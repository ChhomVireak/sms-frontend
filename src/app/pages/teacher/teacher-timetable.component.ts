import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-teacher-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Teaching Timetable'" 
                [subtitle]="'Teacher / Schedule'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Master Timetable Filter Bar -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-emerald-400"></i> My Schedule
          </h3>
          <p class="text-xs text-gray-400 mt-1">Consolidated weekly schedule across all your assigned class groups</p>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <!-- 1. Shift Filter Dropdown -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <i class="fa-solid fa-sun text-amber-400"></i> Shift Filter:
            </label>
            <select [(ngModel)]="selectedTeacherShift" (change)="onShiftChange()" class="bg-[#111827] border border-amber-500/50 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-amber-400 cursor-pointer shadow-md">
              <option value="ALL" class="bg-[#111827] text-white font-bold">All Shifts</option>
              <option value="MORNING" class="bg-[#111827] text-white font-bold">Morning Shift</option>
              <option value="AFTERNOON" class="bg-[#111827] text-white font-bold">Afternoon Shift</option>
              <option value="EVENING" class="bg-[#111827] text-white font-bold">Evening Shift</option>
            </select>
          </div>

          <!-- 2. Class Filter Dropdown -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <i class="fa-solid fa-users-rectangle text-emerald-400"></i> Class Filter:
            </label>
            <select [(ngModel)]="selectedTeacherGroupId" (change)="loadTimetables()" class="bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-md">
              <option value="ALL" class="bg-[#111827] text-white font-bold">All Class Groups</option>
              <option *ngFor="let g of groups" [value]="g.group_id" class="bg-[#111827] text-white font-bold">
                {{ g.group_code }} — {{ g.group_name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Weekly Timetable Grid -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-cyan-400"></i> Weekly Master Teaching Grid
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">Weekly timetable schedule configured for full semester (MON – SAT)</p>
          </div>
          <span class="status-badge status-badge-active">• {{ timetables.length }} Slots Scheduled</span>
        </div>

        <!-- Scrollable Timetable Table Wrapper -->
        <div class="overflow-x-auto rounded-xl border border-[#1f2937] bg-[#111827]/40 p-4">
          <div class="min-w-[850px] space-y-3">
            <!-- Days Header -->
            <div class="grid grid-cols-7 gap-3 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-3 items-center">
              <div class="py-1 uppercase tracking-wider text-gray-400 font-extrabold">TIME</div>
              <div *ngFor="let dayObj of [
                { code: 'MONDAY', label: 'MON' },
                { code: 'TUESDAY', label: 'TUE' },
                { code: 'WEDNESDAY', label: 'WED' },
                { code: 'THURSDAY', label: 'THU' },
                { code: 'FRIDAY', label: 'FRI' },
                { code: 'SATURDAY', label: 'SAT' }
              ]" class="py-1 font-extrabold text-gray-300">
                <span>{{ dayObj.label }}</span>
              </div>
            </div>

            <!-- Dynamic Slots Grid -->
            <div *ngFor="let slot of filteredSlots" class="grid grid-cols-7 gap-3 text-xs items-center">
              <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-3 rounded-xl border border-[#1f2937] shadow-inner">
                <div class="text-emerald-400 font-extrabold">{{ slot.slot_name }}</div>
                <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ (slot.start_time || '08:00').slice(0,5) }} – {{ (slot.end_time || '09:30').slice(0,5) }}</div>
              </div>

              <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
                <!-- Assigned Slot -->
                <div *ngIf="getSlotForDay(slot.slot_id, day) as item; else emptySlot" 
                     class="bg-[#064e3b]/90 border border-emerald-500/60 p-3 rounded-xl space-y-1.5 relative shadow-lg hover:border-emerald-400 transition-all">
                  <div [title]="item.subject_name + ' (' + (item.subject_code || 'CODE') + ')'">
                    <p class="font-extrabold text-emerald-300 truncate text-xs font-mono tracking-wide"><i class="fa-solid fa-book text-emerald-400 mr-1"></i>{{ item.subject_code }}</p>
                    <p class="text-[11px] text-white truncate font-bold leading-tight">{{ item.subject_name }}</p>
                  </div>
                  <p class="text-[10px] text-amber-300 truncate font-bold font-mono"><i class="fa-solid fa-users text-amber-300 mr-1"></i>{{ item.group_code || item.group_name }}</p>
                  <div class="flex items-center justify-between text-[9px] pt-1 border-t border-emerald-800/60">
                    <span class="bg-emerald-950 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-700/50">Room {{ item.room_number }}</span>
                    <span class="text-emerald-300/80 font-mono font-bold">Sem {{ item.semester_id || 1 }}</span>
                  </div>
                </div>

                <!-- Unassigned / Free Slot -->
                <ng-template #emptySlot>
                  <div class="border border-dashed border-gray-800 bg-[#111827]/30 p-3 rounded-xl text-center text-gray-600 font-bold text-[10px] flex flex-col items-center justify-center gap-1 min-h-[64px]">
                    <span class="text-xs text-gray-600 font-mono">—</span>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TeacherTimetableComponent implements OnInit, OnDestroy {
  groups: any[] = [];
  slots: any[] = [];
  timetables: any[] = [];
  selectedTeacherShift: string = 'ALL';
  selectedTeacherGroupId: any = 'ALL';
  private realtimeSub!: Subscription;

  constructor(
    private api: ApiService,
    public toast: ToastService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadSlots();
    this.loadTimetables();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event === 'timetable_updated') {
        this.loadTimetables();
      }
    });
  }

  loadGroups(): void {
    this.api.get<any>('groups', { teacher_only: 'true' }).subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
    });
  }

  loadSlots(): void {
    this.api.get<any>('timetables/slots').subscribe(res => {
      this.slots = res.data?.slots || res.data || [];
    });
  }

  loadTimetables(): void {
    const params: any = { teacher_only: 'true' };
    if (this.selectedTeacherGroupId && this.selectedTeacherGroupId !== 'ALL') {
      params.group_id = this.selectedTeacherGroupId;
    }
    this.api.get<any>('timetables', params).subscribe({
      next: (res) => {
        this.timetables = res.data?.timetables || res.data || [];
      }
    });
  }

  get filteredSlots(): any[] {
    if (!this.slots || !this.slots.length) return [];
    if (!this.selectedTeacherShift || this.selectedTeacherShift === 'ALL') {
      return this.slots;
    }
    const targetUpper = this.selectedTeacherShift.toUpperCase();
    return this.slots.filter(s => String(s.shift || 'MORNING').toUpperCase() === targetUpper);
  }

  onShiftChange(): void {
    this.loadTimetables();
  }

  getSlotForDay(slotId: number, day: string): any {
    if (!this.timetables || !this.timetables.length) return null;
    return this.timetables.find(t => {
      const matchSlot = Number(t.slot_id) === Number(slotId);
      const matchDay = t.day_of_week && t.day_of_week.trim().toUpperCase() === day.trim().toUpperCase();
      if (!matchSlot || !matchDay) return false;

      if (this.selectedTeacherGroupId && this.selectedTeacherGroupId !== 'ALL') {
        if (Number(t.group_id) !== Number(this.selectedTeacherGroupId)) return false;
      }

      if (this.selectedTeacherShift && this.selectedTeacherShift !== 'ALL') {
        const targetShift = this.selectedTeacherShift.toUpperCase();
        const itemShift = String(t.group_shift || t.shift || '').toUpperCase();
        const slotObj = this.slots.find(s => Number(s.slot_id) === Number(t.slot_id));
        const slotShift = String(slotObj?.shift || '').toUpperCase();

        if (itemShift && itemShift !== targetShift && slotShift && slotShift !== targetShift) {
          return false;
        }
      }

      return true;
    });
  }
}

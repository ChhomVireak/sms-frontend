import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-teacher-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Classes Exam Schedule'" 
                [subtitle]="'Exam Schedule & Timetable'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Header & View Switcher -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl md:text-2xl font-extrabold text-white tracking-tight">Exam Schedule & Timetable</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono animate-pulse">
              ⚡ Realtime Synced with Admin
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Switcher Tabs -->
          <div class="flex items-center gap-1.5 bg-[#111827] p-1.5 rounded-2xl border border-[#1f2937]">
            <button (click)="activeTab = 'grid'" 
                    [ngClass]="activeTab === 'grid' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-calendar-days"></i> Exam Timetable Grid
            </button>
            <button (click)="activeTab = 'cards'" 
                    [ngClass]="activeTab === 'cards' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'"
                    class="px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-list-ul"></i> Exam List
            </button>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL SCHEDULED EXAMS</span>
          <h3 class="text-3xl font-extrabold text-white mt-2">{{ exams.length }}</h3>
          <p class="text-xs text-emerald-400 mt-1">Scheduled for your taught class groups</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">UPCOMING EXAMS</span>
          <h3 class="text-3xl font-extrabold text-cyan-400 mt-2">{{ upcomingCount }}</h3>
          <p class="text-xs text-cyan-400 mt-1">Active upcoming exam papers</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">COMPLETED EXAMS</span>
          <h3 class="text-3xl font-extrabold text-purple-400 mt-2">{{ completedCount }}</h3>
          <p class="text-xs text-purple-400 mt-1">Ready for score submission</p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-file-pen text-emerald-400"></i>Class Groups Only
          </h3>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-bold text-gray-300">Filter Group:</label>
          <select [(ngModel)]="selectedGroupId" (change)="loadExams()" class="bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-emerald-400">
            <option value="ALL">All Class Groups</option>
            <option *ngFor="let g of groups" [value]="g.group_id">
              {{ g.group_code }} — {{ g.group_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- VIEW 1: EXAM TIMETABLE GRID -->
      <div *ngIf="activeTab === 'grid'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 overflow-x-auto">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4 min-w-[900px]">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-emerald-400"></i> Weekly Exam Schedule Grid
          </h3>
          <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
            Showing {{ filteredExams.length }} Scheduled Exam(s)
          </span>
        </div>

        <!-- Days Header -->
        <div class="grid grid-cols-7 gap-3 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-2 min-w-[900px]">
          <div class="py-1">TIME SLOT</div>
          <div *ngFor="let dayObj of [
            { code: 'MONDAY', label: 'MON' },
            { code: 'TUESDAY', label: 'TUE' },
            { code: 'WEDNESDAY', label: 'WED' },
            { code: 'THURSDAY', label: 'THU' },
            { code: 'FRIDAY', label: 'FRI' },
            { code: 'SATURDAY', label: 'SAT' }
          ]" class="py-1">
            <span>{{ dayObj.label }}</span>
          </div>
        </div>

        <!-- Time Slot Rows -->
        <div *ngFor="let timeRow of timeSlots" class="grid grid-cols-7 gap-3 text-xs items-center min-w-[900px]">
          <!-- Time Header Pill -->
          <div class="font-mono text-center bg-[#111827] p-2.5 rounded-xl border border-[#1f2937]">
            <span class="text-emerald-400 font-extrabold block text-xs">{{ timeRow.label }}</span>
            <span class="text-gray-400 text-[10px]">{{ timeRow.start }} – {{ timeRow.end }}</span>
          </div>

          <!-- Days Grid -->
          <div *ngFor="let dayCode of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
            <div *ngIf="getExamForSlotAndDay(timeRow.start, dayCode) as ex; else emptyGridCell"
                 class="bg-purple-950/90 border border-purple-700 hover:border-purple-400 p-3 rounded-xl space-y-1.5 shadow-lg relative transition-all group">
              
              <!-- Category & Date Badge Header -->
              <div class="flex items-center justify-between gap-1">
                <span class="text-[9px] font-mono font-extrabold text-purple-300 bg-purple-900/90 border border-purple-600 px-1.5 py-0.5 rounded text-center uppercase truncate">
                  📝 {{ ex.category || 'EXAM' }}
                </span>
                <span class="text-[9px] font-mono font-extrabold text-amber-300 bg-amber-950 border border-amber-700/80 px-1.5 py-0.5 rounded shrink-0">
                  📅 {{ ex.exam_date | date:'dd/MM/yyyy' }}
                </span>
              </div>

              <!-- Subject Code & Title -->
              <div>
                <p class="font-extrabold text-white text-xs truncate">📘 {{ ex.subject_code }}</p>
                <p class="text-[10px] text-purple-200 truncate font-semibold">{{ ex.subject_name }}</p>
              </div>

              <!-- Group Code, Exam Date & Location -->
              <div class="space-y-1 pt-1 border-t border-purple-800/80 font-mono text-[10px]">
                <p class="text-amber-300 font-bold truncate">👥 {{ ex.group_code || ex.group_name }}</p>
                <p class="text-emerald-300 font-bold truncate">🚪 {{ ex.room_number || 'Room 204' }}</p>
                <p class="text-cyan-300 font-extrabold text-[10px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
                  <i class="fa-regular fa-calendar-check text-amber-400"></i> Date Exam: {{ ex.exam_date | date:'dd/MM/yyyy' }}
                </p>
              </div>

              <!-- Quick Score Button -->
              <button (click)="router.navigate(['/teacher/scores'])" class="w-full mt-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] shadow transition-all">
                Enter Grades →
              </button>
            </div>

            <!-- Empty Grid Slot (No Exam) -->
            <ng-template #emptyGridCell>
              <div class="border border-dashed border-gray-800/80 p-3 rounded-xl text-center text-gray-600 font-mono text-[10px] min-h-[75px] flex items-center justify-center">
                —
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- VIEW 2: EXAM LIST CARDS -->
      <div *ngIf="activeTab === 'cards'" class="space-y-4">
        <div *ngFor="let ex of filteredExams" class="bg-[#1e293b]/70 border border-[#1f2937] hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition-all">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f2937]/70 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono font-extrabold text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2.5 py-0.5 rounded-lg">
                  {{ ex.subject_code || 'CS101' }}
                </span>
                <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                  👥 Group {{ ex.group_code || ex.group_name }}
                </span>
                <span class="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-md uppercase font-mono">
                  {{ ex.category || 'Midterm' }}
                </span>
              </div>
              <h3 class="text-base font-extrabold text-white mt-1.5">{{ ex.exam_title || ex.subject_name }}</h3>
            </div>

            <span [ngClass]="{
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': ex.status === 'Active' || ex.status === 'UPCOMING',
              'bg-purple-500/10 text-purple-400 border-purple-500/30': ex.status === 'COMPLETED'
            }" class="px-3 py-1 rounded-full text-xs font-extrabold border font-mono tracking-wider uppercase self-start md:self-auto">
              • {{ ex.status || 'Active' }}
            </span>
          </div>

          <!-- Timing & Location Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
            <div class="flex items-center gap-2 text-gray-300">
              <i class="fa-regular fa-calendar-check text-emerald-400 text-sm"></i>
              <span>Date: <strong class="text-white font-mono">{{ ex.exam_date | date:'EEEE, dd MMMM yyyy' }}</strong></span>
            </div>

            <div class="flex items-center gap-2 text-gray-300">
              <i class="fa-regular fa-clock text-cyan-400 text-sm"></i>
              <span>Time: <strong class="text-cyan-300 font-mono">{{ (ex.start_time || '08:00').slice(0,5) }} – {{ (ex.end_time || '09:30').slice(0,5) }}</strong> ({{ ex.duration_minutes || 90 }} mins)</span>
            </div>

            <div class="flex items-center gap-2 text-gray-300">
              <i class="fa-solid fa-location-dot text-amber-400 text-sm"></i>
              <span>Room: <strong class="text-amber-300 font-mono">{{ ex.room_number || 'Room 101' }}</strong> ({{ ex.building || 'Main Block A' }})</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-[#1f2937]/70 flex items-center justify-between">
            <span class="text-[11px] text-gray-400 font-mono">Academic Year: {{ ex.academic_year || '2025-2026' }} · {{ ex.semester || 'Semester 1' }}</span>
            <button (click)="router.navigate(['/teacher/scores'])" class="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95">
              <i class="fa-solid fa-pen-to-square"></i> Enter Grades
            </button>
          </div>
        </div>

        <div *ngIf="filteredExams.length === 0" class="text-center py-12 bg-[#1e293b]/40 border border-[#1f2937] rounded-2xl text-gray-400 space-y-2">
          <i class="fa-regular fa-file-lines text-3xl text-gray-600 block"></i>
          <p class="text-xs font-semibold">No exams scheduled for your taught class groups.</p>
        </div>
      </div>
    </div>
  `
})
export class TeacherExamsComponent implements OnInit, OnDestroy {
  activeTab: 'grid' | 'cards' = 'grid';
  groups: any[] = [];
  exams: any[] = [];
  selectedGroupId: any = 'ALL';
  private realtimeSub!: Subscription;

  timeSlots = [
    { label: 'Slot 1', start: '08:00', end: '09:30' },
    { label: 'Slot 2', start: '10:00', end: '11:30' },
    { label: 'Slot 3', start: '13:00', end: '14:30' },
    { label: 'Slot 4', start: '15:00', end: '16:30' }
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadExams();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event.startsWith('exam_')) {
        this.loadExams();
      }
    });
  }

  get upcomingCount(): number {
    return this.exams.filter(e => e.status !== 'COMPLETED').length;
  }

  get completedCount(): number {
    return this.exams.filter(e => e.status === 'COMPLETED').length;
  }

  get filteredExams(): any[] {
    if (!this.selectedGroupId || this.selectedGroupId === 'ALL') {
      return this.exams;
    }
    return this.exams.filter(e => Number(e.group_id) === Number(this.selectedGroupId));
  }

  getDayOfWeek(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[d.getDay()];
  }

  getExamForSlotAndDay(slotStart: string, dayCode: string): any {
    if (!this.filteredExams || !this.filteredExams.length) return null;
    return this.filteredExams.find(e => {
      const matchDay = this.getDayOfWeek(e.exam_date) === dayCode;
      if (!matchDay) return false;
      const exTime = (e.start_time || '08:00').slice(0, 2);
      const slotTime = slotStart.slice(0, 2);
      return Math.abs(parseInt(exTime, 10) - parseInt(slotTime, 10)) <= 1;
    });
  }

  loadGroups(): void {
    this.api.get<any>('groups', { teacher_only: 'true' }).subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
    });
  }

  loadExams(): void {
    const params: any = { teacher_only: 'true' };
    if (this.selectedGroupId && this.selectedGroupId !== 'ALL') {
      params.group_id = this.selectedGroupId;
    }

    this.api.get<any>('exams', params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.exams = res.data.exams || [];
        } else {
          this.exams = [];
        }
      },
      error: () => {
        this.exams = [];
      }
    });
  }
}

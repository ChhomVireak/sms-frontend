import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-teacher-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Class Groups'" 
                [subtitle]="'Teacher / Classes'"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL CLASS GROUPS</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">{{ groups.length }}</h3>
          <p class="text-xs text-emerald-400 mt-1">Active class sections</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MORNING SHIFT</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ morningShiftCount }} Classes</h3>
          <p class="text-xs text-gray-400 mt-1">08:00 AM – 11:30 AM</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">AFTERNOON SHIFT</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ afternoonShiftCount }} Classes</h3>
          <p class="text-xs text-gray-400 mt-1">13:00 PM – 16:30 PM</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">EVENING SHIFT</span>
          <h3 class="text-2xl font-extrabold text-purple-400 mt-2">{{ eveningShiftCount }} Classes</h3>
          <p class="text-xs text-gray-400 mt-1">17:00 PM – 20:00 PM</p>
        </div>
      </div>

      <!-- Class Sections List -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-users text-emerald-400"></i> My Assigned Academic Class Sections
          </h3>
          <span class="text-xs font-semibold text-gray-400">{{ groups.length }} active sections</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">CLASS GROUP / CODE</th>
                <th class="pb-3">TAUGHT SUBJECT(S)</th>
                <th class="pb-3">SHIFT & GENERATION</th>
                <th class="pb-3">YEAR & SEMESTER</th>
                <th class="pb-3">ENROLLED STUDENTS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let g of groups" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5">
                  <span class="font-mono text-emerald-400 font-extrabold text-sm block">{{ g.group_code }}</span>
                  <span class="text-xs text-white font-bold block">{{ g.group_name }}</span>
                </td>
                <td class="py-3.5">
                  <div *ngIf="g.taught_subjects && g.taught_subjects.length > 0" class="flex flex-wrap gap-1">
                    <span *ngFor="let sub of g.taught_subjects" class="inline-flex items-center gap-1.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono">
                      <i class="fa-solid fa-book text-[10px]"></i> {{ sub.subject_name }} ({{ sub.subject_code }})
                    </span>
                  </div>
                  <span *ngIf="!g.taught_subjects || g.taught_subjects.length === 0" class="text-cyan-400 font-mono text-xs font-bold">
                    <i class="fa-solid fa-book text-emerald-400 mr-1.5"></i>{{ g.primary_subject_name || g.group_name }}
                  </span>
                </td>
                <td class="py-3.5 space-y-1">
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-800': g.shift === 'MORNING',
                    'bg-amber-950 text-amber-400 border-amber-800': g.shift === 'AFTERNOON',
                    'bg-purple-950 text-purple-400 border-purple-800': g.shift === 'EVENING'
                  }" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono inline-block">
                    {{ g.shift }}
                  </span>
                  <span class="text-[11px] font-bold text-amber-400 font-mono block">• {{ g.generation || 'Gen 9' }}</span>
                </td>
                <td class="py-3.5 font-mono">
                  <span [class.text-amber-400]="g.status !== 'GRADUATED'" [class.text-emerald-400]="g.status === 'GRADUATED'" class="font-bold block">
                    {{ g.status === 'GRADUATED' ? 'GRADUATED' : 'Year ' + (g.academic_year_level || 0) + ' · Semester ' + (g.current_semester || 0) }}
                  </span>
                  <span class="text-[10px] text-gray-400 block font-mono"><i class="fa-regular fa-calendar text-cyan-400 mr-1"></i>{{ (g.semester_start_date ? (g.semester_start_date | date:'dd/MM/yyyy') : 'N/A') }} ➔ {{ (g.semester_end_date ? (g.semester_end_date | date:'dd/MM/yyyy') : 'N/A') }}</span>
                </td>
                <td class="py-3.5 font-mono">
                  <span class="font-bold text-white text-xs block">{{ g.student_count || 0 }} Enrolled</span>
                  <span class="text-[10px] text-gray-400 block">Cap: {{ g.max_capacity || 40 }} max</span>
                </td>
              </tr>
              <tr *ngIf="groups.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500 italic">
                  No assigned class groups found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeacherClassesComponent implements OnInit, OnDestroy {
  groups: any[] = [];
  private realtimeSub!: Subscription;

  constructor(
    private api: ApiService,
    public toast: ToastService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event.startsWith('group_') || event.startsWith('student_')) {
        this.loadGroups();
      }
    });
  }

  get morningShiftCount(): number {
    return this.groups.filter(g => g.shift === 'MORNING').length;
  }

  get afternoonShiftCount(): number {
    return this.groups.filter(g => g.shift === 'AFTERNOON').length;
  }

  get eveningShiftCount(): number {
    return this.groups.filter(g => g.shift === 'EVENING').length;
  }

  loadGroups(): void {
    this.api.get<any>('groups', { teacher_only: 'true' }).subscribe({
      next: (res) => {
        this.groups = res.data?.groups || res.data || [];
      }
    });
  }
}

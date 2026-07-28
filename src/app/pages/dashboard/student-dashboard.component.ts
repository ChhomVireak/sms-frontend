import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Student Dashboard'" 
                [subtitle]="realDateSubtitle" 
                [actionLabel]="'View Timetable'"
                [actionIcon]="'fa-solid fa-calendar-days'"
                (actionClicked)="router.navigate(['/student/timetable'])"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Welcome Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b]/50 border border-[#1f2937] p-6 rounded-2xl">
        <div>
          <span class="text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase">Student Portal</span>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {{ studentName }}
          </h1>
          <p class="text-xs text-gray-400 mt-1 font-mono">ID: {{ studentCustomId }} · {{ studentGroupName }}</p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="router.navigate(['/student/grades'])" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <i class="fa-solid fa-graduation-cap"></i> My Academic Grades
          </button>
        </div>
      </div>

      <!-- 4 Top Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Attendance Rate -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ATTENDANCE RATE</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-user-check"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">
              {{ (stats.attendanceRate !== null && stats.attendanceRate !== undefined) ? stats.attendanceRate + '%' : '100%' }}
            </h3>
            <p class="text-xs text-emerald-400 font-semibold mt-1">
              ✓ Realtime Attendance Rate
            </p>
          </div>
        </div>

        <!-- Current GPA -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CUMULATIVE GPA</span>
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats.gpa }}</h3>
            <p class="text-xs text-amber-400 font-semibold mt-1">
              {{ stats.gpa !== 'N/A' ? 'Academic Score Index' : 'No grades recorded' }}
            </p>
          </div>
        </div>

        <!-- Tuition Fee Balance -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FEE BALANCE</span>
            <div class="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">\${{ stats.feeBalance | number:'1.2-2' }}</h3>
            <p class="text-xs text-rose-400 font-semibold mt-1">Outstanding Balance</p>
          </div>
        </div>

        <!-- Upcoming Exam -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NEXT UPCOMING EXAM</span>
            <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-file-pen"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-base font-extrabold text-white tracking-tight truncate">{{ stats.upcomingExam }}</h3>
            <p class="text-xs text-cyan-400 font-semibold mt-1">Scheduled by Admin</p>
          </div>
        </div>
      </div>

      <!-- Main Split: My Grades Table (Left) + Term GPA & Upcoming Exams (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- My Grades Matrix -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-clipboard-list text-emerald-400"></i> My Academic Results
            </h3>
            <a routerLink="/student/grades" class="text-xs text-emerald-400 hover:underline font-semibold">Full Grade History →</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-3">SUBJECT</th>
                  <th class="pb-3">EXAM / ASSESSMENT</th>
                  <th class="pb-3">RAW SCORE</th>
                  <th class="pb-3">LETTER GRADE</th>
                  <th class="pb-3 text-right">GPA PTS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let g of grades" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3.5 font-bold text-white">
                    <span class="block text-sm font-extrabold text-white">{{ g.subject_name }}</span>
                    <span class="text-[10px] text-gray-400 font-mono">{{ g.subject_code }}</span>
                  </td>
                  <td class="py-3.5 text-gray-300 font-medium">{{ g.exam_title || 'Assessment' }}</td>
                  <td class="py-3.5 text-gray-300 font-mono font-bold">{{ g.raw_score }}/50</td>
                  <td class="py-3.5">
                    <span [ngClass]="{
                      'bg-emerald-950 text-emerald-400 border-emerald-800': g.letter_grade === 'A' || g.letter_grade === 'B+',
                      'bg-amber-950 text-amber-400 border-amber-800': g.letter_grade === 'B' || g.letter_grade === 'C+',
                      'bg-rose-950 text-rose-400 border-rose-800': g.letter_grade === 'C' || g.letter_grade === 'F'
                    }" class="px-2.5 py-1 rounded-md font-extrabold text-xs border font-mono">
                      {{ g.letter_grade }}
                    </span>
                  </td>
                  <td class="py-3.5 text-right font-mono font-extrabold text-emerald-400 text-sm">{{ g.grade_point | number:'1.1-1' }}</td>
                </tr>

                <tr *ngIf="grades.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500 italic">
                    No academic exam results published yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Term GPA Gauge & Upcoming Exams List -->
        <div class="space-y-6">
          <!-- Term GPA Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 text-center space-y-3">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall GPA Performance</h4>
            <div [ngClass]="hasSem1AndSem2Completed ? 'border-emerald-500 shadow-emerald-500/10' : 'border-amber-500 shadow-amber-500/10'" class="w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mx-auto shadow-xl bg-[#111827] px-2">
              <ng-container *ngIf="hasSem1AndSem2Completed">
                <span class="text-3xl font-black text-white tracking-tight">{{ stats.gpa }}</span>
                <span class="text-[10px] text-gray-400 font-mono">{{ stats.gpa !== 'N/A' ? '/ 4.00' : 'No GPA' }}</span>
              </ng-container>

              <ng-container *ngIf="!hasSem1AndSem2Completed">
                <span class="text-xl font-extrabold text-amber-400 tracking-tight">Pending</span>
              </ng-container>
            </div>
            <p class="text-xs text-gray-400 font-mono">{{ studentGroupName }}</p>
          </div>

          <!-- Upcoming Exams Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Exams</h4>
              <a routerLink="/student/timetable" class="text-xs text-cyan-400 hover:underline font-semibold">Timetable →</a>
            </div>

            <div class="space-y-3">
              <div *ngFor="let ex of upcomingExams" class="bg-[#111827]/80 border border-[#1f2937] p-3 rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg w-10 h-10 flex flex-col items-center justify-center leading-none shrink-0 font-mono">
                    <span class="text-xs font-black">{{ (ex.exam_date | date:'dd') || '15' }}</span>
                    <span class="text-[9px] font-bold uppercase">{{ (ex.exam_date | date:'MMM') || 'FEB' }}</span>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-white">{{ ex.exam_title || ex.subject_name }}</p>
                    <p class="text-[10px] text-gray-400 font-mono">Room {{ ex.room_number || 'TBA' }} · {{ ex.group_code || 'All' }}</p>
                  </div>
                </div>
                <span class="text-[10px] font-extrabold text-purple-400 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                  Exam
                </span>
              </div>

              <div *ngIf="upcomingExams.length === 0" class="text-center py-6 text-xs text-gray-500 italic">
                No upcoming exam schedules published.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  studentName: string = 'Chhom Vireak';
  studentCustomId: string = 'SV-2026-0001';
  studentGroupName: string = 'SV34 — Management Information Systems (MIS)';

  stats: any = {
    attendanceRate: null,
    gpa: 'N/A',
    feeBalance: 0,
    upcomingExam: 'No upcoming exams'
  };

  grades: any[] = [];
  upcomingExams: any[] = [];

  constructor(
    private api: ApiService,
    public router: Router,
    public authService: AuthService
  ) {
    const user = this.authService.currentUser();
    if (user) {
      if (user.fullName) this.studentName = user.fullName;
      if (user.username) this.studentCustomId = user.username;
    }
  }

  get realDateSubtitle(): string {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `${formatted} · Student Portal`;
  }

  get hasSem1AndSem2Completed(): boolean {
    if (!this.grades || this.grades.length === 0) return false;

    const hasSem1Final = this.grades.some(g => {
      const sem = (g.semester || g.exam_title || '').toLowerCase();
      const cat = (g.category || g.exam_type || '').toLowerCase();
      const isSem1 = sem.includes('1') || sem.includes('sem 1') || sem.includes('semester 1') || sem.includes('ឆមាសទី ១');
      const isFinal = cat.includes('final') || cat.includes('បញ្ចប់') || g.final_score !== null;
      return isSem1 && isFinal;
    });

    const hasSem2Final = this.grades.some(g => {
      const sem = (g.semester || g.exam_title || '').toLowerCase();
      const cat = (g.category || g.exam_type || '').toLowerCase();
      const isSem2 = sem.includes('2') || sem.includes('sem 2') || sem.includes('semester 2') || sem.includes('ឆមាសទី ២');
      const isFinal = cat.includes('final') || cat.includes('បញ្ចប់') || g.final_score !== null;
      return isSem2 && isFinal;
    });

    return hasSem1Final && hasSem2Final;
  }

  ngOnInit(): void {
    this.loadStudentDashboard();
  }

  loadStudentDashboard(): void {
    this.api.get<any>('dashboard/student').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const s = res.data.student;
          if (s) {
            this.studentName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || this.authService.currentUser()?.fullName || 'Chhom Vireak';
            this.studentCustomId = s.custom_student_id || ('STU-' + s.student_id);
            const grpCode = s.group_code || 'SV34';
            const majorProg = s.program_name || s.group_name || 'Management Information Systems (MIS)';
            const gen = s.generation ? (String(s.generation).startsWith('Gen') ? s.generation : `Gen ${s.generation}`) : '';
            this.studentGroupName = s.major_program_full || `${grpCode} — ${majorProg}${gen ? ' ' + gen : ''}`;
          } else {
            const user = this.authService.currentUser();
            if (user) {
              this.studentName = user.fullName || user.username || 'Chhom Vireak';
            }
          }
          if (res.data.stats) this.stats = res.data.stats;
          if (res.data.grades) this.grades = res.data.grades;
          if (res.data.upcomingExams) this.upcomingExams = res.data.upcomingExams;
        }
      }
    });
  }
}

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

      <!-- 3 Top Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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

      <!-- Main Content Grid: Today's Schedule (Left) + Overall GPA & Upcoming Exams (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Today's Class Schedule Card -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-regular fa-clock text-cyan-400"></i> Today's Schedule
            </h3>
            <a routerLink="/student/timetable" class="text-xs text-cyan-400 hover:underline font-semibold">Full Timetable →</a>
          </div>

          <div *ngIf="todaySchedule.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-gray-800/60 flex items-center justify-center text-gray-500 text-lg">
              <i class="fa-regular fa-calendar"></i>
            </div>
            <p class="text-xs font-semibold">No classes scheduled for today</p>
          </div>

          <div *ngIf="todaySchedule.length > 0" class="space-y-3">
            <div *ngFor="let item of todaySchedule" class="bg-[#111827]/80 border border-[#1f2937] p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span class="text-xs font-mono text-cyan-400 font-extrabold">
                  {{ (item.start_time || '08:00').slice(0,5) }} – {{ (item.end_time || '09:30').slice(0,5) }}
                </span>
                <p class="text-xs font-bold text-white mt-0.5">
                  <i class="fa-solid fa-book text-emerald-400 mr-1.5"></i>{{ item.subject_name }}
                </p>
                <p *ngIf="item.teacher_name" class="text-xs text-amber-300 font-mono font-bold mt-1">
                  <i class="fa-solid fa-chalkboard-user text-amber-300 mr-1.5"></i>{{ item.teacher_name }}
                </p>
              </div>
              <span class="text-xs font-bold bg-emerald-950/80 text-emerald-300 px-3.5 py-1.5 rounded-lg border border-emerald-800/60 font-mono shadow-sm">
                Room {{ item.room_number || 'TBA' }}
              </span>
            </div>
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

          <!-- Active Broadcast Alerts Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-bullhorn text-amber-400 text-sm"></i>
                <h4 class="text-xs font-bold text-gray-300 uppercase tracking-wider">Broadcast Alerts Feed</h4>
                <span *ngIf="unreadAlertsCount > 0" class="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse font-mono">
                  {{ unreadAlertsCount }} Unread
                </span>
              </div>
              <a routerLink="/student/notifications" class="text-xs text-amber-400 hover:underline font-semibold">View all →</a>
            </div>

            <div *ngIf="recentNotifications.length === 0" class="py-6 text-center text-xs text-gray-500 italic">
              No active broadcast alerts published.
            </div>

            <div *ngIf="recentNotifications.length > 0" class="space-y-2.5">
              <div *ngFor="let notif of recentNotifications.slice(0, 3)" class="bg-[#111827]/80 border border-[#1f2937] p-3 rounded-xl space-y-1.5 hover:border-amber-500/40 transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white text-xs flex items-center gap-1.5">
                    <span class="truncate max-w-[180px]">{{ notif.title }}</span>
                    <span *ngIf="!notif.is_read" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                  </span>
                  <button *ngIf="!notif.is_read" (click)="markNotifRead(notif)" class="px-2.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 shrink-0">
                    Mark Read
                  </button>
                  <span *ngIf="notif.is_read" class="text-[10px] font-bold text-gray-500 font-mono shrink-0">Read</span>
                </div>
                <p class="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{{ notif.message }}</p>
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
  unreadAlertsCount: number = 0;
  recentNotifications: any[] = [];

  stats: any = {
    attendanceRate: null,
    gpa: 'N/A',
    feeBalance: 0,
    upcomingExam: 'No upcoming exams'
  };

  grades: any[] = [];
  upcomingExams: any[] = [];
  todaySchedule: any[] = [];

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
    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        const notifs = res.data?.notifications || res.data || [];
        this.recentNotifications = notifs;
        this.unreadAlertsCount = notifs.filter((n: any) => !n.is_read).length;
      }
    });

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
          if (res.data.todaySchedule) this.todaySchedule = res.data.todaySchedule;
        }
      }
    });
  }

  markNotifRead(notif: any): void {
    this.api.post<any>(`notifications/${notif.notification_id || notif.id}/read`, {}).subscribe({
      next: () => {
        notif.is_read = true;
        this.unreadAlertsCount = Math.max(0, this.unreadAlertsCount - 1);
      }
    });
  }
}

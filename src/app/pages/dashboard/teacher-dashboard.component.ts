import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 space-y-8 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Welcome Banner & Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold text-gray-400 font-mono flex items-center gap-2">
            <span>Teacher</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-gray-600"></i>
            <span class="text-emerald-400">Dashboard</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {{ teacherName }}
          </h1>
          <p class="text-xs text-gray-400 mt-1">Here's what's happening with your classes today.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Dynamic Alerts Button (Glows & Pops when Admin sends unread messages) -->
          <button (click)="markReadAndNavigate()" 
                  [ngClass]="unreadAlertsCount > 0 ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 shadow-lg shadow-amber-950/50' : 'bg-[#111827] border-[#1f2937] text-gray-300 hover:bg-[#1e293b]'"
                  class="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 border">
            <i class="fa-solid fa-bell" [ngClass]="unreadAlertsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-gray-400'"></i> 
            <span>Alerts</span>
            <span *ngIf="unreadAlertsCount > 0" class="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono animate-pulse">
              {{ unreadAlertsCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- 3 Top Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card 1: MY CLASSES -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MY CLASSES</span>
            <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-building"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.myClasses || 0 }}</h3>
          </div>
        </div>

        <!-- Card 2: TOTAL STUDENTS -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL STUDENTS</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-hourglass-half"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.totalStudents || 0 }}</h3>
          </div>
        </div>

        <!-- Card 3: TODAY'S SCHEDULE -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TODAY'S SCHEDULE</span>
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.todaysScheduleCount || 0 }}</h3>
          </div>
        </div>
      </div>

      <!-- Middle Split: Today's Schedule (Left) + My Classes (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Today's Schedule Box -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-regular fa-clock text-cyan-400"></i> Today's Schedule
            </h3>
            <a routerLink="/teacher/timetable" class="text-xs text-cyan-400 hover:underline font-semibold">View all</a>
          </div>

          <div *ngIf="todaySchedule.length === 0" class="flex-1 flex flex-col items-center justify-center py-8 text-center text-gray-500 space-y-2">
            <div class="w-10 h-10 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-500 text-lg">
              <i class="fa-regular fa-calendar"></i>
            </div>
            <p class="text-xs font-semibold">No classes scheduled for today</p>
          </div>

          <div *ngIf="todaySchedule.length > 0" class="space-y-3">
            <div *ngFor="let item of todaySchedule" class="bg-[#111827]/80 border border-[#1f2937] p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs font-mono text-cyan-400 font-bold">
                  {{ (item.start_time || '08:00').slice(0,5) }} – {{ (item.end_time || '09:30').slice(0,5) }}
                </span>
                <p class="text-sm font-bold text-white mt-0.5">{{ item.subject_name || 'C++ Programming' }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ item.group_code || item.group_name }}</p>
              </div>
              <span class="text-xs font-semibold bg-gray-800 text-gray-300 px-3 py-1 rounded-lg border border-gray-700 font-mono">
                Room {{ item.room_number || '8' }}
              </span>
            </div>
          </div>
        </div>

        <!-- My Classes Box -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-chalkboard text-emerald-400"></i> My Classes
            </h3>
            <a routerLink="/teacher/classes" class="text-xs text-emerald-400 hover:underline font-semibold">View all</a>
          </div>

          <div class="space-y-3">
            <div *ngFor="let c of myClassesCards" class="bg-[#111827]/80 border border-[#1f2937] hover:border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all">
              <div>
                <p class="text-sm font-bold text-white flex items-center gap-2">
                  <i class="fa-solid fa-book-bookmark text-emerald-400 text-xs"></i>
                  <span>{{ c.subject_name || c.group_name }}</span>
                </p>
                <p class="text-xs text-gray-400 font-mono mt-1">👥 {{ c.group_code }} — {{ c.group_name }}</p>
              </div>
              <div class="bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-gray-300 shrink-0">
                <i class="fa-solid fa-user-group text-emerald-400 text-xs"></i>
                <span class="font-bold">{{ c.student_count || 0 }} Students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Split: Attendance 30d (Left) + Recent Attendance (Center) + Upcoming Exams (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Attendance 30d Card -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white">Attendance (30d)</h3>
            <span class="text-xs text-gray-400 font-mono">{{ attendance30d?.totalRecords || 0 }} records</span>
          </div>

          <!-- Multi-color Progress Bar -->
          <div class="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
            <div [style.width.%]="attendance30d?.presentPct || 0" class="bg-emerald-500 h-full"></div>
            <div [style.width.%]="attendance30d?.latePct || 0" class="bg-amber-500 h-full"></div>
            <div [style.width.%]="attendance30d?.permissionPct || 0" class="bg-cyan-500 h-full"></div>
            <div [style.width.%]="attendance30d?.absentPct || 0" class="bg-rose-500 h-full"></div>
          </div>

          <div class="space-y-2.5 text-xs font-semibold">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-300">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Present
              </span>
              <span class="font-mono text-white font-bold">{{ attendance30d?.presentCount || 0 }} ({{ attendance30d?.presentPct || 0 }}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-300">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> Late
              </span>
              <span class="font-mono text-white font-bold">{{ attendance30d?.lateCount || 0 }} ({{ attendance30d?.latePct || 0 }}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-300">
                <span class="w-2 h-2 rounded-full bg-cyan-500"></span> Permission
              </span>
              <span class="font-mono text-white font-bold">{{ attendance30d?.permissionCount || 0 }} ({{ attendance30d?.permissionPct || 0 }}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-300">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span> Absent
              </span>
              <span class="font-mono text-white font-bold">{{ attendance30d?.absentCount || 0 }} ({{ attendance30d?.absentPct || 0 }}%)</span>
            </div>
          </div>
        </div>

        <!-- Recent Attendance Card -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white">Recent Attendance</h3>
            <a routerLink="/teacher/attendance" class="text-xs text-cyan-400 hover:underline font-semibold">Take attendance</a>
          </div>

          <div class="space-y-3">
            <div *ngFor="let item of recentAttendance.slice(0, 2)" class="bg-[#111827]/80 border border-[#1f2937] p-3 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">{{ item.first_name }} {{ item.last_name }}</p>
                <p class="text-[10px] text-gray-400 font-mono mt-0.5">{{ item.custom_student_id }} · {{ item.subject_name }}</p>
                <p class="text-[10px] text-gray-500 font-mono">{{ item.date ? (item.date | date:'yyyy-MM-dd') : '' }}</p>
              </div>
              <span [ngClass]="{
                'bg-emerald-950 text-emerald-400 border-emerald-800': item.status === 'Present',
                'bg-amber-950 text-amber-400 border-amber-800': item.status === 'Late',
                'bg-rose-950 text-rose-400 border-rose-800': item.status === 'Absent'
              }" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg border font-mono">
                {{ item.status }}
              </span>
            </div>
            <div *ngIf="recentAttendance.length === 0" class="text-center py-6 text-xs text-gray-500 italic">
              No recent attendance logs
            </div>
          </div>
        </div>

        <!-- Upcoming Exams Card -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white">Upcoming Exams</h3>
            <a routerLink="/teacher/exams" class="text-xs text-cyan-400 hover:underline font-semibold">View all</a>
          </div>

          <div *ngIf="upcomingExams.length === 0" class="flex-1 flex flex-col items-center justify-center py-8 text-center text-gray-500 space-y-2">
            <div class="w-10 h-10 rounded-xl bg-gray-800/60 flex items-center justify-center text-gray-500 text-lg">
              <i class="fa-regular fa-file-lines"></i>
            </div>
            <p class="text-xs font-semibold">No upcoming exams</p>
          </div>

          <div *ngIf="upcomingExams.length > 0" class="space-y-3">
            <div *ngFor="let ex of upcomingExams" class="bg-[#111827]/80 border border-[#1f2937] p-3 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">{{ ex.exam_title || ex.subject_name }}</p>
                <p class="text-[10px] text-gray-400 font-mono">{{ ex.group_code }} · {{ ex.exam_date | date:'yyyy-MM-dd' }}</p>
              </div>
              <span class="text-[10px] font-bold text-purple-400 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded-md font-mono">
                Exam
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  teacherName: string = 'Teacher';
  unreadAlertsCount: number = 0;
  private socketSub!: Subscription;

  stats: any = {
    myClasses: 0,
    totalStudents: 0,
    todaysScheduleCount: 0
  };
  myClassesCards: any[] = [];
  todaySchedule: any[] = [];
  attendance30d: any = {
    totalRecords: 0,
    presentCount: 0,
    presentPct: 0,
    lateCount: 0,
    latePct: 0,
    permissionCount: 0,
    permissionPct: 0,
    absentCount: 0,
    absentPct: 0
  };
  recentAttendance: any[] = [];
  upcomingExams: any[] = [];

  constructor(
    private api: ApiService,
    public router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUnreadNotifications();
    this.initSocketListener();
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  markReadAndNavigate(): void {
    const now = Date.now().toString();
    localStorage.setItem('global_alerts_read', 'true');
    localStorage.setItem('alerts_read_all', 'true');
    localStorage.setItem('last_read_notif', now);
    localStorage.setItem('teacher_last_read_notif', now);
    this.unreadAlertsCount = 0;
    this.router.navigate(['/teacher/notifications']);
  }

  initSocketListener(): void {
    this.socketSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event === 'new_announcement_created' || event === 'new_exam_scheduled') {
        localStorage.removeItem('global_alerts_read');
        this.unreadAlertsCount = 1;
      }
    });
  }

  loadUnreadNotifications(): void {
    const isGlobalRead = localStorage.getItem('global_alerts_read') === 'true' || localStorage.getItem('alerts_read_all') === 'true';

    if (isGlobalRead) {
      this.unreadAlertsCount = 0;
      return;
    }

    const lastReadTime = Number(localStorage.getItem('last_read_notif') || 0);
    const readIdsStr = localStorage.getItem('read_notif_ids') || '[]';
    const readIds = new Set(JSON.parse(readIdsStr));

    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        const list = res.data?.notifications || res.data || [];
        this.unreadAlertsCount = list.filter((n: any) => {
          const id = n.notification_id || n.id;
          const notifTime = new Date(n.created_at || n.publish_date || Date.now()).getTime();
          const isRead = Boolean(n.is_read) || readIds.has(id) || (lastReadTime > 0 && notifTime <= lastReadTime);
          return !isRead;
        }).length;
      },
      error: () => {
        this.unreadAlertsCount = 0;
      }
    });
  }

  loadDashboardData(): void {
    this.api.get<any>('dashboard/teacher').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.teacherName) this.teacherName = res.data.teacherName;
          if (res.data.stats) this.stats = res.data.stats;
          if (res.data.myClassesCards) this.myClassesCards = res.data.myClassesCards;
          if (res.data.schedule) this.todaySchedule = res.data.schedule;
          if (res.data.attendance30d) this.attendance30d = res.data.attendance30d;
          if (res.data.recentAttendance) this.recentAttendance = res.data.recentAttendance;
          if (res.data.upcomingExams) this.upcomingExams = res.data.upcomingExams;
        }
      }
    });
  }
}

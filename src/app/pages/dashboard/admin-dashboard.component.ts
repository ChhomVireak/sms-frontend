import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Dashboard'" 
                [subtitle]="realDateSubtitle" 
                [actionLabel]="'Quick Add'"
                (actionClicked)="openQuickAdd()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- 8 Main Metric Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Students -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL STUDENTS</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.totalStudents | number }}</h3>
            <p class="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Active Enrolled
            </p>
          </div>
        </div>

        <!-- Total Teachers -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL TEACHERS</span>
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.totalTeachers }}</h3>
            <p class="text-xs text-blue-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Staff Active
            </p>
          </div>
        </div>

        <!-- Total Classes -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL CLASSES</span>
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-briefcase"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.totalClasses }}</h3>
            <p class="text-xs text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Active Sections
            </p>
          </div>
        </div>

        <!-- Total Subjects -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL SUBJECTS</span>
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-book"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.totalSubjects }}</h3>
            <p class="text-xs text-purple-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Active Courses
            </p>
          </div>
        </div>

        <!-- Fees Collected -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FEES COLLECTED</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-credit-card"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">\${{ stats?.feesCollected || 0 | number:'1.2-2' }}</h3>
            <p class="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Payments Recorded
            </p>
          </div>
        </div>

        <!-- Active Exams -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE EXAMS</span>
            <div class="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.activeExams }}</h3>
            <p class="text-xs text-rose-400 font-semibold mt-1">Scheduled</p>
          </div>
        </div>

        <!-- Reports Generated -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">REPORTS GENERATED</span>
            <div class="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-chart-column"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.reportsGenerated || 0 }}</h3>
            <p class="text-xs text-cyan-400 font-semibold mt-1">This term</p>
          </div>
        </div>

        <!-- Attendance Rate -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ATTENDANCE RATE</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base">
              <i class="fa-solid fa-user-check"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-extrabold text-white tracking-tight">{{ stats?.attendanceRate || 0 }}%</h3>
            <p class="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-arrow-up"></i> Recorded Average
            </p>
          </div>
        </div>
      </div>

      <!-- Content Split: Recent Students Table (Left) + Quick Actions (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Students Table (2 Cols) -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-bold text-white tracking-tight">Recent Students</h3>
            <a routerLink="/admin/students" class="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
              View all <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-3">STUDENT</th>
                  <th class="pb-3">CLASS</th>
                  <th class="pb-3">GENDER</th>
                  <th class="pb-3">ENROLLED</th>
                  <th class="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50 text-sm">
                <tr *ngFor="let s of recentStudents" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3.5 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-emerald-600 border border-emerald-500/40 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-sm">
                      <img *ngIf="s.image" [src]="getPhotoUrl(s.image)" class="w-full h-full object-cover">
                      <span *ngIf="!s.image">{{ (s.first_name || 'S')[0] }}{{ (s.last_name || '')[0] }}</span>
                    </div>
                    <div>
                      <span class="font-semibold text-white block">{{ s.first_name }} {{ s.last_name }}</span>
                      <span class="text-[10px] text-gray-400 font-mono">{{ s.custom_student_id || ('STU-' + s.student_id) }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 text-gray-300 text-xs font-bold">{{ s.class_name || 'Unassigned' }}</td>
                  <td class="py-3.5 text-gray-300 text-xs capitalize">{{ (s.gender || 'MALE').toLowerCase() }}</td>
                  <td class="py-3.5 text-gray-400 text-xs font-mono">{{ (s.enrollment_date || '2026-01-01') | date:'mediumDate' }}</td>
                  <td class="py-3.5 text-right space-x-2">
                    <button (click)="router.navigate(['/admin/students'])" title="View Student List" class="text-gray-400 hover:text-emerald-400 text-xs p-1"><i class="fa-solid fa-eye"></i></button>
                    <button (click)="router.navigate(['/admin/students/edit', s.student_id])" title="Edit Student Profile" class="text-gray-400 hover:text-blue-400 text-xs p-1"><i class="fa-solid fa-pen"></i></button>
                  </td>
                </tr>

                <tr *ngIf="recentStudents.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500 italic">No recent student registrations recorded in MySQL.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions Panel (1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <h3 class="text-base font-bold text-white tracking-tight mb-5">Quick Actions</h3>
          <div class="space-y-3">
            <button (click)="router.navigate(['/admin/students/new'])" class="w-full bg-[#111827]/80 hover:bg-[#111827] border border-[#1f2937] p-3.5 rounded-xl flex items-center gap-4 group transition-all text-left">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-user-plus"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-white">Add Student</p>
                <p class="text-xs text-gray-400">Enroll new student</p>
              </div>
            </button>

            <button (click)="router.navigate(['/admin/teachers'])" class="w-full bg-[#111827]/80 hover:bg-[#111827] border border-[#1f2937] p-3.5 rounded-xl flex items-center gap-4 group transition-all text-left">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-white">Add Teacher</p>
                <p class="text-xs text-gray-400">Create staff record</p>
              </div>
            </button>

            <button (click)="router.navigate(['/admin/exams'])" class="w-full bg-[#111827]/80 hover:bg-[#111827] border border-[#1f2937] p-3.5 rounded-xl flex items-center gap-4 group transition-all text-left">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-file-circle-plus"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-white">Create Exam</p>
                <p class="text-xs text-gray-400">Schedule new exam</p>
              </div>
            </button>

            <button (click)="router.navigate(['/admin/timetable'])" class="w-full bg-[#111827]/80 hover:bg-[#111827] border border-[#1f2937] p-3.5 rounded-xl flex items-center gap-4 group transition-all text-left">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-white">Publish Timetable</p>
                <p class="text-xs text-gray-400">Push schedule live</p>
              </div>
            </button>

            <button (click)="router.navigate(['/admin/notifications'])" class="w-full bg-[#111827]/80 hover:bg-[#111827] border border-[#1f2937] p-3.5 rounded-xl flex items-center gap-4 group transition-all text-left">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-white">Send Announcement</p>
                <p class="text-xs text-gray-400">Broadcast message</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Split: Attendance by Class + Upcoming Exams -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Attendance by Class (Today) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-bold text-white tracking-tight">Attendance by Class (Today)</h3>
              <p class="text-xs text-gray-400 mt-0.5">Real-time daily class presence rates</p>
            </div>
            <a routerLink="/admin/attendance" class="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1">
              Full report →
            </a>
          </div>

          <!-- Dynamic Attendance List from MySQL -->
          <div class="space-y-4">
            <div *ngFor="let item of (attendanceByClass.length > 0 ? attendanceByClass : defaultAttendanceList)">
              <div class="flex justify-between text-xs font-semibold mb-1.5">
                <span class="text-gray-300 font-bold">{{ item.class_name || item.name }} — {{ item.subject_name || item.subject }}</span>
                <span [class.text-emerald-400]="(item.percentage || item.pct) >= 80"
                      [class.text-amber-400]="(item.percentage || item.pct) >= 70 && (item.percentage || item.pct) < 80"
                      [class.text-rose-400]="(item.percentage || item.pct) < 70"
                      class="font-mono font-extrabold">{{ item.percentage || item.pct }}%</span>
              </div>
              <div class="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-[#1f2937]">
                <div [class.bg-emerald-500]="(item.percentage || item.pct) >= 80"
                     [class.bg-amber-500]="(item.percentage || item.pct) >= 70 && (item.percentage || item.pct) < 80"
                     [class.bg-rose-500]="(item.percentage || item.pct) < 70"
                     class="h-full rounded-full transition-all duration-500 shadow-sm" 
                     [style.width.%]="item.percentage || item.pct"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Exams -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-bold text-white tracking-tight">Upcoming Exams</h3>
            <a routerLink="/admin/exams" class="text-xs text-emerald-400 hover:underline font-semibold">Manage →</a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-3">EXAM</th>
                  <th class="pb-3">CLASS</th>
                  <th class="pb-3">DATE</th>
                  <th class="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let ex of upcomingExams" class="hover:bg-gray-800/40">
                  <td class="py-3 font-semibold text-white">{{ ex.exam_title }}</td>
                  <td class="py-3 text-gray-300">{{ ex.class_name }}</td>
                  <td class="py-3 text-gray-400">{{ ex.exam_date | date:'MMM d' }}</td>
                  <td class="py-3">
                    <span [ngClass]="{
                      'status-badge-active': ex.status === 'Active' || ex.status === 'Published',
                      'status-badge-pending': ex.status === 'Pending',
                      'status-badge-draft': ex.status === 'Draft'
                    }" class="status-badge">
                      • {{ ex.status || 'Active' }}
                    </span>
                  </td>
                </tr>

                <tr *ngIf="upcomingExams.length === 0">
                  <td colspan="4" class="py-6 text-center text-gray-500 italic">No upcoming exams scheduled.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    feesCollected: 0,
    activeExams: 0,
    reportsGenerated: 0,
    attendanceRate: 0
  };
  recentStudents: any[] = [];
  attendanceByClass: any[] = [];
  upcomingExams: any[] = [];

  defaultAttendanceList = [

  ];

  constructor(private api: ApiService, public router: Router) { }

  get realDateSubtitle(): string {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const y = now.getFullYear();
    return `${formatted} · Academic Year ${y}–${y + 1}`;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.api.get<any>('dashboard/admin').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data.stats || this.stats;
          this.recentStudents = res.data.recentStudents || [];
          this.attendanceByClass = res.data.attendanceByClass || [];
          this.upcomingExams = res.data.upcomingExams || [];
        }
      },
      error: () => { }
    });
  }

  openQuickAdd(): void {
    this.router.navigate(['/admin/students/new']);
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }
}

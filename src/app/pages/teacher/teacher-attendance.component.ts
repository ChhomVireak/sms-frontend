import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Take Class Session Attendance'" 
                [subtitle]="'Teacher Portal / Per-Session Attendance'"
                [actionLabel]="'Submit Session Attendance'"
                [actionIcon]="'fa-solid fa-check-double'"
                (actionClicked)="saveSessionAttendance()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Metrics Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SESSION ATTENDANCE RATE</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ getAttendanceRate() }}%</h3>
          <div class="w-full bg-[#111827] h-2 rounded-full mt-2 overflow-hidden border border-[#1f2937]">
            <div [style.width.%]="getAttendanceRate()" class="bg-emerald-500 h-full rounded-full transition-all duration-500"></div>
          </div>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PRESENT IN SESSION</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ countStatus('PRESENT') }} Students</h3>
          <p class="text-xs text-emerald-400 mt-1 font-semibold">Marked present</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ABSENT IN SESSION</span>
          <h3 class="text-2xl font-extrabold text-rose-400 mt-2">{{ countStatus('ABSENT') }} Students</h3>
          <p class="text-xs text-rose-400 mt-1 font-semibold">Unexcused absence</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LATE / EXCUSED</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ countStatus('LATE') + countStatus('EXCUSED') }} Students</h3>
          <p class="text-xs text-amber-400 mt-1 font-semibold">Late or excused leave</p>
        </div>
      </div>

      <!-- Date & My Today Sessions Bar -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-calendar-check text-emerald-400"></i> My Today Scheduled Class Sessions
          </h3>
          <div class="flex items-center gap-3">
            <input type="date" [(ngModel)]="selectedDate" (change)="loadTodaySessions()" class="bg-[#111827] border border-[#1f2937] text-xs text-emerald-300 rounded-xl px-4 py-1.5 focus:outline-none focus:border-emerald-500 font-mono font-extrabold">
            <button (click)="setTodayDate()" class="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow">
              <i class="fa-solid fa-rotate"></i> Today
            </button>
          </div>
        </div>

        <!-- Class Sessions Grid List -->
        <div *ngIf="todaySessions.length === 0" class="p-6 text-center text-gray-400 italic bg-[#111827] rounded-xl border border-[#1f2937]">
          No class sessions scheduled for this teacher on {{ selectedDate }}.
        </div>

        <div *ngIf="todaySessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div *ngFor="let s of todaySessions" (click)="selectSession(s)" [ngClass]="{'border-emerald-500 bg-emerald-950/30': selectedTimetableId === s.timetable_id}" class="bg-[#111827] border border-[#1f2937] hover:border-emerald-600 rounded-xl p-4 cursor-pointer transition-all space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-white text-sm">{{ s.group_code }}</span>
              <span [ngClass]="s.is_attendance_taken ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                {{ s.is_attendance_taken ? 'COMPLETED' : 'ATTENDANCE PENDING' }}
              </span>
            </div>
            <div class="text-emerald-400 font-bold">{{ s.subject_name }} ({{ s.subject_code }})</div>
            <div class="text-gray-400 text-[11px] flex items-center gap-2">
              <i class="fa-regular fa-clock"></i> {{ s.start_time?.slice(0,5) }} - {{ s.end_time?.slice(0,5) }}
              <span class="text-gray-500">•</span>
              <i class="fa-solid fa-door-open"></i> Room {{ s.room_number || 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Batch Actions & Student Roster -->
      <div *ngIf="selectedSession" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-users text-emerald-400"></i> Roster: {{ selectedSession?.group_name }} — {{ selectedSession?.subject_name }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">Session: {{ selectedSession?.slot_name }} ({{ selectedSession?.start_time?.slice(0,5) }} - {{ selectedSession?.end_time?.slice(0,5) }})</p>
          </div>

          <!-- Search Input & Batch Mark Buttons -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative w-full sm:w-64">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="onSearchChange()" 
                     placeholder="Search student name or ID..." 
                     class="w-full bg-[#111827] border border-[#1f2937] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium placeholder-gray-500 shadow-inner">
            </div>

            <div class="flex items-center gap-1.5">
              <button (click)="markAll('PRESENT')" class="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-bold text-xs transition-all">All Present</button>
              <button (click)="markAll('ABSENT')" class="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-400 font-bold text-xs transition-all">All Absent</button>
              <button (click)="markAll('LATE')" class="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold text-xs transition-all">All Late</button>
              <button (click)="markAll('EXCUSED')" class="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 font-bold text-xs transition-all">All Excused</button>
            </div>
          </div>
        </div>

        <!-- Student Roster Table -->
        <div class="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar border border-[#1f2937] rounded-xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-[#111827] text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-md">
              <tr>
                <th class="p-3 bg-[#111827]">#</th>
                <th class="p-3 bg-[#111827]">STUDENT</th>
                <th class="p-3 text-center bg-[#111827]">SESSION STATUS</th>
                <th class="p-3 bg-[#111827]">NOTES</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]">
              <tr *ngFor="let s of paginatedStudents; let idx = index" class="hover:bg-[#111827]/50 transition-colors">
                <td class="p-3 font-mono text-gray-400">{{ startIndex + idx + 1 }}</td>
                <td class="p-3">
                  <div class="flex items-center gap-3">
                    <img *ngIf="getStudentImageUrl(s.image) && !s.imageError" 
                         [src]="getStudentImageUrl(s.image)" 
                         (error)="s.imageError = true" 
                         class="w-8 h-8 rounded-full object-cover border border-emerald-500/30">
                    <div *ngIf="!getStudentImageUrl(s.image) || s.imageError" 
                         class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {{ (s.first_name || 'S').charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-white">{{ s.first_name }} {{ s.last_name }}</div>
                      <div class="text-[10px] font-mono text-gray-400">ID: {{ s.custom_student_id }}</div>
                    </div>
                  </div>
                </td>

                <td class="p-3 text-center">
                  <div class="inline-flex rounded-xl bg-[#111827] p-1 border border-[#1f2937] gap-1">
                    <button (click)="s.status = 'PRESENT'" 
                            [class]="s.status === 'PRESENT' ? 'bg-emerald-600 text-white font-extrabold shadow-md' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      PRESENT
                    </button>
                    <button (click)="s.status = 'ABSENT'" 
                            [class]="s.status === 'ABSENT' ? 'bg-rose-600 text-white font-extrabold shadow-md' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      ABSENT
                    </button>
                    <button (click)="s.status = 'LATE'" 
                            [class]="s.status === 'LATE' ? 'bg-amber-600 text-white font-extrabold shadow-md' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      LATE
                    </button>
                    <button (click)="s.status = 'EXCUSED'" 
                            [class]="(s.status === 'EXCUSED' || s.status === 'PERMISSION') ? 'bg-indigo-600 text-white font-extrabold shadow-md' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      EXCUSED
                    </button>
                  </div>
                </td>

                <td class="p-3">
                  <input type="text" [(ngModel)]="s.note" placeholder="Optional notes..." class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium">
                </td>
              </tr>

              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="4" class="py-8 text-center text-gray-500 italic">
                  {{ searchQuery ? 'No matching students found for "' + searchQuery + '"' : 'No active students enrolled in this class group.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls Bar -->
        <div *ngIf="filteredStudents.length > 0" class="p-4 bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1f2937] rounded-b-xl">
          <div class="flex items-center gap-3 text-gray-400 text-xs">
            <span>Showing <strong class="text-white">{{ filteredStudents.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white">{{ endIndex }}</strong> of <strong class="text-white">{{ filteredStudents.length }}</strong> students</span>
            <div class="flex items-center gap-1.5 ml-2">
              <span>Per page:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#1e293b] border border-[#1f2937] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button (click)="goToPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-gray-300">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-gray-300">
              <i class="fa-solid fa-angle-left mr-1"></i> Prev
            </button>
            
            <span class="px-3 py-1 text-xs font-bold text-emerald-400 bg-[#1e293b] rounded border border-emerald-900/50">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-gray-300">
              Next <i class="fa-solid fa-angle-right ml-1"></i>
            </button>
            <button (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-gray-300">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #0f172a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #059669;
    }
  `]
})
export class TeacherAttendanceComponent implements OnInit {
  todaySessions: any[] = [];
  selectedSession: any = null;
  selectedTimetableId: number | null = null;
  selectedDate: string = '';
  students: any[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  searchQuery: string = '';

  get filteredStudents(): any[] {
    if (!this.searchQuery.trim()) return this.students;
    const q = this.searchQuery.toLowerCase().trim();
    return this.students.filter(s => 
      (s.first_name || '').toLowerCase().includes(q) ||
      (s.last_name || '').toLowerCase().includes(q) ||
      (`${s.first_name} ${s.last_name}`).toLowerCase().includes(q) ||
      (s.custom_student_id || '').toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredStudents.length);
  }

  get paginatedStudents(): any[] {
    return this.filteredStudents.slice(this.startIndex, this.endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  constructor(private api: ApiService, private toast: ToastService, private socket: SocketService) {}

  ngOnInit(): void {
    this.setTodayDate();
    this.socket.onEvent('attendance_marked').subscribe(() => {
      this.loadTodaySessions();
      if (this.selectedTimetableId) this.loadSessionAttendance();
    });
  }

  setTodayDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;
    this.loadTodaySessions();
  }

  loadTodaySessions(): void {
    this.api.get<any>('timetables/today', { date: this.selectedDate }).subscribe({
      next: (res) => {
        this.todaySessions = res.data?.sessions || res.data || [];
        if (this.todaySessions.length > 0 && !this.selectedTimetableId) {
          this.selectSession(this.todaySessions[0]);
        }
      },
      error: () => {
        this.todaySessions = [];
      }
    });
  }

  selectSession(s: any): void {
    this.selectedSession = s;
    this.selectedTimetableId = s.timetable_id;
    this.loadSessionAttendance();
  }

  loadSessionAttendance(): void {
    if (!this.selectedTimetableId) return;

    this.api.get<any>('attendance/session', { timetable_id: this.selectedTimetableId, date: this.selectedDate }).subscribe({
      next: (res) => {
        this.students = (res.data?.students || []).map((s: any) => ({
          ...s,
          imageError: false
        }));
      },
      error: () => {
        this.students = [];
      }
    });
  }

  saveSessionAttendance(): void {
    if (!this.selectedTimetableId || this.students.length === 0) {
      this.toast.error('No session or student records selected to save!');
      return;
    }

    const payload = {
      timetable_id: this.selectedTimetableId,
      date: this.selectedDate,
      records: this.students.map(s => ({
        student_id: s.student_id,
        status: s.status,
        note: s.note || ''
      }))
    };

    this.api.post('attendance/session', payload).subscribe({
      next: () => {
        this.toast.success('✓ Session attendance submitted successfully!');
        this.loadTodaySessions();
        this.loadSessionAttendance();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to submit session attendance')
    });
  }

  getStudentImageUrl(img: string | null): string | null {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return img.startsWith('/') ? `${baseUrl}${img}` : `${baseUrl}/${img}`;
  }

  getAttendanceRate(): number {
    if (!this.students || this.students.length === 0) return 0;
    const presentCount = this.countStatus('PRESENT') + this.countStatus('LATE');
    return Math.round((presentCount / this.students.length) * 100);
  }

  countStatus(st: string): number {
    return this.students.filter(s => String(s.status || '').toUpperCase() === st).length;
  }

  markAll(status: string): void {
    this.students.forEach(s => s.status = status);
  }
}

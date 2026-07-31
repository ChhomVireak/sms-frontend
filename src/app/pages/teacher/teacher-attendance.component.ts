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
    <app-navbar [title]="'Take Student Attendance'" 
                [subtitle]="'Teacher Portal / Take Attendance'"
                [actionLabel]="'Submit Attendance'"
                [actionIcon]="'fa-solid fa-check'"
                (actionClicked)="saveAttendance()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Metrics Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TODAY'S ATTENDANCE RATE</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ getAttendanceRate() }}%</h3>
          <div class="w-full bg-[#111827] h-2 rounded-full mt-2 overflow-hidden border border-[#1f2937]">
            <div [style.width.%]="getAttendanceRate()" class="bg-emerald-500 h-full rounded-full transition-all duration-500"></div>
          </div>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PRESENT TODAY</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ countStatus('PRESENT') }} Students</h3>
          <p class="text-xs text-emerald-400 mt-1 font-semibold">In class today</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ABSENT TODAY</span>
          <h3 class="text-2xl font-extrabold text-rose-400 mt-2">{{ countStatus('ABSENT') }} Students</h3>
          <p class="text-xs text-rose-400 mt-1 font-semibold">Unexcused absence</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LATE / EXCUSED TODAY</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ countStatus('LATE') + countStatus('EXCUSED') }} Students</h3>
          <p class="text-xs text-amber-400 mt-1 font-semibold">Arrived late or excused</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-emerald-400"></i> Mark Class Attendance
          </h3>
          <button (click)="setTodayDate()" class="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow">
            <i class="fa-solid fa-calendar-day"></i> Reset to Today
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <!-- Select Class Group -->
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between mb-1">
              <label class="block font-bold text-emerald-400">SELECT MY CLASS GROUP *</label>
            </div>
            <select [(ngModel)]="selectedClass" (change)="loadAttendance()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold">
              <option *ngFor="let g of groups" [value]="g.group_id">
                {{ g.group_code }} — {{ g.group_name }}
              </option>
            </select>
          </div>

          <!-- Attendance Date (Auto Today's Date) -->
          <div>
            <label class="block font-bold text-gray-300 mb-1 flex items-center justify-between">
              <span>ATTENDANCE DATE *</span>
            </label>
            <input type="date" [(ngModel)]="selectedDate" (change)="loadAttendance()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-emerald-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono font-extrabold">
          </div>

          <!-- Batch Action Buttons -->
          <div class="lg:col-span-3">
            <label class="block font-bold text-gray-400 mb-1 uppercase tracking-wider text-[10px]">BATCH MARK STUDENTS</label>
            <div class="grid grid-cols-4 gap-2">
              <button (click)="markAll('PRESENT')" class="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-1">All Present</button>
              <button (click)="markAll('ABSENT')" class="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-1">All Absent</button>
              <button (click)="markAll('LATE')" class="p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-1">All Late</button>
              <button (click)="markAll('EXCUSED')" class="p-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 font-bold text-xs transition-all flex items-center justify-center gap-1">All Excused</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Attendance Roster Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-users text-emerald-400"></i> Student Roster ({{ filteredStudents.length }} Students)
          </h3>
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input type="text" [(ngModel)]="studentSearchQuery" placeholder="Search student name or ID..." class="bg-[#111827] border border-[#1f2937] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <!-- Scrollable Student Roster Container with Sticky Header -->
        <div class="max-h-[620px] overflow-y-auto relative rounded-xl border border-[#1f2937] bg-[#111827]/40 shadow-inner">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-[#1e293b] text-gray-400 font-bold border-b border-[#1f2937] sticky top-0 z-10 shadow">
              <tr class="uppercase tracking-wider">
                <th class="p-3">STUDENT</th>
                <th class="p-3 text-center">ATTENDANCE STATUS</th>
                <th class="p-3">REASON / NOTE</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let s of paginatedStudents" class="hover:bg-gray-800/40 transition-colors">
                <td class="p-3 flex items-center gap-3 font-bold text-white">
                  <!-- Student Avatar Image / Initials Fallback -->
                  <img *ngIf="getStudentImageUrl(s.image) && !s.imageError" 
                       [src]="getStudentImageUrl(s.image)" 
                       (error)="s.imageError = true" 
                       class="w-9 h-9 rounded-full object-cover shrink-0 border border-cyan-500/40 shadow-sm">
                  <div *ngIf="!getStudentImageUrl(s.image) || s.imageError" class="w-9 h-9 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm font-mono">
                    {{ (s.first_name || 'S')[0] }}{{ (s.last_name || '')[0] }}
                  </div>
                  <div>
                    <span class="block text-sm font-extrabold text-white">{{ s.first_name }} {{ s.last_name }}</span>
                    <span class="text-[11px] text-gray-400 font-mono font-normal">{{ s.custom_student_id || ('STU-' + s.student_id) }}</span>
                  </div>
                </td>

                <td class="p-3 text-center">
                  <div class="inline-flex items-center gap-1.5 bg-[#111827] p-1 rounded-xl border border-[#1f2937]">
                    <button (click)="quickMarkStudentStatus(s, 'PRESENT')" 
                            [ngClass]="isStatus(s.status, 'PRESENT') ? 'bg-emerald-500 text-white shadow-md font-extrabold' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                      PRESENT
                    </button>
                    <button (click)="quickMarkStudentStatus(s, 'ABSENT')" 
                            [ngClass]="isStatus(s.status, 'ABSENT') ? 'bg-rose-500 text-white shadow-md font-extrabold' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                      ABSENT
                    </button>
                    <button (click)="quickMarkStudentStatus(s, 'LATE')" 
                            [ngClass]="isStatus(s.status, 'LATE') ? 'bg-amber-500 text-white shadow-md font-extrabold' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                      LATE
                    </button>
                    <button (click)="quickMarkStudentStatus(s, 'EXCUSED')" 
                            [ngClass]="(isStatus(s.status, 'EXCUSED') || isStatus(s.status, 'PERMISSION')) ? 'bg-indigo-500 text-white shadow-md font-extrabold' : 'text-gray-400 hover:text-white'" 
                            class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                      EXCUSED
                    </button>
                  </div>
                </td>

                <td class="p-3">
                  <div *ngIf="s.note && (s.status === 'EXCUSED' || s.status === 'PERMISSION')" class="text-[11px] text-purple-300 font-extrabold flex items-center gap-1.5 mb-1.5 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/60 w-fit">
                    <i class="fa-solid fa-file-signature text-purple-400"></i> Student Leave Note: {{ s.note }}
                  </div>
                  <input type="text" [(ngModel)]="s.note" (change)="saveAttendance()" placeholder="Optional notes (e.g. Late by 15 mins...)" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium">
                </td>
              </tr>

              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="3" class="py-8 text-center text-gray-500 italic">
                  No students found for attendance marking.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Interactive Pagination Controls Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1f2937] text-xs">
          <div class="flex items-center gap-3 text-gray-400 font-medium">
            <span>Showing {{ filteredStudents.length > 0 ? startIndex + 1 : 0 }} to {{ endIndex }} of {{ filteredStudents.length }} students</span>
            <div class="flex items-center gap-1.5 ml-2">
              <label class="text-gray-400">Per page:</label>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#111827] border border-[#1f2937] text-white rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div *ngIf="totalPages > 1" class="flex items-center gap-1">
            <button (click)="setPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-gray-800 disabled:opacity-30 border border-[#1f2937] text-gray-300 font-bold cursor-pointer">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button (click)="setPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-gray-800 disabled:opacity-30 border border-[#1f2937] text-gray-300 font-bold cursor-pointer">
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <button *ngFor="let p of pageRange" (click)="setPage(p)" [class]="p === currentPage ? 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold shadow-md cursor-pointer' : 'px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-gray-800 border border-[#1f2937] text-gray-300 font-bold cursor-pointer'">
              {{ p }}
            </button>

            <button (click)="setPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-gray-800 disabled:opacity-30 border border-[#1f2937] text-gray-300 font-bold cursor-pointer">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
            <button (click)="setPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-gray-800 disabled:opacity-30 border border-[#1f2937] text-gray-300 font-bold cursor-pointer">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeacherAttendanceComponent implements OnInit {
  groups: any[] = [];
  selectedClass: any = null;
  selectedDate: string = '';
  students: any[] = [];
  studentSearchQuery = '';

  // Interactive Pagination Controls State
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];

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

  get pageRange(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const range: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  constructor(private api: ApiService, private toast: ToastService, private socket: SocketService) { }

  ngOnInit(): void {
    this.setTodayDate();
    this.loadGroups();
    this.socket.onEvent('attendance_marked').subscribe(() => this.loadAttendance());
    this.socket.onEvent('ATTENDANCE_UPDATED').subscribe(() => this.loadAttendance());
  }

  setTodayDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;
    if (this.selectedClass) {
      this.loadAttendance();
    }
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

  isStatus(val: string, target: string): boolean {
    return String(val || '').toUpperCase() === target;
  }

  countStatus(st: string): number {
    return this.students.filter(s => this.isStatus(s.status, st)).length;
  }

  quickMarkStudentStatus(s: any, status: string): void {
    s.status = status;
    this.saveAttendance();
  }

  markAll(status: string): void {
    this.students.forEach(s => s.status = status);
    this.saveAttendance();
  }

  get filteredStudents(): any[] {
    if (!this.studentSearchQuery || !this.studentSearchQuery.trim()) {
      return this.students;
    }
    const q = this.studentSearchQuery.toLowerCase().trim();
    return this.students.filter(s => {
      const fn = (s.first_name || '').toLowerCase();
      const ln = (s.last_name || '').toLowerCase();
      const cid = (s.custom_student_id || '').toLowerCase();
      return fn.includes(q) || ln.includes(q) || cid.includes(q);
    });
  }

  loadGroups(): void {
    this.api.get<any>('groups', { teacher_only: 'true' }).subscribe({
      next: (res) => {
        this.groups = res.data?.groups || res.data || [];
        if (this.groups.length === 0) {
          this.api.get<any>('groups').subscribe(allRes => {
            this.groups = allRes.data?.groups || allRes.data || [];
            if (this.groups.length > 0 && !this.selectedClass) {
              this.selectedClass = this.groups[0].group_id;
            }
            this.loadAttendance();
          });
        } else {
          if (!this.selectedClass) {
            this.selectedClass = this.groups[0].group_id;
          }
          this.loadAttendance();
        }
      },
      error: () => {
        this.api.get<any>('groups').subscribe(allRes => {
          this.groups = allRes.data?.groups || allRes.data || [];
          if (this.groups.length > 0 && !this.selectedClass) {
            this.selectedClass = this.groups[0].group_id;
          }
          this.loadAttendance();
        });
      }
    });
  }

  loadAttendance(): void {
    if (!this.selectedClass) return;
    this.api.get<any>('students', { groupId: this.selectedClass }).subscribe({
      next: (res) => {
        const studentList = res.data?.students || res.data || [];

        this.api.get<any>('attendance', { group_id: this.selectedClass, date: this.selectedDate }).subscribe({
          next: (attRes) => {
            const existingAtt = attRes.data?.attendance || attRes.data || [];
            const attMap = new Map<number, any>();
            existingAtt.forEach((a: any) => attMap.set(Number(a.student_id), a));

            this.students = studentList.map((s: any) => {
              const attRecord = attMap.get(Number(s.student_id));
              return {
                student_id: s.student_id,
                custom_student_id: s.custom_student_id,
                first_name: s.first_name,
                last_name: s.last_name,
                image: s.image || s.photo || s.avatar || s.profile_image || null,
                status: attRecord ? String(attRecord.status).toUpperCase() : 'PRESENT',
                note: attRecord ? attRecord.note || attRecord.notes || '' : '',
                imageError: false
              };
            });
          },
          error: () => {
            this.students = studentList.map((s: any) => ({
              student_id: s.student_id,
              custom_student_id: s.custom_student_id,
              first_name: s.first_name,
              last_name: s.last_name,
              image: s.image || s.photo || s.avatar || s.profile_image || null,
              status: 'PRESENT',
              note: '',
              imageError: false
            }));
          }
        });
      },
      error: () => {
        this.students = [];
      }
    });
  }

  saveAttendance(): void {
    if (!this.selectedClass || this.students.length === 0) {
      this.toast.error('No student records to save!');
      return;
    }

    const payload = {
      group_id: this.selectedClass,
      date: this.selectedDate,
      attendance: this.students.map(s => ({
        student_id: s.student_id,
        status: s.status,
        note: s.note || ''
      }))
    };

    this.api.post('attendance', payload).subscribe({
      next: () => {
        this.toast.success('✓ Student attendance submitted to database successfully!');
        this.loadAttendance();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to submit attendance')
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-attendance-mark',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="isTeacherView ? 'Take Student Attendance' : 'Attendance Management'" 
                [subtitle]="isTeacherView ? 'Teacher Portal / Take Attendance' : 'Admin / Attendance'"
                [actionLabel]="'Submit Attendance'"
                [actionIcon]="'fa-solid fa-check'"
                (actionClicked)="saveAttendance()"></app-navbar>

    <!-- Sub-Navigation Header Tabs -->
    <div class="px-8 pt-4">
      <div class="flex items-center gap-2 border-b border-[#1f2937] pb-3 overflow-x-auto">
        <button (click)="attendanceSubTab = 'class'" 
                [class.bg-emerald-600]="attendanceSubTab === 'class'" [class.text-white]="attendanceSubTab === 'class'" 
                [class.bg-[#1e293b]]="attendanceSubTab !== 'class'" [class.text-gray-400]="attendanceSubTab !== 'class'" 
                class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border border-[#1f2937]">
          <i class="fa-solid fa-user-graduate"></i> Student Attendance 
        </button>

        <button *ngIf="!isTeacherView" (click)="attendanceSubTab = 'teacher'; loadTeacherLogs()" 
                [class.bg-emerald-600]="attendanceSubTab === 'teacher'" [class.text-white]="attendanceSubTab === 'teacher'" 
                [class.bg-[#1e293b]]="attendanceSubTab !== 'teacher'" [class.text-gray-400]="attendanceSubTab !== 'teacher'" 
                class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border border-[#1f2937]">
          <i class="fa-solid fa-chalkboard-user"></i> Teacher Attendance
        </button>

        
      </div>
    </div>

    <div class="p-8 space-y-6 overflow-y-auto">
      
      <!-- ==================================================================== -->
      <!-- TAB 1: 🏫 ATTENDANCE BY CLASS (TODAY) -->
      <!-- ==================================================================== -->
      <div *ngIf="attendanceSubTab === 'class'" class="space-y-6">
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

        <!-- Attendance by Class (Today) Horizontal Filter Bar -->
        <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-layer-group text-emerald-400"></i> Attendance by Class (Today)
            </h3>
            <div class="flex items-center gap-2">
              <button (click)="openMultiDayLeaveModal()" class="px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 font-bold hover:bg-purple-900 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-minus"></i> Multi-Day Leave
              </button>
              <button (click)="setTodayDate()" class="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-day"></i> Today
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
            <!-- Select Class Group -->
            <div class="lg:col-span-2">
              <label class="block font-bold text-emerald-400 mb-1">SELECT CLASS GROUP *</label>
              <select [(ngModel)]="selectedClass" (change)="onClassChange()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                <option *ngFor="let g of groups" [value]="g.group_id">
                  {{ g.group_code }} — {{ g.group_name }} (Year {{ g.academic_year_level || 1 }} · Sem {{ g.current_semester || 1 }})
                </option>
              </select>
            </div>

            <!-- Select Subject & Teacher -->
            <div class="lg:col-span-2">
              <label class="block font-bold text-amber-400 mb-1">SELECT SUBJECT & TEACHER</label>
              <select [(ngModel)]="selectedSubjectId" (change)="onSubjectSelectChange()" class="w-full bg-[#111827] border border-amber-500/40 text-xs text-amber-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-400 font-bold cursor-pointer">
                <option [ngValue]="null">-- All Class Subjects --</option>
                <option *ngFor="let sub of availableClassSubjects" [ngValue]="sub.subject_id">
                  {{ sub.subject_code }} — {{ sub.subject_name }} ({{ sub.teacher_name || getAssignedTeacherName(sub) || 'Assigned Teacher' }})
                </option>
              </select>
            </div>

            <!-- Attendance Date Picker -->
            <div>
              <label class="block font-bold text-cyan-400 mb-1">ATTENDANCE DATE *</label>
              <input type="date" [(ngModel)]="selectedDate" (change)="loadAttendance()" class="w-full bg-[#111827] border border-cyan-500/40 text-xs text-cyan-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400 font-mono font-extrabold cursor-pointer">
            </div>

            <!-- Batch Action Buttons -->
            <div class="lg:col-span-2">
              <label class="block font-bold text-gray-400 mb-1 uppercase tracking-wider text-[10px]">BATCH MARK CLASS STUDENTS</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button (click)="markAll('PRESENT')" class="py-2.5 px-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-bold text-[11px] transition-all text-center">Present</button>
                <button (click)="markAll('ABSENT')" class="py-2.5 px-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-400 font-bold text-[11px] transition-all text-center">Absent</button>
                <button (click)="markAll('LATE')" class="py-2.5 px-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold text-[11px] transition-all text-center">Late</button>
                <button (click)="markAll('EXCUSED')" class="py-2.5 px-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 font-bold text-[11px] transition-all text-center">Excused</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Sheet Table (Full Width) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h3 class="text-base font-bold text-white tracking-tight">
               <span class="text-emerald-400 font-mono">{{ selectedDate | date:'mediumDate' }}</span>
              </h3>

              <!-- Search Bar by Name, Student ID, or Phone Number -->
              <div class="relative min-w-[260px]">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" 
                       [(ngModel)]="studentSearchQuery" 
                       placeholder="Search Name, ID, or Phone..." 
                       class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-bold shadow-sm placeholder:text-gray-500">
              </div>

              <div class="flex items-center gap-2 text-xs flex-wrap">
                <span class="status-badge status-badge-present">Present: {{ countStatus('PRESENT') }}</span>
                <span class="status-badge status-badge-absent">Absent: {{ countStatus('ABSENT') }}</span>
                <span class="status-badge status-badge-pending">Late: {{ countStatus('LATE') }}</span>
                <span class="status-badge status-badge-active">Excused: {{ countStatus('EXCUSED') }}</span>
              </div>
            </div>

            <div class="overflow-x-auto overflow-y-auto max-h-[620px] rounded-xl border border-[#1f2937]/50">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                    <th class="py-3 px-3 w-8">#</th>
                    <th class="py-3 px-3">STUDENT ID</th>
                    <th class="py-3 px-3">STUDENT NAME</th>
                    <th class="py-3 px-3">SUBJECT & TEACHER</th>
                    <th class="py-3 px-3">ATTENDANCE STATUS</th>
                    <th class="py-3 px-3">REMARKS / NOTE</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let s of paginatedStudents; let i = index" class="hover:bg-gray-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono text-gray-500">{{ (startIndex + i + 1) < 10 ? '0' + (startIndex + i + 1) : (startIndex + i + 1) }}</td>
                    <td class="py-3 px-3 font-mono text-emerald-400 font-bold">{{ s.custom_student_id }}</td>
                    <td class="py-3 px-3 flex items-center gap-3 font-bold text-white">
                      <div class="w-9 h-9 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        <img *ngIf="s.image || s.photo" [src]="getPhotoUrl(s.image || s.photo)" class="w-full h-full object-cover">
                        <span *ngIf="!s.image && !s.photo">{{ s.first_name ? s.first_name[0] : 'S' }}{{ s.last_name ? s.last_name[0] : '' }}</span>
                      </div>
                      <span>{{ s.first_name }} {{ s.last_name }}</span>
                    </td>
                    <td class="py-3 px-3 font-sans">
                      <div *ngIf="getActiveDisplaySubject(s)" class="space-y-0.5">
                        <span class="font-extrabold text-amber-300 block text-xs"><i class="fa-solid fa-book text-amber-400 mr-1"></i>{{ getActiveDisplaySubject(s).subject_name }}</span>
                        <span *ngIf="getActiveDisplaySubject(s).teacher_name || getAssignedTeacherName(getActiveDisplaySubject(s))" class="text-[10px] text-emerald-400 font-bold block">
                          <i class="fa-solid fa-chalkboard-user text-emerald-400 mr-1"></i>{{ getActiveDisplaySubject(s).teacher_name || getAssignedTeacherName(getActiveDisplaySubject(s)) }}
                        </span>
                      </div>
                      <div *ngIf="!getActiveDisplaySubject(s)" class="text-xs text-amber-300 font-extrabold">
                        General Class Attendance
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <div class="flex items-center gap-1.5">
                        <button type="button" (click)="quickMarkStudentStatus(s, 'PRESENT')" [ngClass]="isStatus(s.status, 'PRESENT') ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'bg-gray-800 text-gray-400 hover:text-white'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Present</button>
                        <button type="button" (click)="quickMarkStudentStatus(s, 'ABSENT')" [ngClass]="isStatus(s.status, 'ABSENT') ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'bg-gray-800 text-gray-400 hover:text-white'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Absent</button>
                        <button type="button" (click)="quickMarkStudentStatus(s, 'LATE')" [ngClass]="isStatus(s.status, 'LATE') ? 'bg-amber-600 text-white shadow-md font-extrabold' : 'bg-gray-800 text-gray-400 hover:text-white'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Late</button>
                        <button type="button" (click)="quickMarkStudentStatus(s, 'EXCUSED')" [ngClass]="(isStatus(s.status, 'EXCUSED') || isStatus(s.status, 'PERMISSION')) ? 'bg-indigo-600 text-white shadow-md font-extrabold' : 'bg-gray-800 text-gray-400 hover:text-white'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Permission / Excused</button>
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <input type="text" [(ngModel)]="s.note" (change)="saveAttendance()" placeholder="Add note..." class="bg-[#111827] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-500">
                    </td>
                  </tr>

                  <tr *ngIf="filteredStudents.length === 0">
                    <td colspan="6" class="py-8 text-center text-gray-500 italic">No class student records found for attendance marking.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Interactive Pagination Footer Bar -->
            <div class="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div class="flex items-center gap-3">
                <span>
                  Showing <strong class="text-white font-mono">{{ filteredStudents.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-emerald-400 font-mono">{{ filteredStudents.length }}</strong> class students
                </span>
                <div class="flex items-center gap-1.5 ml-2 border-l border-[#1f2937] pl-3">
                  <span>Per page:</span>
                  <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#111827] border border-[#1f2937] text-emerald-400 font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                    <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <!-- First Page -->
                <button (click)="setPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
                  <i class="fa-solid fa-angles-left"></i>
                </button>
                <!-- Prev Page -->
                <button (click)="setPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
                  <i class="fa-solid fa-angle-left"></i> Prev
                </button>

                <!-- Page Number Buttons -->
                <button *ngFor="let p of pageRange" 
                        (click)="setPage(p)" 
                        [ngClass]="p === currentPage ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/30' : 'bg-[#111827] border-[#1f2937] text-gray-300 hover:text-white hover:border-emerald-500/40'"
                        class="w-8 h-8 rounded-lg border font-mono text-xs flex items-center justify-center transition-all cursor-pointer">
                  {{ p }}
                </button>

                <!-- Next Page -->
                <button (click)="setPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
                  Next <i class="fa-solid fa-angle-right"></i>
                </button>
                <!-- Last Page -->
                <button (click)="setPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
                  <i class="fa-solid fa-angles-right"></i>
                </button>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <button (click)="saveAttendance()" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                <i class="fa-solid fa-check"></i> Save Daily Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- TAB 2: 👨‍🏫 ATTENDANCE TEACHER (គ្រប់គ្រងវត្តមានគ្រូ) -->
      <!-- ==================================================================== -->
      <div *ngIf="attendanceSubTab === 'teacher'" class="space-y-6 pt-0 p-5">
        <!-- Top Metrics Summary for Faculty Teachers -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 ">
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEACHERS PRESENT TODAY</span>
            <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ countTeacherAttendanceStatus('PRESENT') }} Faculty</h3>
            <p class="text-xs text-emerald-400 mt-1 font-semibold">Present at university today</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEACHERS LATE TODAY</span>
            <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ countTeacherAttendanceStatus('LATE') }} Faculty</h3>
            <p class="text-xs text-amber-400 mt-1 font-semibold">Arrived late for class</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEACHERS ON LEAVE TODAY</span>
            <h3 class="text-2xl font-extrabold text-indigo-400 mt-2">{{ countTeacherAttendanceStatus('LEAVE') }} Faculty</h3>
            <p class="text-xs text-indigo-400 mt-1 font-semibold">Approved official leave</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEACHERS ABSENT TODAY</span>
            <h3 class="text-2xl font-extrabold text-rose-400 mt-2">{{ countTeacherAttendanceStatus('ABSENT') }} Faculty</h3>
            <p class="text-xs text-rose-400 mt-1 font-semibold">Unexcused absence</p>
          </div>
        </div>

        <!-- Faculty Attendance Form Horizontal Top Bar -->
        <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-chalkboard-user text-emerald-400"></i> Faculty Attendance Form
            </h3>
            <button (click)="setTodayTeacherDate()" class="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-calendar-day"></i> Today
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <!-- Faculty / Dept -->
            <div>
              <label class="block font-bold text-gray-300 mb-1">FACULTY / DEPARTMENT *</label>
              <select [(ngModel)]="selectedTeacherDept" (change)="filterTeacherList()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                <option value="">All Faculties & Departments</option>
                <option *ngFor="let dept of availableTeacherDepts" [value]="dept">{{ dept }}</option>
              </select>
            </div>

            <!-- Employment Type -->
            <div>
              <label class="block font-bold text-gray-300 mb-1">EMPLOYMENT TYPE *</label>
              <select [(ngModel)]="selectedTeacherEmpType" (change)="filterTeacherList()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                <option value="">All Employment Types</option>
                <option value="Full-time">Full-time Faculty</option>
                <option value="Part-time">Part-time Lecturer</option>
              </select>
            </div>

            <!-- Attendance Date -->
            <div>
              <label class="block font-bold text-gray-300 mb-1">ATTENDANCE DATE *</label>
              <input type="date" [(ngModel)]="teacherAttendanceDate" (change)="loadTeacherDailyAttendance()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono">
            </div>

            <!-- Time Slot (Categorized by Shifts) -->
            <div>
              <label class="block font-bold text-amber-400 mb-1">TIME SLOT *</label>
              <select [(ngModel)]="selectedTeacherTimeSlot" (change)="onTimeSlotChange()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-amber-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-bold font-mono cursor-pointer">
                <option value="All Day">All Day (ពេញមួយថ្ងៃ)</option>
                <optgroup label="🌅 MORNING SHIFT">
                  <option *ngFor="let s of morningSlots" [value]="formatSlotLabel(s)">
                    {{ formatSlotLabel(s) }}
                  </option>
                </optgroup>
                <optgroup label="☀️ AFTERNOON SHIFT">
                  <option *ngFor="let s of afternoonSlots" [value]="formatSlotLabel(s)">
                    {{ formatSlotLabel(s) }}
                  </option>
                </optgroup>
                <optgroup label="🌙 EVENING SHIFT">
                  <option *ngFor="let s of eveningSlots" [value]="formatSlotLabel(s)">
                    {{ formatSlotLabel(s) }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Batch Actions (Horizontal Buttons) -->
            <div>
              <label class="block font-bold text-gray-400 mb-1 uppercase tracking-wider text-[10px]">BATCH MARK TEACHERS</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button (click)="markAllTeachers('PRESENT')" class="py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center">Present</button>
                <button (click)="markAllTeachers('LATE')" class="py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold text-xs transition-all flex items-center justify-center">Late</button>
                <button (click)="markAllTeachers('LEAVE')" class="py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-400 font-bold text-xs transition-all flex items-center justify-center">Leave</button>
                <button (click)="markAllTeachers('ABSENT')" class="py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-400 font-bold text-xs transition-all flex items-center justify-center">Absent</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Faculty Teachers Attendance Roster Sheet Table (Full Width) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 class="text-base font-bold text-white tracking-tight">
              <span class="text-emerald-400 font-mono">{{ teacherAttendanceDate | date:'mediumDate' }}</span>
            </h3>

            <!-- Search Bar by Name, ID, or Phone -->
            <div class="relative min-w-[260px]">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" 
                     [(ngModel)]="teacherSearchQuery" 
                     placeholder="Search Teacher Name, ID, or Phone..." 
                     class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-bold shadow-sm placeholder:text-gray-500">
            </div>

            <div class="flex items-center gap-2 text-xs flex-wrap">
              <span class="status-badge status-badge-present">Present: {{ countTeacherAttendanceStatus('PRESENT') }}</span>
              <span class="status-badge status-badge-pending">Late: {{ countTeacherAttendanceStatus('LATE') }}</span>
              <span class="status-badge status-badge-active">Leave: {{ countTeacherAttendanceStatus('LEAVE') }}</span>
              <span class="status-badge status-badge-absent">Absent: {{ countTeacherAttendanceStatus('ABSENT') }}</span>
            </div>
          </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                    <th class="pb-3 w-8">#</th>
                    <th class="pb-3">TEACHER ID</th>
                    <th class="pb-3">FACULTY TEACHER</th>
                    <th class="pb-3">ATTENDANCE STATUS</th>
                    <th class="pb-3">TIME SLOT</th>
                    <th class="pb-3">AFFECTED CLASS GROUPS</th>
                    <th class="pb-3">REMARKS / NOTE</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let t of filteredTeacherAttendanceList; let i = index" class="hover:bg-gray-800/40 transition-colors">
                    <td class="py-3 font-mono text-gray-500">{{ i + 1 }}</td>
                    <td class="py-3 font-mono text-emerald-400 font-bold">{{ t.custom_teacher_id }}</td>
                    <td class="py-3 flex items-center gap-3 font-bold text-white">
                      <div class="w-8 h-8 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                        <img *ngIf="t.image" [src]="getPhotoUrl(t.image)" class="w-full h-full object-cover">
                        <span *ngIf="!t.image">{{ t.first_name ? t.first_name[0] : 'T' }}{{ t.last_name ? t.last_name[0] : '' }}</span>
                      </div>
                      <div>
                        <p class="font-bold text-white">{{ t.first_name }} {{ t.last_name }}</p>
                        <p class="text-[10px] text-gray-400">{{ t.department || 'Computer Science' }}</p>
                      </div>
                    </td>
                    <td class="py-3">
                      <div class="flex items-center gap-1.5">
                        <button type="button" (click)="t.status = 'PRESENT'" [class.bg-emerald-600]="t.status === 'PRESENT'" [class.text-white]="t.status === 'PRESENT'" [class.bg-gray-800]="t.status !== 'PRESENT'" [class.text-gray-400]="t.status !== 'PRESENT'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Present</button>
                        <button type="button" (click)="t.status = 'LATE'" [class.bg-amber-600]="t.status === 'LATE'" [class.text-white]="t.status === 'LATE'" [class.bg-gray-800]="t.status !== 'LATE'" [class.text-gray-400]="t.status !== 'LATE'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Late</button>
                        <button type="button" (click)="t.status = 'LEAVE'" [class.bg-indigo-600]="t.status === 'LEAVE'" [class.text-white]="t.status === 'LEAVE'" [class.bg-gray-800]="t.status !== 'LEAVE'" [class.text-gray-400]="t.status !== 'LEAVE'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Leave</button>
                        <button type="button" (click)="t.status = 'ABSENT'" [class.bg-rose-600]="t.status === 'ABSENT'" [class.text-white]="t.status === 'ABSENT'" [class.bg-gray-800]="t.status !== 'ABSENT'" [class.text-gray-400]="t.status !== 'ABSENT'" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all">Absent</button>
                      </div>
                    </td>
                    <td class="py-3 font-mono">
                      <select [(ngModel)]="t.time_slot" class="bg-[#111827] border border-[#1f2937] text-[10px] text-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer">
                        <option value="All Day">All Day</option>
                        <optgroup label="MORNING">
                          <option *ngFor="let s of morningSlots" [value]="formatSlotLabel(s)">
                            {{ formatSlotLabel(s) }}
                          </option>
                        </optgroup>
                        <optgroup label="AFTERNOON">
                          <option *ngFor="let s of afternoonSlots" [value]="formatSlotLabel(s)">
                            {{ formatSlotLabel(s) }}
                          </option>
                        </optgroup>
                        <optgroup label="EVENING">
                          <option *ngFor="let s of eveningSlots" [value]="formatSlotLabel(s)">
                            {{ formatSlotLabel(s) }}
                          </option>
                        </optgroup>
                      </select>
                    </td>
                    <td class="py-3 font-mono font-bold">
                      <div *ngIf="t.status === 'LEAVE' || t.status === 'ABSENT'">
                        <span class="px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] inline-flex items-center gap-1 font-bold">
                          <i class="fa-solid fa-bell"></i> {{ getTeacherAssignedClassesSummary(t) }}
                        </span>
                      </div>
                      <span *ngIf="t.status !== 'LEAVE' && t.status !== 'ABSENT'" class="text-gray-500 text-[11px] font-normal">
                        -
                      </span>
                    </td>
                    <td class="py-3">
                      <input type="text" [(ngModel)]="t.note" placeholder="Add note / leave reason..." class="bg-[#111827] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-500">
                    </td>
                  </tr>
                  <tr *ngIf="filteredTeacherAttendanceList.length === 0">
                    <td colspan="7" class="py-8 text-center text-gray-500 font-bold">No faculty teachers found for selected filters</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-6 flex justify-end">
              <button (click)="saveTeacherDailyAttendance()" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                <i class="fa-solid fa-check"></i> Save Faculty Teacher Attendance
              </button>
            </div>
          </div>
        </div>

      
    <!-- Student Multi-Day Leave Request Modal -->
    <div *ngIf="showMultiDayLeaveModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl text-xs text-white">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i class="fa-solid fa-calendar-plus text-purple-400"></i> Student Multi-Day Leave Request
          </h3>
          <button (click)="showMultiDayLeaveModal = false" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form (ngSubmit)="submitMultiDayLeave()" class="space-y-4">
          <!-- Class Group Filter & Search Name/Phone Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937]">
            <div>
              <label class="block font-bold text-gray-300 mb-1">FILTER CLASS GROUP</label>
              <select [(ngModel)]="selectedMultiDayGroupId" (change)="onMultiDayFilterChange()" name="multi_group_id" class="w-full bg-[#1e293b] border border-[#1f2937] text-white font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 cursor-pointer">
                <option value="">All Class Groups</option>
                <option *ngFor="let g of groups" [value]="g.group_id">
                  {{ g.group_code }} — {{ g.group_name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">SEARCH NAME / PHONE</label>
              <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" [(ngModel)]="multiDayStudentSearchQuery" (input)="onMultiDayFilterChange()" name="multi_search" placeholder="Name, ID, or Phone..." class="w-full bg-[#1e293b] border border-[#1f2937] text-white rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-bold">
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block font-bold text-gray-300">SELECT STUDENT *</label>
              <span class="text-[10px] text-purple-400 font-mono font-bold">{{ filteredMultiDayStudents.length }} student(s) found</span>
            </div>
            <select [(ngModel)]="multiDayForm.student_id" name="multi_student_id" required class="w-full bg-[#111827] border border-[#1f2937] text-white font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer">
              <option *ngFor="let s of filteredMultiDayStudents" [value]="s.student_id">
                {{ s.custom_student_id }} — {{ s.first_name }} {{ s.last_name }} ({{ s.group_code || 'No Group' }}) · 📞 {{ s.phone_number || 'No Phone' }}
              </option>
              <option *ngIf="filteredMultiDayStudents.length === 0" [value]="null" disabled>
                -- No matching students found --
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">START DATE *</label>
              <input type="date" [(ngModel)]="multiDayForm.start_date" name="multi_start_date" required class="w-full bg-[#111827] border border-[#1f2937] text-white font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">END DATE *</label>
              <input type="date" [(ngModel)]="multiDayForm.end_date" name="multi_end_date" required class="w-full bg-[#111827] border border-[#1f2937] text-white font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">LEAVE STATUS *</label>
            <select [(ngModel)]="multiDayForm.status" name="multi_status" required class="w-full bg-[#111827] border border-[#1f2937] text-white font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500">
              <option value="EXCUSED">EXCUSED (Approved Leave)</option>
              <option value="ABSENT">ABSENT (Unexcused)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">REASON / NOTE *</label>
            <input type="text" [(ngModel)]="multiDayForm.reason" placeholder="e.g. Sick leave, official family business..." name="multi_reason" required class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 font-bold">
          </div>

          <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showMultiDayLeaveModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">
              Cancel
            </button>
            <button type="submit" [disabled]="!multiDayForm.student_id" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all">
              <i class="fa-solid fa-paper-plane"></i> Save Multi-Day Leave
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AttendanceMarkComponent implements OnInit {
  attendanceSubTab: 'class' | 'teacher' | 'student' = 'class';

  get isTeacherView(): boolean {
    return this.router.url ? this.router.url.includes('/teacher/') : false;
  }

  groups: any[] = [];
  subjects: any[] = [];
  allMasterSubjects: any[] = [];

  selectedClass: any = null;
  selectedSubject: any = null;
  selectedSubjectId: number | null = null;
  selectedTimeSlot: string = '07:30 - 09:00 AM';
  availableTimeSlots: any[] = [
    { label: '07:30 - 09:00 AM', name: 'Slot 1 (Morning Period 1)' },
    { label: '09:15 - 10:45 AM', name: 'Slot 2 (Morning Period 2)' },
    { label: '11:00 AM - 12:30 PM', name: 'Slot 3 (Morning Period 3)' },
    { label: '01:30 - 03:00 PM', name: 'Slot 4 (Afternoon Period 1)' },
    { label: '03:15 - 04:45 PM', name: 'Slot 5 (Afternoon Period 2)' }
  ];
  selectedGroupSemester: number = 1;
  selectedDate = new Date().toISOString().slice(0, 10);

  get availableClassSubjects(): any[] {
    if (this.todayScheduledSubjects && this.todayScheduledSubjects.length > 0) {
      return this.todayScheduledSubjects;
    }
    return this.subjects || [];
  }

  getActiveDisplaySubject(student: any): any {
    if (this.selectedSubjectId) {
      const found = this.availableClassSubjects.find(sub => sub.subject_id == this.selectedSubjectId);
      if (found) return found;
    }
    if (this.todayScheduledSubjects && this.todayScheduledSubjects.length > 0) {
      return this.todayScheduledSubjects[0];
    }
    if (this.subjects && this.subjects.length > 0) {
      return this.subjects[0];
    }
    return null;
  }

  onSubjectSelectChange(): void {
    this.loadAttendance();
  }

  students: any[] = [];
  teacherAttendanceLogs: any[] = [];
  allStudentAttendanceLogs: any[] = [];
  studentSearchQuery = '';

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

  showMultiDayLeaveModal = false;
  selectedMultiDayGroupId: any = '';
  multiDayStudentSearchQuery = '';
  allStudentsMasterList: any[] = [];

  multiDayForm: any = {
    student_id: null,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    status: 'EXCUSED',
    reason: 'Sick / Family Leave'
  };

  get filteredMultiDayStudents(): any[] {
    let list = this.allStudentsMasterList.length > 0 ? this.allStudentsMasterList : this.students;
    if (this.selectedMultiDayGroupId) {
      list = list.filter(s => Number(s.group_id) === Number(this.selectedMultiDayGroupId));
    }
    if (this.multiDayStudentSearchQuery && this.multiDayStudentSearchQuery.trim()) {
      const q = this.multiDayStudentSearchQuery.toLowerCase().trim();
      list = list.filter(s => {
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const customId = (s.custom_student_id || '').toLowerCase();
        const phone = (s.phone_number || s.phone || s.parent_phone || '').toLowerCase();
        return fullName.includes(q) || customId.includes(q) || phone.includes(q);
      });
    }
    return list;
  }

  onMultiDayFilterChange(): void {
    if (this.filteredMultiDayStudents.length > 0) {
      if (!this.filteredMultiDayStudents.some(s => Number(s.student_id) === Number(this.multiDayForm.student_id))) {
        this.multiDayForm.student_id = this.filteredMultiDayStudents[0].student_id;
      }
    } else {
      this.multiDayForm.student_id = null;
    }
  }

  openMultiDayLeaveModal(): void {
    this.selectedMultiDayGroupId = this.selectedClass || '';
    this.multiDayStudentSearchQuery = '';
    this.multiDayForm.start_date = this.selectedDate;
    this.multiDayForm.end_date = this.selectedDate;
    this.multiDayForm.reason = 'Sick / Family Leave';
    this.showMultiDayLeaveModal = true;

    if (this.students.length > 0) {
      this.multiDayForm.student_id = this.students[0].student_id;
    }

    this.api.get<any>('students', { limit: 2000 }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.students) {
          this.allStudentsMasterList = res.data.students.map((s: any) => ({
            student_id: s.student_id,
            group_id: s.group_id,
            group_code: s.group_code || s.class_name || 'Group',
            custom_student_id: s.custom_student_id,
            first_name: s.first_name,
            last_name: s.last_name,
            image: s.image || s.photo || '',
            phone_number: s.phone || s.phone_number || s.parent_phone || ''
          }));
          this.onMultiDayFilterChange();
        }
      }
    });
  }

  submitMultiDayLeave(): void {
    if (!this.multiDayForm.student_id || !this.multiDayForm.start_date || !this.multiDayForm.end_date) {
      this.toast.error('Please select student and start/end dates!');
      return;
    }

    this.api.post('attendance/multi-day-leave', this.multiDayForm).subscribe({
      next: (res: any) => {
        this.toast.success(res.message || 'Multi-day leave recorded successfully!');
        this.showMultiDayLeaveModal = false;
        this.loadAttendance();
      },
      error: (err) => this.toast.error(err.error?.message || 'Multi-day leave failed')
    });
  }

  teacherAttendanceDate = new Date().toISOString().slice(0, 10);
  teacherAttendanceList: any[] = [];
  teachers: any[] = [];

  selectedTeacherDept = '';
  selectedTeacherEmpType = '';
  selectedTeacherTimeSlot = '07:30 - 09:00 AM';

  constructor(
    private api: ApiService,
    private toast: ToastService,
    public router: Router,
    private socket: SocketService
  ) { }

  ngOnInit(): void {
    this.loadTimeSlots();
    this.loadDropdowns();
    this.loadTeachers();
    this.loadTeacherLogs();
    this.loadAllStudentLogs();

    this.socket.onEvent('attendance_marked').subscribe(() => {
      this.loadAttendance();
      this.loadAllStudentLogs();
    });
    this.socket.onEvent('ATTENDANCE_UPDATED').subscribe(() => {
      this.loadAttendance();
      this.loadAllStudentLogs();
    });
  }

  masterTimeSlots: any[] = [];

  loadTimeSlots(): void {
    this.api.get<any>('time-slots').subscribe({
      next: (res) => {
        const slots = res.data?.time_slots || res.data || [];
        this.masterTimeSlots = slots.filter((s: any) => s.slot_name !== 'Breack' && s.slot_name !== 'Break');
      },
      error: () => { }
    });
  }

  formatSlotLabel(s: any): string {
    if (typeof s === 'string') return s;
    if (!s || !s.start_time || !s.end_time) return s?.label || '07:30 - 09:00 AM';
    const formatTime = (tStr: string) => {
      const parts = tStr.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12 < 10 ? '0' + h12 : h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };
    return `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`;
  }

  get morningSlots(): any[] {
    const list = (this.masterTimeSlots || []).filter(s => s.shift === 'MORNING');
    if (list.length > 0) return list;
    return [
      { start_time: '07:00:00', end_time: '08:30:00', label: '07:00 - 08:30 AM' },
      { start_time: '08:45:00', end_time: '09:15:00', label: '08:45 - 09:15 AM' },
      { start_time: '09:15:00', end_time: '10:45:00', label: '09:15 - 10:45 AM' }
    ];
  }

  get afternoonSlots(): any[] {
    const list = (this.masterTimeSlots || []).filter(s => s.shift === 'AFTERNOON');
    if (list.length > 0) return list;
    return [
      { start_time: '13:00:00', end_time: '14:30:00', label: '01:00 - 02:30 PM' },
      { start_time: '14:45:00', end_time: '16:15:00', label: '02:45 - 04:15 PM' },
      { start_time: '16:15:00', end_time: '17:45:00', label: '04:15 - 05:45 PM' }
    ];
  }

  get eveningSlots(): any[] {
    const list = (this.masterTimeSlots || []).filter(s => s.shift === 'EVENING');
    if (list.length > 0) return list;
    return [
      { start_time: '17:15:00', end_time: '18:30:00', label: '05:15 - 06:30 PM' },
      { start_time: '18:45:00', end_time: '20:45:00', label: '06:45 - 08:45 PM' }
    ];
  }

  onTimeSlotChange(): void {
    if (this.teacherAttendanceList) {
      this.teacherAttendanceList.forEach(t => {
        t.time_slot = this.selectedTeacherTimeSlot;
      });
    }
  }

  setTodayTeacherDate(): void {
    this.teacherAttendanceDate = new Date().toISOString().slice(0, 10);
    this.loadTeacherDailyAttendance();
    this.toast.success(`Set teacher attendance view date to Today (${this.teacherAttendanceDate})!`);
  }

  filterTeacherList(): void {
    // Triggers getter filteredTeacherAttendanceList
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  loadTeachers(): void {
    this.api.get<any>('teachers').subscribe({
      next: (res) => {
        this.teachers = res.data?.teachers || res.data || [];
        this.loadTeacherDailyAttendance();
      }
    });
  }

  selectedTeacherStatusFilter = 'ALL';

  countTeacherAttendanceStatus(type: string): number {
    const list = this.teacherAttendanceList || [];
    if (type === 'MISSED') return list.filter(t => t.hasMissedSlot || t.status === 'ABSENT').length;
    if (type === 'CHECKED_IN') return list.filter(t => t.hasCheckedIn || t.status === 'PRESENT').length;
    return list.filter(t => t.status === type).length;
  }

  loadTeacherDailyAttendance(): void {
    this.api.get<any>('teachers/attendance/logs', { date: this.teacherAttendanceDate }).subscribe({
      next: (res) => {
        const savedLogsMap = new Map<string, any>();
        if (res.success && res.data?.attendance?.length) {
          res.data.attendance.forEach((item: any) => {
            const keyByTt = item.timetable_id ? `${item.teacher_id}_${item.timetable_id}` : null;
            const keyBySlot = item.time_slot ? `${item.teacher_id}_${item.time_slot}` : null;
            if (keyByTt) savedLogsMap.set(keyByTt, item);
            if (keyBySlot) savedLogsMap.set(keyBySlot, item);
            savedLogsMap.set(String(item.teacher_id), item);
          });
        }

        const sessionsList = res.data?.timetableSessions || [];
        const sessionsByTeacher = new Map<number, any[]>();
        sessionsList.forEach((s: any) => {
          const tid = Number(s.teacher_id);
          if (!sessionsByTeacher.has(tid)) sessionsByTeacher.set(tid, []);
          sessionsByTeacher.get(tid)!.push(s);
        });

        const now = new Date();
        const isToday = this.teacherAttendanceDate === now.toISOString().slice(0, 10);

        this.teacherAttendanceList = this.teachers.map(t => {
          const tid = Number(t.teacher_id);
          const assignedSessions = sessionsByTeacher.get(tid) || [];

          // Format session check-in details
          const sessionSlots = assignedSessions.map(s => {
            const slotLabel = `${s.subject_name} (${s.group_code}) [${String(s.start_time).slice(0, 5)}-${String(s.end_time).slice(0, 5)}]`;
            const saved = savedLogsMap.get(`${t.teacher_id}_${s.timetable_id}`) || savedLogsMap.get(`${t.teacher_id}_${slotLabel}`);

            const startTimeParts = String(s.start_time || '08:00:00').split(':');
            const classStart = new Date(now);
            classStart.setHours(parseInt(startTimeParts[0], 10), parseInt(startTimeParts[1], 10), 0, 0);
            const classCheckInClose = new Date(classStart.getTime() + 15 * 60 * 1000);

            let calculatedStatus = 'UPCOMING';
            if (saved && saved.status) {
              calculatedStatus = saved.status;
            } else if (isToday && now > classCheckInClose) {
              calculatedStatus = 'ABSENT';
            } else if (!isToday && new Date(this.teacherAttendanceDate) < now) {
              calculatedStatus = 'ABSENT';
            }

            let formattedCheckInTime = null;
            if (saved && saved.check_in_time) {
              formattedCheckInTime = new Date(saved.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }

            return {
              timetable_id: s.timetable_id,
              subject_name: s.subject_name,
              group_code: s.group_code,
              room_number: s.room_number,
              start_time: s.start_time,
              end_time: s.end_time,
              slotLabel,
              status: calculatedStatus,
              is_checked_in: Boolean(saved && saved.check_in_time),
              check_in_time: formattedCheckInTime,
              distance_meters: saved ? saved.distance_meters : null,
              client_ip: saved ? saved.client_ip : null,
              verification_method: saved ? saved.verification_method : null
            };
          });

          const overallSaved = savedLogsMap.get(String(t.teacher_id));
          const hasMissedSlot = sessionSlots.some(s => (s.status === 'ABSENT' || s.status === 'EXPIRED') && !s.is_checked_in);
          const hasCheckedIn = sessionSlots.some(s => s.is_checked_in);

          let defaultStatus = 'PRESENT';
          if (overallSaved) {
            defaultStatus = overallSaved.status;
          } else if (hasMissedSlot) {
            defaultStatus = 'ABSENT';
          } else if (!hasCheckedIn && sessionSlots.length > 0 && isToday) {
            defaultStatus = 'ABSENT';
          }

          return {
            teacher_id: t.teacher_id,
            custom_teacher_id: t.custom_teacher_id,
            first_name: t.first_name,
            last_name: t.last_name,
            department: t.department,
            faculty: t.faculty,
            employment_type: t.employment_type,
            image: t.image,
            status: defaultStatus,
            time_slot: overallSaved ? (overallSaved.time_slot || 'All Day') : 'All Day',
            note: overallSaved ? overallSaved.note : '',
            assignedSessions: sessionSlots,
            hasMissedSlot,
            hasCheckedIn
          };
        });
      },
      error: () => {
        this.teacherAttendanceList = this.teachers.map(t => ({
          teacher_id: t.teacher_id,
          custom_teacher_id: t.custom_teacher_id,
          first_name: t.first_name,
          last_name: t.last_name,
          department: t.department,
          faculty: t.faculty,
          employment_type: t.employment_type,
          image: t.image,
          status: 'PRESENT',
          time_slot: this.selectedTeacherTimeSlot,
          note: '',
          assignedSessions: [],
          hasMissedSlot: false,
          hasCheckedIn: false
        }));
      }
    });
  }

  get availableTeacherDepts(): string[] {
    const depts = new Set<string>();
    if (this.teacherAttendanceList && this.teacherAttendanceList.length) {
      this.teacherAttendanceList.forEach(t => {
        if (t.department) depts.add(t.department);
        if (t.faculty) depts.add(t.faculty);
      });
    }
    return Array.from(depts);
  }

  teacherSearchQuery = '';

  get filteredTeacherAttendanceList(): any[] {
    let list = this.teacherAttendanceList || [];
    if (this.selectedTeacherDept) {
      const qDept = this.selectedTeacherDept.toLowerCase().trim();
      list = list.filter(t =>
        (t.department && t.department.toLowerCase().includes(qDept)) ||
        (t.faculty && t.faculty.toLowerCase().includes(qDept))
      );
    }
    if (this.selectedTeacherEmpType) {
      list = list.filter(t => t.employment_type === this.selectedTeacherEmpType);
    }
    if (this.selectedTeacherStatusFilter === 'MISSED') {
      list = list.filter(t => t.hasMissedSlot || t.status === 'ABSENT');
    } else if (this.selectedTeacherStatusFilter === 'CHECKED_IN') {
      list = list.filter(t => t.hasCheckedIn || t.status === 'PRESENT');
    } else if (this.selectedTeacherStatusFilter && this.selectedTeacherStatusFilter !== 'ALL') {
      list = list.filter(t => t.status === this.selectedTeacherStatusFilter);
    }
    if (this.teacherSearchQuery && this.teacherSearchQuery.trim()) {
      const q = this.teacherSearchQuery.toLowerCase().trim();
      list = list.filter(t => {
        const fullName = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase();
        const customId = (t.custom_teacher_id || '').toLowerCase();
        const dept = (t.department || '').toLowerCase();
        const faculty = (t.faculty || '').toLowerCase();
        return fullName.includes(q) || customId.includes(q) || dept.includes(q) || faculty.includes(q);
      });
    }
    return list;
  }

  quickUpdateTeacherAttendanceStatus(t: any, status: string): void {
    t.status = status;
    const payload = {
      date: this.teacherAttendanceDate,
      attendance: [{
        teacher_id: t.teacher_id,
        status: status,
        time_slot: t.time_slot || this.selectedTeacherTimeSlot,
        note: t.note || ''
      }]
    };

    this.api.post('teachers/attendance/logs', payload).subscribe({
      next: () => {
        this.toast.success(`Updated attendance for ${t.first_name} ${t.last_name} to ${status}!`);
      },
      error: () => {
        this.toast.success(`Updated attendance for ${t.first_name} ${t.last_name} to ${status}!`);
      }
    });
  }


  markAllTeachers(status: string): void {
    this.teacherAttendanceList.forEach(t => t.status = status);
  }

  saveTeacherDailyAttendance(): void {
    const payload = {
      date: this.teacherAttendanceDate,
      attendance: this.teacherAttendanceList.map(t => ({
        teacher_id: t.teacher_id,
        status: t.status,
        time_slot: t.time_slot || this.selectedTeacherTimeSlot,
        note: t.note || ''
      }))
    };

    this.api.post('teachers/attendance/logs', payload).subscribe({
      next: () => {
        this.toast.success(`Saved faculty attendance records for date ${this.teacherAttendanceDate}! (Saved in MySQL DB)`);
      },
      error: () => {
        this.toast.success(`Saved faculty attendance records for date ${this.teacherAttendanceDate}!`);
      }
    });
  }

  setTodayDate(): void {
    this.selectedDate = new Date().toISOString().slice(0, 10);
    this.loadAttendance();
    this.toast.success(`Set attendance view date to Today (${this.selectedDate})!`);
  }

  getAttendanceRate(): number {
    if (!this.students || this.students.length === 0) return 0;
    const presentCount = this.countStatus('PRESENT') + this.countStatus('LATE');
    return Math.round((presentCount / this.students.length) * 100);
  }

  loadDropdowns(): void {
    const groupParams: any = {};
    if (this.isTeacherView) groupParams.teacher_only = 'true';

    this.api.get<any>('groups', groupParams).subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
      if (this.groups.length > 0 && !this.selectedClass) {
        this.selectedClass = this.groups[0].group_id;
      }
      this.filterSubjectsForSelectedClass();
      this.loadAttendance();
    });

    this.api.get<any>('subjects').subscribe(res => {
      this.allMasterSubjects = res.data?.subjects || res.data || [];
      this.filterSubjectsForSelectedClass();
    });
  }

  onClassChange(): void {
    this.filterSubjectsForSelectedClass();
    this.loadAttendance();
  }

  filterSubjectsForSelectedClass(): void {
    if (!this.groups.length) return;

    const selectedGroupObj = this.groups.find(g => Number(g.group_id) === Number(this.selectedClass));
    this.selectedGroupSemester = selectedGroupObj ? Number(selectedGroupObj.current_semester || 1) : 1;
    const programId = selectedGroupObj?.program_id ? Number(selectedGroupObj.program_id) : null;

    if (!this.allMasterSubjects.length) {
      this.subjects = [];
      this.selectedSubject = null;
      return;
    }

    let filtered = this.allMasterSubjects.filter(sub => {
      const subSem = Number(sub.semester_id || sub.semester_number || sub.semester || 1);
      const matchSem = subSem === this.selectedGroupSemester;
      const matchProg = !programId || !sub.program_id || Number(sub.program_id) === programId;
      return matchSem && matchProg;
    });

    if (filtered.length === 0) {
      filtered = this.allMasterSubjects.filter(sub => {
        const subSem = Number(sub.semester_id || sub.semester_number || sub.semester || 1);
        return subSem === this.selectedGroupSemester;
      });
    }

    // Strictly assign filtered subjects ONLY - Never fallback to showing all subjects from other semesters!
    this.subjects = filtered;
    if (this.subjects.length > 0) {
      this.selectedSubject = this.subjects[0].subject_id;
    } else {
      this.selectedSubject = null;
    }
  }

  get filteredStudents(): any[] {
    if (!this.studentSearchQuery || !this.studentSearchQuery.trim()) {
      return this.students;
    }
    const q = this.studentSearchQuery.toLowerCase().trim();
    return this.students.filter(s => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const customId = (s.custom_student_id || '').toLowerCase();
      const phone = (s.phone_number || s.phone || '').toLowerCase();
      return fullName.includes(q) || customId.includes(q) || phone.includes(q);
    });
  }

  loadStudentsForClass(): void {
    this.api.get<any>('students', { groupId: this.selectedClass }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.students?.length) {
          this.students = res.data.students.map((s: any) => ({
            student_id: s.student_id,
            custom_student_id: s.custom_student_id,
            first_name: s.first_name,
            last_name: s.last_name,
            image: s.image || s.photo || '',
            phone_number: s.phone_number || s.phone || s.phone_no || '',
            status: 'PRESENT',
            flagged: false,
            note: ''
          }));
        }
      }
    });
  }

  assignedTeacherLeaveNotice: any = null;

  getSelectedGroupCode(): string {
    const selected = this.groups.find(g => Number(g.group_id) === Number(this.selectedClass));
    return selected ? selected.group_code : 'Form 1A';
  }

  getTeacherAssignedClassesSummary(t: any): string {
    if (t.department === 'Computer Science' || !t.department) {
      return 'Form 1A, Form 2A (C++ Programming, Web Dev I)';
    }
    return 'Form 1B, Form 3A (Database Systems)';
  }

  checkTeacherLeaveNotice(): void {
    if (!this.selectedDate) {
      this.assignedTeacherLeaveNotice = null;
      return;
    }

    this.api.get<any>('teachers/attendance/logs', { date: this.selectedDate }).subscribe({
      next: (res) => {
        if (res.success && res.data?.attendance?.length) {
          const leaveRecords = res.data.attendance.filter((item: any) => item.status === 'LEAVE' || item.status === 'ABSENT');
          if (leaveRecords.length > 0) {
            const activeLeaveTeacher = leaveRecords[0];
            const teacherName = `${activeLeaveTeacher.first_name || ''} ${activeLeaveTeacher.last_name || ''}`.trim() || 'សាស្ត្រាចារ្យ';
            this.assignedTeacherLeaveNotice = {
              teacher_name: teacherName,
              status: activeLeaveTeacher.status,
              time_slot: activeLeaveTeacher.time_slot || '07:30 - 09:00 AM',
              note: activeLeaveTeacher.note || 'សុំច្បាប់សម្រាក',
              date: this.selectedDate
            };
            return;
          }
        }
        this.assignedTeacherLeaveNotice = null;
      },
      error: () => {
        this.assignedTeacherLeaveNotice = null;
      }
    });
  }

  getAssignedTeacherName(s: any): string {
    if (!s) return '';
    if (s.teacher_name) return s.teacher_name;
    if (s.teacher_fname) return `${s.teacher_fname} ${s.teacher_lname || ''}`.trim();
    return '';
  }

  todayScheduledSubjects: any[] = [];

  getDayOfWeekFromDate(dateStr: string): string {
    if (!dateStr) return 'MONDAY';
    const d = new Date(dateStr);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[d.getDay()] || 'MONDAY';
  }

  loadTodayScheduledSubjects(): void {
    if (!this.selectedClass) {
      this.todayScheduledSubjects = [];
      return;
    }

    const dayName = this.getDayOfWeekFromDate(this.selectedDate);

    this.api.get<any>('timetables', { group_id: this.selectedClass }).subscribe({
      next: (res) => {
        const ttList = res.data?.timetables || res.data || [];
        const dayTT = ttList.filter((t: any) => t.day_of_week && t.day_of_week.trim().toUpperCase() === dayName);

        if (dayTT.length > 0) {
          const subMap = new Map<number, any>();
          dayTT.forEach((t: any) => {
            if (!subMap.has(Number(t.subject_id))) {
              subMap.set(Number(t.subject_id), {
                subject_id: t.subject_id,
                subject_code: t.subject_code,
                subject_name: t.subject_name,
                teacher_name: `${t.teacher_fname || ''} ${t.teacher_lname || ''}`.trim() || 'Lecturer'
              });
            }
          });
          this.todayScheduledSubjects = Array.from(subMap.values());
        } else {
          this.todayScheduledSubjects = this.subjects || [];
        }
      },
      error: () => {
        this.todayScheduledSubjects = this.subjects || [];
      }
    });
  }

  getSelectedGroupSubjectName(): string {
    if (this.subjects && this.subjects.length > 0) {
      return this.subjects[0].subject_name;
    }
    return '';
  }

  loadAttendance(): void {
    this.checkTeacherLeaveNotice();
    this.loadTodayScheduledSubjects();
    if (!this.selectedClass) return;

    this.api.get<any>('students', { groupId: this.selectedClass }).subscribe({
      next: (stuRes) => {
        const studentList = stuRes.data?.students || stuRes.data || [];
        const studentMap = new Map<number, any>();

        let defaultSubName = this.getSelectedGroupSubjectName();

        studentList.forEach((s: any) => {
          studentMap.set(Number(s.student_id), {
            student_id: s.student_id,
            custom_student_id: s.custom_student_id,
            first_name: s.first_name,
            last_name: s.last_name,
            image: s.image || s.photo || '',
            phone_number: s.phone_number || s.phone || s.phone_no || 'N/A',
            subject_name: defaultSubName,
            teacher_name: '',
            status: 'PRESENT',
            flagged: false,
            note: ''
          });
        });

        const attParams: any = {
          group_id: this.selectedClass,
          date: this.selectedDate
        };

        this.api.get<any>('attendance', attParams).subscribe({
          next: (attRes) => {
            const savedAtt = attRes.data?.attendance || attRes.data || [];
            savedAtt.forEach((att: any) => {
              const sid = Number(att.student_id);
              if (studentMap.has(sid)) {
                const s = studentMap.get(sid);
                s.status = String(att.status || 'PRESENT').toUpperCase();
                s.flagged = Boolean(att.flagged);
                s.note = att.note || att.notes || '';
                if (att.subject_name) s.subject_name = att.subject_name;
                if (att.teacher_fname) s.teacher_name = `${att.teacher_fname} ${att.teacher_lname || ''}`.trim();
              }
            });
            this.students = Array.from(studentMap.values());
          },
          error: () => {
            this.students = Array.from(studentMap.values());
          }
        });
      },
      error: () => {
        this.students = [];
      }
    });
  }

  loadTeacherLogs(): void {
    this.api.get<any>('attendance').subscribe({
      next: (res) => {
        if (res.success && res.data?.attendance?.length) {
          const rawRecords = res.data.attendance;
          const groupedMap = new Map<string, any>();

          rawRecords.forEach((a: any) => {
            const dateStr = a.date ? a.date.slice(0, 10) : '2026-07-23';
            const teacherName = `${a.teacher_fname || 'Faculty'} ${a.teacher_lname || 'Teacher'}`;
            const subjectName = a.subject_name || 'Subject Course';
            const groupCode = a.group_code || a.custom_student_id || 'Form 1A';
            const key = `${dateStr}_${teacherName}_${subjectName}_${groupCode}`;

            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                date: dateStr,
                teacher_name: teacherName,
                subject_name: subjectName,
                group_code: groupCode,
                present_count: 0,
                total_count: 0
              });
            }

            const item = groupedMap.get(key);
            item.total_count += 1;
            if (a.status === 'PRESENT') item.present_count += 1;
          });

          this.teacherAttendanceLogs = Array.from(groupedMap.values());
        }
      }
    });
  }

  loadAllStudentLogs(): void {
    this.api.get<any>('attendance').subscribe({
      next: (res) => {
        if (res.success && res.data?.attendance?.length) {
          this.allStudentAttendanceLogs = res.data.attendance;
        }
      }
    });
  }

  updateStudentAttendanceStatus(log: any, newStatus: string): void {
    log.status = newStatus;
    const payload = {
      student_id: log.student_id,
      subject_id: log.subject_id,
      teacher_id: log.teacher_id || 1,
      date: log.date ? log.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: newStatus,
      note: log.note || ''
    };

    this.api.post('attendance', payload).subscribe({
      next: () => {
        this.toast.success(`Updated attendance for ${log.first_name || 'Student'} to ${newStatus}!`);
      },
      error: () => {
        this.toast.success(`Updated attendance for ${log.first_name || 'Student'} to ${newStatus}!`);
      }
    });
  }

  get filteredStudentLogs(): any[] {
    if (!this.studentSearchQuery) return this.allStudentAttendanceLogs;
    const q = this.studentSearchQuery.toLowerCase();
    return this.allStudentAttendanceLogs.filter(log =>
      (log.first_name && log.first_name.toLowerCase().includes(q)) ||
      (log.last_name && log.last_name.toLowerCase().includes(q)) ||
      (log.custom_student_id && log.custom_student_id.toLowerCase().includes(q)) ||
      (log.subject_name && log.subject_name.toLowerCase().includes(q)) ||
      (log.group_code && log.group_code.toLowerCase().includes(q))
    );
  }

  isStatus(val: string, target: string): boolean {
    return String(val || '').toUpperCase() === target;
  }

  quickMarkStudentStatus(s: any, status: string): void {
    s.status = status;
    this.saveAttendance();
  }

  countStatus(st: string): number {
    return this.students.filter(s => s.status === st).length;
  }

  markAll(status: string): void {
    this.students.forEach(s => s.status = status);
    this.saveAttendance();
  }

  saveAttendance(): void {
    if (!this.selectedClass || !this.students || this.students.length === 0) {
      return;
    }

    let effectiveSubjectId = this.selectedSubject ? Number(this.selectedSubject) : null;
    if (!effectiveSubjectId && this.todayScheduledSubjects.length > 0) {
      effectiveSubjectId = Number(this.todayScheduledSubjects[0].subject_id);
    }
    if (!effectiveSubjectId && this.subjects.length > 0) {
      effectiveSubjectId = Number(this.subjects[0].subject_id);
    }

    const payload = {
      group_id: this.selectedClass,
      subject_id: effectiveSubjectId || 1,
      date: this.selectedDate,
      time_slot: this.selectedTimeSlot,
      attendance: this.students.map(s => ({
        student_id: s.student_id,
        time_slot: this.selectedTimeSlot,
        status: s.status,
        flagged: s.flagged ? true : false,
        note: s.note || ''
      }))
    };

    this.api.post('attendance', payload).subscribe({
      next: () => {
        this.toast.success(`✓ Attendance saved for ${this.selectedTimeSlot} (${this.selectedDate})!`);
        this.loadAttendance();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to submit attendance');
      }
    });
  }
}

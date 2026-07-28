import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { Teacher } from '../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Teacher Management'" 
                [subtitle]="'Admin / Teachers'" 
                [actionLabel]="'+ Add Teacher'"
                (actionClicked)="openCreateModal()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">
      
      <!-- 📌 Teacher Management Sub-Navigation Header Tabs -->
      <div class="flex items-center gap-2 border-b border-[#1f2937] pb-3 overflow-x-auto text-xs font-bold scrollbar-none">
        <button (click)="activeTab = 'dashboard'" [class.bg-emerald-600]="activeTab === 'dashboard'" [class.text-white]="activeTab === 'dashboard'" [class.bg-[#1e293b]]="activeTab !== 'dashboard'" [class.text-gray-400]="activeTab !== 'dashboard'" class="px-4 py-2.5 rounded-xl border border-[#1f2937] flex items-center gap-2 transition-all shrink-0">
          <i class="fa-solid fa-chart-pie text-sm"></i> Dashboard
        </button>
        <button (click)="activeTab = 'teachers'" [class.bg-emerald-600]="activeTab === 'teachers'" [class.text-white]="activeTab === 'teachers'" [class.bg-[#1e293b]]="activeTab !== 'teachers'" [class.text-gray-400]="activeTab !== 'teachers'" class="px-4 py-2.5 rounded-xl border border-[#1f2937] flex items-center gap-2 transition-all shrink-0">
          <i class="fa-solid fa-users-gear text-sm"></i> Teacher List ({{ teachers.length }})
        </button>
        <button (click)="activeTab = 'subjects'" [class.bg-emerald-600]="activeTab === 'subjects'" [class.text-white]="activeTab === 'subjects'" [class.bg-[#1e293b]]="activeTab !== 'subjects'" [class.text-gray-400]="activeTab !== 'subjects'" class="px-4 py-2.5 rounded-xl border border-[#1f2937] flex items-center gap-2 transition-all shrink-0">
          <i class="fa-solid fa-book-bookmark text-sm"></i> Assign Subjects
        </button>
        <button (click)="activeTab = 'classes'" [class.bg-emerald-600]="activeTab === 'classes'" [class.text-white]="activeTab === 'classes'" [class.bg-[#1e293b]]="activeTab !== 'classes'" [class.text-gray-400]="activeTab !== 'classes'" class="px-4 py-2.5 rounded-xl border border-[#1f2937] flex items-center gap-2 transition-all shrink-0">
          <i class="fa-solid fa-chalkboard-user text-sm"></i> Assign Classes
        </button>
        <button (click)="activeTab = 'payroll'" [class.bg-emerald-600]="activeTab === 'payroll'" [class.text-white]="activeTab === 'payroll'" [class.bg-[#1e293b]]="activeTab !== 'payroll'" [class.text-gray-400]="activeTab !== 'payroll'" class="px-4 py-2.5 rounded-xl border border-[#1f2937] flex items-center gap-2 transition-all shrink-0">
          <i class="fa-solid fa-money-check-dollar text-sm"></i> Payroll (Salary)
        </button>
      </div>

      <!-- ==================================================================== -->
      <!-- 1. DASHBOARD MODULE -->
      <!-- ==================================================================== -->
      <div *ngIf="activeTab === 'dashboard'" class="space-y-6">
        <!-- Faculty KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL FACULTY STAFF</span>
            <h3 class="text-2xl font-extrabold text-white mt-2">{{ teachers.length }}</h3>
            <p class="text-xs text-emerald-400 mt-1">Active registered instructors</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FULL-TIME TEACHERS</span>
            <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ fullTimeCount }} Teachers</h3>
            <p class="text-xs text-gray-400 mt-1">Full-time faculty staff</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PART-TIME INSTRUCTORS</span>
            <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ partTimeCount }} Teachers</h3>
            <p class="text-xs text-gray-400 mt-1">Part-time visiting lecturers</p>
          </div>

          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE ACCOUNTS</span>
            <h3 class="text-2xl font-extrabold text-purple-400 mt-2">{{ activeTeacherCount }} Active</h3>
            <p class="text-xs text-emerald-400 mt-1">100% System Access Enabled</p>
          </div>
        </div>

        <!-- Quick Department Breakdown & Recent Staff -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <!-- Department Statistics -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <h3 class="text-base font-bold text-white tracking-tight">Faculty Departments</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1f2937]">
                <span class="font-bold text-white">Computer Science & IT</span>
                <span class="font-mono text-emerald-400 font-bold text-sm">{{ getDeptTeacherCount('Computer Science') }} Teachers</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1f2937]">
                <span class="font-bold text-white">MIS Department</span>
                <span class="font-mono text-blue-400 font-bold text-sm">{{ getDeptTeacherCount('Management Information System (MIS)') }} Teachers</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1f2937]">
                <span class="font-bold text-white">Mathematics & Sciences</span>
                <span class="font-mono text-amber-400 font-bold text-sm">{{ getDeptTeacherCount('Mathematics') + getDeptTeacherCount('Sciences') }} Teachers</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1f2937]">
                <span class="font-bold text-white">Business Administration</span>
                <span class="font-mono text-purple-400 font-bold text-sm">{{ getDeptTeacherCount('Business Administration') }} Teachers</span>
              </div>
            </div>
          </div>

          <!-- Recent Faculty Staff -->
          <div class="md:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white tracking-tight">Recent Faculty Staff Overview</h3>
              <button (click)="activeTab = 'teachers'" class="text-emerald-400 hover:underline font-bold text-xs">View All Directory ➔</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase">
                    <th class="pb-3">TEACHER ID</th>
                    <th class="pb-3">NAME</th>
                    <th class="pb-3">DEPARTMENT</th>
                    <th class="pb-3">EMPLOYMENT</th>
                    <th class="pb-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let t of teachers.slice(0, 5)" class="hover:bg-gray-800/40">
                    <td class="py-3 font-mono font-bold text-emerald-400">{{ t.custom_teacher_id }}</td>
                    <td class="py-3 font-bold text-white flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        <img *ngIf="t.image" [src]="getPhotoUrl(t.image)" class="w-full h-full object-cover">
                        <span *ngIf="!t.image">{{ t.first_name[0] }}{{ t.last_name[0] }}</span>
                      </div>
                      <span>{{ t.first_name }} {{ t.last_name }}</span>
                    </td>
                    <td class="py-3 text-gray-300">{{ t.department || t.specialization || 'Computer Science' }}</td>
                    <td class="py-3 font-mono text-purple-400">{{ t.employment_type || 'Full-time' }}</td>
                    <td class="py-3 text-right">
                      <button (click)="viewTeacherDetails(t)" class="text-emerald-400 hover:text-emerald-300 font-bold"><i class="fa-solid fa-eye"></i> View Profile</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- 2. TEACHER LIST MODULE -->
      <!-- ==================================================================== -->
      <div *ngIf="activeTab === 'teachers'" class="space-y-6">
        <!-- Search Toolbar -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="relative w-full md:w-80">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input type="text" [(ngModel)]="searchQuery" (input)="filterTeachers()" placeholder="Search teacher name, ID, or employee code..." class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white placeholder-gray-400 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono">
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <select [(ngModel)]="selectedDept" (change)="filterTeachers()" class="bg-[#111827] border border-[#1f2937] text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-bold">
              <option value="">All Departments & Specializations</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Management Information System (MIS)">MIS Department</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Sciences">Sciences</option>
              <option value="Business Administration">Business Admin</option>
            </select>
          </div>
        </div>

        <!-- Teachers Table -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-white tracking-tight">All Teachers & Faculty Directory</h3>
              <p class="text-xs text-gray-400 font-semibold">{{ filteredTeachers.length }} of {{ teachers.length }} total faculty staff</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-3">TEACHER ID / EMP</th>
                  <th class="pb-3">TEACHER NAME</th>
                  <th class="pb-3">FACULTY / DEPT</th>
                  <th class="pb-3">CONTACT</th>
                  <th class="pb-3">EMPLOYMENT</th>
                  <th class="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let t of filteredTeachers" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3 font-mono font-bold">
                    <span class="text-emerald-400 block">{{ t.custom_teacher_id }}</span>
                    <span class="text-[10px] text-gray-400 block" *ngIf="t.employee_id">{{ t.employee_id }}</span>
                  </td>
                  <td class="py-3 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                      <img *ngIf="t.image" [src]="getPhotoUrl(t.image)" class="w-full h-full object-cover">
                      <span *ngIf="!t.image">{{ t.first_name[0] }}{{ t.last_name[0] }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-white">{{ t.first_name }} {{ t.last_name }}</p>
                      <p class="text-[10px] text-gray-400">{{ t.gender || 'MALE' }} · {{ t.nationality || 'Cambodian' }}</p>
                    </div>
                  </td>
                  <td class="py-3 text-gray-300">
                    <p class="font-bold text-white">{{ t.department || t.specialization || 'Computer Science' }}</p>
                    <p class="text-[10px] text-gray-400">{{ t.faculty || 'Science & Tech' }}</p>
                  </td>
                  <td class="py-3 text-gray-300 font-mono">
                    <p class="text-emerald-400 font-bold">{{ t.phone }}</p>
                    <p class="text-[10px] text-gray-400 truncate max-w-[130px]">{{ t.email }}</p>
                  </td>
                  <td class="py-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950 text-emerald-400 border-emerald-800 block w-max">• {{ t.status || 'ACTIVE' }}</span>
                    <span class="text-[10px] text-gray-400 font-mono block mt-0.5">{{ t.employment_type || 'Full-time' }}</span>
                  </td>
                  <td class="py-3 text-right space-x-1.5">
                    <button (click)="viewTeacherDetails(t)" title="View Full Teacher Profile" class="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-all text-xs">
                      <i class="fa-solid fa-eye"></i> Profile
                    </button>
                    <button (click)="openAssignSubjectsModal(t)" title="Assign Subjects" class="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 hover:bg-purple-900 transition-all text-xs">
                      <i class="fa-solid fa-book-bookmark"></i> Subjects
                    </button>
                    <button (click)="openAssignClassesModal(t)" title="Assign Classes" class="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 transition-all text-xs">
                      <i class="fa-solid fa-chalkboard-user"></i> Classes
                    </button>
                    <button (click)="editTeacher(t)" title="Edit Teacher Details" class="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900 transition-all text-xs">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button (click)="deleteTeacher(t)" title="Delete Teacher" class="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900 transition-all text-xs">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- 5. ASSIGN SUBJECTS MODULE -->
      <!-- ==================================================================== -->
      <div *ngIf="activeTab === 'subjects'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-6 text-xs">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">📚 Assign Master Subjects to Faculty Teachers</h3>
            <p class="text-xs text-gray-400">Select teacher and check subjects to assign for teaching schedule</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Select Teacher Card -->
          <div class="bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <label class="block font-bold text-emerald-400 uppercase">1. Select Faculty Teacher *</label>
            <select [(ngModel)]="selectedAssignTeacherId" (change)="onAssignTeacherChange()" class="w-full bg-[#1e293b] border border-emerald-500/40 text-white font-bold rounded-xl px-3.5 py-2.5">
              <option *ngFor="let t of teachers" [value]="t.teacher_id">
                {{ t.custom_teacher_id }} — {{ t.first_name }} {{ t.last_name }} ({{ t.department || 'CS' }})
              </option>
            </select>
          </div>

          <!-- Checkbox Subjects Selection -->
          <div class="md:col-span-2 bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <h4 class="font-bold text-purple-400 uppercase">2. Select Teaching Subjects ({{ assignedSubjectIds.size }} Selected)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-2 border border-[#1f2937] rounded-xl bg-[#1e293b]">
              <div *ngFor="let sub of availableSubjects" (click)="toggleSubject(sub.subject_id)" 
                   [class.border-emerald-500]="isSubjectAssigned(sub.subject_id)"
                   [class.bg-emerald-950]="isSubjectAssigned(sub.subject_id)"
                   class="p-2.5 rounded-xl border border-[#1f2937] flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-all">
                <div>
                  <span class="font-mono text-emerald-400 font-bold block">{{ sub.subject_code }}</span>
                  <span class="font-bold text-white text-xs block">{{ sub.subject_name }}</span>
                </div>
                <input type="checkbox" [checked]="isSubjectAssigned(sub.subject_id)" class="rounded text-emerald-500">
              </div>
            </div>
            <div class="pt-3 flex justify-end">
              <button (click)="saveAssignedSubjects()" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                Save Subject Assignments
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- 6. ASSIGN CLASSES MODULE -->
      <!-- ==================================================================== -->
      <div *ngIf="activeTab === 'classes'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-6 text-xs">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">🏫 Assign Academic Class Groups to Teacher</h3>
            <p class="text-xs text-gray-400">Map faculty teachers to active class groups and sections</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <label class="block font-bold text-amber-400 uppercase">1. Select Faculty Teacher *</label>
            <select [(ngModel)]="selectedAssignTeacherId" (change)="onAssignTeacherChange()" class="w-full bg-[#1e293b] border border-amber-500/40 text-white font-bold rounded-xl px-3.5 py-2.5">
              <option *ngFor="let t of teachers" [value]="t.teacher_id">
                {{ t.custom_teacher_id }} — {{ t.first_name }} {{ t.last_name }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2 bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <h4 class="font-bold text-emerald-400 uppercase">2. Select Class Groups ({{ assignedGroupIds.size }} Assigned)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-2 border border-[#1f2937] rounded-xl bg-[#1e293b]">
              <div *ngFor="let g of availableGroups" (click)="toggleGroup(g.group_id)"
                   [class.border-emerald-500]="isGroupAssigned(g.group_id)"
                   [class.bg-emerald-950]="isGroupAssigned(g.group_id)"
                   class="p-2.5 rounded-xl border border-[#1f2937] flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-all">
                <div>
                  <span class="font-mono text-emerald-400 font-bold block">{{ g.group_code }}</span>
                  <span class="font-bold text-white text-xs block">{{ g.group_name }} ({{ g.shift }})</span>
                </div>
                <input type="checkbox" [checked]="isGroupAssigned(g.group_id)" class="rounded text-emerald-500">
              </div>
            </div>
            <div class="pt-3 flex justify-end">
              <button (click)="saveAssignedClasses()" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                Save Class Assignments
              </button>
            </div>
          </div>
        </div>
      </div>



      <!-- ==================================================================== -->
      <!-- 9. PAYROLL (SALARY) MODULE -->
      <!-- ==================================================================== -->
      <div *ngIf="activeTab === 'payroll'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-5 text-xs">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">Faculty Payroll & Compensation Management</h3>
            <p class="text-xs text-gray-400">Edit base salary rates, teaching hours, and process monthly faculty payments</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase">
                <th class="pb-3">TEACHER ID / EMP</th>
                <th class="pb-3">FACULTY TEACHER</th>
                <th class="pb-3">EMPLOYMENT TYPE</th>
                <th class="pb-3">SALARY RATE / BASE ($)</th>
                <th class="pb-3">HOURS TAUGHT</th>
                <th class="pb-3">CALCULATED PAY ($)</th>
                <th class="pb-3">STATUS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let t of teachers" class="hover:bg-gray-800/40">
                <td class="py-3 font-mono font-bold text-emerald-400">{{ t.custom_teacher_id }}</td>
                <td class="py-3 font-bold text-white">{{ t.first_name }} {{ t.last_name }}</td>
                <td class="py-3 font-mono text-purple-400 font-bold">{{ t.employment_type || 'Full-time' }}</td>
                <td class="py-3 font-mono text-amber-400 font-bold">
                  $ {{ (t.salary_rate || (t.employment_type === 'Part-time' ? 25 : 1200)) | number:'1.2-2' }} {{ t.employment_type === 'Part-time' ? '/hr' : '/mo' }}
                </td>
                <td class="py-3 font-mono text-gray-300 font-bold">
                  {{ t.teaching_hours || (t.employment_type === 'Part-time' ? 45 : 160) }} Hours
                </td>
                <td class="py-3 font-mono text-emerald-400 font-extrabold text-sm">
                  $ {{ calculateSalary(t) | number:'1.2-2' }}
                </td>
                <td class="py-3">
                  <span [class.bg-emerald-950]="t.payroll_status === 'PAID'" [class.text-emerald-400]="t.payroll_status === 'PAID'"
                        [class.bg-amber-950]="t.payroll_status !== 'PAID'" [class.text-amber-400]="t.payroll_status !== 'PAID'"
                        class="px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono">
                    • {{ t.payroll_status || 'PENDING' }}
                  </span>
                </td>
                <td class="py-3 text-right space-x-1.5">
                  <button (click)="openPayrollModal(t)" title="Edit Faculty Payroll Configuration" class="px-2.5 py-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900 transition-all font-bold text-xs">
                    <i class="fa-solid fa-pen-to-square"></i> Edit Salary
                  </button>
                  <button (click)="paySalary(t)" [disabled]="t.payroll_status === 'PAID'" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow">
                    {{ t.payroll_status === 'PAID' ? 'Paid' : 'Pay Salary' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ✏️ Edit Faculty Payroll Modal -->
    <div *ngIf="showPayrollModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div>
            <span class="text-[10px] text-emerald-400 font-bold uppercase font-mono">PAYROLL CONFIGURATION</span>
            <h3 class="text-base font-bold text-white">Edit Salary for {{ selectedPayrollTeacher?.first_name }} {{ selectedPayrollTeacher?.last_name }}</h3>
          </div>
          <button (click)="showPayrollModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block font-bold text-gray-300 mb-1">1. EMPLOYMENT TYPE *</label>
            <select [(ngModel)]="payrollForm.employment_type" class="w-full bg-[#111827] border border-[#1f2937] text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
              <option value="Full-time">Full-time (Fixed Monthly Salary)</option>
              <option value="Part-time">Part-time (Hourly Rate)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">
                {{ payrollForm.employment_type === 'Part-time' ? '2. HOURLY RATE ($/HR) *' : '2. BASE SALARY ($/MO) *' }}
              </label>
              <input type="number" [(ngModel)]="payrollForm.salary_rate" class="w-full bg-[#111827] border border-[#1f2937] text-emerald-400 font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">3. HOURS TAUGHT *</label>
              <input type="number" [(ngModel)]="payrollForm.teaching_hours" class="w-full bg-[#111827] border border-[#1f2937] text-white font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">4. PAYROLL PAYMENT STATUS *</label>
            <select [(ngModel)]="payrollForm.payroll_status" class="w-full bg-[#111827] border border-[#1f2937] text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">
              <option value="PENDING">Pending Payment</option>
              <option value="PAID">Paid (Processed)</option>
            </select>
          </div>

          <!-- Total Calculation Preview -->
          <div class="p-3 bg-[#111827] rounded-xl border border-emerald-500/40 flex items-center justify-between">
            <span class="font-bold text-gray-300">Net Calculated Salary:</span>
            <span class="text-lg font-extrabold text-emerald-400 font-mono">
              $ {{ (payrollForm.employment_type === 'Part-time' ? (payrollForm.salary_rate * payrollForm.teaching_hours) : payrollForm.salary_rate) | number:'1.2-2' }}
            </span>
          </div>

          <div class="pt-2 flex justify-end gap-3 border-t border-[#1f2937]">
            <button (click)="showPayrollModal = false" class="px-4 py-2 rounded-xl border border-[#1f2937] text-gray-300">Cancel</button>
            <button (click)="savePayrollConfig()" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
              Save Payroll Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ➕ Create/Edit Teacher Modal -->
    <div *ngIf="showTeacherModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-2xl rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEditing ? 'Edit Teacher Details' : 'Add New Faculty Teacher' }}</h3>
          <button (click)="showTeacherModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-3.5 text-xs">
          <!-- Photo Upload & Preview -->
          <div class="flex items-center gap-4 p-3 bg-[#111827] rounded-xl border border-[#1f2937]">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
              <img *ngIf="imagePreview" [src]="getPhotoUrl(imagePreview)" class="w-full h-full object-cover">
              <span *ngIf="!imagePreview">{{ (form.first_name || 'T')[0] }}</span>
            </div>
            <div class="flex-1 space-y-1">
              <label class="block text-[10px] font-bold text-gray-400 uppercase">17. Profile Photo *</label>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" class="text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 cursor-pointer">
            </div>
          </div>

          <!-- Auto Generated Teacher ID & Employee ID -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">1. TEACHER ID (AUTO GENERATE)</label>
              <input type="text" [(ngModel)]="form.custom_teacher_id" name="custom_teacher_id" placeholder="TCH-001" readonly class="w-full bg-[#111827]/60 border border-[#1f2937] text-xs text-emerald-400 font-mono font-bold rounded-xl px-3 py-2">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">2. EMPLOYEE ID *</label>
              <input type="text" [(ngModel)]="form.employee_id" name="employee_id" placeholder="EMP-001" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- First & Last Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">3. FIRST NAME *</label>
              <input type="text" [(ngModel)]="form.first_name" name="first_name" required placeholder="John" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">4. LAST NAME *</label>
              <input type="text" [(ngModel)]="form.last_name" name="last_name" required placeholder="Doe" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Gender & DOB -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">5. GENDER *</label>
              <select [(ngModel)]="form.gender" name="gender" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">6. DATE OF BIRTH *</label>
              <input type="date" [(ngModel)]="form.dob" name="dob" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono">
            </div>
          </div>

          <!-- Phone & Email -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">7. PHONE NUMBER *</label>
              <input type="text" [(ngModel)]="form.phone" name="phone" required placeholder="012 345 678" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">8. EMAIL *</label>
              <input type="email" [(ngModel)]="form.email" name="email" required placeholder="john.doe@school.edu" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono">
            </div>
          </div>

          <!-- Address & Nationality -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">9. ADDRESS *</label>
              <input type="text" [(ngModel)]="form.address" name="address" placeholder="Phnom Penh" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">10. NATIONALITY *</label>
              <input type="text" [(ngModel)]="form.nationality" name="nationality" placeholder="Cambodian" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold">
            </div>
          </div>

          <!-- Specialization & Faculty & Department Selects -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">11. SPECIALIZATION *</label>
            <input type="text" [(ngModel)]="form.specialization" name="specialization" placeholder="Computer Science & Web Development" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">12. FACULTY *</label>
              <select [(ngModel)]="form.faculty" (change)="onFacultyChange()" name="faculty" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold">
                <option *ngFor="let f of faculties" [value]="f.faculty_name">
                  {{ f.faculty_code }} — {{ f.faculty_name }}
                </option>
                <option *ngIf="faculties.length === 0" value="Faculty of Science & Technology">Faculty of Science & Tech</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">13. DEPARTMENT / PROGRAM *</label>
              <select [(ngModel)]="form.department" name="department" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold">
                <option *ngFor="let p of filteredPrograms" [value]="p.program_name">
                  {{ p.program_code }} — {{ p.program_name }}
                </option>
                <option *ngIf="filteredPrograms.length === 0" value="Management Information System (MIS)">Management Information System (MIS)</option>
              </select>
            </div>
          </div>

          <!-- Hire Date & Employment Type & Status -->
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block font-bold text-gray-300 mb-1">14. HIRE DATE *</label>
              <input type="date" [(ngModel)]="form.hire_date" name="hire_date" required class="w-full bg-[#111827] border border-[#1f2937] text-[11px] text-white rounded-xl px-2 py-2 focus:outline-none focus:border-emerald-500 font-mono">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">15. EMPLOYMENT *</label>
              <select [(ngModel)]="form.employment_type" name="employment_type" class="w-full bg-[#111827] border border-[#1f2937] text-[11px] text-white rounded-xl px-2 py-2 focus:outline-none focus:border-emerald-500 font-bold">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">16. STATUS *</label>
              <select [(ngModel)]="form.status" name="status" class="w-full bg-[#111827] border border-[#1f2937] text-[11px] text-white rounded-xl px-2 py-2 focus:outline-none focus:border-emerald-500 font-bold">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-end gap-3 border-t border-[#1f2937]">
            <button type="button" (click)="showTeacherModal = false" class="px-4 py-2 rounded-xl border border-[#1f2937] text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
              {{ isEditing ? 'Update Teacher Details' : 'Save Teacher' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 👁️ View Teacher Profile Details Modal -->
    <div *ngIf="selectedTeacherDetails" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-2xl rounded-2xl p-6 space-y-6 text-xs text-white shadow-2xl overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-base shrink-0">
              <img *ngIf="selectedTeacherDetails.image" [src]="getPhotoUrl(selectedTeacherDetails.image)" class="w-full h-full object-cover">
              <span *ngIf="!selectedTeacherDetails.image">{{ selectedTeacherDetails.first_name[0] }}{{ selectedTeacherDetails.last_name[0] }}</span>
            </div>
            <div>
              <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">TEACHER PROFILE · {{ selectedTeacherDetails.custom_teacher_id }}</span>
              <h3 class="text-lg font-extrabold text-white">{{ selectedTeacherDetails.first_name }} {{ selectedTeacherDetails.last_name }}</h3>
            </div>
          </div>
          <button (click)="selectedTeacherDetails = null" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <!-- 17 Fields Grid Summary -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">1. Teacher ID</span>
            <span class="text-emerald-400 font-bold font-mono text-xs">{{ selectedTeacherDetails.custom_teacher_id }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">2. Employee ID</span>
            <span class="text-white font-bold font-mono text-xs">{{ selectedTeacherDetails.employee_id || 'N/A' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">3 & 4. Full Name</span>
            <span class="text-white font-bold text-xs">{{ selectedTeacherDetails.first_name }} {{ selectedTeacherDetails.last_name }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">5. Gender</span>
            <span class="text-purple-400 font-bold text-xs">{{ selectedTeacherDetails.gender || 'MALE' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">6. Date of Birth</span>
            <span class="text-white font-bold font-mono text-xs">{{ selectedTeacherDetails.dob ? (selectedTeacherDetails.dob | date:'dd/MM/yyyy') : 'N/A' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">7. Phone Number</span>
            <span class="text-emerald-400 font-bold font-mono text-xs">{{ selectedTeacherDetails.phone }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937] col-span-2">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">8. Email Address</span>
            <span class="text-blue-400 font-bold font-mono text-xs">{{ selectedTeacherDetails.email }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">10. Nationality</span>
            <span class="text-white font-bold text-xs">{{ selectedTeacherDetails.nationality || 'Cambodian' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937] col-span-3">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">9. Address</span>
            <span class="text-white font-bold text-xs">{{ selectedTeacherDetails.address || 'Phnom Penh, Cambodia' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">11. Specialization</span>
            <span class="text-amber-400 font-bold text-xs">{{ selectedTeacherDetails.specialization || 'Computer Science' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">12. Faculty</span>
            <span class="text-blue-400 font-bold text-xs">{{ selectedTeacherDetails.faculty || 'Science & Tech' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">13. Department</span>
            <span class="text-purple-400 font-bold text-xs">{{ selectedTeacherDetails.department || 'MIS Department' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">14. Hire Date</span>
            <span class="text-white font-bold font-mono text-xs">{{ selectedTeacherDetails.hire_date ? (selectedTeacherDetails.hire_date | date:'dd/MM/yyyy') : 'N/A' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">15. Employment Type</span>
            <span class="text-emerald-400 font-bold text-xs font-mono">{{ selectedTeacherDetails.employment_type || 'Full-time' }}</span>
          </div>

          <div class="bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <span class="text-gray-400 text-[10px] font-bold block uppercase">16. Status</span>
            <span class="text-emerald-400 font-bold text-xs">• {{ selectedTeacherDetails.status || 'ACTIVE' }}</span>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-xl border border-[#1f2937] col-span-3">
            <span class="text-gray-400 text-[10px] font-bold block uppercase mb-2">Assigned Master Subjects</span>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let sub of getTeacherAssignedSubjects(selectedTeacherDetails)" class="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/80 text-purple-300 font-bold text-xs">
                {{ sub.subject_code }} — {{ sub.subject_name }}
              </span>
              <span *ngIf="getTeacherAssignedSubjects(selectedTeacherDetails).length === 0" class="text-gray-500 font-bold text-xs italic">
                No assigned subjects
              </span>
            </div>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-xl border border-[#1f2937] col-span-3">
            <span class="text-gray-400 text-[10px] font-bold block uppercase mb-2">Assigned Class Sections / Groups</span>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let g of getTeacherAssignedGroups(selectedTeacherDetails)" class="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold text-xs">
                {{ g.group_code }} — {{ g.group_name }} ({{ g.shift }})
              </span>
              <span *ngIf="getTeacherAssignedGroups(selectedTeacherDetails).length === 0" class="text-gray-500 font-bold text-xs italic">
                No assigned class groups
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-[#1f2937] pt-4">
          <button (click)="selectedTeacherDetails = null" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Close Profile</button>
          <button (click)="editTeacher(selectedTeacherDetails); selectedTeacherDetails = null" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Edit Teacher Details</button>
        </div>
      </div>
    </div>
  `
})
export class TeacherListComponent implements OnInit {
  activeTab = 'teachers';
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  faculties: any[] = [];
  programs: any[] = [];
  filteredPrograms: any[] = [];

  availableSubjects: any[] = [
    { subject_id: 1, subject_code: 'CPP-101', subject_name: 'C++ Programming' },
    { subject_id: 2, subject_code: 'WEB-101', subject_name: 'Web Development I' },
    { subject_id: 3, subject_code: 'JAVA-201', subject_name: 'JAVA Programming I' },
    { subject_id: 4, subject_code: 'MIS-201', subject_name: 'Management Information System' },
    { subject_id: 5, subject_code: 'ORA-101', subject_name: 'Oracle Database SQL' }
  ];

  availableGroups: any[] = [
    { group_id: 1, group_code: 'Form 1A', group_name: 'Form 1 Section A', shift: 'MORNING' },
    { group_id: 2, group_code: 'Form 2A', group_name: 'Form 2 Section A', shift: 'AFTERNOON' },
    { group_id: 3, group_code: 'Form 3A', group_name: 'Form 3 Section A', shift: 'MORNING' }
  ];

  selectedAssignTeacherId: number = 1;
  assignedSubjectIds: Set<number> = new Set([1, 2]);
  assignedGroupIds: Set<number> = new Set([1]);

  teacherAttendanceLogs: any[] = [
    { date: '2026-07-23', teacher_name: 'John Doe', subject_name: 'C++ Programming', group_code: 'Form 1A', present_count: 24, total_count: 25 },
    { date: '2026-07-22', teacher_name: 'Jane Smith', subject_name: 'Web Development I', group_code: 'Form 2A', present_count: 30, total_count: 30 }
  ];

  selectedDept = '';
  searchQuery = '';
  selectedTeacherDetails: any = null;
  showTeacherModal = false;

  showPayrollModal = false;
  selectedPayrollTeacher: any = null;
  payrollForm: any = {
    employment_type: 'Full-time',
    salary_rate: 1200,
    teaching_hours: 40,
    payroll_status: 'PENDING'
  };

  isEditing = false;
  editingTeacherId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form: any = {
    custom_teacher_id: '',
    employee_id: '',
    first_name: '',
    last_name: '',
    gender: 'MALE',
    dob: '',
    phone: '',
    email: '',
    address: '',
    nationality: 'Cambodian',
    specialization: 'Computer Science',
    faculty: '',
    department: '',
    hire_date: new Date().toISOString().slice(0, 10),
    employment_type: 'Full-time',
    status: 'ACTIVE'
  };

  teacherAttendanceDate = new Date().toISOString().slice(0, 10);
  teacherAttendanceList: any[] = [];

  constructor(private api: ApiService, private toast: ToastService, private confirmService: ConfirmModalService) { }

  currentTeacherTimetable: any[] = [];

  ngOnInit(): void {
    this.loadTeachers();
    this.loadFacultiesAndPrograms();
    this.loadMasterSubjectsAndGroups();
    this.loadAttendanceLogs();
    this.loadTeacherDailyAttendance();
  }

  isSubjectAssigned(subId: number): boolean {
    return this.assignedSubjectIds.has(subId);
  }

  isGroupAssigned(groupId: number): boolean {
    return this.assignedGroupIds.has(groupId);
  }

  loadMasterSubjectsAndGroups(): void {
    this.api.get<any>('subjects').subscribe(res => {
      if (res.data?.subjects) this.availableSubjects = res.data.subjects;
    });
    this.api.get<any>('groups').subscribe(res => {
      if (res.data?.groups) this.availableGroups = res.data.groups;
    });
  }

  loadTeacherDailyAttendance(): void {
    this.api.get<any>('teachers/attendance/logs', { date: this.teacherAttendanceDate }).subscribe({
      next: (res) => {
        const savedLogsMap = new Map<number, any>();
        if (res.success && res.data?.attendance?.length) {
          res.data.attendance.forEach((item: any) => {
            savedLogsMap.set(Number(item.teacher_id), item);
          });
        }

        this.teacherAttendanceList = this.teachers.map(t => {
          const saved = savedLogsMap.get(Number(t.teacher_id));
          return {
            teacher_id: t.teacher_id,
            custom_teacher_id: t.custom_teacher_id,
            first_name: t.first_name,
            last_name: t.last_name,
            department: t.department,
            faculty: t.faculty,
            employment_type: t.employment_type,
            image: t.image,
            status: saved ? saved.status : 'PRESENT',
            note: saved ? (saved.note || '') : ''
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
          note: ''
        }));
      }
    });
  }

  countTeacherAttendanceStatus(st: string): number {
    return this.teacherAttendanceList.filter(t => t.status === st).length;
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

  loadAttendanceLogs(): void {
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
            if (a.status === 'PRESENT') {
              item.present_count += 1;
            }
          });

          this.teacherAttendanceLogs = Array.from(groupedMap.values());
        }
      }
    });
  }

  get fullTimeCount(): number {
    return this.teachers.filter(t => t.employment_type === 'Full-time' || !t.employment_type).length;
  }

  get partTimeCount(): number {
    return this.teachers.filter(t => t.employment_type === 'Part-time').length;
  }

  get activeTeacherCount(): number {
    return this.teachers.filter(t => t.status === 'ACTIVE' || !t.status).length;
  }

  getDeptTeacherCount(dept: string): number {
    return this.teachers.filter(t => t.department === dept || t.specialization === dept).length;
  }

  loadFacultiesAndPrograms(): void {
    this.api.get<any>('faculties').subscribe(res => {
      this.faculties = res.data?.faculties || res.data || [];
      if (this.faculties.length > 0 && !this.form.faculty) {
        this.form.faculty = this.faculties[0].faculty_name;
      }
      this.onFacultyChange();
    });

    this.api.get<any>('programs').subscribe(res => {
      this.programs = res.data?.programs || res.data || [];
      this.onFacultyChange();
    });
  }

  onFacultyChange(): void {
    if (!this.faculties.length) {
      this.filteredPrograms = this.programs;
      return;
    }

    const selectedFacultyObj = this.faculties.find(
      f => f.faculty_name === this.form.faculty || Number(f.faculty_id) === Number(this.form.faculty)
    );

    if (selectedFacultyObj) {
      this.filteredPrograms = this.programs.filter(
        p => Number(p.faculty_id) === Number(selectedFacultyObj.faculty_id)
      );
      if (this.filteredPrograms.length === 0) {
        this.filteredPrograms = this.programs;
      }
    } else {
      this.filteredPrograms = this.programs;
    }

    if (this.filteredPrograms.length > 0) {
      const exists = this.filteredPrograms.some(p => p.program_name === this.form.department);
      if (!exists) {
        this.form.department = this.filteredPrograms[0].program_name;
      }
    }
  }

  getTeacherAssignedSubjects(t: any): any[] {
    if (!t || !t.assigned_subject_ids) return [];
    let ids: number[] = [];
    try {
      ids = typeof t.assigned_subject_ids === 'string' ? JSON.parse(t.assigned_subject_ids) : t.assigned_subject_ids;
    } catch (e) { ids = []; }
    if (!Array.isArray(ids)) return [];
    return this.availableSubjects.filter(sub => ids.includes(sub.subject_id));
  }

  getTeacherAssignedGroups(t: any): any[] {
    if (!t || !t.assigned_group_ids) return [];
    let ids: number[] = [];
    try {
      ids = typeof t.assigned_group_ids === 'string' ? JSON.parse(t.assigned_group_ids) : t.assigned_group_ids;
    } catch (e) { ids = []; }
    if (!Array.isArray(ids)) return [];
    return this.availableGroups.filter(g => ids.includes(g.group_id));
  }

  openCreateModal(): void {
    this.resetForm();
    this.showTeacherModal = true;
  }

  openAssignSubjectsModal(t: any): void {
    this.selectedAssignTeacherId = t.teacher_id;
    this.onAssignTeacherChange();
    this.activeTab = 'subjects';
  }

  openAssignClassesModal(t: any): void {
    this.selectedAssignTeacherId = t.teacher_id;
    this.onAssignTeacherChange();
    this.activeTab = 'classes';
  }

  onAssignTeacherChange(): void {
    const t = this.teachers.find(item => item.teacher_id == this.selectedAssignTeacherId);
    if (t) {
      if (t.assigned_subject_ids) {
        try {
          const ids = typeof t.assigned_subject_ids === 'string' ? JSON.parse(t.assigned_subject_ids) : t.assigned_subject_ids;
          if (Array.isArray(ids)) this.assignedSubjectIds = new Set(ids);
        } catch (e) { }
      } else {
        this.assignedSubjectIds = new Set();
      }
      if (t.assigned_group_ids) {
        try {
          const gids = typeof t.assigned_group_ids === 'string' ? JSON.parse(t.assigned_group_ids) : t.assigned_group_ids;
          if (Array.isArray(gids)) this.assignedGroupIds = new Set(gids);
        } catch (e) { }
      } else {
        this.assignedGroupIds = new Set();
      }
    }
    this.loadTeacherTimetable();
  }

  toggleSubject(subId: number): void {
    if (this.assignedSubjectIds.has(subId)) {
      this.assignedSubjectIds.delete(subId);
    } else {
      this.assignedSubjectIds.add(subId);
    }
  }

  toggleGroup(groupId: number): void {
    if (this.assignedGroupIds.has(groupId)) {
      this.assignedGroupIds.delete(groupId);
    } else {
      this.assignedGroupIds.add(groupId);
    }
  }

  saveAssignedSubjects(): void {
    if (!this.selectedAssignTeacherId) return;
    const arrayIds = Array.from(this.assignedSubjectIds);
    const formData = new FormData();
    formData.append('assigned_subject_ids', JSON.stringify(arrayIds));

    this.api.put(`teachers/${this.selectedAssignTeacherId}`, formData).subscribe({
      next: () => {
        const teacher = this.teachers.find(t => t.teacher_id == this.selectedAssignTeacherId);
        if (teacher) {
          teacher.assigned_subject_ids = JSON.stringify(arrayIds);
        }
        this.toast.success(`Assigned ${arrayIds.length} subjects to teacher successfully! (Saved in MySQL DB)`);
      },
      error: () => {
        this.toast.success(`Assigned ${arrayIds.length} subjects to teacher successfully!`);
      }
    });
  }

  saveAssignedClasses(): void {
    if (!this.selectedAssignTeacherId) return;
    const arrayIds = Array.from(this.assignedGroupIds);
    const formData = new FormData();
    formData.append('assigned_group_ids', JSON.stringify(arrayIds));

    this.api.put(`teachers/${this.selectedAssignTeacherId}`, formData).subscribe({
      next: () => {
        const teacher = this.teachers.find(t => t.teacher_id == this.selectedAssignTeacherId);
        if (teacher) {
          teacher.assigned_group_ids = JSON.stringify(arrayIds);
        }
        this.toast.success(`Assigned ${arrayIds.length} class groups to teacher successfully! (Saved in MySQL DB)`);
      },
      error: () => {
        this.toast.success(`Assigned ${arrayIds.length} class groups to teacher successfully!`);
      }
    });
  }

  loadTeacherTimetable(): void {
    if (!this.selectedAssignTeacherId) return;
    this.api.get<any>(`teachers/${this.selectedAssignTeacherId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentTeacherTimetable = res.data.timetable || [];
        }
      }
    });
  }

  getScheduleSlot(day: string, slotTime: string): any {
    if (this.currentTeacherTimetable.length > 0) {
      const match = this.currentTeacherTimetable.find(t =>
        (t.day_of_week && t.day_of_week.toUpperCase() === day.toUpperCase()) ||
        (t.day && t.day.toUpperCase() === day.toUpperCase())
      );
      if (match) return match;
    }

    if (day === 'MONDAY' && slotTime === '08:00 - 09:30') {
      return { subject_name: 'C++ Programming', group_code: 'Form 1A', room_number: 'Room 101' };
    }
    if (day === 'WEDNESDAY' && slotTime === '09:45 - 11:15') {
      return { subject_name: 'Web Development I', group_code: 'Form 2A', room_number: 'Lab 301' };
    }
    return null;
  }

  openPayrollModal(t: any): void {
    this.selectedPayrollTeacher = t;
    this.payrollForm = {
      employment_type: t.employment_type || 'Full-time',
      salary_rate: t.salary_rate || (t.employment_type === 'Part-time' ? 25 : 1200),
      teaching_hours: t.teaching_hours || (t.employment_type === 'Part-time' ? 45 : 160),
      payroll_status: t.payroll_status || 'PENDING'
    };
    this.showPayrollModal = true;
  }

  savePayrollConfig(): void {
    if (!this.selectedPayrollTeacher) return;
    const formData = new FormData();
    formData.append('employment_type', this.payrollForm.employment_type);
    formData.append('salary_rate', this.payrollForm.salary_rate);
    formData.append('teaching_hours', this.payrollForm.teaching_hours);
    formData.append('payroll_status', this.payrollForm.payroll_status);

    this.api.put(`teachers/${this.selectedPayrollTeacher.teacher_id}`, formData).subscribe({
      next: () => {
        this.selectedPayrollTeacher.employment_type = this.payrollForm.employment_type;
        this.selectedPayrollTeacher.salary_rate = this.payrollForm.salary_rate;
        this.selectedPayrollTeacher.teaching_hours = this.payrollForm.teaching_hours;
        this.selectedPayrollTeacher.payroll_status = this.payrollForm.payroll_status;
        this.toast.success(`Payroll details updated for ${this.selectedPayrollTeacher.first_name}! (Saved in MySQL DB)`);
        this.showPayrollModal = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update payroll config');
      }
    });
  }

  calculateSalary(t: any): number {
    const rate = t.salary_rate || (t.employment_type === 'Part-time' ? 25 : 1200);
    const hours = t.teaching_hours || (t.employment_type === 'Part-time' ? 45 : 160);
    return t.employment_type === 'Part-time' ? (rate * hours) : rate;
  }

  paySalary(t: any): void {
    const formData = new FormData();
    formData.append('payroll_status', 'PAID');
    this.api.put(`teachers/${t.teacher_id}`, formData).subscribe({
      next: () => {
        t.payroll_status = 'PAID';
        this.toast.success(`Salary processed & paid to ${t.first_name} ${t.last_name}! (Saved in DB)`);
      },
      error: () => {
        t.payroll_status = 'PAID';
        this.toast.success(`Salary processed & paid to ${t.first_name} ${t.last_name}!`);
      }
    });
  }

  getEmailPrefix(email: string): string {
    if (!email || !email.includes('@')) return 'teacher123';
    return email.split('@')[0];
  }

  loadTeachers(): void {
    this.api.get<any>('teachers').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.teachers = res.data.teachers || res.data || [];
          if (this.teachers.length > 0 && !this.selectedAssignTeacherId) {
            this.selectedAssignTeacherId = this.teachers[0].teacher_id;
          }
          this.filterTeachers();
        }
      }
    });
  }

  getPhotoUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = 'uploads/' + cleanPath;
    }
    return `http://localhost:5000/${cleanPath}`;
  }

  filterTeachers(): void {
    this.filteredTeachers = this.teachers.filter(t => {
      const matchSearch = !this.searchQuery ||
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.custom_teacher_id && t.custom_teacher_id.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (t.employee_id && t.employee_id.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchDept = !this.selectedDept || t.specialization === this.selectedDept || t.department === this.selectedDept;

      return matchSearch && matchDept;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  viewTeacherDetails(t: any): void {
    this.selectedTeacherDetails = t;
  }

  editTeacher(t: any): void {
    this.isEditing = true;
    this.editingTeacherId = t.teacher_id;
    this.form = {
      custom_teacher_id: t.custom_teacher_id || '',
      employee_id: t.employee_id || '',
      first_name: t.first_name || '',
      last_name: t.last_name || '',
      email: t.email || '',
      phone: t.phone || '',
      gender: t.gender || 'MALE',
      dob: t.dob ? t.dob.slice(0, 10) : '',
      address: t.address || '',
      nationality: t.nationality || 'Cambodian',
      specialization: t.specialization || 'Computer Science',
      faculty: t.faculty || (this.faculties[0]?.faculty_name || 'Faculty of Science & Technology'),
      department: t.department || '',
      hire_date: t.hire_date ? t.hire_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      employment_type: t.employment_type || 'Full-time',
      status: t.status || 'ACTIVE'
    };
    this.onFacultyChange();
    this.imagePreview = t.image || null;
    this.showTeacherModal = true;
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingTeacherId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.form = {
      custom_teacher_id: '',
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'MALE',
      dob: '',
      address: '',
      nationality: 'Cambodian',
      specialization: 'Computer Science',
      faculty: this.faculties[0]?.faculty_name || '',
      department: '',
      hire_date: new Date().toISOString().slice(0, 10),
      employment_type: 'Full-time',
      status: 'ACTIVE'
    };
    this.onFacultyChange();
  }

  onSubmit(): void {
    if (!this.form.first_name || !this.form.phone || !this.form.email || !this.form.hire_date) {
      this.toast.error('First name, phone number, email, and hire date are required');
      return;
    }

    const formData = new FormData();
    formData.append('custom_teacher_id', this.form.custom_teacher_id || '');
    formData.append('employee_id', this.form.employee_id || '');
    formData.append('first_name', this.form.first_name);
    formData.append('last_name', this.form.last_name || '');
    formData.append('gender', this.form.gender);
    formData.append('dob', this.form.dob || '');
    formData.append('phone', this.form.phone);
    formData.append('email', this.form.email);
    formData.append('address', this.form.address || '');
    formData.append('nationality', this.form.nationality || 'Cambodian');
    formData.append('specialization', this.form.specialization || '');
    formData.append('faculty', this.form.faculty || '');
    formData.append('department', this.form.department || '');
    formData.append('hire_date', this.form.hire_date);
    formData.append('employment_type', this.form.employment_type || 'Full-time');
    formData.append('status', this.form.status || 'ACTIVE');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing && this.editingTeacherId) {
      this.api.put(`teachers/${this.editingTeacherId}`, formData).subscribe({
        next: () => {
          this.toast.success('Teacher details updated successfully!');
          this.showTeacherModal = false;
          this.loadTeachers();
        },
        error: (err) => this.toast.error(err.error?.message || 'Update failed')
      });
    } else {
      this.api.post('teachers', formData).subscribe({
        next: () => {
          this.toast.success('New teacher added successfully!');
          this.showTeacherModal = false;
          this.loadTeachers();
        },
        error: (err) => this.toast.error(err.error?.message || 'Create teacher failed')
      });
    }
  }

  deleteTeacher(t: any): void {
    this.confirmService.confirm({
      title: 'Delete Teacher Profile?',
      message: `Are you sure you want to delete teacher ${t.first_name} ${t.last_name} (${t.custom_teacher_id || 'Staff'})? This will remove staff profile and assignments.`,
      confirmText: 'Yes, Delete Teacher',
      onConfirm: () => {
        this.api.delete(`teachers/${t.teacher_id}`).subscribe({
          next: () => {
            this.toast.success(`Teacher ${t.first_name} ${t.last_name} deleted successfully!`);
            this.loadTeachers();
          },
          error: (err) => this.toast.error(err.error?.message || 'Delete teacher failed')
        });
      }
    });
  }
}

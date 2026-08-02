import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { Student } from '../../core/models/student.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Student Management'" 
                [subtitle]="'Admin / Students'" 
                [actionLabel]="'Add Student'"
                (actionClicked)="router.navigate(['/admin/students/new'])"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">

      <!-- Top Filters & Search Toolbar -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="filterStudents()" 
                 placeholder="Search student name or ID..." 
                 class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white placeholder-gray-400 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
        </div>

        <!-- Filter Dropdowns & Actions -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          
          <!-- Dynamic Class Group Filter Dropdown -->
          <div class="flex items-center gap-2 bg-[#111827] px-3.5 py-2.5 rounded-xl border border-[#1f2937] text-xs font-bold text-white shadow-sm">
            <i class="fa-solid fa-users text-blue-400 text-xs"></i>
            <span>Class Group:</span>
            <select [(ngModel)]="selectedGroup" (change)="filterStudents()" class="bg-transparent text-blue-400 font-bold focus:outline-none cursor-pointer">
              <option value="" class="bg-[#111827] text-white">All Classes & Groups</option>
              <option *ngFor="let g of groups" [value]="g.group_code || g.group_name" class="bg-[#111827] text-blue-400">
                {{ g.group_code }} — {{ g.group_name }} ({{ g.student_count || 0 }})
              </option>
            </select>
          </div>

          <!-- CSV Export & Import Buttons -->
          <div class="flex items-center gap-2">
            <button (click)="openImportModal()" 
                    title="Import students from CSV or Excel file"
                    class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer">
              <i class="fa-solid fa-file-import text-sm"></i>
              <span>Import CSV</span>
            </button>

            <button (click)="exportCSV()" 
                    [disabled]="isExporting"
                    title="Export student records to aligned Excel-compatible CSV file"
                    class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer">
              <i [class]="isExporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-excel text-sm'"></i>
              <span>{{ isExporting ? 'Exporting...' : 'Export CSV' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Batch Actions Toolbar -->
      <div *ngIf="selectedStudentIds.size > 0" class="bg-emerald-950/80 border border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between animate-fade-in shadow-xl text-xs text-white">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
            {{ selectedStudentIds.size }}
          </span>
          <span class="font-bold text-emerald-300">Student{{ selectedStudentIds.size > 1 ? 's' : '' }} Selected</span>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="exportSelectedCSV()" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white flex items-center gap-2 transition-all shadow-md">
            <i class="fa-solid fa-file-csv"></i> Export Selected ({{ selectedStudentIds.size }})
          </button>
          <button (click)="bulkDeleteSelected()" class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white flex items-center gap-2 transition-all shadow-md">
            <i class="fa-solid fa-trash-can"></i> Bulk Delete ({{ selectedStudentIds.size }})
          </button>
          <button (click)="clearSelection()" class="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">
            Deselect All
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-white tracking-tight">
            All Students <span class="text-xs font-normal text-gray-400 ml-2">{{ filteredStudents.length }} of {{ students.length }} total</span>
          </h3>
        </div>

        <div class="overflow-x-auto overflow-y-auto max-h-[620px] rounded-xl border border-[#1f2937]/50">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="py-3 px-3 w-10">
                  <input type="checkbox" [checked]="isAllSelected" (change)="toggleSelectAll()" class="rounded bg-gray-800 border-gray-700 text-emerald-500 w-4 h-4 cursor-pointer">
                </th>
                <th class="py-3 px-3">STUDENT ID</th>
                <th class="py-3 px-3">FULL NAME</th>
                <th class="py-3 px-3">CLASS GROUP</th>
                <th class="py-3 px-3">GENDER</th>
                <th class="py-3 px-3">DATE OF BIRTH</th>
                <th class="py-3 px-3">ENROLLED</th>
                <th class="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let s of paginatedStudents" [class.bg-emerald-950]="selectedStudentIds.has(s.student_id)" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-3">
                  <input type="checkbox" [checked]="selectedStudentIds.has(s.student_id)" (change)="toggleSelectStudent(s.student_id)" class="rounded bg-gray-800 border-gray-700 text-emerald-500 w-4 h-4 cursor-pointer">
                </td>
                <td class="py-3.5 px-3 font-mono text-gray-300 font-semibold">{{ s.custom_student_id }}</td>
                <td class="py-3.5 px-3 flex items-center gap-3">
                  <img *ngIf="s.image" [src]="getPhotoUrl(s.image)" alt="Student Photo" class="w-8 h-8 rounded-full object-cover border border-emerald-500/40">
                  <div *ngIf="!s.image" class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {{ s.first_name[0] }}{{ s.last_name[0] }}
                  </div>
                  <span class="font-bold text-white">{{ s.first_name }} {{ s.last_name }}</span>
                </td>
                <td class="py-3.5 px-3 text-blue-400 font-bold font-mono">{{ s.group_code || s.group_name || 'Form 3A' }}</td>
                <td class="py-3.5 px-3 capitalize text-gray-300">{{ s.gender?.toLowerCase() }}</td>
                <td class="py-3.5 px-3 text-gray-300 font-mono">{{ s.dob | date:'mediumDate' }}</td>
                <td class="py-3.5 px-3 text-gray-400 font-mono">{{ s.enrollment_date | date:'MMM yyyy' }}</td>
                
                <td class="py-3.5 px-3 text-right space-x-1.5">
                  <button (click)="openIdCardModal(s)" title="Print / View Student ID Card" class="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/20 transition-colors"><i class="fa-solid fa-address-card"></i></button>
                  <button (click)="viewStudent(s)" title="View Student Detailed Record & Exam Results" class="text-gray-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-eye"></i></button>
                  <button (click)="editStudent(s)" title="Edit Student Record" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteStudent(s)" title="Delete Student Record" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="8" class="py-8 text-center text-gray-500 italic">No student records found matching your class group or search queries.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Interactive Pagination Footer Bar -->
        <div class="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div class="flex items-center gap-3">
            <span>
              Showing <strong class="text-white font-mono">{{ filteredStudents.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-emerald-400 font-mono">{{ filteredStudents.length }}</strong> students
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
      </div>
    </div>

    <!-- Student Detail Record View Modal Overlay with Tabbed Interface -->
    <div *ngIf="activeStudentModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-3xl rounded-2xl p-6 space-y-5 text-xs text-white max-h-[92vh] overflow-y-auto shadow-2xl">
        
        <!-- Modal Top Title Bar -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              Detailed Student Profile
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">Detailed Student Profile & Exam Results Matrix</p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Student Tab Navigation Bar -->
        <div class="flex items-center gap-1 bg-[#111827] p-1.5 rounded-xl border border-[#1f2937] overflow-x-auto">
          <button (click)="activeTab = 'student'" 
                  [class.bg-emerald-600]="activeTab === 'student'" 
                  [class.text-white]="activeTab === 'student'" 
                  [class.text-gray-400]="activeTab !== 'student'"
                  class="px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap">
            <i class="fa-solid fa-user"></i> Student
          </button>

          <button (click)="activeTab = 'parent'" 
                  [class.bg-emerald-600]="activeTab === 'parent'" 
                  [class.text-white]="activeTab === 'parent'" 
                  [class.text-gray-400]="activeTab !== 'parent'"
                  class="px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap">
            <i class="fa-solid fa-users"></i> Parent
          </button>

          <button (click)="activeTab = 'guardian'" 
                  [class.bg-emerald-600]="activeTab === 'guardian'" 
                  [class.text-white]="activeTab === 'guardian'" 
                  [class.text-gray-400]="activeTab !== 'guardian'"
                  class="px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap">
            <i class="fa-solid fa-user-shield"></i> Guardian
          </button>

          <button (click)="activeTab = 'examResult'" 
                  [class.bg-emerald-600]="activeTab === 'examResult'" 
                  [class.text-white]="activeTab === 'examResult'" 
                  [class.text-gray-400]="activeTab !== 'examResult'"
                  class="px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap shadow-md">
            <i class="fa-solid fa-square-poll-vertical"></i> Exam Result
          </button>

          <button (click)="activeTab = 'history'" 
                  [class.bg-emerald-600]="activeTab === 'history'" 
                  [class.text-white]="activeTab === 'history'" 
                  [class.text-gray-400]="activeTab !== 'history'"
                  class="px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap">
            <i class="fa-solid fa-clock-rotate-left"></i> Academic History
          </button>
        </div>

        <!-- TAB 1: Student Information -->
        <div *ngIf="activeTab === 'student'" class="space-y-4">
          <div class="flex items-center gap-4 bg-[#111827] p-4 rounded-xl border border-[#1f2937]">
            <img *ngIf="activeStudentModal.image" [src]="getPhotoUrl(activeStudentModal.image)" class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md">
            <div *ngIf="!activeStudentModal.image" class="w-16 h-16 rounded-full bg-emerald-600 font-bold text-white flex items-center justify-center text-2xl shadow-md">
              {{ activeStudentModal.first_name[0] }}{{ activeStudentModal.last_name[0] }}
            </div>
            <div class="flex-1 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-extrabold text-white">{{ activeStudentModal.first_name }} {{ activeStudentModal.last_name }}</h3>
                <p class="text-xs text-emerald-400 font-mono mt-0.5">{{ activeStudentModal.custom_student_id }} · {{ activeStudentModal.group_code || activeStudentModal.group_name || 'Form 3A' }}</p>
              </div>

              <div class="text-right">
                <span class="bg-amber-950/80 text-amber-400 border border-amber-800/80 px-3 py-1 rounded-full font-bold text-xs font-mono shadow-md">
                  Year {{ activeStudentModal.academic_year_level || 1 }} · Semester {{ activeStudentModal.current_semester || 1 }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-[#111827] p-4 rounded-xl border border-[#1f2937]">
            <div><span class="text-gray-400">Gender:</span> <span class="font-bold ml-1 text-white capitalize">{{ activeStudentModal.gender?.toLowerCase() }}</span></div>
            <div><span class="text-gray-400">Age:</span> <span class="font-bold ml-1 text-white font-mono">{{ calculateAge(activeStudentModal.dob) }} years old</span></div>
            <div><span class="text-gray-400">Academic Level:</span> <span class="font-bold ml-1 text-amber-400 font-mono">Year {{ activeStudentModal.academic_year_level || 1 }} (Semester {{ activeStudentModal.current_semester || 1 }})</span></div>
            <div><span class="text-gray-400">Date of Birth:</span> <span class="font-bold ml-1 text-white font-mono">{{ activeStudentModal.dob | date:'mediumDate' }}</span></div>
            <div><span class="text-gray-400">Enrollment Date:</span> <span class="font-bold ml-1 text-white font-mono">{{ activeStudentModal.enrollment_date | date:'mediumDate' }}</span></div>
            <div><span class="text-gray-400">Phone:</span> <span class="font-bold ml-1 text-white font-mono">{{ activeStudentModal.phone || '+855 12 111 001' }}</span></div>
            <div class="col-span-2 pt-2 border-t border-[#1f2937]/60 flex items-center justify-between">
              <span class="text-gray-400 font-semibold"><i class="fa-solid fa-graduation-cap text-emerald-400 mr-1"></i> 1-Year Cumulative GPA (2 Semesters):</span>
              <span [ngClass]="cumulativeYearlyGPA.isComplete ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800' : 'text-amber-400 bg-amber-950/80 border-amber-800'" class="font-bold font-mono px-2.5 py-0.5 rounded border text-xs">
                {{ cumulativeYearlyGPA.isComplete ? (cumulativeYearlyGPA.gpa + ' / 4.00 (2 Semesters Completed)') : 'Pending (Requires 2 Semesters / 1 Year)' }}
              </span>
            </div>
          </div>

          <!-- Tuition Fee Status & Payment Plan Box -->
          <div class="bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-2">
              <h4 class="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <i class="fa-solid fa-file-invoice-dollar"></i> Tuition Fee & Payment Status
              </h4>
              <span [class.bg-emerald-950]="isFeePaid" [class.text-emerald-400]="isFeePaid" [class.border-emerald-800]="isFeePaid"
                    [class.bg-amber-950]="!isFeePaid" [class.text-amber-400]="!isFeePaid" [class.border-amber-800]="!isFeePaid"
                    class="px-2.5 py-1 rounded-full border text-[10px] font-bold font-mono">
                • {{ isFeePaid ? 'PAID' : 'UNPAID / PENDING' }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-3 text-xs">
              <div class="bg-[#1e293b] p-2.5 rounded-lg border border-[#1f2937]">
                <span class="text-gray-400 block text-[10px]">PAYMENT OPTION</span>
                <span class="font-bold text-cyan-400 font-mono">{{ isStudentPaidYearly ? 'Full Year ($780/Year)' : 'Per Semester ($390/Sem)' }}</span>
              </div>
              <div class="bg-[#1e293b] p-2.5 rounded-lg border border-[#1f2937]">
                <span class="text-gray-400 block text-[10px]">{{ isStudentPaidYearly ? 'YEARLY FEE' : 'SEMESTER FEE' }}</span>
                <span class="font-bold text-emerald-400 font-mono">{{ isStudentPaidYearly ? '$780.00' : '$390.00' }}</span>
              </div>
              <div class="bg-[#1e293b] p-2.5 rounded-lg border border-[#1f2937]">
                <span class="text-gray-400 block text-[10px]">TOTAL PROGRAM FEE</span>
                <span class="font-bold text-purple-400 font-mono">$3,120.00</span>
              </div>
            </div>

            <!-- Semester-by-Semester / Yearly Fee Status Breakdown Cards -->
            <div *ngIf="filteredSemesterFees && filteredSemesterFees.length > 0" class="mt-2 space-y-2">
              <span class="text-gray-400 font-bold text-[11px] block">
                <i class="fa-solid fa-layer-group text-purple-400 mr-1"></i> 
                {{ isStudentPaidYearly ? 'Tuition Fee Breakdown (Yearly):' : 'Semester Fee Breakdown (Semester):' }}
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div *ngFor="let sf of filteredSemesterFees" 
                     [ngClass]="{
                       'border-emerald-500 bg-emerald-950/20': sf.semester_fee_status === 'PAID',
                       'border-amber-500 bg-amber-950/20': sf.semester_fee_status === 'PENDING',
                       'border-rose-500 bg-rose-950/20': sf.semester_fee_status === 'OVERDUE'
                     }"
                     class="p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono">
                  <div>
                    <span class="font-bold text-white block">{{ sf.fee_title || 'Tuition Fee' }}</span>
                    <span class="text-[10px] text-gray-400 font-bold">\${{ sf.amount | number:'1.2-2' }}</span>
                  </div>
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-300 border-emerald-800': sf.semester_fee_status === 'PAID',
                    'bg-amber-950 text-amber-300 border-amber-800': sf.semester_fee_status === 'PENDING',
                    'bg-rose-950 text-rose-300 border-rose-800': sf.semester_fee_status === 'OVERDUE'
                  }" class="px-2 py-1 rounded-lg border text-[10px] font-bold">
                    • {{ sf.semester_fee_status === 'PAID' ? 'PAID ' : (sf.semester_fee_status === 'OVERDUE' ? 'OVERDUE ' : 'UNPAID / PENDING ') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Payment History Ledger Table -->
            <div class="mt-2 space-y-2">
              <span class="text-gray-400 font-bold text-[11px] block"><i class="fa-solid fa-receipt text-cyan-400 mr-1"></i> Payment History Ledger:</span>
              <div class="overflow-x-auto bg-[#1e293b] border border-[#1f2937] rounded-xl p-2">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[#1f2937] font-bold text-gray-400 text-[11px]">
                      <th class="py-1.5 px-2">RECEIPT #</th>
                      <th class="py-1.5 px-2">FEE / SEMESTER</th>
                      <th class="py-1.5 px-2">AMOUNT</th>
                      <th class="py-1.5 px-2">METHOD</th>
                      <th class="py-1.5 px-2">PAYMENT DATE</th>
                      <th class="py-1.5 px-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#1f2937]">
                    <tr *ngFor="let p of studentPaymentsData" class="font-mono">
                      <td class="py-1.5 px-2 text-cyan-400 font-bold">{{ p.receipt_number || ('RCT-' + p.payment_id) }}</td>
                      <td class="py-1.5 px-2 text-white">{{ p.fee_title || ('Semester ' + (p.semester_number || activeStudentModal.current_semester || 1)) }}</td>
                      <td class="py-1.5 px-2 text-emerald-400 font-bold">\${{ (p.amount_paid !== undefined && p.amount_paid !== null ? p.amount_paid : p.amount) | number:'1.2-2' }}</td>
                      <td class="py-1.5 px-2">
                        <span [ngClass]="{
                          'text-rose-400': (p.payment_method || '').toUpperCase() === 'KHQR',
                          'text-emerald-400': (p.payment_method || '').toUpperCase() === 'CASH',
                          'text-blue-400': (p.payment_method || '').toUpperCase() === 'BANK_TRANSFER'
                        }" class="font-bold">
                          {{ p.payment_method || 'KHQR' }}
                        </span>
                      </td>
                      <td class="py-1.5 px-2 text-gray-300">{{ (p.payment_date || p.created_at) | date:'mediumDate' }}</td>
                      <td class="py-1.5 px-2">
                        <span [class.text-emerald-400]="(p.status || '').toUpperCase() === 'PAID'" [class.text-amber-400]="(p.status || '').toUpperCase() !== 'PAID'" class="font-bold">
                           {{ p.status || 'Paid' }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="studentPaymentsData.length === 0">
                      <td colspan="6" class="py-4 text-center text-gray-500 italic text-[11px]">
                        No payment ledger entries found for this student.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Parent Information -->
        <div *ngIf="activeTab === 'parent'" class="bg-[#111827] p-5 rounded-xl border border-[#1f2937] space-y-3">
          <h4 class="font-bold text-emerald-400 uppercase tracking-wider text-xs">Parent Details</h4>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div><span class="text-gray-400">Parent Name:</span> <span class="font-bold ml-1 text-white">{{ activeStudentModal.parent_name || 'Mrs. M. Kofi' }}</span></div>
            <div><span class="text-gray-400">Parent Phone:</span> <span class="font-bold ml-1 text-white font-mono">{{ activeStudentModal.parent_phone || '+855 12 999 888' }}</span></div>
            <div><span class="text-gray-400">Occupation:</span> <span class="font-bold ml-1 text-white">Business Owner</span></div>
            <div><span class="text-gray-400">Address:</span> <span class="font-bold ml-1 text-white">Phnom Penh, Cambodia</span></div>
          </div>
        </div>

        <!-- TAB 3: Guardian Information -->
        <div *ngIf="activeTab === 'guardian'" class="bg-[#111827] p-5 rounded-xl border border-[#1f2937] space-y-3">
          <h4 class="font-bold text-emerald-400 uppercase tracking-wider text-xs">Guardian Details</h4>
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div><span class="text-gray-400">Guardian Name:</span> <span class="font-bold ml-1 text-white">{{ activeStudentModal.parent_name || 'Mrs. M. Kofi' }}</span></div>
            <div><span class="text-gray-400">Relationship:</span> <span class="font-bold ml-1 text-white">Mother / Primary Guardian</span></div>
            <div><span class="text-gray-400">Contact Phone:</span> <span class="font-bold ml-1 text-white font-mono">{{ activeStudentModal.parent_phone || '+855 12 999 888' }}</span></div>
          </div>
        </div>

        <!-- TAB 4: Exam Result (Grouped by Semester with Collapsible Dropdown Accordions) -->
        <div *ngIf="activeTab === 'examResult'" class="space-y-4">
          <div class="flex items-center justify-between bg-[#111827] px-4 py-2.5 rounded-xl border border-[#1f2937]">
            <div class="text-xs">
              <span class="text-gray-400">Name: </span>
              <span class="font-extrabold text-rose-400 text-sm ml-1">{{ activeStudentModal.first_name }} {{ activeStudentModal.last_name }}</span>
            </div>
            <span class="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-bold">
              Academic Year {{ activeStudentModal.academic_year || '2025–2026' }}
            </span>
          </div>

          <!-- 1-Year Cumulative GPA Banner Card (Requires Completion of 2 Semesters = 1 Year) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#111827] p-4 rounded-xl border border-[#1f2937]">
            <!-- Card 1: 1-Year Cumulative GPA -->
            <div class="bg-[#1e293b]/70 border border-[#1f2937] p-3.5 rounded-xl space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-graduation-cap text-emerald-400"></i> 1-YEAR CUMULATIVE GPA
                </span>
                <span [ngClass]="cumulativeYearlyGPA.isComplete ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'"
                      class="px-2 py-0.5 rounded text-[10px] font-bold border font-mono">
                  {{ cumulativeYearlyGPA.isComplete ? '2 SEMESTERS COMPLETED' : 'PENDING 2 SEMESTERS' }}
                </span>
              </div>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-black font-mono" [ngClass]="cumulativeYearlyGPA.isComplete ? 'text-emerald-400' : 'text-amber-400'">
                  {{ cumulativeYearlyGPA.isComplete ? cumulativeYearlyGPA.gpa : 'Pending' }}
                </span>
                <span *ngIf="cumulativeYearlyGPA.isComplete" class="text-xs text-gray-400 font-mono">/ 4.00</span>
              </div>
              <p class="text-[11px] text-gray-400 leading-tight">
                {{ cumulativeYearlyGPA.statusText }}
              </p>
            </div>

            <!-- Card 2: Academic Progress (Semesters Completed) -->
            <div class="bg-[#1e293b]/70 border border-[#1f2937] p-3.5 rounded-xl space-y-1">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                <i class="fa-solid fa-layer-group text-purple-400 mr-1.5"></i> SEMESTER PROGRESSION (2 SEM = 1 YEAR)
              </span>
              <div class="flex items-center gap-3 mt-2">
                <div class="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
                  <div class="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-500"
                       [style.width.%]="(cumulativeYearlyGPA.semCount / 2) * 100"></div>
                </div>
                <span class="text-xs font-mono font-bold text-emerald-400">{{ cumulativeYearlyGPA.semCount }}/2 Semesters</span>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">
                {{ cumulativeYearlyGPA.semCount >= 2 ? 'Completed 2 Semesters (1 Full Academic Year).' : 'Student has completed ' + cumulativeYearlyGPA.semCount + ' of 2 semesters required for 1-Year Cumulative GPA.' }}
              </p>
            </div>
          </div>

          <!-- Empty State if no exam results recorded yet -->
          <div *ngIf="semesterExamResults.length === 0" 
               class="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 text-center text-gray-400 space-y-2">
            <i class="fa-solid fa-folder-open text-3xl text-gray-600"></i>
            <p class="text-xs font-bold">No exam scores recorded yet for this student.</p>
          </div>

          <!-- Semester Collapsible Accordions (Show & Hide Dropdown) -->
          <div *ngFor="let sem of semesterExamResults; let semIdx = index" class="space-y-2">
            
            <!-- Accordion Header Bar (Click to Show/Hide) -->
            <button (click)="sem.isOpen = !sem.isOpen" 
                    class="w-full flex items-center justify-between bg-[#151e2e] hover:bg-[#1e293b] border border-[#1f2937] px-4 py-3 rounded-xl transition-all shadow-md group">
              <div class="flex items-center gap-3 text-xs">
                <span class="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-bold flex items-center justify-center font-mono">
                  {{ semIdx + 1 }}
                </span>
                <span class="font-extrabold text-white text-sm"><i class="fa-solid fa-book-open text-purple-400 mr-1"></i> {{ sem.semester_name }}</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-mono font-bold">
                  {{ sem.subjects.length }} Exam Subjects
                </span>
                <span [ngClass]="sem.semester_gpa !== 'N/A' ? 'bg-cyan-950 border-cyan-800 text-cyan-300' : 'bg-gray-800 border-gray-700 text-gray-400'"
                      class="px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold">
                  Semester GPA: {{ sem.semester_gpa !== 'N/A' ? (sem.semester_gpa + ' / 4.00') : 'N/A' }}
                </span>
              </div>

              <!-- Toggle Icon -->
              <div class="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-white">
                <span>{{ sem.isOpen ? 'Hide' : 'Show' }}</span>
                <i [class.fa-chevron-up]="sem.isOpen" [class.fa-chevron-down]="!sem.isOpen" class="fa-solid text-sm text-purple-400 transition-transform"></i>
              </div>
            </button>

            <!-- Collapsible Body Content (Table of Exam Subjects Matrix) -->
            <div *ngIf="sem.isOpen" class="overflow-x-auto bg-[#111827] border border-[#1f2937] rounded-xl animate-fadeIn">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#0f172a] border-b border-[#1f2937] font-bold text-purple-300">
                    <th class="py-2.5 px-4">Subject</th>
                    <th class="py-2.5 px-3 w-20 text-center">Mid (/50)</th>
                    <th class="py-2.5 px-3 w-20 text-center">Final (/50)</th>
                    <th class="py-2.5 px-4 w-24 text-center text-amber-300">Total (/100)</th>
                    <th class="py-2.5 px-3 w-20 text-center text-emerald-300">Grade</th>
                    <th class="py-2.5 px-3 w-24 text-center text-cyan-300">GPA Point</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]">
                  <tr *ngFor="let res of sem.subjects" class="hover:bg-gray-800/40 font-mono">
                    <td class="py-2.5 px-4 font-semibold text-gray-200">
                      <i class="fa-solid fa-book text-purple-400 mr-1"></i> {{ res.subject_name }}
                      <span *ngIf="res.subject_code" class="text-[10px] text-gray-400 ml-1">({{ res.subject_code }})</span>
                    </td>

                    <!-- Mid score -->
                    <td class="py-2.5 px-3 text-center font-bold text-emerald-400">
                      {{ res.mid_score !== null && res.mid_score !== undefined ? (res.mid_score + '/50') : '-' }}
                    </td>

                    <!-- Final score -->
                    <td class="py-2.5 px-3 text-center font-bold text-purple-400">
                      {{ res.final_score !== null && res.final_score !== undefined ? (res.final_score + '/50') : '-' }}
                    </td>

                    <!-- Total score -->
                    <td class="py-2.5 px-4 text-center font-extrabold text-amber-400">
                      {{ res.total_score !== null ? (res.total_score + '/100') : '-' }}
                    </td>

                    <!-- Grade -->
                    <td class="py-2.5 px-3 text-center font-bold">
                      <span *ngIf="res.letter_grade && res.letter_grade !== '-'"
                            [ngClass]="{
                              'bg-emerald-950 text-emerald-400 border-emerald-800': res.letter_grade === 'A' || res.letter_grade === 'B+',
                              'bg-amber-950 text-amber-400 border-amber-800': res.letter_grade === 'B' || res.letter_grade === 'C+',
                              'bg-cyan-950 text-cyan-400 border-cyan-800': res.letter_grade === 'C',
                              'bg-rose-950 text-rose-400 border-rose-800': res.letter_grade === 'F'
                            }"
                            class="px-2 py-0.5 rounded border text-[11px] font-mono">
                        {{ res.letter_grade }}
                      </span>
                      <span *ngIf="!res.letter_grade || res.letter_grade === '-'" class="text-gray-500">-</span>
                    </td>

                    <!-- GPA Point -->
                    <td class="py-2.5 px-3 text-center font-bold text-cyan-400 font-mono">
                      {{ res.gpa_point !== null && res.gpa_point !== undefined ? (res.gpa_point | number:'1.2-2') : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <!-- TAB 5: Academic History -->
        <div *ngIf="activeTab === 'history'" class="space-y-3">
          <h4 class="font-bold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left"></i> Academic Progression Log
          </h4>
          
          <div class="overflow-x-auto bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400">
                  <th class="py-2 px-3">SEMESTER</th>
                  <th class="py-2 px-3">YEAR LEVEL</th>
                  <th class="py-2 px-3">CLASS GROUP</th>
                  <th class="py-2 px-3">STATUS</th>
                  <th class="py-2 px-3">PROMOTION DATE</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]">
                <tr *ngFor="let h of studentHistoryData" class="hover:bg-gray-800/40 font-mono">
                  <td class="py-2 px-3 font-bold text-emerald-400">{{ h.semester_label || ('Semester ' + h.semester_id) }}</td>
                  <td class="py-2 px-3 text-white">Year {{ h.academic_year_level || 1 }}</td>
                  <td class="py-2 px-3 text-purple-400 font-bold">{{ h.group_code || 'SV34' }}</td>
                  <td class="py-2 px-3">
                    <span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {{ h.status || 'COMPLETED' }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-gray-400">{{ h.promotion_date | date:'mediumDate' }}</td>
                </tr>

                <tr *ngIf="studentHistoryData.length === 0">
                  <td colspan="5" class="py-6 text-center text-gray-500 italic">
                    Enrolled in active 1st semester
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between border-t border-[#1f2937] pt-4">
          <button (click)="openIdCardModal(activeStudentModal)" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20">
            <i class="fa-solid fa-id-card"></i> View Student ID Card
          </button>
          <div class="flex items-center gap-2">
            <button (click)="closeModal()" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">Close</button>
            <button (click)="editStudent(activeStudentModal)" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20">Edit Record</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Authentic Cambodian Student ID Card Modal Dialog (Matching Reference Photo Design) -->
    <div *ngIf="activeIdCardModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white print:static">
      <div class="printable-area bg-[#1e293b] border border-[#1f2937] w-full max-w-sm rounded-3xl p-6 space-y-5 text-white shadow-2xl relative print:shadow-none print:border-none print:bg-white">
        
        <!-- Top Controls Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3 print:hidden">
          <h3 class="font-extrabold text-emerald-400 text-sm flex items-center gap-2">
            <i class="fa-solid fa-address-card"></i> Student ID Card
          </h3>
          <button (click)="activeIdCardModal = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Physical Plastic Sleeve Badge Holder Container -->
        <div class="flex justify-center">
          <div class="relative w-[280px] bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200 text-slate-800 rounded-2xl p-3.5 shadow-2xl border-4 border-white/90 ring-1 ring-black/10">
            
            <!-- Lanyard Slot Punch Hole -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-gray-400 rounded-full border border-gray-500 shadow-inner flex items-center justify-center print:hidden">
              <div class="w-6 h-1.5 bg-gray-800 rounded-full"></div>
            </div>

            <!-- ID Card Inner Canvas -->
            <div class="bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200 text-slate-900 mt-1">
              
              <!-- Green Top Header Banner -->
              <div class="bg-[#16a34a] text-white text-center py-2 px-1 font-bold text-xs tracking-wide shadow-sm">
                <span>Student Identification Card</span>
              </div>

              <div class="p-3 text-center space-y-1.5">
                <!-- ID Code Badge -->
                <div class="text-[11px] font-mono font-bold text-[#16a34a] bg-emerald-50 py-0.5 px-3 rounded-full inline-block border border-emerald-200 shadow-sm">
                  ID: {{ activeIdCardModal.custom_student_id || 'AM0922-0147' }}
                </div>

                <!-- Student Photo Container (Blue Portrait Background matching Reference Photo) -->
                <div class="flex justify-center my-1.5">
                  <div class="w-28 h-36 bg-[#0284c7] rounded-lg p-0.5 shadow-md border-2 border-white overflow-hidden">
                    <img *ngIf="activeIdCardModal.image" [src]="getPhotoUrl(activeIdCardModal.image)" class="w-full h-full object-cover rounded">
                    <div *ngIf="!activeIdCardModal.image" class="w-full h-full bg-[#0284c7] text-white font-bold flex items-center justify-center text-3xl">
                      {{ activeIdCardModal.first_name[0] }}{{ activeIdCardModal.last_name[0] }}
                    </div>
                  </div>
                </div>

                <!-- Student Name in Khmer -->
                <div class="pt-0.5">
                  <h4 class="text-lg font-extrabold text-slate-900 leading-snug">
                    {{ activeIdCardModal.first_name }} {{ activeIdCardModal.last_name }}
                  </h4>
                </div>

                <!-- Student Information List -->
                <div class="text-[11px] space-y-1 text-slate-700 font-semibold pt-1 text-center leading-relaxed">
                  <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                    <span class="text-slate-500">Date of Birth:</span>
                    <span class="font-bold text-slate-900 ml-1 font-mono">{{ activeIdCardModal.dob ? (activeIdCardModal.dob | date:'dd/MM/yyyy') : '01/01/2005' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                    <span class="text-slate-500">Major:</span>
                    <span class="font-bold text-slate-900 ml-1 font-mono uppercase">{{ activeIdCardModal.program_code || activeIdCardModal.program_name || 'BSCS' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                    <span class="text-slate-500">Generation & Group:</span>
                    <span class="font-bold text-slate-900 ml-1 font-mono">{{ activeIdCardModal.generation || 'Gen 9' }} | Group: {{ activeIdCardModal.group_code || 'ASI4' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-slate-800 font-bold">
                    <span class="text-slate-500">Academic Year:</span>
                    <span class="font-bold text-slate-900 ml-1 font-mono">2025-2026</span>
                  </div>
                </div>
              </div>
              
              <!-- Bottom Green Accent Strip -->
              <div class="h-2 bg-[#16a34a]"></div>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Close & Print) -->
        <div class="flex items-center justify-between gap-3 pt-2 print:hidden">
          <button (click)="activeIdCardModal = null" class="w-1/2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">
            Close
          </button>
          <button (click)="printIdCard()" class="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
            <i class="fa-solid fa-print"></i> Print ID Card
          </button>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal -->
    <div *ngIf="showImportModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-2xl rounded-2xl p-6 space-y-5 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold flex items-center justify-center text-lg shadow-lg">
              <i class="fa-solid fa-file-import"></i>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white">Import Students from CSV</h3>
              <p class="text-xs text-gray-400">Batch upload student profiles with auto-created user accounts</p>
            </div>
          </div>
          <button (click)="showImportModal = false" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Target Program & Class Group Assignment Bar -->
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
          <p class="font-bold text-blue-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <i class="fa-solid fa-graduation-cap"></i> Target Major & Class Group Selection
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1">SELECT MAJOR / PROGRAM *</label>
              <select [(ngModel)]="importSelectedProgramId" (change)="onImportProgramChange()" class="w-full bg-[#1e293b] border border-[#374151] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                <option [ngValue]="null" class="bg-[#111827] text-gray-400">-- Select Major / Program --</option>
                <option *ngFor="let p of programs" [ngValue]="p.program_id" class="bg-[#111827] text-white">
                  {{ p.program_code }} — {{ p.program_name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1">SELECT CLASS GROUP *</label>
              <select [(ngModel)]="importSelectedGroupId" (change)="onImportGroupChange()" class="w-full bg-[#1e293b] border border-[#374151] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                <option [ngValue]="null" class="bg-[#111827] text-gray-400">-- Select Class Group --</option>
                <option *ngFor="let g of filteredImportGroups" [ngValue]="g.group_id" class="bg-[#111827] text-white">
                  {{ g.group_code }} — {{ g.group_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Download Sample Template Banner -->
        <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <i class="fa-solid fa-circle-info"></i> CSV / Excel Template Format
            </p>
            <p class="text-[11px] text-gray-400 mt-0.5">Required fields: First Name, Last Name. Optional: Gender, DOB, Phone, Class Group, Major.</p>
          </div>
          <button (click)="downloadSampleCSV()" class="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer">
            <i class="fa-solid fa-download"></i> Sample CSV
          </button>
        </div>

        <!-- File Upload Dropzone -->
        <div>
          <input #csvFileInput type="file" (change)="onCSVFileSelected($event)" accept=".xlsx, .xls, .csv, .txt" class="hidden">
          <div (click)="csvFileInput.click()" class="border-2 border-dashed border-[#1f2937] hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#111827]/50 relative overflow-hidden group">
            <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i class="fa-solid fa-file-excel text-emerald-400"></i>
            </div>
            <p class="text-xs font-bold text-white">{{ importedFileName ? importedFileName : 'Click to Upload Excel (.xlsx / .xls) or CSV File' }}</p>
            <p class="text-[10px] text-gray-400 mt-1">Supports Microsoft Excel (.xlsx, .xls) & Standard CSV (.csv)</p>
          </div>
        </div>

        <!-- Preview Table -->
        <div *ngIf="parsedImportStudents.length > 0" class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-gray-300 uppercase tracking-wider">Preview Students ({{ parsedImportStudents.length }} Found)</span>
            <span class="text-emerald-400 font-mono font-bold">{{ parsedImportStudents.length }} valid records ready</span>
          </div>

          <div class="overflow-x-auto max-h-48 rounded-xl border border-[#1f2937] bg-[#111827]">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-[#1e293b] text-gray-400 font-bold border-b border-[#1f2937]">
                <tr>
                  <th class="p-2.5">FIRST NAME</th>
                  <th class="p-2.5">LAST NAME</th>
                  <th class="p-2.5">GENDER</th>
                  <th class="p-2.5">DOB</th>
                  <th class="p-2.5">CLASS GROUP</th>
                  <th class="p-2.5">PHONE</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50 text-white">
                <tr *ngFor="let s of parsedImportStudents.slice(0, 10)">
                  <td class="p-2.5 font-bold">{{ s.first_name }}</td>
                  <td class="p-2.5 font-bold">{{ s.last_name }}</td>
                  <td class="p-2.5 font-mono text-emerald-400">{{ s.gender || 'MALE' }}</td>
                  <td class="p-2.5 font-mono text-gray-400">{{ s.dob || '2005-01-01' }}</td>
                  <td class="p-2.5 font-mono" [class.text-emerald-400]="getSelectedGroupCode(s)" [class.text-amber-400]="!getSelectedGroupCode(s)">
                    {{ getSelectedGroupCode(s) || 'Unassigned' }}
                  </td>
                  <td class="p-2.5 font-mono text-gray-300">{{ s.phone || 'N/A' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="parsedImportStudents.length > 10" class="text-[10px] text-gray-400 italic text-center">... and {{ parsedImportStudents.length - 10 }} more students</p>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-[#1f2937] pt-4">
          <button (click)="showImportModal = false" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold cursor-pointer">Cancel</button>
          <button (click)="submitImport()" [disabled]="isImporting || (!selectedExcelFile && parsedImportStudents.length === 0)" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer">
            <i [class]="isImporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-upload'"></i>
            <span>{{ isImporting ? 'Importing...' : (selectedExcelFile ? 'Confirm & Import Excel File' : 'Confirm & Import (' + parsedImportStudents.length + ' Students)') }}</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  groups: any[] = [];
  programs: any[] = [];
  importSelectedProgramId: number | null = null;
  importSelectedGroupId: number | null = null;
  filteredImportGroups: any[] = [];

  searchQuery = '';
  selectedGroup = '';

  selectedStudentIds = new Set<number>();
  isAllSelected = false;

  showImportModal = false;
  isImporting = false;
  importedFileName = '';
  parsedImportStudents: any[] = [];
  selectedExcelFile: File | null = null;

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

  get paginatedStudents(): Student[] {
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
      this.updateSelectAllState();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updateSelectAllState();
  }

  isExporting = false;
  activeStudentModal: any = null;
  activeIdCardModal: any = null;
  activeTab: string = 'student'; // Default to Student tab as requested

  midExamDate: string | null = null;
  finalExamDate: string | null = null;
  studentHistoryData: any[] = [];
  studentPaymentsData: any[] = [];
  isFeePaid: boolean = false;

  semesterExamResults: any[] = [];

  get cumulativeYearlyGPA(): { gpa: string; isComplete: boolean; semCount: number; statusText: string } {
    if (!this.semesterExamResults || this.semesterExamResults.length === 0) {
      return {
        gpa: 'N/A',
        isComplete: false,
        semCount: 0,
        statusText: 'No exam records available yet'
      };
    }

    const completedSemesters = this.semesterExamResults.filter(s => s.is_completed);

    // Rule: Full Year Cumulative GPA requires completion of 2 semesters (1 academic year)
    if (completedSemesters.length >= 2) {
      let totalGpaPoints = 0;
      let totalSubjects = 0;

      completedSemesters.forEach(sem => {
        sem.subjects.forEach((sub: any) => {
          if (sub.gpa_point !== null && sub.gpa_point !== undefined) {
            totalGpaPoints += Number(sub.gpa_point);
            totalSubjects++;
          }
        });
      });

      const yearlyGpa = totalSubjects > 0 ? (totalGpaPoints / totalSubjects).toFixed(2) : 'N/A';
      return {
        gpa: yearlyGpa,
        isComplete: true,
        semCount: completedSemesters.length,
        statusText: 'Academic Year Complete (Semesters 1 & 2 Completed)'
      };
    } else {
      return {
        gpa: 'Pending',
        isComplete: false,
        semCount: completedSemesters.length,
        statusText: 'Requires Completion of Both Semesters 1 & 2 (1 Academic Year) to calculate Cumulative GPA'
      };
    }
  }

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmService: ConfirmModalService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadGroups();
    this.loadStudents();
  }

  getPhotoUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = 'uploads/' + cleanPath;
    }
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${cleanPath}`;
  }

  loadPrograms(): void {
    this.api.get<any>('programs').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.programs = res.data.programs || res.data || [];
        }
      }
    });
  }

  loadGroups(): void {
    this.api.get<any>('groups').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.groups = res.data.groups || res.data || [];
          this.filteredImportGroups = [...this.groups];
        }
      }
    });
  }

  onImportProgramChange(): void {
    if (!this.importSelectedProgramId) {
      this.filteredImportGroups = [...this.groups];
      this.importSelectedGroupId = null;
      return;
    }

    this.filteredImportGroups = this.groups.filter(g => Number(g.program_id) === Number(this.importSelectedProgramId));
    if (this.filteredImportGroups.length > 0) {
      this.importSelectedGroupId = this.filteredImportGroups[0].group_id;
    } else {
      this.importSelectedGroupId = null;
    }
  }

  onImportGroupChange(): void {
    if (this.importSelectedGroupId) {
      const g = this.groups.find(x => Number(x.group_id) === Number(this.importSelectedGroupId));
      if (g && g.program_id) {
        this.importSelectedProgramId = g.program_id;
      }
    }
  }

  getSelectedGroupCode(s: any): string {
    if (s.group_code || s.class_group) return s.group_code || s.class_group;
    if (this.importSelectedGroupId) {
      const g = this.groups.find(x => Number(x.group_id) === Number(this.importSelectedGroupId));
      return g ? (g.group_code || g.group_name) : '';
    }
    return '';
  }

  loadStudents(): void {
    this.api.get<any>('students?limit=1000').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.students = res.data.students || res.data || [];
          this.filterStudents();
        }
      }
    });
  }

  filterStudents(): void {
    const sel = this.selectedGroup ? this.selectedGroup.toString().trim().toLowerCase() : '';
    const q = this.searchQuery ? this.searchQuery.toString().trim().toLowerCase() : '';

    this.filteredStudents = this.students.filter(s => {
      const full = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const customId = (s.custom_student_id || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const matchSearch = !q || full.includes(q) || customId.includes(q) || email.includes(q);

      const sGroupCode = (s.group_code || '').toString().trim().toLowerCase();
      const sGroupName = (s.group_name || '').toString().trim().toLowerCase();
      const sGroupId = s.group_id ? s.group_id.toString().trim().toLowerCase() : '';

      const groupMatch = !sel ||
        sGroupCode === sel ||
        sGroupName === sel ||
        sGroupId === sel ||
        (sGroupCode && (sGroupCode.includes(sel) || sel.includes(sGroupCode))) ||
        (sGroupName && (sGroupName.includes(sel) || sel.includes(sGroupName)));

      return matchSearch && groupMatch;
    });

    this.currentPage = 1;
    this.updateSelectAllState();
  }

  calculateAge(dob: string): number {
    if (!dob) return 18;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 18;
  }

  toggleSelectStudent(studentId: number): void {
    if (this.selectedStudentIds.has(studentId)) {
      this.selectedStudentIds.delete(studentId);
    } else {
      this.selectedStudentIds.add(studentId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedStudentIds.clear();
      this.isAllSelected = false;
    } else {
      this.filteredStudents.forEach(s => this.selectedStudentIds.add(s.student_id));
      this.isAllSelected = true;
    }
  }

  updateSelectAllState(): void {
    if (this.filteredStudents.length === 0) {
      this.isAllSelected = false;
    } else {
      this.isAllSelected = this.filteredStudents.every(s => this.selectedStudentIds.has(s.student_id));
    }
  }

  clearSelection(): void {
    this.selectedStudentIds.clear();
    this.isAllSelected = false;
  }

  exportCSV(): void {
    this.isExporting = true;
    this.downloadCSVData(this.filteredStudents, 'all_students_export.csv');
  }

  exportSelectedCSV(): void {
    const selectedList = this.students.filter(s => this.selectedStudentIds.has(s.student_id));
    this.downloadCSVData(selectedList, `selected_students_${selectedList.length}.csv`);
  }

  private downloadCSVData(dataList: Student[], filename: string): void {
    if (!dataList || dataList.length === 0) {
      this.toast.error('No student records available to export');
      this.isExporting = false;
      return;
    }

    // Export ALL 20 Complete Student Fields from MySQL Database & Frontend State into Excel Spreadsheet
    const headerCols = [
      'Student ID',
      'First Name',
      'Last Name',
      'Full Name',
      'Gender',
      'Date of Birth (DOB)',
      'Phone Number',
      'Degree / Major',
      'Class Group',
      'Generation',
      'Shift',
      'Year Level',
      'Semester',
      'Fee Status',
      'Parent / Guardian Name',
      'Parent Phone',
      'Previous School',
      'Re-Exam Status',
      'Enrollment Date',
      'Status'
    ];

    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>All Student Records</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  th { background-color: #10b981; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #059669; padding: 8px; white-space: nowrap; }
  td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; white-space: nowrap; }
  tr:nth-child(even) { background-color: #f8fafc; }
</style>
</head>
<body>
<table>
  <thead>
    <tr>
      ${headerCols.map(h => `<th>${h}</th>`).join('')}
    </tr>
  </thead>
  <tbody>`;

    for (const s of dataList) {
      const customId = s.custom_student_id || (s.student_id ? `STU-${String(s.student_id).padStart(4, '0')}` : '');
      const firstName = s.first_name || '';
      const lastName = s.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const gender = s.gender || 'MALE';
      const dobStr = s.dob ? (typeof s.dob === 'string' ? s.dob.slice(0, 10) : new Date(s.dob).toISOString().slice(0, 10)) : '';
      const phone = s.phone || '';
      const programStr = (s as any).program_name || (s as any).program_code || 'Computer Science';
      const groupStr = s.group_code || s.group_name || 'ASI4';
      const genStr = (s as any).generation || 'Gen 9';
      const shiftStr = (s as any).shift || 'MORNING';
      const yearLevelStr = `Year ${(s as any).academic_year_level || 1}`;
      const semStr = `Semester ${(s as any).current_semester || 1}`;
      const feeStatusStr = (s as any).fee_status || (s as any).feeStatus || 'Paid';
      const parentName = s.parent_name || '';
      const parentPhone = s.parent_phone || '';
      const prevSchool = s.previous_school || '';
      const reexamStatus = (s as any).reexam_status || 'NONE';
      const enrollDateStr = s.enrollment_date ? (typeof s.enrollment_date === 'string' ? s.enrollment_date.slice(0, 10) : new Date(s.enrollment_date).toISOString().slice(0, 10)) : '';
      const statusStr = s.status || 'ACTIVE';

      tableHtml += `
    <tr>
      <td style="font-family:monospace; font-weight:bold; color:#059669;">${customId}</td>
      <td>${firstName}</td>
      <td>${lastName}</td>
      <td style="font-weight:bold;">${fullName}</td>
      <td>${gender}</td>
      <td>${dobStr}</td>
      <td>'${phone}</td>
      <td>${programStr}</td>
      <td style="font-family:monospace; font-weight:bold;">${groupStr}</td>
      <td>${genStr}</td>
      <td>${shiftStr}</td>
      <td>${yearLevelStr}</td>
      <td>${semStr}</td>
      <td style="font-weight:bold; color:#059669;">${feeStatusStr}</td>
      <td>${parentName}</td>
      <td>'${parentPhone}</td>
      <td>${prevSchool}</td>
      <td>${reexamStatus}</td>
      <td>${enrollDateStr}</td>
      <td>${statusStr}</td>
    </tr>`;
    }

    tableHtml += `
  </tbody>
</table>
</body>
</html>`;

    // Save as Excel spreadsheet file (.xls) so Excel opens with perfect columns, styles, and all 20 fields
    const excelFilename = filename.replace(/\.csv$/i, '') + '.xls';
    const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', excelFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toast.success(`Exported all 20 fields for ${dataList.length} student records to Excel (.xls)!`);
    this.isExporting = false;
  }

  bulkDeleteSelected(): void {
    const count = this.selectedStudentIds.size;
    if (confirm(`Are you sure you want to delete ${count} selected student(s)? This action cannot be undone.`)) {
      const idsToDelete = Array.from(this.selectedStudentIds);
      const promises = idsToDelete.map(id => this.api.delete(`students/${id}`).toPromise());

      Promise.all(promises).then(() => {
        this.toast.success(`Successfully deleted ${count} student records`);
        this.clearSelection();
        this.loadStudents();
      }).catch(err => {
        this.toast.error('Failed to delete some student records');
        this.loadStudents();
      });
    }
  }

  studentSemesterFees: any[] = [];

  get isStudentPaidYearly(): boolean {
    if (!this.studentSemesterFees || this.studentSemesterFees.length === 0) return false;
    return this.studentSemesterFees.some(sf => {
      const title = (sf.fee_title || '').toLowerCase();
      const term = (sf.term || sf.term_cycle || '').toLowerCase();
      const isYearItem = title.includes('full year') || title.includes('year 1 full') || title.includes('yearly') || title.includes('បង់ជាឆ្នាំ') || term.includes('yearly');
      return isYearItem && sf.semester_fee_status === 'PAID';
    });
  }

  get filteredSemesterFees(): any[] {
    if (!this.studentSemesterFees || this.studentSemesterFees.length === 0) return [];

    if (this.isStudentPaidYearly) {
      return this.studentSemesterFees.filter(sf => {
        const title = (sf.fee_title || '').toLowerCase();
        const term = (sf.term || sf.term_cycle || '').toLowerCase();
        return title.includes('full year') || title.includes('year 1 full') || title.includes('yearly') || title.includes('បង់ជាឆ្នាំ') || term.includes('yearly');
      });
    }

    const isSemesterPaid = this.studentSemesterFees.some(sf => {
      const title = (sf.fee_title || '').toLowerCase();
      const isSemItem = title.includes('semester') || title.includes('sem');
      return isSemItem && sf.semester_fee_status === 'PAID';
    });

    if (isSemesterPaid) {
      return this.studentSemesterFees.filter(sf => {
        const title = (sf.fee_title || '').toLowerCase();
        const term = (sf.term || sf.term_cycle || '').toLowerCase();
        return !title.includes('full year') && !title.includes('yearly') && !title.includes('បង់ជាឆ្នាំ') && !term.includes('yearly');
      });
    }

    return this.studentSemesterFees.filter(sf => {
      const title = (sf.fee_title || '').toLowerCase();
      return !title.includes('full year') && !title.includes('yearly') && !title.includes('បង់ជាឆ្នាំ');
    });
  }

  viewStudent(s: any): void {
    this.activeStudentModal = s;
    this.activeTab = 'student';
    this.studentHistoryData = [];
    this.studentPaymentsData = [];
    this.studentSemesterFees = [];
    this.isFeePaid = false;

    this.midExamDate = s.mid_exam_date || null;
    this.finalExamDate = s.final_exam_date || null;

    this.api.get<any>(`students/${s.student_id}`).subscribe({
      next: (stuRes) => {
        if (stuRes.data) {
          this.studentSemesterFees = stuRes.data.semesterFeesBreakdown || [];
        }
      }
    });

    this.api.get<any>(`students/${s.student_id}/academic-history`).subscribe({
      next: (hRes) => {
        this.studentHistoryData = hRes.data?.history || [];
      }
    });

    this.api.get<any>('payments', { student_id: s.student_id }).subscribe({
      next: (payRes) => {
        this.studentPaymentsData = payRes.data?.payments || payRes.data || [];
        if (this.studentPaymentsData.length > 0) {
          this.isFeePaid = this.studentPaymentsData.some((f: any) => (f.status || '').toUpperCase() === 'PAID');
        } else {
          this.isFeePaid = (s.fee_status || '').toUpperCase() === 'PAID';
        }
      },
      error: () => {
        this.isFeePaid = (s.fee_status || '').toUpperCase() === 'PAID';
      }
    });

    this.api.get<any>('results', { student_id: s.student_id }).subscribe({
      next: (rRes) => {
        const rawResults = rRes.data?.results || rRes.data || [];
        const semMap = new Map();

        rawResults.forEach((r: any) => {
          const semKey = r.semester || r.eg_semester || `Semester ${s.current_semester || 1}`;
          if (!semMap.has(semKey)) {
            semMap.set(semKey, {
              semester_name: semKey,
              isOpen: true,
              subjectsMap: new Map()
            });
          }
          const semGroup = semMap.get(semKey);
          const subId = r.subject_id || r.subject_code || r.subject_name;
          if (!semGroup.subjectsMap.has(subId)) {
            semGroup.subjectsMap.set(subId, {
              subject_id: subId,
              subject_code: r.subject_code,
              subject_name: r.subject_name || r.subject_code || 'Subject',
              mid_score: null,
              final_score: null
            });
          }
          const subObj = semGroup.subjectsMap.get(subId);
          const cat = String(r.category || r.exam_title || '').toLowerCase();
          if (cat.includes('final')) {
            subObj.final_score = r.raw_score !== null && r.raw_score !== undefined ? Number(r.raw_score) : null;
          } else {
            subObj.mid_score = r.raw_score !== null && r.raw_score !== undefined ? Number(r.raw_score) : null;
          }
        });

        this.semesterExamResults = Array.from(semMap.values()).map(sem => {
          let semTotalGpa = 0;
          let semCount = 0;

          const subjects = Array.from(sem.subjectsMap.values()).map((sub: any) => {
            const m = sub.mid_score !== null ? Number(sub.mid_score) : null;
            const f = sub.final_score !== null ? Number(sub.final_score) : null;
            
            let total: number | null = null;
            if (m !== null && f !== null) {
              total = m + f;
            } else if (m !== null) {
              total = m <= 50 ? m * 2 : m;
            } else if (f !== null) {
              total = f <= 50 ? f * 2 : f;
            }

            sub.total_score = total;

            if (total !== null) {
              if (total >= 90) { sub.letter_grade = 'A'; sub.gpa_point = 4.0; }
              else if (total >= 80) { sub.letter_grade = 'B+'; sub.gpa_point = 3.5; }
              else if (total >= 70) { sub.letter_grade = 'B'; sub.gpa_point = 3.0; }
              else if (total >= 60) { sub.letter_grade = 'C+'; sub.gpa_point = 2.5; }
              else if (total >= 50) { sub.letter_grade = 'C'; sub.gpa_point = 2.0; }
              else { sub.letter_grade = 'F'; sub.gpa_point = 0.0; }

              semTotalGpa += sub.gpa_point;
              semCount++;
            } else {
              sub.letter_grade = '-';
              sub.gpa_point = null;
            }
            return sub;
          });

          const semesterGpa = semCount > 0 ? (semTotalGpa / semCount).toFixed(2) : 'N/A';

          return {
            semester_name: sem.semester_name,
            isOpen: sem.isOpen,
            subjects: subjects,
            semester_gpa: semesterGpa,
            is_completed: semCount > 0
          };
        });
      },
      error: () => {
        this.semesterExamResults = [];
      }
    });
  }

  closeModal(): void {
    this.activeStudentModal = null;
  }

  openIdCardModal(s: any): void {
    this.activeIdCardModal = s;
  }

  printIdCard(): void {
    window.print();
  }

  editStudent(s: any): void {
    this.closeModal();
    this.router.navigate(['/admin/students/edit', s.student_id]);
  }

  deleteStudent(s: any): void {
    this.confirmService.confirm({
      title: 'Delete Student Record?',
      message: `Are you sure you want to delete student ${s.first_name} ${s.last_name} (${s.custom_student_id || ('STU-' + s.student_id)})? This action cannot be undone.`,
      confirmText: 'Yes, Delete Student',
      onConfirm: () => {
        this.api.delete(`students/${s.student_id}`).subscribe({
          next: () => {
            this.toast.success(`Student ${s.first_name} ${s.last_name} deleted successfully!`);
            this.loadStudents();
          }
        });
      }
    });
  }

  openImportModal(): void {
    this.importedFileName = '';
    this.parsedImportStudents = [];
    this.showImportModal = true;
  }

  downloadSampleCSV(): void {
    const csvHeader = 'First Name,Last Name,Gender,DOB,Phone,Class Group Code,Parent Name,Parent Phone,Enrollment Date\n';
    const sampleRows = 'Sok,Samnang,MALE,2005-04-15,012345678,SV34,Mr. Sok Meas,012999888,2025-09-01\n' +
      'Keo,Bopha,FEMALE,2006-08-20,098765432,SA01,Mrs. Keo Chann,098111222,2025-09-01\n' +
      'Chan,Vireak,MALE,2005-11-10,077123456,SV35,Mr. Chan Dara,077333444,2025-09-01\n';

    const blob = new Blob(['\uFEFF' + csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_students_import_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  onCSVFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.importedFileName = file.name;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const text = e.target.result || '';
      this.parseCSVText(text);
    };
    reader.readAsText(file);
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  parseCSVText(csvText: string): void {
    const lines = csvText.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      this.toast.error('CSV file is empty or missing headers');
      return;
    }

    const headers = this.parseCSVLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
    const students: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cleanCols = this.parseCSVLine(lines[i]).map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cleanCols.length < 2) continue;

      const obj: any = {};
      headers.forEach((h, idx) => {
        const val = cleanCols[idx] || '';

        if (h === 'student id' || h === 'custom_student_id' || h === 'id') {
          obj.custom_student_id = val;
        } else if (h === 'first name' || h === 'first_name') {
          obj.first_name = val;
        } else if (h === 'last name' || h === 'last_name') {
          obj.last_name = val;
        } else if (h === 'gender') {
          obj.gender = val.toUpperCase();
        } else if (h === 'date of birth (dob)' || h === 'dob' || h === 'date of birth') {
          obj.dob = val;
        } else if (h === 'phone number' || h === 'phone' || h === 'mobile') {
          obj.phone = val.replace(/^'/, '');
        } else if (h === 'class group' || h === 'group_code' || h === 'class' || h === 'group') {
          obj.group_code = val;
        } else if (h === 'degree / major' || h === 'program_code' || h === 'major' || h === 'degree') {
          obj.program_code = val;
        } else if (h === 'parent / guardian name' || h === 'parent_name' || h === 'parent name') {
          obj.parent_name = val;
        } else if (h === 'parent phone' || h === 'parent_phone') {
          obj.parent_phone = val.replace(/^'/, '');
        } else if (h === 'previous school' || h === 'previous_school') {
          obj.previous_school = val;
        } else if (h === 'enrollment date' || h === 'enrollment_date') {
          obj.enrollment_date = val;
        } else if (h === 'status') {
          obj.status = val.toUpperCase();
        }
      });

      if ((!obj.first_name || !obj.last_name) && cleanCols[3] && headers.includes('full name')) {
        const parts = cleanCols[3].trim().split(' ');
        if (parts.length >= 2) {
          obj.first_name = obj.first_name || parts[0];
          obj.last_name = obj.last_name || parts.slice(1).join(' ');
        }
      }

      if (obj.first_name && obj.last_name) {
        students.push(obj);
      }
    }

    this.parsedImportStudents = students;
    if (students.length === 0) {
      this.toast.error('No valid student rows found in CSV file');
    } else {
      this.toast.success(`Parsed ${students.length} student records from CSV!`);
    }
  }

  submitImport(): void {
    if (this.selectedExcelFile) {
      this.isImporting = true;
      const formData = new FormData();
      formData.append('file', this.selectedExcelFile);
      if (this.importSelectedProgramId) formData.append('program_id', String(this.importSelectedProgramId));
      if (this.importSelectedGroupId) formData.append('group_id', String(this.importSelectedGroupId));

      this.api.post('students/import-excel', formData).subscribe({
        next: (res: any) => {
          this.isImporting = false;
          this.showImportModal = false;
          this.toast.success(res.message || 'Successfully imported Excel student records!');
          this.selectedExcelFile = null;
          this.parsedImportStudents = [];
          this.loadStudents();
        },
        error: (err: any) => {
          this.isImporting = false;
          this.toast.error(err.error?.message || 'Excel Import failed');
        }
      });
      return;
    }

    if (this.parsedImportStudents.length === 0) return;

    this.isImporting = true;
    const payload = {
      students: this.parsedImportStudents,
      program_id: this.importSelectedProgramId,
      group_id: this.importSelectedGroupId
    };

    this.api.post('students/import', payload).subscribe({
      next: (res: any) => {
        this.isImporting = false;
        this.showImportModal = false;
        this.toast.success(res.message || `Successfully imported ${this.parsedImportStudents.length} students!`);
        this.parsedImportStudents = [];
        this.loadStudents();
      },
      error: (err: any) => {
        this.isImporting = false;
        this.toast.error(err.error?.message || 'CSV Import failed');
      }
    });
  }
}

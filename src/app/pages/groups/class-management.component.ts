import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { AcademicService, Program } from '../../core/services/academic.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="isTeacherView ? 'My Taught Class Groups' : 'Class Group Management'" 
                [subtitle]="isTeacherView ? 'Teacher Portal / Classes' : 'Admin / Classes'"
                [actionLabel]="isTeacherView ? '' : 'Create Class Group'"
                (actionClicked)="openCreateModal()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
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

      <!-- Class Groups Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-bold text-white tracking-tight">All Academic Class Sections</h3>
            <button *ngIf="selectedGroupIds.size > 0" 
                    (click)="deleteSelectedGroups()" 
                    class="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse">
              <i class="fa-solid fa-trash"></i> Delete Selected ({{ selectedGroupIds.size }})
            </button>
          </div>
          <span class="text-xs font-semibold text-gray-400">{{ groups.length }} active sections</span>
        </div>

        <div class="overflow-x-auto overflow-y-auto max-h-[620px] rounded-xl border border-[#1f2937]/50">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th *ngIf="!isTeacherView" class="py-3.5 px-3 w-10">
                  <input type="checkbox" [checked]="isGroupAllSelected" (change)="toggleGroupSelectAll($event)" class="rounded border-[#1f2937] bg-[#111827] text-emerald-500 focus:ring-0 cursor-pointer">
                </th>
                <th class="py-3.5 px-3">CLASS GROUP / CODE</th>
                <th class="py-3.5 px-3">SHIFT & GENERATION</th>
                <th class="py-3.5 px-3">YEAR & SEMESTER</th>
                <th class="py-3.5 px-3">ENROLLED STUDENTS</th>
                <th *ngIf="!isTeacherView" class="py-3.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let g of paginatedGroups" [ngClass]="{'bg-emerald-950/20': isGroupSelected(g.group_id)}" class="hover:bg-gray-800/40 transition-colors">
                <td *ngIf="!isTeacherView" class="py-3.5 px-3">
                  <input type="checkbox" [checked]="isGroupSelected(g.group_id)" (change)="toggleGroupSelect(g.group_id)" class="rounded border-[#1f2937] bg-[#111827] text-emerald-500 focus:ring-0 cursor-pointer">
                </td>
                <td class="py-3.5 px-3">
                  <span class="font-mono text-emerald-400 font-extrabold text-sm block">{{ g.group_code }}</span>
                  <span class="text-xs text-white font-bold block">{{ g.group_name }}</span>
                </td>
                <td class="py-3.5 px-3 space-y-1">
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-800': g.shift === 'MORNING',
                    'bg-amber-950 text-amber-400 border-amber-800': g.shift === 'AFTERNOON',
                    'bg-purple-950 text-purple-400 border-purple-800': g.shift === 'EVENING'
                  }" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono inline-block">
                    {{ g.shift }}
                  </span>
                  <span class="text-[11px] font-bold text-amber-400 font-mono block">• {{ g.generation || 'Gen 9' }}</span>
                </td>
                <td class="py-3.5 px-3 font-mono">
                  <span [class.text-amber-400]="g.status !== 'GRADUATED'" [class.text-emerald-400]="g.status === 'GRADUATED'" class="font-bold block">
                    {{ g.status === 'GRADUATED' ? '🎓 GRADUATED' : 'Year ' + (g.academic_year_level || 0) + ' · Semester ' + (g.current_semester || 0) }}
                  </span>
                  <span class="text-[10px] text-gray-400 block font-mono">📅 {{ (g.semester_start_date ? (g.semester_start_date | date:'dd/MM/yyyy') : 'N/A') }} ➔ {{ (g.semester_end_date ? (g.semester_end_date | date:'dd/MM/yyyy') : 'N/A') }}</span>
                </td>
                <td class="py-3.5 px-3 font-mono">
                  <span class="font-bold text-white text-xs block">{{ g.student_count || 0 }} Enrolled</span>
                  <span class="text-[10px] text-gray-400 block">Cap: {{ g.max_capacity || 40 }} max</span>
                </td>
                <td *ngIf="!isTeacherView" class="py-3.5 px-3 text-right space-x-1">
                  <button (click)="openPromotionAuditModal(g)" title="Audit Exam Status & Promote Class" class="text-purple-400 hover:text-purple-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-graduation-cap"></i>
                  </button>
                  <button (click)="viewClassDetails(g)" title="View Class Overview" class="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button (click)="printGroupCards(g)" title="Print All Student ID Cards for this Group" class="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-address-card"></i>
                  </button>
                  <button (click)="openAssignStudentsModal(g)" title="Add / Assign Students by Major" class="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-user-plus"></i>
                  </button>
                  <button (click)="editClass(g)" title="Edit Class Group" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="deleteClass(g)" title="Delete Class Group" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>

              <tr *ngIf="groups.length === 0">
                <td [attr.colspan]="isTeacherView ? 4 : 6" class="py-8 text-center text-gray-500 italic">No class groups found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Interactive Pagination & Selection Footer Bar -->
        <div class="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div class="flex items-center gap-3">
            <span *ngIf="selectedGroupIds.size > 0" class="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-double"></i> {{ selectedGroupIds.size }} selected
              <button (click)="deleteSelectedGroups()" title="Delete Selected Class Groups" class="px-2 py-0.5 rounded bg-rose-900/80 text-rose-300 hover:bg-rose-800 text-[10px] font-extrabold ml-1 border border-rose-700 flex items-center gap-1">
                <i class="fa-solid fa-trash"></i> Delete Selected
              </button>
              <button (click)="clearGroupSelection()" class="text-xs text-gray-400 hover:text-white ml-1">✕</button>
            </span>
            <span>
              Showing <strong class="text-white font-mono">{{ groups.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-emerald-400 font-mono">{{ groups.length }}</strong> active sections
            </span>
            <div class="flex items-center gap-1.5 ml-2 border-l border-[#1f2937] pl-3">
              <span>Per page:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#111827] border border-[#1f2937] text-emerald-400 font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button (click)="setPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button (click)="setPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
              <i class="fa-solid fa-angle-left"></i> Prev
            </button>

            <button *ngFor="let p of pageRange" 
                    (click)="setPage(p)" 
                    [ngClass]="p === currentPage ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/30' : 'bg-[#111827] border-[#1f2937] text-gray-300 hover:text-white hover:border-emerald-500/40'"
                    class="w-8 h-8 rounded-lg border font-mono text-xs flex items-center justify-center transition-all cursor-pointer">
              {{ p }}
            </button>

            <button (click)="setPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
              Next <i class="fa-solid fa-angle-right"></i>
            </button>
            <button (click)="setPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Students to Class Group Modal (Filtered by Major / Program) -->
    <div *ngIf="activeAssignModalGroup" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-xl rounded-2xl p-6 space-y-6 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-lg shadow-lg">
              <i class="fa-solid fa-user-plus"></i>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white">Add Students to {{ activeAssignModalGroup.group_code }}</h3>
              <p class="text-xs text-emerald-400 font-mono">Filter & Assign Students by Major</p>
            </div>
          </div>
          <button (click)="activeAssignModalGroup = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <!-- Filter by Major / Program Dropdown -->
        <div class="space-y-2 bg-[#111827] p-4 rounded-xl border border-[#1f2937]">
          <label class="block text-xs font-bold text-emerald-400 uppercase tracking-wider">1. SELECT MAJOR / PROGRAM *</label>
          <select [(ngModel)]="selectedProgramId" (change)="loadStudentsForProgram()" class="w-full bg-[#1e293b] border border-emerald-500/40 text-xs text-white rounded-xl px-4 py-2.5 font-bold">
            <option [value]="null">-- All Majors / Programs --</option>
            <option *ngFor="let p of programs" [value]="p.program_id">
              {{ p.program_code }} — {{ p.program_name }} ({{ p.degree }})
            </option>
          </select>
        </div>

        <!-- Student Selection List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-gray-300 uppercase tracking-wider text-[11px]">2. SELECT STUDENTS TO ASSIGN ({{ availableStudents.length }} Found)</h4>
            <button (click)="toggleSelectAllStudents()" class="text-xs text-emerald-400 font-bold hover:underline">
              {{ isAllStudentSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>

          <div class="max-h-60 overflow-y-auto space-y-2 border border-[#1f2937] p-3 rounded-xl bg-[#111827]">
            <div *ngFor="let stu of availableStudents" (click)="toggleStudent(stu.student_id)" 
                 [class.border-emerald-500]="selectedStudentIds.has(stu.student_id)"
                 [class.bg-emerald-950]="selectedStudentIds.has(stu.student_id)"
                 class="p-2.5 rounded-xl border border-[#1f2937] flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-all">
              <div class="flex items-center gap-3">
                <input type="checkbox" [checked]="selectedStudentIds.has(stu.student_id)" class="rounded text-emerald-500 focus:ring-0">
                <div>
                  <p class="font-bold text-white text-xs">{{ stu.first_name }} {{ stu.last_name }}</p>
                  <p class="text-[10px] font-mono text-gray-400">ID: {{ stu.custom_student_id }} · Major: {{ stu.program_code || 'MIS' }}</p>
                </div>
              </div>
              <span [class.text-emerald-400]="stu.group_code" class="text-[10px] font-mono font-bold">
                {{ stu.group_code ? 'Currently in ' + stu.group_code : 'Unassigned' }}
              </span>
            </div>

            <div *ngIf="availableStudents.length === 0" class="py-8 text-center text-gray-500 italic">
              No students found for the selected major.
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-[#1f2937] pt-4">
          <button (click)="activeAssignModalGroup = null" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Cancel</button>
          <button (click)="saveAssignedStudents()" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
            Save & Assign {{ selectedStudentIds.size }} Students
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Class Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEdit ? 'Edit Class Group' : 'Create New Class Group' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveClassGroup()" class="space-y-3">
          <div>
            <label class="block font-bold text-emerald-400 mb-1">MAJOR / PROGRAM *</label>
            <select [(ngModel)]="formGroup.program_id" name="program_id" required class="w-full bg-[#111827] border border-emerald-500/50 rounded-xl px-3 py-2.5 text-white font-bold">
              <option *ngFor="let p of programs" [value]="p.program_id">
                {{ p.program_code }} — {{ p.program_name }} ({{ p.degree }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">CLASS CODE *</label>
            <input type="text" [(ngModel)]="formGroup.group_code" name="group_code" required placeholder="e.g. Form 5A" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono">
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">CLASS NAME *</label>
            <input type="text" [(ngModel)]="formGroup.group_name" name="group_name" required placeholder="e.g. Form 5 Section A" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-emerald-400 mb-1">SEMESTER START DATE *</label>
              <input type="date" [(ngModel)]="formGroup.semester_start_date" name="semester_start_date" required class="w-full bg-[#111827] border border-emerald-500/50 rounded-xl px-3 py-2.5 text-white font-mono font-bold">
            </div>

            <div>
              <label class="block font-bold text-rose-400 mb-1">SEMESTER END DATE *</label>
              <input type="date" [(ngModel)]="formGroup.semester_end_date" name="semester_end_date" class="w-full bg-[#111827] border border-rose-500/50 rounded-xl px-3 py-2.5 text-white font-mono font-bold">
            </div>
          </div>

          <div>
            <label class="block font-bold text-amber-400 mb-1">GENERATION *</label>
            <input type="text" [(ngModel)]="formGroup.generation" name="generation" required placeholder="e.g. Gen 9" class="w-full bg-[#111827] border border-amber-500/40 rounded-xl px-3 py-2.5 text-white font-bold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">SHIFT *</label>
              <select [(ngModel)]="formGroup.shift" name="shift" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
                <option value="MORNING">Morning Shift</option>
                <option value="AFTERNOON">Afternoon Shift</option>
                <option value="EVENING">Evening Shift</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">MAX CAPACITY</label>
              <input type="number" [(ngModel)]="formGroup.max_capacity" name="max_capacity" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
              {{ isEdit ? 'Update Class Group' : 'Save Class Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Class Group Details & Overview Modal -->
    <div *ngIf="activeClassDetails" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-2xl rounded-2xl p-6 space-y-6 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-lg shadow-lg">
              <i class="fa-solid fa-users"></i>
            </div>
            <div>
              <h3 class="text-lg font-extrabold text-white">{{ activeClassDetails.group_name }}</h3>
              <p class="text-xs text-emerald-400 font-mono">{{ activeClassDetails.group_code }} · {{ activeClassDetails.shift }} SHIFT</p>
            </div>
          </div>
          <button (click)="activeClassDetails = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <!-- Class Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#111827] p-4 rounded-xl border border-[#1f2937]">
          <div><span class="text-gray-400 block">Class Shift:</span> <span class="font-bold text-emerald-400 font-mono text-sm">{{ activeClassDetails.shift }}</span></div>
          <div><span class="text-gray-400 block">Start Date:</span> <span class="font-bold text-emerald-400 font-mono text-sm">{{ activeClassDetails.semester_start_date ? (activeClassDetails.semester_start_date | date:'dd/MM/yyyy') : '01/09/2025' }}</span></div>
          <div><span class="text-gray-400 block">Max Capacity:</span> <span class="font-bold text-white font-mono text-sm">{{ activeClassDetails.max_capacity || 40 }} Students</span></div>
          <div><span class="text-gray-400 block">Enrolled Count:</span> <span class="font-bold text-white font-mono text-sm">{{ activeClassDetails.student_count || 0 }} Active</span></div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-[#1f2937] pt-4">
          <button (click)="activeClassDetails = null" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Close</button>
          <button (click)="editClass(activeClassDetails); activeClassDetails = null" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Edit Class Group</button>
        </div>
      </div>
    </div>

    <!-- Batch Student ID Cards Printable Modal (Print Cards by Group) -->
    <div *ngIf="activePrintGroupModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:p-0 print:bg-white print:static print:block">
      <div class="printable-area bg-[#1e293b] border border-[#1f2937] w-full max-w-5xl rounded-3xl p-6 space-y-5 text-white max-h-[92vh] overflow-y-auto shadow-2xl relative print:shadow-none print:border-none print:bg-white print:max-h-none print:w-full print:p-0">
        
        <!-- Header Controls (Hidden on Print) -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3 print:hidden">
          <div>
            <h3 class="font-extrabold text-amber-400 text-sm flex items-center gap-2">
              <i class="fa-solid fa-address-card text-base"></i> Batch Student ID Cards
            </h3>
            <p class="text-xs text-gray-400">Class Section: <span class="text-white font-bold font-mono">{{ activePrintGroupModal.group_code }} — {{ activePrintGroupModal.group_name }}</span> (<span class="text-amber-400 font-bold font-mono">{{ printGroupStudents.length }}</span> total students)</p>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="triggerBatchPrint()" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
              <i class="fa-solid fa-print"></i> Print All {{ printGroupStudents.length }} ID Cards
            </button>
            <button (click)="activePrintGroupModal = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Printable Grid (Standard ID Card Print Size: ~54mm x 86mm ratio) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center py-2 print:grid-cols-2 print:gap-3 print:py-0 print:w-full">
          <div *ngFor="let s of printGroupStudents" class="relative w-[215px] h-[335px] bg-white text-slate-900 rounded-xl overflow-hidden shadow-lg border border-gray-300 print:shadow-none print:border-gray-400 print:break-inside-avoid flex flex-col justify-between">
            
            <!-- Green Header Banner -->
            <div class="bg-[#16a34a] text-white text-center py-1.5 px-1 font-bold text-[10px] tracking-wide shadow-sm">
              <span>Student Identification Card</span>
            </div>

            <!-- Card Content Body -->
            <div class="p-2 text-center flex-1 flex flex-col justify-around items-center">
              <!-- ID Code Badge -->
              <div class="text-[9px] font-mono font-bold text-[#16a34a] bg-emerald-50 py-0.5 px-2 rounded-full border border-emerald-200">
                ID: {{ s.custom_student_id || 'AM0922-0147' }}
              </div>

              <!-- Student Photo (Blue Background) -->
              <div class="w-20 h-28 bg-[#0284c7] rounded-md p-0.5 shadow-sm border border-gray-300 overflow-hidden my-0.5">
                <img *ngIf="s.image" [src]="getPhotoUrl(s.image)" class="w-full h-full object-cover rounded-xs">
                <div *ngIf="!s.image" class="w-full h-full bg-[#0284c7] text-white font-bold flex items-center justify-center text-xl">
                  {{ s.first_name[0] }}{{ s.last_name[0] }}
                </div>
              </div>

              <!-- Student Name -->
              <div>
                <h4 class="text-xs font-extrabold text-slate-900 leading-tight">
                  {{ s.first_name }} {{ s.last_name }}
                </h4>
              </div>

              <!-- Information Details -->
              <div class="text-[9px] space-y-0.5 text-slate-700 font-semibold leading-snug w-full">
                <p class="flex justify-between border-b border-gray-100 pb-0.5 px-1">
                  <span class="text-slate-500">Date of Birth:</span> 
                  <span class="font-bold text-slate-900 font-mono">{{ s.dob | date:'dd/MM/yyyy' }}</span>
                </p>
                <p class="flex justify-between border-b border-gray-100 pb-0.5 px-1">
                  <span class="text-slate-500">Major:</span> 
                  <span class="font-bold text-[#16a34a]">{{ s.program_code || activePrintGroupModal.program_code || 'MIS' }}</span>
                </p>
                <p class="flex justify-between border-b border-gray-100 pb-0.5 px-1">
                  <span class="text-slate-500">Gen:</span> 
                  <span class="font-bold text-slate-900 font-mono">{{ activePrintGroupModal.generation || '09' }} Group: {{ activePrintGroupModal.group_code }}</span>
                </p>
                <p class="flex justify-between px-1">
                  <span class="text-slate-500">Academic Year:</span> 
                  <span class="font-bold text-slate-900 font-mono">2025-2026</span>
                </p>
              </div>
            </div>
            
            <!-- Bottom Green Accent Strip -->
            <div class="h-1.5 bg-[#16a34a] w-full"></div>
          </div>

          <div *ngIf="printGroupStudents.length === 0" class="col-span-full py-12 text-center text-gray-400 italic">
            No enrolled students in this class group yet
          </div>
        </div>
      </div>
    </div>

    <!-- Promotion Audit & Re-Exam Status Modal -->
    <div *ngIf="activeAuditGroupModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-3xl rounded-3xl p-6 space-y-6 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">
              Class Group Promotion Audit
            </h3>
            <p class="text-xs text-purple-400 font-mono mt-1">
              Class: <span class="font-bold text-white">{{ activeAuditGroupModal.group_code }} — {{ activeAuditGroupModal.group_name }}</span>
            </p>
          </div>
          <button (click)="activeAuditGroupModal = null" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Year & Semester Transition Banner -->
        <div class="bg-gradient-to-r from-purple-950/80 via-slate-900 to-emerald-950/80 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">CURRENT STATUS</span>
            <p class="text-sm font-extrabold text-amber-400 font-mono">
              Year {{ activeAuditGroupModal.academic_year_level }} · Semester {{ activeAuditGroupModal.current_semester }}
            </p>
          </div>
          <div class="text-xl text-purple-400 font-extrabold">
            <i class="fa-solid fa-arrow-right"></i>
          </div>
          <div class="space-y-1 text-right">
            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TARGET PROMOTION STATUS</span>
            <p class="text-sm font-extrabold text-emerald-400 font-mono">
              Year {{ auditData?.group?.next_year }} · Semester {{ auditData?.group?.next_semester }}
            </p>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-emerald-400 uppercase">Passed / Eligible</span>
              <h4 class="text-xl font-black text-white mt-1">{{ auditData?.eligible_count || 0 }} Students</h4>
              <p class="text-[10px] text-emerald-300/80 mt-0.5">Will be promoted to Semester {{ auditData?.group?.next_semester }}</p>
            </div>
            <span class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-user-check"></i>
            </span>
          </div>

          <div class="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-rose-400 uppercase">Failed / Retained</span>
              <h4 class="text-xl font-black text-white mt-1">{{ auditData?.retained_count || 0 }} Students</h4>
              <p class="text-[10px] text-rose-300/80 mt-0.5">Retained in Semester {{ auditData?.group?.current_semester }} until Re-Exam passed</p>
            </div>
            <span class="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-user-clock"></i>
            </span>
          </div>
        </div>

        <!-- Roster Student Audit Table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-white tracking-tight">Student Exam Progression Roster</h4>
            <span class="text-[10px] text-gray-400">Total {{ auditData?.students?.length || 0 }} Students</span>
          </div>

          <div class="overflow-x-auto border border-[#1f2937] rounded-xl max-h-60 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#111827] text-gray-400 font-bold uppercase sticky top-0">
                <tr>
                  <th class="p-3">ID & Student Name</th>
                  <th class="p-3">Mid + Final (Total)</th>
                  <th class="p-3">Promotion Status</th>
                  <th class="p-3 text-right">Re-Exam Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]">
                <tr *ngFor="let s of auditData?.students" class="hover:bg-gray-800/30">
                  <td class="p-3 font-bold">
                    <span class="font-mono text-emerald-400 block text-[11px]">{{ s.custom_student_id || ('STU-' + s.student_id) }}</span>
                    <span class="text-white text-xs block">{{ s.first_name }} {{ s.last_name }}</span>
                  </td>
                  <td class="p-3 font-mono">
                    <div *ngIf="s.total_score !== null && s.total_score !== undefined" class="flex flex-col">
                      <span [class.text-rose-400]="s.total_score < 50" [class.text-emerald-400]="s.total_score >= 50" class="font-bold text-xs">
                        {{ s.total_score }}/100
                      </span>
                      <span class="text-[10px] text-gray-400 font-normal">
                        (Mid: {{ s.mid_score || 0 }} + Final: {{ s.final_score || 0 }})
                      </span>
                    </div>
                    <span *ngIf="s.total_score === null || s.total_score === undefined" class="text-gray-500 italic">No Scores</span>
                  </td>
                  <td class="p-3">
                    <span *ngIf="s.promotion_status === 'ELIGIBLE_PASSED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block">
                      PASSED ➔ Promoted to Semester {{ auditData?.group?.next_semester }}
                    </span>
                    <span *ngIf="s.promotion_status === 'ELIGIBLE_REEXAM_CLEARED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 inline-block">
                      RE-EXAM CLEARED ➔ Promoted to Semester {{ auditData?.group?.next_semester }}
                    </span>
                    <span *ngIf="s.promotion_status === 'RETAINED_FAILED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 inline-block">
                      FAILED ➔ Retained in Semester {{ auditData?.group?.current_semester }}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button *ngIf="!s.is_cleared" (click)="markStudentReexamPassed(s)" title="Mark Passed Re-Exam" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow transition-all flex-inline items-center gap-1">
                      <i class="fa-solid fa-circle-check"></i> Pass Re-exam
                    </button>
                    <span *ngIf="s.is_cleared" class="text-[10px] text-emerald-400 font-bold font-mono">
                      Cleared
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-3 border-t border-[#1f2937] flex items-center justify-between">
          <button type="button" (click)="activeAuditGroupModal = null" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">
            Cancel
          </button>

          <button type="button" (click)="executeConfirmedPromotion()" class="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-dots"></i> Promote Eligible Students
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClassManagementComponent implements OnInit, OnDestroy {
  groups: any[] = [];
  programs: Program[] = [];
  availableStudents: any[] = [];
  selectedStudentIds: Set<number> = new Set();
  selectedProgramId: number | null = null;
  activeAssignModalGroup: any = null;

  selectedGroupIds: Set<number> = new Set<number>();

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  toggleGroupSelectAll(event: any): void {
    if (event.target.checked) {
      this.paginatedGroups.forEach(g => this.selectedGroupIds.add(g.group_id));
    } else {
      this.paginatedGroups.forEach(g => this.selectedGroupIds.delete(g.group_id));
    }
  }

  toggleGroupSelect(groupId: number): void {
    if (this.selectedGroupIds.has(groupId)) {
      this.selectedGroupIds.delete(groupId);
    } else {
      this.selectedGroupIds.add(groupId);
    }
  }

  isGroupSelected(groupId: number): boolean {
    return this.selectedGroupIds.has(groupId);
  }

  get isGroupAllSelected(): boolean {
    if (!this.paginatedGroups || this.paginatedGroups.length === 0) return false;
    return this.paginatedGroups.every(g => this.selectedGroupIds.has(g.group_id));
  }

  clearGroupSelection(): void {
    this.selectedGroupIds.clear();
  }

  deleteSelectedGroups(): void {
    if (this.selectedGroupIds.size === 0) return;
    const count = this.selectedGroupIds.size;

    this.confirmService.confirm({
      title: 'Delete Selected Class Groups?',
      message: `Are you sure you want to delete ${count} selected class section(s)? This action cannot be undone.`,
      confirmText: `Yes, Delete ${count} Section(s)`,
      onConfirm: () => {
        const idsToDelete = Array.from(this.selectedGroupIds);
        let successCount = 0;
        let completedCount = 0;

        idsToDelete.forEach((id) => {
          this.api.delete(`groups/${id}`).subscribe({
            next: () => {
              successCount++;
              completedCount++;
              if (completedCount === idsToDelete.length) {
                this.toast.success(`Successfully deleted ${successCount} selected class group(s)!`);
                this.selectedGroupIds.clear();
                this.loadGroups();
              }
            },
            error: () => {
              completedCount++;
              if (completedCount === idsToDelete.length) {
                this.toast.success(`Successfully deleted ${successCount} selected class group(s)!`);
                this.selectedGroupIds.clear();
                this.loadGroups();
              }
            }
          });
        });
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.groups.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.groups.length);
  }

  get paginatedGroups(): any[] {
    return this.groups.slice(this.startIndex, this.endIndex);
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

  activeAuditGroupModal: any = null;
  auditData: any = null;

  showModal = false;
  isEdit = false;
  editingGroupId: number | null = null;
  activeClassDetails: any = null;
  activePrintGroupModal: any = null;
  printGroupStudents: any[] = [];
  private realtimeSub!: Subscription;

  openPromotionAuditModal(g: any): void {
    this.activeAuditGroupModal = g;
    this.auditData = null;
    this.loadPromotionAudit(g.group_id);
  }

  loadPromotionAudit(groupId: number): void {
    this.api.get<any>(`groups/${groupId}/promotion-audit`).subscribe({
      next: (res) => {
        this.auditData = res.data || null;
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to calculate promotion audit')
    });
  }

  markStudentReexamPassed(student: any): void {
    this.api.post('groups/resolve-reexam', { student_id: student.student_id, status: 'PASSED_REEXAM' }).subscribe({
      next: () => {
        this.toast.success(`Updated student ${student.first_name} ${student.last_name} to Passed Re-Exam!`);
        if (this.activeAuditGroupModal) {
          this.loadPromotionAudit(this.activeAuditGroupModal.group_id);
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to update re-exam status')
    });
  }

  executeConfirmedPromotion(): void {
    if (!this.activeAuditGroupModal) return;
    const g = this.activeAuditGroupModal;
    this.api.post(`groups/${g.group_id}/promote`, {}).subscribe({
      next: (res: any) => {
        this.toast.success(res.message || 'Academic Year / Semester promoted successfully!');
        this.activeAuditGroupModal = null;
        this.loadGroups();
      },
      error: (err) => this.toast.error(err.error?.message || 'Promote failed')
    });
  }

  formGroup: any = {
    group_code: 'Form 5A',
    group_name: 'Form 5 Section A',
    shift: 'MORNING',
    max_capacity: 40
  };

  constructor(
    private api: ApiService,
    private academicService: AcademicService,
    public toast: ToastService,
    private socketService: SocketService,
    private confirmService: ConfirmModalService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadPrograms();
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
        console.log(`⚡ Auto-refreshing Class Groups UI on real-time event: ${event}`);
        this.loadGroups();
      }
    });
  }

  get isTeacherView(): boolean {
    return this.router.url.includes('/teacher/');
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
    const params: any = {};
    if (this.isTeacherView) {
      params.teacher_only = 'true';
    }
    this.api.get<any>('groups', params).subscribe({
      next: (res) => {
        this.groups = res.data?.groups || res.data || [];
      }
    });
  }

  loadPrograms(): void {
    this.academicService.getPrograms().subscribe(res => {
      this.programs = res.data?.programs || [];
    });
  }

  openAssignStudentsModal(g: any): void {
    this.activeAssignModalGroup = g;
    this.selectedProgramId = this.programs.length > 0 ? this.programs[0].program_id : null;
    this.selectedStudentIds.clear();
    this.loadStudentsForProgram();
  }

  loadStudentsForProgram(): void {
    const params: any = {
      limit: 100,
      unassignedOnly: true,
      groupId: this.activeAssignModalGroup?.group_id
    };

    if (this.selectedProgramId) {
      params.programId = this.selectedProgramId;
    }

    this.api.get<any>('students', params).subscribe({
      next: (res) => {
        const rawList = res.data?.students || [];
        // Filter out students assigned to another class group already
        this.availableStudents = rawList.filter((stu: any) =>
          !stu.group_id || stu.group_id === this.activeAssignModalGroup?.group_id
        );

        // Pre-select students already in this class group
        this.availableStudents.forEach(stu => {
          if (stu.group_id === this.activeAssignModalGroup?.group_id) {
            this.selectedStudentIds.add(stu.student_id);
          }
        });
      }
    });
  }

  toggleStudent(id: number): void {
    if (this.selectedStudentIds.has(id)) {
      this.selectedStudentIds.delete(id);
    } else {
      this.selectedStudentIds.add(id);
    }
  }

  get isAllStudentSelected(): boolean {
    return this.availableStudents.length > 0 && this.availableStudents.every(s => this.selectedStudentIds.has(s.student_id));
  }

  toggleSelectAllStudents(): void {
    if (this.isAllStudentSelected) {
      this.selectedStudentIds.clear();
    } else {
      this.availableStudents.forEach(s => this.selectedStudentIds.add(s.student_id));
    }
  }

  saveAssignedStudents(): void {
    if (!this.activeAssignModalGroup) return;

    const studentIds = Array.from(this.selectedStudentIds);
    this.api.post(`groups/${this.activeAssignModalGroup.group_id}/assign-students`, { student_ids: studentIds }).subscribe({
      next: () => {
        this.toast.success(`Assigned ${studentIds.length} students to class ${this.activeAssignModalGroup.group_code} successfully!`);
        this.activeAssignModalGroup = null;
        this.loadGroups();
      },
      error: (err) => this.toast.error(err.error?.message || 'Assign failed')
    });
  }

  openCreateModal(): void {
    this.isEdit = false;
    this.editingGroupId = null;
    this.formGroup = {
      group_code: '',
      group_name: '',
      shift: 'MORNING',
      program_id: this.programs.length > 0 ? this.programs[0].program_id : 1,
      generation: 'Gen 9',
      academic_year_level: 1,
      current_semester: 1,
      semester_start_date: new Date().toISOString().slice(0, 10),
      semester_end_date: '',
      max_capacity: 40
    };
    this.showModal = true;
  }

  editClass(g: any): void {
    this.isEdit = true;
    this.editingGroupId = g.group_id;
    this.formGroup = {
      group_code: g.group_code,
      group_name: g.group_name,
      shift: g.shift,
      program_id: g.program_id || (this.programs[0]?.program_id || 1),
      generation: g.generation || 'Gen 9',
      academic_year_level: g.academic_year_level || 1,
      current_semester: g.current_semester || 1,
      semester_start_date: g.semester_start_date ? g.semester_start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      semester_end_date: g.semester_end_date ? g.semester_end_date.slice(0, 10) : '',
      max_capacity: g.max_capacity || 40
    };
    this.showModal = true;
  }

  promoteClass(g: any): void {
    if (confirm(`Are you sure you want to promote class "${g.group_code}" to the next semester/year?`)) {
      this.api.post(`groups/${g.group_id}/promote`, {}).subscribe({
        next: (res: any) => {
          this.toast.success(res.message || 'Academic Year / Semester promoted successfully!');
          this.loadGroups();
        },
        error: (err) => this.toast.error(err.error?.message || 'Promote failed')
      });
    }
  }

  promoteAllClasses(): void {
    this.confirmService.confirm({
      title: 'Bulk Promote All Classes?',
      message: 'Are you sure you want to bulk promote all active class groups to the next semester/year?',
      confirmText: 'Yes, Promote All',
      onConfirm: () => {
        this.api.post('groups/promote-all', {}).subscribe({
          next: (res: any) => {
            this.toast.success(res.message || 'All class groups promoted successfully!');
            this.loadGroups();
          },
          error: (err) => this.toast.error(err.error?.message || 'Bulk promote failed')
        });
      }
    });
  }

  deleteClass(g: any): void {
    this.confirmService.confirm({
      title: 'Delete Class Group?',
      message: `Are you sure you want to delete class group "${g.group_code} — ${g.group_name}"?`,
      confirmText: 'Yes, Delete Class',
      onConfirm: () => {
        this.api.delete(`groups/${g.group_id}`).subscribe({
          next: () => {
            this.toast.success('Class group deleted successfully!');
            this.loadGroups();
          },
          error: (err) => this.toast.error(err.error?.message || 'Delete failed')
        });
      }
    });
  }

  viewClassDetails(g: any): void {
    this.activeClassDetails = g;
  }

  printGroupCards(g: any): void {
    this.activePrintGroupModal = g;
    this.printGroupStudents = [];

    this.api.get<any>(`students?groupId=${g.group_id}&limit=1000`).subscribe({
      next: (res) => {
        this.printGroupStudents = res.data?.students || [];
      }
    });
  }

  triggerBatchPrint(): void {
    window.print();
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

  saveClassGroup(): void {
    if (!this.formGroup.group_code || !this.formGroup.group_name) {
      this.toast.error('Please enter Class Code and Class Name!');
      return;
    }

    if (this.isEdit && this.editingGroupId) {
      this.api.put(`groups/${this.editingGroupId}`, this.formGroup).subscribe({
        next: () => {
          this.toast.success('Class Group updated successfully!');
          this.showModal = false;
          this.loadGroups();
        },
        error: (err) => this.toast.error(err.error?.message || 'Update failed')
      });
    } else {
      this.api.post('groups', this.formGroup).subscribe({
        next: () => {
          this.toast.success('Class Group created successfully!');
          this.showModal = false;
          this.loadGroups();
        },
        error: (err) => this.toast.error(err.error?.message || 'Create failed')
      });
    }
  }
}

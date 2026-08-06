import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-score-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Academic Score Entry & Exam Grading'" 
                [subtitle]="'Admin / Scores'"
                [actionLabel]="'Publish Scores'"
                [actionIcon]="'fa-solid fa-cloud-arrow-up'"
                (actionClicked)="publishScores()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Score Matrix (Left 2 Cols) -->
        <div class="lg:col-span-6 space-y-6">
          <!-- Assessment Type Toggle Bar: Mid vs Final -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <span class="text-xs font-bold text-gray-300">SELECT ASSESSMENT TYPE TO ENTER SCORES:</span>
            <div class="flex items-center gap-2 flex-wrap">
              <button (click)="assessmentType = 'Mid'; onAssessmentTypeChange()" 
                      [class.bg-emerald-600]="assessmentType === 'Mid'"
                      [class.text-white]="assessmentType === 'Mid'"
                      [class.text-gray-400]="assessmentType !== 'Mid'"
                      class="px-4 py-2 rounded-xl border border-[#1f2937] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md">
                <i class="fa-solid fa-pen-clip"></i>Midterm Score (Mid)
              </button>

              <button (click)="assessmentType = 'Final'; onAssessmentTypeChange()" 
                      [class.bg-purple-600]="assessmentType === 'Final'"
                      [class.text-white]="assessmentType === 'Final'"
                      [class.text-gray-400]="assessmentType !== 'Final'"
                      class="px-4 py-2 rounded-xl border border-[#1f2937] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md">
                <i class="fa-solid fa-award"></i>Final Exam Score (Final)
              </button>

              <button (click)="openPastScoresModal()" 
                      class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg border border-purple-400/40">
                <i class="fa-solid fa-clock-rotate-left text-amber-300"></i>
                <span>View Past Scores</span>
              </button>
            </div>
          </div>

          <!-- Session Filter Box & Class Metrics Bar -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold text-purple-400 mb-1">
                  <i class="fa-solid fa-layer-group text-purple-400 mr-1"></i> SELECT EXAM GROUP *
                </label>
                <select [(ngModel)]="selectedExamGroup" (change)="onExamGroupChange()" class="w-full bg-[#111827] border border-purple-500/60 text-xs text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-purple-500">
                  <option *ngFor="let eg of filteredExamGroups" [value]="eg.exam_group_id">
                    {{ eg.exam_group_code }} — {{ eg.exam_group_name }} ({{ eg.exam_type || 'Exam' }})
                  </option>
                  <option *ngIf="filteredExamGroups.length === 0" [value]="null" disabled>No {{ assessmentType === 'Mid' ? 'Midterm' : 'Final' }} exam groups available</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">
                  <i class="fa-solid fa-users-rectangle text-gray-300 mr-1"></i> SELECT CLASS GROUP *
                </label>
                <select [(ngModel)]="selectedClass" (change)="loadScores()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
                  <option value="ALL">All Classes in Exam Group</option>
                  <option *ngFor="let g of filteredGroupList" [value]="g.group_id">
                    {{ g.group_code }} — {{ g.group_name }}
                  </option>
                  <option *ngIf="filteredGroupList.length === 0" [value]="null" disabled>No class groups available</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-emerald-400 mb-1">
                  <i class="fa-solid fa-book-open text-emerald-400 mr-1"></i> SELECT SUBJECT *
                </label>
                <select [(ngModel)]="selectedSubject" (change)="onSubjectChange()" class="w-full bg-[#111827] border border-emerald-500/60 text-xs text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
                  <option value="ALL">All Exam Subjects</option>
                  <option *ngFor="let sub of examSubjects" [value]="sub.subject_id">
                    {{ sub.subject_code }} — {{ sub.subject_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Calculated Metrics Summary -->
            <div class="grid grid-cols-3 gap-3 pt-3 border-t border-[#1f2937] text-center">
              <div class="bg-[#111827] p-2.5 rounded-xl border border-[#1f2937]">
                <span class="text-gray-400 text-[10px] uppercase font-bold block">Highest Score</span>
                <span class="text-emerald-400 font-bold font-mono text-sm">{{ highestScore }}/50</span>
              </div>
              <div class="bg-[#111827] p-2.5 rounded-xl border border-[#1f2937]">
                <span class="text-gray-400 text-[10px] uppercase font-bold block">Average Class Score</span>
                <span class="text-white font-bold font-mono text-sm">{{ averageScore | number:'1.1-1' }}/50</span>
              </div>
              <div class="bg-[#111827] p-2.5 rounded-xl border border-[#1f2937]">
                <span class="text-gray-400 text-[10px] uppercase font-bold block">Pass Rate (≥20)</span>
                <span class="text-cyan-400 font-bold font-mono text-sm">{{ passRate }}%</span>
              </div>
            </div>
          </div>

          <!-- Score Matrix Table -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{{ assessmentType === 'Mid' ? 'Midterm Score (Mid)' : 'Final Score (Final)' }}</span>
                <span class="px-2.5 py-0.5 rounded-lg bg-purple-950/90 border border-purple-800 text-purple-300 font-mono text-xs font-bold">
                  {{ selectedSubject === 'ALL' ? ((visibleSubjects.length || 1) + ' Subjects') : 'Single Subject View' }}
                </span>
              </h3>
              <div class="flex items-center gap-2">
                <button (click)="autoFillPassScores()" class="text-xs text-emerald-400 hover:underline font-bold">+ Auto-fill Pass Scores (35)</button>
                <span class="text-xs text-amber-400 font-semibold bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full">{{ students.length }} students enrolled</span>
              </div>
            </div>

            <!-- Quick Subject Filter Tabs -->
            <div *ngIf="examSubjects.length > 0" class="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs border-b border-[#1f2937] pt-1">
              <button (click)="selectedSubject = 'ALL'; onSubjectChange()"
                      [class.bg-emerald-600]="selectedSubject === 'ALL'"
                      [class.text-white]="selectedSubject === 'ALL'"
                      [class.bg-[#111827]="selectedSubject !== 'ALL'"
                      [class.text-gray-400]="selectedSubject !== 'ALL'"
                      class="px-3 py-1 rounded-xl border border-[#1f2937] font-bold text-[11px] shrink-0 transition-all hover:border-emerald-500">
                <i class="fa-solid fa-border-all mr-1"></i> All Subjects
              </button>
              <button *ngFor="let sub of examSubjects"
                      (click)="selectedSubject = sub.subject_id; onSubjectChange()"
                      [class.bg-purple-600]="selectedSubject == sub.subject_id"
                      [class.text-white]="selectedSubject == sub.subject_id"
                      [class.bg-[#111827]="selectedSubject != sub.subject_id"
                      [class.text-gray-400]="selectedSubject != sub.subject_id"
                      class="px-3 py-1 rounded-xl border border-[#1f2937] font-bold text-[11px] shrink-0 transition-all flex items-center gap-1 hover:border-purple-500"
                      [title]="sub.subject_name">
                <i class="fa-solid fa-book text-purple-400 mr-1"></i> {{ sub.subject_code || sub.subject_name }}
              </button>
            </div>

            <div class="overflow-x-auto overflow-y-auto max-h-[550px] custom-scrollbar border border-[#1f2937]/60 rounded-xl">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider text-center">
                    <th class="p-3 text-left w-8 bg-[#111827]">#</th>
                    <th class="p-3 text-left bg-[#111827]">STUDENT</th>
                    <th class="p-3 text-left bg-[#111827]">CLASS</th>
                    
                    <!-- Dynamic Subject Header Columns -->
                    <th *ngFor="let sub of visibleSubjects" class="p-3 min-w-[100px] bg-[#111827]" [title]="sub.subject_name">
                      <div class="text-purple-400 font-mono text-[11px] font-extrabold"><i class="fa-solid fa-book text-purple-400 mr-1"></i> {{ sub.subject_code || sub.subject_name }}</div>
                      <div class="text-[9px] text-gray-400 font-normal truncate max-w-[110px] mx-auto">{{ sub.subject_name }}</div>
                    </th>

                    <!-- Fallback Column if no subjects -->
                    <th *ngIf="visibleSubjects.length === 0" class="pb-3 px-3 w-32 bg-[#111827]">
                      {{ assessmentType === 'Mid' ? 'MID (0-50)' : 'FINAL (0-50)' }}
                    </th>

                    <th class="pb-3 text-left bg-[#111827]">TEACHER REMARKS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let s of paginatedStudents; let i = index" class="hover:bg-gray-800/40 transition-colors">
                    <td class="py-3 font-mono text-gray-500 text-center">{{ startIndex + i }}</td>
                    <td class="py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-500/40 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-sm">
                          <img *ngIf="s.image && !s.imageError" [src]="getPhotoUrl(s.image)" (error)="s.imageError = true" class="w-full h-full object-cover">
                          <span *ngIf="!s.image || s.imageError">{{ s.first_name?.[0] || '?' }}{{ s.last_name?.[0] || '' }}</span>
                        </div>
                        <div>
                          <div class="font-bold text-white whitespace-nowrap">{{ s.first_name }} {{ s.last_name }}</div>
                          <div class="text-[10px] text-gray-500 font-mono">{{ s.custom_student_id || s.student_code || s.student_id_number || '' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3">
                      <span class="px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 text-[10px] font-bold font-mono">
                        {{ s._group_code || s.group_code || 'N/A' }}
                      </span>
                    </td>

                    <!-- Dynamic Input Box for Each Subject Side-by-Side [ 0 ] [ 0 ] [ 0 ] -->
                    <td *ngFor="let sub of visibleSubjects" class="py-3 px-2 text-center">
                      <input type="number" 
                             min="0"
                             max="100"
                             placeholder="0"
                             [(ngModel)]="s.subject_scores[sub.subject_id]" 
                             (input)="validateAndRecalculate(s, sub.subject_id)" 
                             [class.border-rose-500]="(s.subject_scores[sub.subject_id] !== null && s.subject_scores[sub.subject_id] !== undefined && s.subject_scores[sub.subject_id] < 20)"
                             class="w-16 bg-[#111827] border border-[#1f2937] text-xs font-mono font-bold rounded-lg px-2 py-1 text-center focus:outline-none focus:border-purple-500">
                    </td>

                    <!-- Fallback Single Input if no subjects -->
                    <td *ngIf="visibleSubjects.length === 0" class="py-3 px-3 text-center">
                      <input type="number" 
                             min="0"
                             max="100"
                             placeholder="0"
                             [(ngModel)]="s.mid_score" 
                             (input)="validateAndRecalculate(s)" 
                             class="w-16 bg-[#111827] border border-[#1f2937] text-xs font-mono font-bold rounded-lg px-2 py-1 text-center focus:outline-none focus:border-emerald-500">
                    </td>

                    <!-- REMARKS -->
                    <td class="py-3 text-gray-300">
                      <input type="text" [(ngModel)]="s.remarks" placeholder="Add remark..." class="bg-[#111827] border border-[#1f2937] text-xs text-gray-300 rounded-lg px-2.5 py-1 w-full focus:outline-none focus:border-emerald-500">
                    </td>
                  </tr>
                  <!-- Empty State when no students found or not scheduled -->
                  <tr *ngIf="students.length === 0">
                    <td colspan="7" class="py-12 text-center">
                      <div class="flex flex-col items-center justify-center gap-3">
                        <div [class]="
                          emptyStateReason === 'NOT_SCHEDULED_YET' ? 'w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 text-2xl shadow-lg' :
                          'w-14 h-14 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-500 text-2xl shadow-lg'
                        ">
                          <i [class]="
                            emptyStateReason === 'NOT_SCHEDULED_YET' ? 'fa-solid fa-calendar-xmark' :
                            (emptyStateReason === 'NO_CLASSES_IN_GROUP' ? 'fa-solid fa-folder-minus' : 'fa-solid fa-users-slash')
                          "></i>
                        </div>
                        
                        <!-- Reason 0: No Exam Group created for this assessment type (Mid or Final) -->
                        <div *ngIf="emptyStateReason === 'NO_EXAM_GROUP_FOR_TYPE' || filteredExamGroups.length === 0" class="space-y-1">
                          <p class="font-extrabold text-purple-300 text-sm">No {{ assessmentType === 'Mid' ? 'Midterm' : 'Final Exam' }} Group Available</p>
                          <p class="text-[11px] text-gray-400 max-w-md">
                            Please create an exam schedule and group in <strong class="text-purple-400">Exam Group Management</strong> first.
                          </p>
                        </div>

                        <!-- Reason 1: Not Scheduled Yet -->
                        <div *ngIf="emptyStateReason === 'NOT_SCHEDULED_YET' && filteredExamGroups.length > 0" class="space-y-1">
                          <p class="font-extrabold text-amber-300 text-sm">Exam Not Scheduled Yet</p>
                          <p class="text-[11px] text-gray-400 max-w-md">
                            Please set up exam schedules in <strong class="text-amber-400">Exam Group Management</strong> first.
                          </p>
                        </div>

                        <!-- Reason 2: No Classes Assigned to Exam Group -->
                        <div *ngIf="emptyStateReason === 'NO_CLASSES_IN_GROUP'" class="space-y-1">
                          <p class="font-extrabold text-rose-300 text-sm">No Classes Assigned to Exam Group</p>
                          <p class="text-[11px] text-gray-400 max-w-md">
                            Please assign class groups to this exam group in <strong class="text-purple-400">Exam Group Management</strong> first.
                          </p>
                        </div>

                        <!-- Reason 3: No Students in Class -->
                        <div *ngIf="emptyStateReason === 'NO_STUDENTS' || (!emptyStateReason && students.length === 0)" class="space-y-1">
                          <p class="font-extrabold text-gray-300 text-sm">No Enrolled Students Found</p>
                          <p class="text-[11px] text-gray-500 max-w-md">
                            Please enroll students in <strong class="text-emerald-400">Student Management</strong> first.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Controls Bar -->
            <div *ngIf="students.length > 0" class="p-4 bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1f2937] rounded-b-xl">
              <div class="flex items-center gap-3 text-gray-400 text-xs">
                <span>Showing <strong class="text-white">{{ startIndex }}</strong> to <strong class="text-white">{{ endIndex }}</strong> of <strong class="text-white">{{ students.length }}</strong> students</span>
                <div class="flex items-center gap-1.5 ml-2">
                  <span>Per page:</span>
                  <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#1e293b] border border-[#1f2937] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-purple-500 font-bold cursor-pointer">
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
                
                <span class="px-3 py-1 text-xs font-bold text-purple-400 bg-[#1e293b] rounded border border-purple-900/50">
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

            <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#1f2937]">
              <button (click)="loadScores()" class="px-4 py-2 rounded-xl border border-[#1f2937] text-xs text-gray-300 hover:text-white">Reset Form</button>
              <button (click)="publishScores()" 
                      [class.bg-emerald-600]="assessmentType === 'Mid' && isAdmin"
                      [class.hover:bg-emerald-500]="assessmentType === 'Mid' && isAdmin"
                      [class.bg-purple-600]="assessmentType === 'Final' && isAdmin"
                      [class.hover:bg-purple-500]="assessmentType === 'Final' && isAdmin"
                      [class.bg-indigo-600]="!isAdmin"
                      [class.hover:bg-indigo-500]="!isAdmin"
                      class="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2">
                <i *ngIf="isAdmin" class="fa-solid fa-cloud-arrow-up text-amber-300"></i>
                <i *ngIf="!isAdmin" class="fa-solid fa-paper-plane text-cyan-300"></i>
                <span>
                  {{ isAdmin ? ('Save & Publish ' + (assessmentType === 'Mid' ? 'Mid' : 'Final') + ' Scores') : ('Submit ' + (assessmentType === 'Mid' ? 'Mid' : 'Final') + ' Scores to Admin') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dialog: Past Exam Scores History -->
    <div *ngIf="showPastScoresModal" class="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 text-lg shadow-inner">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                Past Exam Scores History
              </h3>
              <p class="text-xs text-gray-400">
                View saved exam scores grouped by academic year, semester, and class.
              </p>
            </div>
          </div>

          <button (click)="showPastScoresModal = false" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Modal Search & Filters Bar -->
        <div class="px-6 py-3 bg-[#0d1521] border-b border-[#1f2937] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block font-bold text-gray-400 mb-1">Search Student</label>
            <input type="text" [(ngModel)]="pastScoreSearch" placeholder="Search name or ID..." class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500">
          </div>
          <div>
            <label class="block font-bold text-gray-400 mb-1">Academic Year</label>
            <select [(ngModel)]="pastScoreYear" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500">
              <option value="ALL">-- All Academic Years --</option>
              <option *ngFor="let yr of availableYears" [value]="yr">{{ yr }}</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-400 mb-1">Semester</label>
            <select [(ngModel)]="pastScoreSemester" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500">
              <option value="ALL">-- All Semesters --</option>
              <option *ngFor="let sem of availableSemesters" [value]="sem">{{ sem }}</option>
            </select>
          </div>
        </div>

        <!-- Modal Body Content: Past Scores Cards -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div *ngIf="filteredPastStudentResults.length === 0" class="py-12 text-center text-gray-400 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 text-xl mx-auto">
              <i class="fa-solid fa-folder-open"></i>
            </div>
            <p class="font-bold text-sm text-gray-300">No past score records found.</p>
            <p class="text-xs text-gray-500">Saved exam scores for this group will appear here.</p>
          </div>

          <div *ngFor="let item of filteredPastStudentResults" 
               class="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 space-y-4 hover:border-purple-500/60 transition-all">
            
            <!-- Student Header Banner -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1f2937]">
              <!-- Left Info -->
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {{ item.first_name?.[0] || '?' }}{{ item.last_name?.[0] || '' }}
                  </div>
                  <span class="font-bold text-white text-base">{{ item.first_name }} {{ item.last_name }}</span>
                  <span class="px-2.5 py-0.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono font-bold">{{ item.custom_student_id || 'N/A' }}</span>
                  <span class="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">{{ item.group_code || 'N/A' }}</span>
                </div>

                <div class="flex items-center gap-4 text-xs text-gray-400 flex-wrap pt-1">
                  <span class="flex items-center gap-1.5"><i class="fa-solid fa-calendar text-amber-400"></i> Academic Year: <strong class="text-white">{{ item.academic_year }}</strong></span>
                  <span class="flex items-center gap-1.5"><i class="fa-solid fa-book-open text-purple-400"></i> Semester: <strong class="text-white">{{ item.semester }}</strong></span>
                  <span class="flex items-center gap-1.5"><i class="fa-solid fa-clock text-cyan-400"></i> Exam Date: <strong class="text-cyan-300 font-mono">{{ item.exam_date | date:'yyyy-MM-dd' }}</strong></span>
                </div>
              </div>

              <!-- Right Average & Grade -->
              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <div class="text-[10px] text-gray-400 uppercase font-bold">Total Average</div>
                  <div class="text-base font-extrabold font-mono text-amber-400">{{ item.avgScore | number:'1.1-1' }}/100</div>
                </div>
                <span [ngClass]="{
                  'bg-emerald-950 text-emerald-400 border-emerald-800': item.letter === 'A' || item.letter === 'B+',
                  'bg-blue-950 text-blue-400 border-blue-800': item.letter === 'B' || item.letter === 'C+',
                  'bg-rose-950 text-rose-400 border-rose-800': item.letter === 'F'
                }" class="px-3.5 py-2 rounded-xl font-mono font-extrabold text-sm border shadow-lg">
                  {{ item.letter }} ({{ item.gpa }})
                </span>
              </div>
            </div>

            <!-- Subject Scores Breakdown Table (Subject | Mid (/50) | Final (/50) | Total (/100)) -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs bg-[#0f172a] rounded-xl overflow-hidden border border-[#1f2937]">
                <thead>
                  <tr class="bg-[#1e293b] text-purple-300 font-bold border-b border-[#1f2937]">
                    <th class="py-2.5 px-4">Subject</th>
                    <th class="py-2.5 px-4 text-center w-24">Mid (/50)</th>
                    <th class="py-2.5 px-4 text-center w-24">Final (/50)</th>
                    <th class="py-2.5 px-4 text-center w-28 text-amber-300">Total (/100)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sub of item.subjects" class="border-b border-[#1f2937]/50 hover:bg-[#1e293b]/50">
                    <td class="py-2.5 px-4 font-semibold text-gray-200">
                      {{ sub.subject_name }}
                      <span *ngIf="sub.subject_code" class="text-[10px] text-gray-400 font-mono ml-1.5">({{ sub.subject_code }})</span>
                    </td>
                    <td class="py-2.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {{ sub.mid_score !== null && sub.mid_score !== undefined ? (sub.mid_score + '/50') : '-' }}
                    </td>
                    <td class="py-2.5 px-4 text-center font-mono font-bold text-purple-400">
                      {{ sub.final_score !== null && sub.final_score !== undefined ? (sub.final_score + '/50') : '-' }}
                    </td>
                    <td class="py-2.5 px-4 text-center font-mono font-extrabold text-amber-400">
                      {{ sub.total_score }}/100
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 bg-[#111827] border-t border-[#1f2937] flex items-center justify-between text-xs">
          <span class="text-gray-400">Total Records: <strong class="text-white">{{ filteredPastStudentResults.length }} Students</strong></span>
          <button (click)="showPastScoresModal = false" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all">
            Close
          </button>
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
      background: #9333ea;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
    }
    input[type=number] {
      -moz-appearance: textfield !important;
    }
  `]
})
export class ScoreEntryComponent implements OnInit {
  selectedExam = '1';
  selectedExamGroup: any = null; // Selected Exam Group (from Exam Group Management)
  selectedClass = 'ALL';
  selectedSubject = 'ALL';
  assessmentType: 'Mid' | 'Final' = 'Mid'; // Midterm score by default
  emptyStateReason: 'NOT_SCHEDULED_YET' | 'NO_CLASSES_IN_GROUP' | 'NO_STUDENTS' | 'NO_EXAM_GROUP_FOR_TYPE' | '' = '';

  scheduledExams: any[] = [];
  examSubjects: any[] = [];
  visibleSubjects: any[] = [];
  savedResultsList: any[] = [];
  allPastResultsList: any[] = [];
  showPastScoresModal = false;
  pastScoreSearch = '';
  pastScoreYear = 'ALL';
  pastScoreSemester = 'ALL';

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  get paginatedStudents(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.students.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil((this.students?.length || 0) / this.pageSize) || 1;
  }

  get startIndex(): number {
    return this.students.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.students.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  openPastScoresModal(): void {
    this.pastScoreSearch = '';
    this.pastScoreYear = 'ALL';
    this.pastScoreSemester = 'ALL';
    this.showPastScoresModal = true;
    this.api.get<any>('results').subscribe({
      next: (res) => {
        this.allPastResultsList = res.data?.results || res.data || [];
      },
      error: () => {
        this.allPastResultsList = this.savedResultsList || [];
      }
    });
  }

  get availableYears(): string[] {
    const rawList = (this.allPastResultsList && this.allPastResultsList.length > 0) ? this.allPastResultsList : this.savedResultsList;
    if (!rawList || rawList.length === 0) return [];
    const set = new Set<string>();
    rawList.forEach(r => {
      const yr = r.academic_year || r.eg_generation || '2025-2026';
      if (yr) set.add(yr);
    });
    return Array.from(set);
  }

  get availableSemesters(): string[] {
    const rawList = (this.allPastResultsList && this.allPastResultsList.length > 0) ? this.allPastResultsList : this.savedResultsList;
    if (!rawList || rawList.length === 0) return [];
    const set = new Set<string>();
    rawList.forEach(r => {
      const sem = r.semester || r.eg_semester || 'Semester 1';
      if (sem) set.add(sem);
    });
    return Array.from(set);
  }

  get filteredPastStudentResults(): any[] {
    const rawList = (this.allPastResultsList && this.allPastResultsList.length > 0) ? this.allPastResultsList : this.savedResultsList;
    if (!rawList || rawList.length === 0) return [];

    const map = new Map();
    rawList.forEach(r => {
      // Group strictly by student_id so each student gets ONLY 1 card per semester
      const key = `${r.student_id}`;
      if (!map.has(key)) {
        map.set(key, {
          student_id: r.student_id,
          first_name: r.first_name,
          last_name: r.last_name,
          custom_student_id: r.custom_student_id || r.student_code,
          group_code: r.group_code,
          exam_group_name: r.exam_group_name || r.exam_title,
          academic_year: r.academic_year || r.eg_generation || 'Gen 9',
          semester: r.semester || r.eg_semester || 'Semester 1',
          exam_date: r.exam_date || r.eg_start_date || r.recorded_at,
          recorded_at: r.recorded_at,
          subjectsMap: new Map()
        });
      }
      const sItem = map.get(key);
      const subId = r.subject_id || r.subject_code || r.subject_name;
      if (!sItem.subjectsMap.has(subId)) {
        sItem.subjectsMap.set(subId, {
          subject_id: subId,
          subject_code: r.subject_code,
          subject_name: r.subject_name || r.subject_code || 'Subject',
          mid_score: null,
          final_score: null
        });
      }
      const subObj = sItem.subjectsMap.get(subId);
      const cat = String(r.category || r.exam_title || '').toLowerCase();
      if (cat.includes('final')) {
        subObj.final_score = r.raw_score;
      } else {
        subObj.mid_score = r.raw_score;
      }
    });

    let list = Array.from(map.values());
    list.forEach(s => {
      s.subjects = Array.from(s.subjectsMap.values());
      let totalSum = 0;
      let subjectCount = 0;

      s.subjects.forEach((sub: any) => {
        const m = Number(sub.mid_score) || 0;
        const f = Number(sub.final_score) || 0;
        sub.total_score = m + f; // Mid (/50) + Final (/50) = Total (/100)
        totalSum += sub.total_score;
        subjectCount += 1;
      });

      s.avgScore = subjectCount > 0 ? (totalSum / subjectCount) : 0;
      if (s.avgScore >= 90) { s.letter = 'A'; s.gpa = 4.0; }
      else if (s.avgScore >= 80) { s.letter = 'B+'; s.gpa = 3.5; }
      else if (s.avgScore >= 70) { s.letter = 'B'; s.gpa = 3.0; }
      else if (s.avgScore >= 60) { s.letter = 'C+'; s.gpa = 2.5; }
      else if (s.avgScore >= 50) { s.letter = 'C'; s.gpa = 2.0; }
      else { s.letter = 'F'; s.gpa = 0.0; }
    });

    if (this.pastScoreSearch) {
      const term = this.pastScoreSearch.toLowerCase();
      list = list.filter(s =>
        (s.first_name && s.first_name.toLowerCase().includes(term)) ||
        (s.last_name && s.last_name.toLowerCase().includes(term)) ||
        (s.custom_student_id && s.custom_student_id.toLowerCase().includes(term)) ||
        (s.group_code && s.group_code.toLowerCase().includes(term))
      );
    }
    if (this.pastScoreYear && this.pastScoreYear !== 'ALL') {
      const yTerm = String(this.pastScoreYear).toLowerCase().replace(/[^a-z0-9]/g, '');
      list = list.filter(s => {
        const itemY = String(s.academic_year || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemY.includes(yTerm) || yTerm.includes(itemY);
      });
    }
    if (this.pastScoreSemester && this.pastScoreSemester !== 'ALL') {
      const sTerm = String(this.pastScoreSemester).toLowerCase().replace(/[^a-z0-9]/g, '');
      list = list.filter(s => {
        const itemS = String(s.semester || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemS.includes(sTerm) || sTerm.includes(itemS);
      });
    }

    return list;
  }
  examList: any[] = [];
  examGroups: any[] = []; // Loaded from exams/groups API
  groupList: any[] = [];
  subjectList: any[] = [];

  get savedStudentResults(): any[] {
    if (!this.savedResultsList || this.savedResultsList.length === 0) return [];
    const map = new Map();
    this.savedResultsList.forEach(r => {
      if (!map.has(r.student_id)) {
        map.set(r.student_id, {
          student_id: r.student_id,
          first_name: r.first_name,
          last_name: r.last_name,
          custom_student_id: r.custom_student_id || r.student_code,
          group_code: r.group_code,
          academic_year: r.academic_year || r.eg_academic_year || '2025-2026',
          semester: r.semester || r.eg_semester || 'Semester 1',
          exam_date: r.exam_date || r.eg_start_date || r.recorded_at,
          recorded_at: r.recorded_at,
          subjectScores: [],
          totalScore: 0,
          count: 0
        });
      }
      const sItem = map.get(r.student_id);
      sItem.subjectScores.push({
        subject_code: r.subject_code,
        subject_name: r.subject_name,
        score: r.raw_score,
        letter_grade: r.letter_grade
      });
      sItem.totalScore += Number(r.raw_score) || 0;
      sItem.count += 1;
    });

    const list = Array.from(map.values());
    list.forEach(s => {
      s.avgScore = s.count > 0 ? (s.totalScore / s.count) : 0;
      if (s.avgScore >= 45) { s.letter = 'A'; s.gpa = 4.0; }
      else if (s.avgScore >= 40) { s.letter = 'B+'; s.gpa = 3.5; }
      else if (s.avgScore >= 35) { s.letter = 'B'; s.gpa = 3.0; }
      else if (s.avgScore >= 30) { s.letter = 'C+'; s.gpa = 2.5; }
      else if (s.avgScore >= 20) { s.letter = 'C'; s.gpa = 2.0; }
      else { s.letter = 'F'; s.gpa = 0.0; }
    });

    return list;
  }

  updateExamSubjects(): void {
    if (!this.scheduledExams || this.scheduledExams.length === 0) {
      this.examSubjects = [];
      this.visibleSubjects = [];
      return;
    }
    const map = new Map();
    this.scheduledExams.forEach(ex => {
      const cat = String(ex.category || ex.exam_type || '').toLowerCase();
      if (this.assessmentType === 'Final') {
        if (cat && !cat.includes('final')) return;
      } else {
        if (cat && cat.includes('final')) return;
      }

      if (ex.subject_id && !map.has(ex.subject_id)) {
        map.set(ex.subject_id, {
          subject_id: ex.subject_id,
          subject_name: ex.subject_name || ex.subject_code || 'Subject',
          subject_code: ex.subject_code,
          exam_id: ex.exam_id
        });
      }
    });
    this.examSubjects = Array.from(map.values());
    this.updateVisibleSubjects();
  }

  updateVisibleSubjects(): void {
    if (!this.examSubjects || this.examSubjects.length === 0) {
      this.visibleSubjects = [];
      return;
    }
    if (this.selectedSubject && this.selectedSubject !== 'ALL') {
      this.visibleSubjects = this.examSubjects.filter(sub => String(sub.subject_id) === String(this.selectedSubject));
    } else {
      this.visibleSubjects = [...this.examSubjects];
    }
  }

  onSubjectChange(): void {
    this.updateVisibleSubjects();
  }

  get filteredExamGroups(): any[] {
    if (!this.examGroups || this.examGroups.length === 0) return [];
    if (this.assessmentType === 'Final') {
      return this.examGroups.filter(eg => eg.exam_type && String(eg.exam_type).toLowerCase().includes('final'));
    } else {
      return this.examGroups.filter(eg => !eg.exam_type || String(eg.exam_type).toLowerCase().includes('mid') || !String(eg.exam_type).toLowerCase().includes('final'));
    }
  }

  get filteredGroupList(): any[] {
    if (!this.selectedExamGroup) return [];
    const selectedEG = this.examGroups.find(eg => Number(eg.exam_group_id) === Number(this.selectedExamGroup));
    return selectedEG?.classes || [];
  }

  students: any[] = [

  ];

  newExam: any = {
    exam_title: 'Midterm — Mathematics',
    subject_id: 1,
    group_id: 5,
    semester_id: 2,
    exam_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    duration_minutes: 90,
    category: 'Midterm',
    status: 'Active'
  };

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadScores();
  }

  onAssessmentTypeChange(): void {
    const list = this.filteredExamGroups;
    if (list.length > 0) {
      this.selectedExamGroup = list[0].exam_group_id;
      this.onExamGroupChange();
    } else {
      this.selectedExamGroup = null;
      this.students = [];
      this.scheduledExams = [];
      this.updateExamSubjects();
      this.emptyStateReason = 'NO_EXAM_GROUP_FOR_TYPE';
      // this.toast.info(`មិនទាន់មានក្រុមប្រឡង ${this.assessmentType === 'Mid' ? 'Midterm' : 'Final'} ក្នុង Exam Group Management ឡើយ`);
    }
  }

  get highestScore(): number {
    if (!this.students || this.students.length === 0) return 0;
    return Math.max(...this.students.map(s => Number(s.avg_score) || 0));
  }

  get averageScore(): number {
    if (!this.students || this.students.length === 0) return 0;
    const total = this.students.reduce((acc, s) => acc + (Number(s.avg_score) || 0), 0);
    return total / this.students.length;
  }

  get passRate(): number {
    if (!this.students || this.students.length === 0) return 0;
    const passCount = this.students.filter(s => (Number(s.avg_score) || 0) >= 20).length;
    return Math.round((passCount / this.students.length) * 100);
  }

  loadDropdowns(): void {
    // Load Exam Groups from Exam Group Management
    this.api.get<any>('exams/groups').subscribe(res => {
      this.examGroups = res.data?.exam_groups || res.data?.examGroups || res.data?.groups || res.data || [];
      this.onAssessmentTypeChange();
    });

    // Also load individual exams as fallback
    this.api.get<any>('exams').subscribe(res => {
      this.examList = res.data?.exams || res.data || [];
    });

    this.api.get<any>('groups').subscribe(res => this.groupList = res.data?.groups || res.data || []);
    this.api.get<any>('subjects').subscribe(res => this.subjectList = res.data?.subjects || res.data || []);
  }

  onExamGroupChange(): void {
    const selectedEG = this.examGroups.find(eg => Number(eg.exam_group_id) === Number(this.selectedExamGroup));
    if (selectedEG) {
      if (selectedEG.exam_type) {
        if (String(selectedEG.exam_type).toLowerCase().includes('final')) {
          this.assessmentType = 'Final';
        } else {
          this.assessmentType = 'Mid';
        }
      }
      const classList = selectedEG.classes || [];
      if (classList.length > 0 && classList[0].group_id) {
        this.selectedClass = String(classList[0].group_id);
      } else {
        this.selectedClass = 'ALL';
      }
      // this.toast.info(`🏛️ Exam Group: ${selectedEG.exam_group_name}`);
    }
    this.loadScores();
  }

  onExamChange(): void {
    const selectedExamObj = this.examList.find(ex => Number(ex.exam_id) === Number(this.selectedExam));
    if (selectedExamObj && selectedExamObj.group_id) {
      this.selectedClass = String(selectedExamObj.group_id);
    }
    this.loadScores();
  }

  loadScores(): void {
    if (!this.selectedExamGroup) {
      this.students = [];
      this.scheduledExams = [];
      this.updateExamSubjects();
      this.emptyStateReason = 'NO_CLASSES_IN_GROUP';
      return;
    }

    const selectedEG = this.examGroups.find(eg => Number(eg.exam_group_id) === Number(this.selectedExamGroup));
    const examGroupClasses: any[] = selectedEG?.classes || [];

    if (examGroupClasses.length === 0) {
      this.students = [];
      this.scheduledExams = [];
      this.updateExamSubjects();
      this.emptyStateReason = 'NO_CLASSES_IN_GROUP';
      return;
    }

    // Step 1: Check if an Exam Schedule has been created for this Exam Group
    this.api.get<any>('exams', { exam_group_id: this.selectedExamGroup }).subscribe({
      next: (examRes) => {
        this.scheduledExams = examRes.data?.exams || examRes.data || [];
        this.updateExamSubjects();
        if (this.scheduledExams.length === 0) {
          this.students = [];
          this.emptyStateReason = 'NOT_SCHEDULED_YET';
          return;
        }

        let targetClasses = examGroupClasses;
        if (this.selectedClass && this.selectedClass !== 'ALL') {
          targetClasses = examGroupClasses.filter(c => Number(c.group_id) === Number(this.selectedClass));
        }

        if (targetClasses.length === 0) {
          this.students = [];
          this.emptyStateReason = 'NO_CLASSES_IN_GROUP';
          return;
        }

        const studentRequests = targetClasses.map((cls: any) =>
          this.api.get<any>('students', { groupId: cls.group_id, group_id: cls.group_id }).toPromise()
        );

        Promise.all(studentRequests).then((responses: any[]) => {
          let allStudents: any[] = [];
          responses.forEach((res: any, idx: number) => {
            const grpStudents: any[] = res?.data?.students || res?.data || [];
            const grpInfo = targetClasses[idx];
            grpStudents.forEach((s: any) => {
              allStudents.push({ ...s, _group_code: s.group_code || grpInfo.group_code });
            });
          });

          if (allStudents.length === 0) {
            this.students = [];
            this.emptyStateReason = 'NO_STUDENTS';
            return;
          }

          this.emptyStateReason = '';

          this.api.get<any>('results', {
            exam_group_id: this.selectedExamGroup,
            group_id: this.selectedClass === 'ALL' ? null : this.selectedClass
          }).subscribe({
            next: (scoreRes) => {
              const existingScores: any[] = scoreRes.data?.results || scoreRes.data || [];
              this.savedResultsList = existingScores;

              this.students = allStudents.map((s: any) => {
                const subject_scores: any = {};
                let firstRemark = '';
                if (this.examSubjects.length > 0) {
                  this.examSubjects.forEach(sub => {
                    const match = existingScores.find((r: any) => Number(r.student_id) === Number(s.student_id) && Number(r.exam_id) === Number(sub.exam_id));
                    if (match) {
                      subject_scores[sub.subject_id] = match.raw_score ?? match.mid_score ?? match.final_score;
                      if (match.remarks && !firstRemark) firstRemark = match.remarks;
                    }
                  });
                }
                const item = {
                  ...s,
                  subject_scores,
                  remarks: firstRemark || s.remarks || ''
                };
                this.recalculate(item);
                return item;
              });
            },
            error: () => {
              this.savedResultsList = [];
              this.students = allStudents.map((s: any) => {
                const item = { ...s, subject_scores: {}, remarks: '' };
                this.recalculate(item);
                return item;
              });
            }
          });
        }).catch(() => {
          this.toast.error('Failed to load students for this Exam Group');
        });
      },
      error: () => {
        this.students = [];
        this.scheduledExams = [];
        this.updateExamSubjects();
        this.emptyStateReason = 'NOT_SCHEDULED_YET';
      }
    });
  }

  validateAndRecalculate(s: any, subjectId?: any): void {
    if (subjectId !== undefined && s.subject_scores) {
      let val = s.subject_scores[subjectId];
      if (val !== null && val !== undefined && val !== '') {
        const numVal = Number(val);
        if (numVal < 0) {
          this.toast.error('ពិន្ទុត្រូវតែចាប់ពី ០ ឡើងទៅ! (Negative scores < 0 are not allowed)');
          s.subject_scores[subjectId] = 0;
        } else if (numVal > 100) {
          this.toast.warning('ពិន្ទុអតិបរមាត្រឹម ១០០!');
          s.subject_scores[subjectId] = 100;
        }
      }
    }

    if (s.mid_score !== null && s.mid_score !== undefined && s.mid_score !== '') {
      const numMid = Number(s.mid_score);
      if (numMid < 0) {
        this.toast.error('ពិន្ទុត្រូវតែចាប់ពី ០ ឡើងទៅ! (Negative scores < 0 are not allowed)');
        s.mid_score = 0;
      } else if (numMid > 100) {
        s.mid_score = 100;
      }
    }

    this.recalculate(s);
  }

  recalculate(s: any): void {
    if (!s.subject_scores) s.subject_scores = {};

    if (this.examSubjects.length > 0) {
      let total = 0;
      let count = 0;
      this.examSubjects.forEach(sub => {
        const val = parseFloat(s.subject_scores[sub.subject_id]);
        if (!isNaN(val)) {
          total += val;
          count++;
        }
      });
      s.avg_score = count > 0 ? (total / count) : 0;
    } else {
      s.avg_score = parseFloat(this.assessmentType === 'Mid' ? s.mid_score : s.final_score) || 0;
    }

    const num = s.avg_score;
    if (num >= 45) { s.letter_grade = 'A'; s.grade_point = 4.0; }
    else if (num >= 40) { s.letter_grade = 'B+'; s.grade_point = 3.5; }
    else if (num >= 35) { s.letter_grade = 'B'; s.grade_point = 3.0; }
    else if (num >= 30) { s.letter_grade = 'C+'; s.grade_point = 2.5; }
    else if (num >= 20) { s.letter_grade = 'C'; s.grade_point = 2.0; }
    else { s.letter_grade = 'F'; s.grade_point = 0.0; }
  }

  autoFillPassScores(): void {
    this.students.forEach(s => {
      if (!s.subject_scores) s.subject_scores = {};
      if (this.examSubjects.length > 0) {
        this.examSubjects.forEach(sub => {
          s.subject_scores[sub.subject_id] = this.assessmentType === 'Mid' ? 35 : 40;
        });
      } else {
        if (this.assessmentType === 'Mid') s.mid_score = 35;
        else s.final_score = 40;
      }
      this.recalculate(s);
    });
    this.toast.info(`Filled default passing ${this.assessmentType === 'Mid' ? 'Mid' : 'Final'} scores for all subjects`);
  }

  get currentUserRole(): string {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return String(u.role || u.user_type || 'ADMIN').toUpperCase();
    } catch (e) {
      return 'ADMIN';
    }
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'SUPER_ADMIN';
  }

  publishScores(): void {
    if (this.students.length === 0) {
      this.toast.warning('No exam data or students to Save & Publish.');
      return;
    }

    let allScoreItems: any[] = [];

    if (this.examSubjects.length > 0) {
      this.students.forEach(s => {
        this.visibleSubjects.forEach(sub => {
          const val = s.subject_scores?.[sub.subject_id];
          if (val !== undefined && val !== null && val !== '') {
            allScoreItems.push({
              student_id: s.student_id,
              exam_id: sub.exam_id,
              raw_score: Number(val),
              remarks: s.remarks || ''
            });
          }
        });
      });
    } else {
      allScoreItems = this.students.map(s => ({
        student_id: s.student_id,
        exam_id: this.selectedExam,
        raw_score: this.assessmentType === 'Mid' ? s.mid_score : s.final_score,
        remarks: s.remarks || ''
      }));
    }

    if (allScoreItems.length === 0) {
      this.toast.warning('Please enter score for at least one subject first.');
      return;
    }

    const payload = {
      exam_id: this.selectedExam || (this.examSubjects[0]?.exam_id),
      assessmentType: this.assessmentType,
      scores: allScoreItems,
      is_published: this.isAdmin ? 1 : 0
    };

    this.api.post('results', payload).subscribe({
      next: () => {
        if (this.isAdmin) {
          this.toast.success(`Saved & Published ${this.assessmentType === 'Mid' ? 'Midterm (Mid)' : 'Final (Final)'} scores successfully! Students can now view their grades.`);
        } else {
          this.toast.success(`Submitted ${this.assessmentType === 'Mid' ? 'Midterm (Mid)' : 'Final (Final)'} scores to Admin for review & publishing!`);
        }
        this.loadScores();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to process scores');
      }
    });
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }
}

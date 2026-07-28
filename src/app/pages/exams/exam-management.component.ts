import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-exam-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Exam Schedule & Exam Group Management'" 
                [subtitle]="'Admin / Exams'"
                [actionLabel]="activeSubTab === 'schedules' ? '+ Schedule New Exam' : '+ Create Exam Group'"
                [actionIcon]="activeSubTab === 'schedules' ? 'fa-solid fa-calendar-plus' : 'fa-solid fa-layer-group'"
                (actionClicked)="onHeaderActionClicked()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Sub-Tabs Switcher -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div class="flex items-center gap-3">
          <button (click)="switchSubTab('schedules')" 
                  [class]="activeSubTab === 'schedules' ? 'px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2' : 'px-5 py-2.5 rounded-xl bg-[#1e293b] text-gray-400 hover:text-white font-bold text-xs border border-[#1f2937] flex items-center gap-2'">
            <i class="fa-solid fa-calendar-days text-sm"></i> Exam Schedules
          </button>
          <button (click)="switchSubTab('groups')" 
                  [class]="activeSubTab === 'groups' ? 'px-5 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2' : 'px-5 py-2.5 rounded-xl bg-[#1e293b] text-gray-400 hover:text-white font-bold text-xs border border-[#1f2937] flex items-center gap-2'">
            <i class="fa-solid fa-users-rectangle text-sm"></i> Exam Groups
          </button>
        </div>

        <span class="text-xs font-semibold text-gray-400">
          • Total Exam Groups: <strong class="text-purple-400">{{ examGroups.length }}</strong> | Total Schedules: <strong class="text-emerald-400">{{ exams.length }}</strong>
        </span>
      </div>

      <!-- TAB 1: EXAM SCHEDULES (WEEKLY TIMETABLE GRID LAYOUT) -->
      <div *ngIf="activeSubTab === 'schedules'" class="space-y-6">
        <!-- Horizontal Filter & Schedule Session Bar -->
        <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-3">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-calendar-plus text-emerald-400"></i> Assign Exam Timetable Slot
            </h3>

            <!-- View Mode Switcher: Grid vs Table -->
            <div class="flex items-center gap-1 bg-[#111827] p-1.5 rounded-xl border border-[#1f2937]">
              <button (click)="scheduleViewMode = 'GRID'" [class]="scheduleViewMode === 'GRID' ? 'px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow' : 'px-3 py-1.5 text-gray-400 hover:text-white font-bold text-xs flex items-center gap-1.5'">
                <i class="fa-solid fa-table-cells"></i> Timetable Grid
              </button>
              <button (click)="scheduleViewMode = 'TABLE'" [class]="scheduleViewMode === 'TABLE' ? 'px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow' : 'px-3 py-1.5 text-gray-400 hover:text-white font-bold text-xs flex items-center gap-1.5'">
                <i class="fa-solid fa-list"></i> Table List
              </button>
            </div>
          </div>

          <form (ngSubmit)="onCreateExam()" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <!-- EXAM GROUP SELECT -->
            <div class="lg:col-span-2">
              <label class="block font-extrabold text-purple-400 mb-1"><i class="fa-solid fa-layer-group text-purple-400 mr-1"></i> SELECT EXAM GROUP *</label>
              <select [(ngModel)]="newExam.exam_group_id" (change)="onExamGroupSelectChange()" name="bar_exam_group_id" required class="w-full bg-[#111827] border border-purple-500/60 text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                <option *ngFor="let eg of examGroups" [value]="eg.exam_group_id">{{ eg.exam_group_code }} — {{ eg.exam_group_name }}</option>
                <option *ngIf="examGroups.length === 0" [value]="null" disabled>No exam groups available</option>
              </select>
            </div>

            <!-- Subject -->
            <div class="lg:col-span-2">
              <label class="block font-bold text-gray-300 mb-1">SUBJECT *</label>
              <select [(ngModel)]="newExam.subject_id" name="bar_subject_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
                <option *ngFor="let sub of filteredSubjects" [value]="sub.subject_id">{{ sub.subject_name }} ({{ sub.subject_code }})</option>
                <option *ngIf="filteredSubjects.length === 0" [value]="null" disabled>-- No subjects available --</option>
              </select>
            </div>

            <!-- Exam Date -->
            <div>
              <label class="block font-bold text-gray-300 mb-1">
                EXAM DATE * <span class="text-[10px] text-purple-400 font-bold ml-1"></span>
              </label>
              <input type="date" [(ngModel)]="newExam.exam_date" name="bar_exam_date" required class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-mono font-bold">
            </div>

            <!-- Start Time -->
            <div>
              <label class="block font-bold text-amber-400 mb-1">EXAM TIME *</label>
              <select [(ngModel)]="newExam.start_time" name="bar_start_time" class="w-full bg-[#111827] border border-amber-500/50 text-xs text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-amber-400">
                <option *ngFor="let slot of filteredExamTimeSlots" [value]="slot.start_time.slice(0, 5)">
                  {{ slot.slot_name }} ({{ slot.start_time.slice(0, 5) }} – {{ slot.end_time.slice(0, 5) }})
                </option>
                <option *ngIf="filteredExamTimeSlots.length === 0" value="08:00">08:00 – 09:30 AM</option>
              </select>
            </div>

            <!-- Room & Submit -->
            <div>
              <label class="block font-bold text-gray-300 mb-1 flex items-center justify-between">
                <span>ROOM *</span>
                <span *ngIf="newExam.room_id" [ngClass]="getRoomStatusById(newExam.room_id).isOccupied ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'" class="text-[10px]">
                  {{ getRoomStatusById(newExam.room_id).isOccupied ? 'BUSY' : 'FREE' }}
                </span>
              </label>
              <div class="flex items-center gap-2">
                <select [(ngModel)]="newExam.room_id" name="bar_room_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                  <option *ngFor="let r of rooms" [value]="r.room_id">
                    {{ r.room_number }} — {{ getRoomStatus(r).statusLabel }}
                  </option>
                </select>
                <button type="submit" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 shrink-0 flex items-center gap-1">
                  <i class="fa-solid fa-check"></i> Save
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- MODE A: WEEKLY EXAM TIMETABLE SCHEDULE GRID -->
        <div *ngIf="scheduleViewMode === 'GRID'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <i class="fa-solid fa-calendar-days text-amber-400"></i> Weekly Exam Timetable Schedule
                </h3>
                <span *ngIf="selectedExamGroupObj" [class]="
                  selectedExamGroupObj.exam_type === 'Final' ? 'px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-800 text-rose-300 text-[10px] font-extrabold font-mono' :
                  'px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-800 text-amber-300 text-[10px] font-extrabold font-mono'
                ">
                  {{ selectedExamGroupObj?.exam_type === 'Final' ? 'Final Exam' : 'Midterm Exam' }} — {{ selectedExamGroupObj?.exam_group_code }}
                </span>
                <span [class]="
                  selectedExamGroupShift === 'AFTERNOON' ? 'px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-800 text-amber-300 text-[10px] font-extrabold font-mono flex items-center gap-1' :
                  (selectedExamGroupShift === 'EVENING' ? 'px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-800 text-indigo-300 text-[10px] font-extrabold font-mono flex items-center gap-1' :
                  'px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-extrabold font-mono flex items-center gap-1')
                ">
                  <i [class]="selectedExamGroupShift === 'AFTERNOON' ? 'fa-solid fa-sun' : (selectedExamGroupShift === 'EVENING' ? 'fa-solid fa-moon' : 'fa-solid fa-sun-plant-wilt')"></i>
                  {{ selectedExamGroupShift === 'AFTERNOON' ? 'Afternoon Shift' : (selectedExamGroupShift === 'EVENING' ? 'Evening Shift' : 'Morning Shift') }}
                </span>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5">Click any free slot to schedule exam, or click assigned slot to delete</p>
            </div>
            
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="status-badge status-badge-active">• {{ exams.length }} Exam Slots Scheduled</span>
            </div>
          </div>

          <!-- Days Header with + Add Button Per Day -->
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-2 items-center">
            <div class="py-1">TIME</div>
            <div *ngFor="let dayObj of [
              { code: 'MONDAY', label: 'MON' },
              { code: 'TUESDAY', label: 'TUE' },
              { code: 'WEDNESDAY', label: 'WED' },
              { code: 'THURSDAY', label: 'THU' },
              { code: 'FRIDAY', label: 'FRI' },
              { code: 'SATURDAY', label: 'SAT' }
            ]" class="flex items-center justify-center gap-1.5 py-1">
              <span>{{ dayObj.label }}</span>
              <button (click)="openScheduleModalForDay(dayObj.code)" [title]="'Add Exam Slot for ' + dayObj.label" class="px-1.5 py-0.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[10px] font-bold transition-all hover:scale-105 flex items-center gap-0.5 shadow-sm">
                <i class="fa-solid fa-plus text-[9px]"></i> Add
              </button>
            </div>
          </div>

          <!-- Dynamic Exam Slots Grid — filtered by Exam Group's shift (filteredExamTimeSlots) -->
          <div *ngFor="let slot of filteredExamTimeSlots" class="grid grid-cols-7 gap-2 text-xs items-center">
            <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-2 rounded-xl border border-[#1f2937]">
              <div class="text-emerald-300 font-extrabold">{{ slot.slot_name }}</div>
              <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }}</div>
            </div>

            <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
              <!-- Assigned Exam Slot -->
              <div *ngIf="getExamSlotForDay(slot, day) as item; else emptyExamSlot" 
                   class="bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/70 hover:border-amber-500 p-2.5 rounded-xl space-y-1.5 relative shadow-sm transition-all group cursor-pointer">
                <div class="flex items-center justify-between gap-1" [title]="item.exam_title + ' - ' + item.subject_name">
                  <p class="font-extrabold text-amber-300 truncate text-xs font-mono tracking-wide group-hover:text-amber-200">{{ item.subject_code }}</p>
                  <button (click)="deleteExam(item)" title="Delete Exam Schedule" class="text-rose-400 hover:text-rose-300 text-[11px]">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
                <p class="text-[10px] text-purple-300 font-bold truncate">
                  {{ item.exam_group_name || item.group_code || item.group_name }}
                </p>
                <div class="flex items-center justify-between text-[9px] pt-0.5">
                  <span class="bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">{{ item.room_number || '101' }}</span>
                  <span class="text-gray-400 font-mono">{{ item.exam_date ? (item.exam_date | date:'d/M') : '' }}</span>
                </div>
              </div>

              <!-- Unassigned / Free Slot (Click to Add / Auto-Fill Form) -->
              <ng-template #emptyExamSlot>
                <div (click)="clickFreeExamSlot(slot, day)" 
                     class="border border-dashed border-gray-800/80 hover:border-emerald-500/80 hover:bg-emerald-950/40 p-2.5 rounded-xl text-center text-gray-500 hover:text-emerald-400 font-bold text-[10px] cursor-pointer transition-all flex flex-col items-center justify-center gap-1 min-h-[58px] group">
                  <span class="group-hover:scale-110 transition-transform text-xs">+ Free</span>
                  <span class="text-[9px] text-gray-600 group-hover:text-emerald-400/80 font-normal">Click to Add</span>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- MODE B: TABLE LIST VIEW -->
        <div *ngIf="scheduleViewMode === 'TABLE'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
            <div>
              <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-list text-emerald-400"></i> Active Exam Schedules List Table
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">Manage conflict-free exam schedules for students and teachers in table format</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-3">EXAM TITLE</th>
                  <th class="pb-3">SUBJECT</th>
                  <th class="pb-3">CLASS GROUP</th>
                  <th class="pb-3">EXAM GROUP</th>
                  <th class="pb-3">SEMESTER & YEAR</th>
                  <th class="pb-3">EXAM DATE</th>
                  <th class="pb-3">TIME (START – END)</th>
                  <th class="pb-3">ROOM</th>
                  <th class="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let ex of exams" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3.5 font-bold text-white">
                    {{ ex.exam_title }}
                    <span class="block text-[10px] font-mono text-gray-400">{{ ex.category }}</span>
                  </td>
                  <td class="py-3.5 text-gray-300 font-semibold">
                    {{ ex.subject_name }}
                    <span class="block text-[10px] text-emerald-400 font-mono">({{ ex.subject_code }})</span>
                  </td>
                  <td class="py-3.5 font-mono text-emerald-300 font-bold">
                    <span class="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs inline-flex items-center gap-1 font-bold">
                      {{ ex.group_code || ex.group_name || 'N/A' }}
                    </span>
                  </td>
                  <td class="py-3.5 font-mono text-purple-300 font-bold">
                    <span *ngIf="ex.exam_group_name" class="px-2 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 text-xs inline-flex items-center gap-1 font-bold">
                      {{ ex.exam_group_name }}
                    </span>
                    <span *ngIf="!ex.exam_group_name" class="text-gray-500 font-normal">-</span>
                  </td>
                  <td class="py-3.5 font-mono text-gray-300">
                    {{ ex.semester || 'Semester 1' }}
                    <span class="block text-[10px] text-gray-500">{{ ex.academic_year || '2025–2026' }}</span>
                  </td>
                  <td class="py-3.5 font-mono text-white font-semibold">{{ ex.exam_date | date:'mediumDate' }}</td>
                  <td class="py-3.5 font-mono text-amber-400 font-bold">
                    {{ ex.start_time ? ex.start_time.slice(0,5) : '08:00' }} – {{ ex.end_time ? ex.end_time.slice(0,5) : '09:30' }}
                  </td>
                  <td class="py-3.5 font-mono text-cyan-400 font-bold">
                    {{ ex.room_number || 'Room 101' }}
                  </td>
                  <td class="py-3.5 text-right">
                    <button (click)="deleteExam(ex)" title="Delete Exam Schedule" class="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs transition-all">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="exams.length === 0">
                  <td colspan="9" class="py-8 text-center text-gray-500 font-bold">
                    No examination schedules found for selected filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: EXAM GROUPS MANAGEMENT -->
      <div *ngIf="activeSubTab === 'groups'" class="space-y-6">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4 flex-wrap gap-3">
            <div>
              <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-users-rectangle text-purple-400"></i> Exam Groups Management
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">Manage exam groups, academic years, semesters, and exam types (Midterm / Final / Rexam).</p>
            </div>
            <button (click)="openCreateExamGroupModal()" class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all active:scale-95">
              <i class="fa-solid fa-plus-circle"></i> + Create Exam Group
            </button>
          </div>

          <!-- Exam Groups List Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <div *ngFor="let eg of examGroups" class="bg-[#111827]/90 border border-[#1f2937] hover:border-purple-500/50 rounded-2xl p-5 space-y-4 transition-all shadow-md">
              <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
                <div>
                  <h4 class="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <i class="fa-solid fa-layer-group text-purple-400"></i> {{ eg.exam_group_name }}
                  </h4>
                  <span class="text-[10px] font-mono text-purple-400 font-bold">CODE: {{ eg.exam_group_code }}</span>
                </div>
                <button (click)="confirmDeleteExamGroup(eg)" title="Delete Exam Group" class="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs transition-all">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <!-- Auto-detected Gen, Semester, Exam Type & Exam Date Range Badges -->
              <div class="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                <span class="px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-800 text-purple-300 font-mono">{{ eg.generation || 'Gen 9' }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-800 text-emerald-300 font-mono">{{ eg.semester || 'Semester 1' }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-800 text-amber-300 font-bold">{{ eg.exam_type || 'Midterm' }}</span>
                <span *ngIf="eg.start_date && eg.end_date" class="px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-800 text-cyan-300 font-mono">
                  {{ eg.start_date | date:'dd/MM/yyyy' }} ➔ {{ eg.end_date | date:'dd/MM/yyyy' }}
                </span>
              </div>

              <div class="space-y-2">
                <span class="text-[11px] font-bold text-gray-400">Assigned Classes ({{ eg.classes?.length || 0 }} classes):</span>
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let c of eg.classes" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                    {{ c.group_code }} ({{ c.group_name }})
                  </span>
                  <span *ngIf="!eg.classes || eg.classes.length === 0" class="text-xs text-gray-500 italic">
                    No classes assigned yet
                  </span>
                </div>
              </div>

              <div class="pt-3 border-t border-[#1f2937] flex items-center justify-between text-xs">
                <span class="text-gray-400 font-medium">{{ eg.description || 'No description' }}</span>
                <button (click)="openExamScheduleForGroup(eg)" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1">
                  <i class="fa-solid fa-calendar-plus"></i> Create Schedule
                </button>
              </div>
            </div>

            <div *ngIf="examGroups.length === 0" class="col-span-full py-12 text-center text-gray-500 font-bold border border-dashed border-[#1f2937] rounded-2xl">
              No exam groups created yet. Click the button above to create a new exam group.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Create Exam Group -->
    <div *ngIf="showCreateExamGroupModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-xl rounded-3xl p-6 space-y-5 text-xs text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-purple-400 text-lg"></i>
            <h3 class="text-base font-extrabold text-white">Create Exam Group</h3>
          </div>
          <button (click)="showCreateExamGroupModal = false" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form (ngSubmit)="onCreateExamGroupSubmit()" class="space-y-4">
          <!-- 1. Select Class Groups FIRST -->
          <div class="space-y-2 bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-2xl">
            <label class="block font-extrabold text-emerald-400 text-xs">
              SELECT CLASS GROUPS *
            </label>
            <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-3 max-h-44 overflow-y-auto space-y-2">
              <label *ngFor="let g of groups" class="flex items-center gap-2.5 p-2 hover:bg-[#1e293b] rounded-xl cursor-pointer transition-colors">
                <input type="checkbox" [checked]="isGroupSelectedInExamGroup(g.group_id)" (change)="toggleGroupInExamGroup(g.group_id)" class="w-4 h-4 accent-emerald-500 rounded">
                <span class="font-mono font-bold text-emerald-300">{{ g.group_code }}</span>
                <span class="text-gray-300 font-semibold">— {{ g.group_name }} (Gen: {{ g.generation || 'Gen 9' }} | Sem {{ g.current_semester || 1 }})</span>
              </label>
            </div>
            <p *ngIf="newExamGroup.class_ids.length > 0" class="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 pt-1">
              <i class="fa-solid fa-circle-check text-emerald-400"></i> Auto-Detected: Gen <strong>{{ newExamGroup.generation }}</strong> | <strong>{{ newExamGroup.semester }}</strong> ({{ newExamGroup.class_ids.length }} classes selected)
            </p>
          </div>

          <!-- 2. Auto-Detected Generation & Semester + Exam Type Selection -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">GENERATION *</label>
              <input type="text" [(ngModel)]="newExamGroup.generation" (input)="updateAutoDetectedExamGroupInfo()" name="eg_gen" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-emerald-400 font-bold font-mono">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">SEMESTER *</label>
              <select [(ngModel)]="newExamGroup.semester" (change)="updateAutoDetectedExamGroupInfo()" name="eg_sem" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-amber-400 mb-1">EXAM TYPE *</label>
              <select [(ngModel)]="newExamGroup.exam_type" (change)="updateAutoDetectedExamGroupInfo()" name="eg_type" class="w-full bg-[#111827] border border-amber-500/50 rounded-xl px-3 py-2.5 text-amber-300 font-extrabold">
                <option value="Midterm">Midterm Exam</option>
                <option value="Final">Final Exam</option>
                <option value="Rexam">Rexam</option>
              </select>
            </div>
          </div>

          <!-- 3. Exam Date Range -->
          <div class="grid grid-cols-2 gap-3 bg-[#111827] p-3 rounded-2xl border border-[#1f2937]">
            <div>
              <label class="block font-bold text-gray-300 mb-1">EXAM START DATE *</label>
              <input type="date" [(ngModel)]="newExamGroup.start_date" name="eg_start_date" required class="w-full bg-[#1e293b] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono font-bold">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">EXAM END DATE *</label>
              <input type="date" [(ngModel)]="newExamGroup.end_date" name="eg_end_date" required class="w-full bg-[#1e293b] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono font-bold">
            </div>
          </div>

          <!-- 4. Exam Group Code & Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">EXAM GROUP CODE *</label>
              <input type="text" [(ngModel)]="newExamGroup.exam_group_code" name="eg_code" required placeholder="e.g. EG-GEN9-S1-MID" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono uppercase font-bold">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">EXAM GROUP NAME *</label>
              <input type="text" [(ngModel)]="newExamGroup.exam_group_name" name="eg_name" required placeholder="e.g. Midterm Exam Group - Gen 9 (Semester 1)" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">DESCRIPTION</label>
            <input type="text" [(ngModel)]="newExamGroup.description" name="eg_desc" placeholder="e.g. Midterm exam group for Gen 9" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showCreateExamGroupModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-600/20 flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Create Exam Group
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Delete Exam Group Confirmation Popup -->
    <div *ngIf="showDeleteExamGroupModal" class="fixed inset-0 z-[20000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in">
      <div class="bg-[#1e293b] border border-rose-500/40 w-full max-w-md rounded-3xl p-6 space-y-5 text-xs text-white shadow-2xl">
        <div class="flex items-center gap-3 border-b border-[#1f2937] pb-3 text-rose-400">
          <div class="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 text-lg shrink-0">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-white">Delete Exam Group?</h3>
            <p class="text-[11px] text-gray-400">Confirm exam group deletion</p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-gray-300 leading-relaxed">
            Are you sure you want to delete exam group <strong class="text-purple-300 font-mono">{{ examGroupToDelete?.exam_group_code }}</strong> — <strong class="text-white">{{ examGroupToDelete?.exam_group_name }}</strong>?
          </p>
          <p class="text-[11px] text-rose-400/90 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50">
            <i class="fa-solid fa-circle-exclamation mr-1"></i> Warning: Deleting this exam group will also unassign associated exam schedules.
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <button (click)="showDeleteExamGroupModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">
            Cancel
          </button>
          <button (click)="executeDeleteExamGroup()" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all active:scale-95">
            <i class="fa-solid fa-trash-can"></i> Delete Exam Group
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Schedule New Examination -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-xl rounded-3xl p-6 space-y-5 text-xs text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div>
            <h3 class="text-base font-extrabold text-emerald-400 flex items-center gap-2">
              <i class="fa-solid fa-calendar-plus"></i> Schedule New Examination
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">Schedule an exam slot for an Exam Group</p>
          </div>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form (ngSubmit)="onCreateExam()" class="space-y-4">
          <!-- Target Selection: Exam Group -->
          <div class="bg-purple-950/40 border border-purple-800/60 p-3.5 rounded-2xl space-y-2">
            <label class="block font-extrabold text-purple-400 text-xs tracking-wide">
              EXAM GROUP *
            </label>
            <select [(ngModel)]="newExam.exam_group_id" (change)="onExamGroupSelectChange()" name="exam_group_id" required class="w-full bg-[#111827] border border-purple-500 text-xs text-white rounded-xl px-3.5 py-2.5 font-bold">
              <option *ngFor="let eg of examGroups" [value]="eg.exam_group_id">
                {{ eg.exam_group_code }} — {{ eg.exam_group_name }} ({{ eg.classes?.length || 0 }} classes)
              </option>
              <option *ngIf="examGroups.length === 0" [value]="null" disabled>No exam groups available</option>
            </select>
          </div>

          <!-- Exam Title & Category -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">EXAM TITLE *</label>
              <input type="text" [(ngModel)]="newExam.exam_title" name="exam_title" required placeholder="e.g. Midterm Examination" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">CATEGORY *</label>
              <select [(ngModel)]="newExam.category" name="category" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
                <option value="Midterm">Midterm Exam</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Rexam">Rexam</option>
                <option value="Quiz">Quiz</option>
                <option value="Monthly Test">Monthly Test</option>
              </select>
            </div>
          </div>

          <!-- Subject -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT *</label>
            <select [(ngModel)]="newExam.subject_id" name="subject_id" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
              <option *ngFor="let sub of filteredSubjects" [value]="sub.subject_id">
                {{ sub.subject_name }} ({{ sub.subject_code }})
              </option>
            </select>
          </div>

          <!-- Exam Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">
                EXAM DATE * <span class="text-[10px] text-purple-400 font-bold ml-1">(Auto: START DATE)</span>
              </label>
              <input type="date" [(ngModel)]="newExam.exam_date" name="exam_date" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono font-bold">
            </div>
            <div>
              <label class="block font-bold text-amber-400 mb-1">EXAM TIME *</label>
              <select [(ngModel)]="newExam.start_time" name="start_time" class="w-full bg-[#111827] border border-amber-500/50 text-xs text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-amber-400">
                <option *ngFor="let slot of filteredExamTimeSlots" [value]="slot.start_time.slice(0, 5)">
                  {{ slot.slot_name }} ({{ slot.start_time.slice(0, 5) }} – {{ slot.end_time.slice(0, 5) }})
                </option>
                <option *ngIf="filteredExamTimeSlots.length === 0" value="08:00">08:00 – 09:30 AM</option>
              </select>
            </div>
          </div>

          <!-- Room -->
          <div>
            <label class="block font-bold text-gray-300 mb-1 flex items-center justify-between">
              <span>EXAM ROOM ASSIGNMENT *</span>
              <span *ngIf="newExam.room_id" [ngClass]="getRoomStatusById(newExam.room_id).isOccupied ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'" class="text-[10px]">
                {{ getRoomStatusById(newExam.room_id).isOccupied ? 'BUSY' : 'AVAILABLE' }}
              </span>
            </label>
            <select [(ngModel)]="newExam.room_id" name="room_id" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
              <option *ngFor="let rm of rooms" [value]="rm.room_id">
                {{ rm.room_number }} — {{ rm.building }} ({{ getRoomStatus(rm).statusLabel }})
              </option>
            </select>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExamManagementComponent implements OnInit {
  activeSubTab: 'schedules' | 'groups' = 'schedules';
  scheduleViewMode: 'GRID' | 'TABLE' = 'GRID';

  exams: any[] = [];
  examGroups: any[] = [];
  subjects: any[] = [];
  groups: any[] = [];
  rooms: any[] = [];
  curriculumHierarchy: any[] = [];

  slots: any[] = []; // Loaded live from /timetables/slots API
  selectedExamGroupShift: string = 'MORNING'; // Auto-detected from selected exam group's classes

  get filteredExamTimeSlots(): any[] {
    if (!this.slots || !this.slots.length) return [];
    const shiftUpper = String(this.selectedExamGroupShift || 'MORNING').toUpperCase();
    const matched = this.slots.filter(s => String(s.shift || 'MORNING').toUpperCase() === shiftUpper);
    // Fallback: if no slots match this shift, return all slots
    return matched.length > 0 ? matched : this.slots;
  }

  getRoomStatus(rm: any): { isOccupied: boolean, statusLabel: string, occupiedBy: string } {
    if (!rm || !this.newExam || !this.newExam.exam_date || !this.newExam.start_time) {
      return { isOccupied: false, statusLabel: 'AVAILABLE', occupiedBy: '' };
    }

    const targetDate = String(this.newExam.exam_date).slice(0, 10);
    const targetTime = String(this.newExam.start_time).slice(0, 5);

    const conflictingExam = this.exams.find(e =>
      Number(e.room_id) === Number(rm.room_id) &&
      e.exam_date && String(e.exam_date).slice(0, 10) === targetDate &&
      e.start_time && String(e.start_time).slice(0, 5) === targetTime &&
      e.exam_id !== this.newExam.exam_id
    );

    if (conflictingExam) {
      const groupCode = conflictingExam.group_code || conflictingExam.exam_group_code || 'Class Group';
      const subjectName = conflictingExam.subject_code || conflictingExam.subject_name || 'Exam';
      return {
        isOccupied: true,
        statusLabel: `BUSY (: ${groupCode} - ${subjectName})`,
        occupiedBy: `${groupCode} (${subjectName})`
      };
    }

    return { isOccupied: false, statusLabel: 'AVAILABLE', occupiedBy: '' };
  }

  getRoomStatusById(roomId: any): { isOccupied: boolean, statusLabel: string, occupiedBy: string } {
    const rm = this.rooms.find(r => Number(r.room_id) === Number(roomId));
    return this.getRoomStatus(rm);
  }

  showModal = false;
  showCreateExamGroupModal = false;
  showDeleteExamGroupModal = false;
  examGroupToDelete: any = null;

  scheduleTargetMode: 'EXAM_GROUP' | 'CLASS_GROUP' = 'EXAM_GROUP';
  selectedFilterGroupId: any = 'ALL';
  selectedFilterExamGroupId: any = 'ALL';
  selectedGroup: any = null;
  selectedExamGroupObj: any = null;
  filteredSubjects: any[] = [];

  newExamGroup: any = {
    exam_group_code: '',
    exam_group_name: '',
    generation: 'Gen 9',
    semester: 'Semester 1',
    exam_type: 'Midterm',
    start_date: '',
    end_date: '',
    description: '',
    class_ids: []
  };

  newExam: any = {
    exam_title: 'Midterm Examination',
    category: 'Midterm',
    semester: 'Semester 1',
    academic_year: '2025–2026',
    subject_id: null,
    group_id: null,
    exam_group_id: null,
    room_id: null,
    exam_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    start_time: '08:00',
    end_time: '09:30',
    duration_minutes: 90,
    status: 'Active'
  };

  constructor(private api: ApiService, public toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadExamGroups();
  }

  onHeaderActionClicked(): void {
    if (this.activeSubTab === 'schedules') {
      this.openScheduleModal('Midterm');
    } else {
      this.openCreateExamGroupModal();
    }
  }

  openCreateExamGroupModal(): void {
    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    this.newExamGroup = {
      exam_group_code: '',
      exam_group_name: '',
      generation: 'Gen 9',
      semester: 'Semester 1',
      exam_type: 'Midterm',
      start_date: startDate,
      end_date: endDate,
      description: '',
      class_ids: []
    };
    if (this.groups.length > 0) {
      this.newExamGroup.class_ids = [this.groups[0].group_id];
      this.updateAutoDetectedExamGroupInfo();
    }
    this.showCreateExamGroupModal = false;
    setTimeout(() => this.showCreateExamGroupModal = true, 50);
  }

  openScheduleModal(category: string): void {
    this.newExam.category = category;
    this.newExam.exam_title = category === 'Midterm' ? 'Midterm Examination' : (category === 'Rexam' ? 'Re-Exam (Rexam)' : 'Final Examination');
    this.showModal = true;

    if (this.examGroups.length > 0) {
      this.scheduleTargetMode = 'EXAM_GROUP';
      this.newExam.exam_group_id = this.examGroups[0].exam_group_id;
      this.onExamGroupSelectChange();
    } else if (this.groups.length > 0) {
      this.scheduleTargetMode = 'CLASS_GROUP';
      this.newExam.group_id = this.groups[0].group_id;
      this.onGroupChange();
    }
  }

  onFilterExamGroupChange(): void {
    if (this.selectedFilterExamGroupId !== 'ALL') {
      this.selectedFilterGroupId = 'ALL';
      this.scheduleTargetMode = 'EXAM_GROUP';
      this.newExam.exam_group_id = this.selectedFilterExamGroupId;
      this.onExamGroupSelectChange();
    }
    this.loadExams();
  }

  onFilterGroupChange(): void {
    if (this.selectedFilterGroupId !== 'ALL') {
      this.selectedFilterExamGroupId = 'ALL';
      this.scheduleTargetMode = 'CLASS_GROUP';
      this.newExam.group_id = this.selectedFilterGroupId;
      this.onGroupChange();
    }
    this.loadExams();
  }

  openScheduleModalForDay(day: string): void {
    this.openScheduleModal('Midterm');
    this.toast.info(`Scheduling exam for ${day}!`);
  }

  clickFreeExamSlot(slot: any, day: string): void {
    this.newExam.start_time = slot.start_time.slice(0, 5);
    this.openScheduleModal('Midterm');
  }

  getExamDayOfWeek(examDateStr: string): string {
    if (!examDateStr) return 'MONDAY';
    const d = new Date(examDateStr);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[d.getDay()] || 'MONDAY';
  }

  getExamSlotForDay(slot: any, day: string): any {
    const activeEgId = (this.selectedFilterExamGroupId && this.selectedFilterExamGroupId !== 'ALL')
      ? this.selectedFilterExamGroupId
      : this.newExam.exam_group_id;

    return this.exams.find(ex => {
      if (activeEgId && Number(ex.exam_group_id) !== Number(activeEgId)) {
        return false;
      }
      const exDay = this.getExamDayOfWeek(ex.exam_date);
      const exTime = ex.start_time ? ex.start_time.slice(0, 5) : '08:00';
      const slotTime = slot.start_time.slice(0, 5);
      return exDay === day && exTime === slotTime;
    });
  }

  openExamScheduleForGroup(eg: any): void {
    this.activeSubTab = 'schedules';
    this.scheduleTargetMode = 'EXAM_GROUP';
    this.newExam.exam_group_id = eg.exam_group_id;
    this.newExam.category = eg.exam_type === 'Final' ? 'Final Exam' : (eg.exam_type === 'Rexam' ? 'Rexam' : 'Midterm');
    this.newExam.exam_title = eg.exam_type === 'Final' ? 'Final Examination' : (eg.exam_type === 'Rexam' ? 'Re-Exam (Rexam)' : 'Midterm Examination');
    this.showModal = true;
    this.onExamGroupSelectChange();
  }

  onModeChange(): void {
    if (this.scheduleTargetMode === 'EXAM_GROUP') {
      this.newExam.group_id = null;
      if (this.examGroups.length > 0 && !this.newExam.exam_group_id) {
        this.newExam.exam_group_id = this.examGroups[0].exam_group_id;
      }
      this.onExamGroupSelectChange();
    } else {
      this.newExam.exam_group_id = null;
      if (this.groups.length > 0 && !this.newExam.group_id) {
        this.newExam.group_id = this.groups[0].group_id;
      }
      this.onGroupChange();
    }
  }

  loadExamGroups(): void {
    this.api.get<any>('exams/groups').subscribe({
      next: (res) => {
        this.examGroups = res.data?.exam_groups || res.data || [];
        if (this.examGroups.length > 0 && !this.newExam.exam_group_id) {
          this.newExam.exam_group_id = this.examGroups[0].exam_group_id;
          this.onExamGroupSelectChange();
        }
      }
    });
  }

  isGroupSelectedInExamGroup(groupId: number): boolean {
    return this.newExamGroup.class_ids.includes(groupId);
  }

  toggleGroupInExamGroup(groupId: number): void {
    const idx = this.newExamGroup.class_ids.indexOf(groupId);
    if (idx > -1) {
      this.newExamGroup.class_ids.splice(idx, 1);
    } else {
      this.newExamGroup.class_ids.push(groupId);
    }
    this.updateAutoDetectedExamGroupInfo();
  }

  updateAutoDetectedExamGroupInfo(): void {
    if (this.newExamGroup.class_ids.length > 0) {
      const selectedGroups = this.groups.filter(g => this.newExamGroup.class_ids.includes(g.group_id));
      if (selectedGroups.length > 0) {
        const firstGroup = selectedGroups[0];
        if (firstGroup.generation) {
          this.newExamGroup.generation = firstGroup.generation;
        }
        if (firstGroup.current_semester) {
          this.newExamGroup.semester = `Semester ${firstGroup.current_semester}`;
        }

        const genShort = (this.newExamGroup.generation || 'Gen9').replace(/\s+/g, '').toUpperCase();
        const semNum = firstGroup.current_semester || 1;
        const typeShort = (this.newExamGroup.exam_type || 'Midterm').toUpperCase();
        const nextIdx = String(this.examGroups.length + 1).padStart(2, '0');

        this.newExamGroup.exam_group_code = `EG-${genShort}-S${semNum}-${typeShort}-${nextIdx}`;
        this.newExamGroup.exam_group_name = `Exam Group ${this.newExamGroup.exam_type} - ${this.newExamGroup.generation} (Semester ${semNum}) #${nextIdx}`;
      }
    }
  }

  switchSubTab(tab: 'schedules' | 'groups'): void {
    this.activeSubTab = tab;
    this.loadExamGroups();
    this.loadExams();
  }

  onCreateExamGroupSubmit(): void {
    if (!this.newExamGroup.exam_group_code || !this.newExamGroup.exam_group_name) {
      this.toast.error('Please enter Exam Group Code and Name!');
      return;
    }

    this.api.post('exams/groups', this.newExamGroup).subscribe({
      next: () => {
        this.toast.success('Exam group created successfully!');
        this.showCreateExamGroupModal = false;
        this.newExamGroup = { exam_group_code: '', exam_group_name: '', generation: 'Gen 9', semester: 'Semester 1', exam_type: 'Midterm', start_date: '', end_date: '', description: '', class_ids: [] };
        this.loadExamGroups();
        this.loadExams();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create exam group')
    });
  }

  confirmDeleteExamGroup(eg: any): void {
    this.examGroupToDelete = eg;
    this.showDeleteExamGroupModal = true;
  }

  executeDeleteExamGroup(): void {
    if (!this.examGroupToDelete) return;
    const egId = this.examGroupToDelete.exam_group_id;
    this.api.delete(`exams/groups/${egId}`).subscribe({
      next: () => {
        this.toast.success('Exam group deleted successfully!');
        this.showDeleteExamGroupModal = false;
        this.examGroupToDelete = null;
        this.loadExamGroups();
        this.loadExams();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete exam group')
    });
  }

  loadDropdowns(): void {
    this.api.get<any>('subjects').subscribe(res => {
      this.subjects = res.data?.subjects || res.data || [];
      this.filteredSubjects = [...this.subjects];
    });

    this.api.get<any>('curriculums/hierarchy').subscribe(res => {
      this.curriculumHierarchy = res.data?.hierarchy || [];
    });

    this.api.get<any>('groups').subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
      if (this.groups.length > 0 && !this.newExam.group_id) {
        this.newExam.group_id = this.groups[0].group_id;
      }
      this.loadExams();
    });

    this.api.get<any>('rooms').subscribe(res => {
      this.rooms = res.data?.rooms || res.data || [];
      if (this.rooms.length > 0 && !this.newExam.room_id) {
        this.newExam.room_id = this.rooms[0].room_id;
      }
    });

    // Load Time Slots from Manage Time Slots API (ទាញ Time Slots ពី /timetables/slots)
    this.api.get<any>('timetables/slots').subscribe(res => {
      this.slots = res.data?.slots || res.data || [];
      // Auto-select the first slot matching current shift
      if (this.slots.length > 0 && !this.newExam.start_time) {
        this.newExam.start_time = this.slots[0].start_time.slice(0, 5);
      }
    });
  }

  onExamGroupSelectChange(): void {
    if (!this.newExam.exam_group_id) return;
    this.selectedFilterExamGroupId = this.newExam.exam_group_id;
    this.loadExams();

    this.selectedExamGroupObj = this.examGroups.find(eg => Number(eg.exam_group_id) === Number(this.newExam.exam_group_id));
    if (this.selectedExamGroupObj) {
      const rawStartDate = this.selectedExamGroupObj.start_date || this.selectedExamGroupObj.exam_start_date;
      if (rawStartDate) {
        if (typeof rawStartDate === 'string') {
          this.newExam.exam_date = rawStartDate.slice(0, 10);
        } else {
          this.newExam.exam_date = new Date(rawStartDate).toISOString().slice(0, 10);
        }
      }
      if (this.selectedExamGroupObj.exam_type) {
        this.newExam.category = this.selectedExamGroupObj.exam_type;
      }
      this.newExam.exam_title = `${this.selectedExamGroupObj.exam_type || 'Exam'} - ${this.selectedExamGroupObj.exam_group_code}`;

      const classList = this.selectedExamGroupObj.classes || [];
      if (classList.length > 0) {
        const groupDetails = classList.map((c: any) => this.groups.find(g => Number(g.group_id) === Number(c.group_id))).filter(Boolean);

        // Auto-detect Class Study Shift (ម៉ោងដែលថ្នាក់គាត់រៀន)
        const firstGrp = groupDetails[0] || classList[0];
        if (firstGrp) {
          const shiftStr = String(firstGrp.shift || '').toUpperCase();
          if (shiftStr.includes('AFTERNOON')) {
            this.selectedExamGroupShift = 'AFTERNOON';
          } else if (shiftStr.includes('EVENING')) {
            this.selectedExamGroupShift = 'EVENING';
          } else {
            this.selectedExamGroupShift = 'MORNING';
          }
          // Auto-select first time slot matching this shift
          const matchingSlots = this.slots.filter(s => String(s.shift || 'MORNING').toUpperCase() === this.selectedExamGroupShift);
          if (matchingSlots.length > 0) {
            this.newExam.start_time = matchingSlots[0].start_time.slice(0, 5);
          } else if (this.slots.length > 0) {
            this.newExam.start_time = this.slots[0].start_time.slice(0, 5);
          }
        }

        let matchingSubjects: any[] = [];

        for (const grp of groupDetails) {
          const sem = Number(grp.current_semester || 1);
          const programId = grp.program_id ? Number(grp.program_id) : null;
          const programCode = grp.program_code || null;

          let grpSubjects: any[] = [];
          if (this.curriculumHierarchy.length > 0) {
            for (const fac of this.curriculumHierarchy) {
              for (const prog of fac.programs || []) {
                const matchProg = (programId && Number(prog.program_id) === programId) || (programCode && prog.program_code === programCode);
                if (matchProg && prog.subjects) {
                  const sList = prog.subjects.filter((sub: any) =>
                    Number(sub.semester_id || sub.semester_number || sub.semester || 1) === sem
                  );
                  grpSubjects.push(...sList);
                }
              }
            }
          }

          if (grpSubjects.length === 0) {
            grpSubjects = this.subjects.filter(sub => {
              const subSem = Number(sub.semester_id || sub.semester_number || sub.semester || 1);
              const matchSem = subSem === sem;
              const matchProg = !programId || !sub.program_id || Number(sub.program_id) === programId;
              return matchSem && matchProg;
            });
          }

          matchingSubjects.push(...grpSubjects);
        }

        const uniqueSubMap = new Map();
        matchingSubjects.forEach(sub => {
          if (sub && sub.subject_id) {
            uniqueSubMap.set(sub.subject_id, sub);
          }
        });

        this.filteredSubjects = Array.from(uniqueSubMap.values());
      } else {
        this.filteredSubjects = [...this.subjects];
      }
    } else {
      this.filteredSubjects = [...this.subjects];
    }

    if (this.filteredSubjects.length > 0) {
      this.newExam.subject_id = this.filteredSubjects[0].subject_id;
    } else {
      this.newExam.subject_id = null;
    }
  }

  onGroupChange(): void {
    if (!this.newExam.group_id) return;
    this.selectedGroup = this.groups.find(g => Number(g.group_id) === Number(this.newExam.group_id));
    if (this.selectedGroup) {
      const sem = Number(this.selectedGroup.current_semester || 1);
      this.newExam.semester = `Semester ${sem}`;
      const programId = this.selectedGroup.program_id ? Number(this.selectedGroup.program_id) : null;
      const programCode = this.selectedGroup.program_code || null;

      let hierarchySubjects: any[] = [];
      if (this.curriculumHierarchy.length > 0) {
        for (const fac of this.curriculumHierarchy) {
          for (const prog of fac.programs || []) {
            const matchProg = (programId && Number(prog.program_id) === programId) || (programCode && prog.program_code === programCode);
            if (matchProg && prog.subjects) {
              hierarchySubjects = prog.subjects.filter((sub: any) =>
                Number(sub.semester_id || sub.semester_number || sub.semester || 1) === sem
              );
            }
          }
        }
      }

      if (hierarchySubjects.length > 0) {
        this.filteredSubjects = hierarchySubjects;
      } else {
        this.filteredSubjects = this.subjects.filter(sub => {
          const subSem = Number(sub.semester_id || sub.semester_number || sub.semester || 1);
          const matchSem = subSem === sem;
          const matchProg = !programId || !sub.program_id || Number(sub.program_id) === programId;
          return matchSem && matchProg;
        });
      }

      if (this.filteredSubjects.length > 0) {
        this.newExam.subject_id = this.filteredSubjects[0].subject_id;
      } else {
        this.newExam.subject_id = null;
      }
    }
  }

  loadExams(): void {
    const params: any = {};
    if (this.selectedFilterExamGroupId && this.selectedFilterExamGroupId !== 'ALL') {
      params.exam_group_id = this.selectedFilterExamGroupId;
    } else if (this.selectedFilterGroupId && this.selectedFilterGroupId !== 'ALL') {
      params.group_id = this.selectedFilterGroupId;
    }

    this.api.get<any>('exams', params).subscribe({
      next: (res) => {
        this.exams = res.data?.exams || res.data || [];
      }
    });
  }

  onCreateExam(): void {
    if (this.scheduleTargetMode === 'EXAM_GROUP' && !this.newExam.exam_group_id) {
      this.toast.error('Please select an Exam Group!');
      return;
    }
    if (this.scheduleTargetMode === 'CLASS_GROUP' && !this.newExam.group_id) {
      this.toast.error('Please select a Class Group!');
      return;
    }
    if (!this.newExam.subject_id || !this.newExam.exam_date) {
      this.toast.error('Please select Subject and Exam Date!');
      return;
    }

    if (this.newExam.room_id) {
      const roomStatus = this.getRoomStatusById(this.newExam.room_id);
      if (roomStatus.isOccupied) {
        this.toast.error(`Selected Room is BUSY (${roomStatus.occupiedBy}). Please choose another room or change exam date/time!`);
        return;
      }
    }

    const payload = {
      ...this.newExam,
      group_id: this.scheduleTargetMode === 'CLASS_GROUP' ? this.newExam.group_id : null,
      exam_group_id: this.scheduleTargetMode === 'EXAM_GROUP' ? this.newExam.exam_group_id : null
    };

    this.api.post('exams', payload).subscribe({
      next: () => {
        this.toast.success('Exam schedule created successfully!');
        this.showModal = false;
        this.loadExams();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create exam schedule');
      }
    });
  }

  deleteExam(ex: any): void {
    this.confirmService.confirm({
      title: 'Delete Exam Schedule?',
      message: `Are you sure you want to delete exam schedule "${ex.exam_title}" (${ex.exam_date ? ex.exam_date.slice(0, 10) : ''})?`,
      confirmText: 'Yes, Delete Exam',
      onConfirm: () => {
        this.api.delete(`exams/${ex.exam_id}`).subscribe({
          next: () => {
            this.toast.success(`Exam schedule '${ex.exam_title}' deleted successfully!`);
            this.loadExams();
          },
          error: (err) => this.toast.error(err.error?.message || 'Failed to delete exam schedule')
        });
      }
    });
  }
}

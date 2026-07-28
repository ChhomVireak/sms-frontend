import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-timetable-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="isTeacherView ? 'My Teaching Timetable' : 'Timetable Management'" 
                [subtitle]="isTeacherView ? 'Teacher Portal / Schedule' : 'Admin / Timetable'"
                [actionLabel]="isTeacherView ? '' : '+ New Time Slot'"
                [actionIcon]="'fa-solid fa-clock-rotate-left'"
                (actionClicked)="showSlotModal = true"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">
      <!-- Assign Timetable Class Slot Horizontal Top Bar (Admin Only) -->
      <div *ngIf="!isTeacherView" class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-2.5">
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-calendar-plus text-emerald-400"></i> Assign Timetable Class Slot
            </h3>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
              <i class="fa-solid fa-repeat"></i> 1 Full Semester Recurrence
            </span>
          </div>
          <span class="text-xs text-gray-400 font-semibold">• Weekly schedule applies for the full semester</span>
        </div>

        <form (ngSubmit)="onSaveSlot()" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
          <!-- 1. Class -->
          <div>
            <label class="block font-bold text-emerald-400 mb-1">CLASS *</label>
            <select [(ngModel)]="form.group_id" (change)="onClassChange()" name="group_id" class="w-full bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-400">
              <option *ngFor="let g of groups" [value]="g.group_id">
                {{ g.group_code }} — {{ g.group_name }}
              </option>
            </select>
          </div>

          <!-- 2. Teacher -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">TEACHER *</label>
            <select [(ngModel)]="form.teacher_id" (change)="onTeacherChange()" name="teacher_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500">
              <option *ngFor="let t of filteredTeachers" [value]="t.teacher_id">
                {{ t.first_name }} {{ t.last_name }}
              </option>
            </select>
          </div>

          <!-- 3. Subject -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT *</label>
            <select [(ngModel)]="form.subject_id" (change)="onSubjectChange()" name="subject_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500">
              <option *ngFor="let s of subjects" [value]="s.subject_id">
                {{ s.subject_name }} ({{ s.subject_code }})
              </option>
            </select>
          </div>

          <!-- 4. Day of Week -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">DAY *</label>
            <select [(ngModel)]="form.day_of_week" name="day_of_week" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold">
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
            </select>
          </div>

          <!-- 5. Time Slot -->
          <div>
            <label class="block font-bold text-amber-400 mb-1">TIME SLOT *</label>
            <select [(ngModel)]="form.slot_id" name="slot_id" class="w-full bg-[#111827] border border-amber-500/50 text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-amber-400">
              <option *ngFor="let slot of filteredSlots" [value]="slot.slot_id">
                [{{ slot.shift || 'MORNING' }}] {{ slot.slot_name }} ({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})
              </option>
            </select>
          </div>

          <!-- 6. Room -->
          <div>
            <label class="block font-bold text-gray-300 mb-1">ROOM *</label>
            <select [(ngModel)]="form.room_id" name="room_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold">
              <option *ngFor="let r of rooms" [value]="r.room_id">
                {{ r.room_number }} ({{ r.building || 'Main' }})
              </option>
            </select>
          </div>

          <!-- 7. Save Action Button -->
          <div>
            <button type="submit" class="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1">
              <i class="fa-solid fa-plus"></i> Assign Slot
            </button>
          </div>
        </form>
      </div>

      <!-- Teacher Master Timetable Control Bar -->
      <div *ngIf="isTeacherView" class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-emerald-400"></i> My Master Personal Timetable
          </h3>
          <p class="text-xs text-gray-400 mt-1">Consolidated weekly schedule across all your assigned class groups</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-bold text-gray-300">Class Filter:</label>
          <select [(ngModel)]="selectedTeacherGroupId" (change)="loadTimetables()" class="bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-emerald-400">
            <option value="ALL">All My Taught Class Groups</option>
            <option *ngFor="let g of groups" [value]="g.group_id">
              {{ g.group_code }} — {{ g.group_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Weekly Timetable Grid (Full Width) -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <i class="fa-solid fa-calendar-days text-emerald-400"></i> Weekly Timetable Schedule
                </h3>
                <span class="px-2.5 py-0.5 rounded-full bg-purple-950/90 border border-purple-800 text-purple-300 text-[10px] font-extrabold font-mono">
                  Semester {{ selectedGroupSemester }}
                </span>
                <span [class]="
                  selectedGroupShift === 'AFTERNOON' ? 'px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-800 text-amber-300 text-[10px] font-extrabold font-mono flex items-center gap-1' :
                  (selectedGroupShift === 'EVENING' ? 'px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-800 text-indigo-300 text-[10px] font-extrabold font-mono flex items-center gap-1' :
                  'px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-extrabold font-mono flex items-center gap-1')
                ">
                  <i [class]="
                    selectedGroupShift === 'AFTERNOON' ? 'fa-solid fa-sun text-amber-400' :
                    (selectedGroupShift === 'EVENING' ? 'fa-solid fa-moon text-indigo-400' :
                    'fa-solid fa-sun-plant-wilt text-emerald-400')
                  "></i>
                  {{ selectedGroupShift === 'AFTERNOON' ? 'Afternoon Shift' : (selectedGroupShift === 'EVENING' ? 'Evening Shift' : 'Morning Shift') }}
                </span>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5">Weekly timetable schedule configured for full semester (MON – SAT)</p>
            </div>
            
            <div class="flex items-center gap-2.5 flex-wrap">
             

              <span class="status-badge status-badge-active">• {{ timetables.length }} Slots Scheduled</span>
              
              <button *ngIf="!isTeacherView && timetables.length > 0" (click)="clearClassTimetable()" class="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md">
                <i class="fa-solid fa-trash-can"></i> Clear Class Schedule
              </button>
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
              <button *ngIf="!isTeacherView" (click)="openAssignSlotModalForDay(dayObj.code)" [title]="'Add Schedule Slot for ' + dayObj.label" class="px-1.5 py-0.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[10px] font-bold transition-all hover:scale-105 flex items-center gap-0.5 shadow-sm">
                <i class="fa-solid fa-plus text-[9px]"></i> Add
              </button>
            </div>
          </div>

          <!-- Dynamic Slots Grid -->
          <div *ngFor="let slot of filteredSlots" class="grid grid-cols-7 gap-2 text-xs items-center">
            <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-2 rounded-xl border border-[#1f2937] relative group">
              <button *ngIf="!isTeacherView" (click)="deleteTimeSlotDefinition(slot)" title="Delete Time Slot (លុបម៉ោងសរុបដែលបង្កើតខុស)" class="absolute -top-1.5 -left-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-md opacity-80 group-hover:opacity-100 transition-all">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <div class="text-emerald-300 font-extrabold">{{ slot.slot_name }}</div>
              <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }}</div>
            </div>

            <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
              <!-- Assigned Slot (Click to Edit / Delete for Admin) -->
              <div *ngIf="getSlotForDay(slot.slot_id, day) as item; else emptySlot" 
                   (click)="!isTeacherView ? openEditSlotModal(item) : null"
                   class="bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/80 hover:border-emerald-500 p-2.5 rounded-xl space-y-1 relative shadow-sm cursor-pointer transition-all group">
                <div [title]="item.subject_name + ' (' + (item.subject_code || 'CODE') + ')'">
                  <p class="font-extrabold text-emerald-300 truncate text-xs font-mono tracking-wide group-hover:text-emerald-200">📘 {{ item.subject_code }}</p>
                  <p class="text-[10px] text-white truncate font-bold">{{ item.subject_name }}</p>
                </div>
                <p class="text-[10px] text-amber-400 truncate font-semibold font-mono">👥 {{ item.group_code || item.group_name }}</p>
                <div class="flex items-center justify-between text-[9px] pt-0.5">
                  <span class="bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">🚪 Room {{ item.room_number }}</span>
                  <span class="text-gray-400 font-mono">Sem {{ item.semester_id || 1 }}</span>
                </div>
              </div>

              <!-- Unassigned / Free Slot -->
              <ng-template #emptySlot>
                <div (click)="!isTeacherView ? clickFreeSlot(slot.slot_id, day) : null" 
                     [ngClass]="{'cursor-pointer hover:border-emerald-500/80 hover:bg-emerald-950/40': !isTeacherView}"
                     class="border border-dashed border-gray-800/80 p-2.5 rounded-xl text-center text-gray-500 font-bold text-[10px] flex flex-col items-center justify-center gap-1 min-h-[58px] group">
                  <span class="text-xs text-gray-600 font-mono">{{ isTeacherView ? '—' : '+ Free' }}</span>
                </div>
              </ng-template>
          </div>
        </div>
      </div>

    <!-- Edit / Delete Timetable Slot Modal -->
    <div *ngIf="showEditSlotModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            ✏️ Edit / Delete Timetable Slot
          </h3>
          <button (click)="showEditSlotModal = false" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form (ngSubmit)="onUpdateSlot()" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-gray-300 mb-1">CLASS</label>
            <input type="text" [value]="editingSlot.group_code + ' — ' + editingSlot.group_name" disabled class="w-full bg-[#111827] border border-[#1f2937] text-gray-400 font-bold rounded-xl px-3 py-2.5">
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">TEACHER *</label>
            <select [(ngModel)]="editingSlot.teacher_id" (change)="onModalTeacherChange()" name="modal_teacher_id" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
              <option *ngFor="let t of filteredTeachers" [value]="t.teacher_id">{{ t.first_name }} {{ t.last_name }} ({{ t.specialization || 'Teacher' }})</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT *</label>
            <select [(ngModel)]="editingSlot.subject_id" name="modal_subject_id" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
              <option *ngFor="let s of subjects" [value]="s.subject_id">
                {{ s.subject_name }} ({{ s.subject_code }}) — {{ getAssignedTeacherName(s) }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">DAY *</label>
              <select [(ngModel)]="editingSlot.day_of_week" name="modal_day_of_week" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2.5">
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">TIME SLOT *</label>
              <select [(ngModel)]="editingSlot.slot_id" name="modal_slot_id" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2.5">
                <option *ngFor="let slot of slots" [value]="slot.slot_id">{{ slot.slot_name }} ({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">ROOM *</label>
            <select [(ngModel)]="editingSlot.room_id" name="modal_room_id" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2.5">
              <option *ngFor="let r of rooms" [value]="r.room_id">{{ r.room_number }} ({{ r.building || 'Main' }})</option>
            </select>
          </div>

          <div class="pt-3 flex items-center justify-between gap-3 border-t border-[#1f2937]">
            <button type="button" (click)="onDeleteSlotFromModal()" class="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-trash-can"></i> Delete Slot
            </button>
            <div class="flex items-center gap-2">
              <button type="button" (click)="showEditSlotModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                <i class="fa-solid fa-check"></i> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Timetable Class Slot Modal -->
    <div *ngIf="showAssignSlotModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-lg rounded-3xl p-6 space-y-5 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-calendar-plus text-emerald-400 text-lg"></i>
            <h3 class="text-base font-extrabold text-white">Assign Timetable Class Slot</h3>
          </div>
          <button (click)="showAssignSlotModal = false" class="text-gray-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form (ngSubmit)="saveSlotFromModal()" class="space-y-4">
          <div>
            <label class="block font-bold text-emerald-400 mb-1">CLASS *</label>
            <select [(ngModel)]="form.group_id" (change)="onClassChange()" name="modal_group_id" class="w-full bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-emerald-400">
              <option *ngFor="let g of groups" [value]="g.group_id">
                {{ g.group_code }} — {{ g.group_name }} (Sem {{ g.current_semester || 1 }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">TEACHER *</label>
            <select [(ngModel)]="form.teacher_id" (change)="onTeacherChange()" name="modal_teacher_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 font-bold">
              <option *ngFor="let t of filteredTeachers" [value]="t.teacher_id">{{ t.first_name }} {{ t.last_name }} ({{ t.specialization || 'Teacher' }})</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT *</label>
            <select [(ngModel)]="form.subject_id" (change)="onSubjectChange()" name="modal_subject_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
              <option *ngFor="let s of subjects" [value]="s.subject_id">
                {{ s.subject_name }} ({{ s.subject_code }}) — {{ getAssignedTeacherName(s) }}
              </option>
              <option *ngIf="subjects.length === 0" [value]="null" disabled>-- No subjects available for Semester {{ selectedGroupSemester }} --</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">DAY *</label>
              <select [(ngModel)]="form.day_of_week" name="modal_day_of_week" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">TIME SLOT *</label>
              <select [(ngModel)]="form.slot_id" name="modal_slot_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                <option *ngFor="let slot of filteredSlots" [value]="slot.slot_id">[{{ slot.shift || 'MORNING' }}] {{ slot.slot_name }} ({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">ROOM *</label>
            <select [(ngModel)]="form.room_id" name="modal_room_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 font-bold">
              <option *ngFor="let r of rooms" [value]="r.room_id">{{ r.room_number }} ({{ r.building || 'Main' }})</option>
            </select>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showAssignSlotModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Save Schedule Slot
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create New Time Slot Modal Overlay -->
    <div *ngIf="showSlotModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-clock text-emerald-400 text-base"></i>
            <h3 class="text-base font-bold text-white">Create & Manage Time Slots</h3>
          </div>
          <button (click)="showSlotModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="onCreateTimeSlot()" class="space-y-3">
          <div>
            <label class="block font-bold text-gray-300 mb-1">SLOT NAME *</label>
            <input type="text" [(ngModel)]="newSlot.slot_name" name="slot_name" placeholder="e.g. Period 5 or Evening Session" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">START TIME *</label>
              <input type="time" [(ngModel)]="newSlot.start_time" name="start_time" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">END TIME *</label>
              <input type="time" [(ngModel)]="newSlot.end_time" name="end_time" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">SHIFT *</label>
            <select [(ngModel)]="newSlot.shift" name="shift" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
              <option value="MORNING">Morning Shift</option>
              <option value="AFTERNOON">Afternoon Shift</option>
              <option value="EVENING">Evening Shift</option>
            </select>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showSlotModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Create Time Slot</button>
          </div>
        </form>

        <!-- Existing Time Slots Grouped by Shift -->
        <div class="border-t border-[#1f2937] pt-4 space-y-3">
          <h4 class="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
            <i class="fa-solid fa-list-check"></i> EXISTING TIME SLOTS BY SHIFT:
          </h4>

          <div class="max-h-60 overflow-y-auto space-y-3 pr-1">
            <!-- Morning Shift Group -->
            <div class="space-y-1.5 bg-[#111827]/80 p-2.5 rounded-xl border border-emerald-500/20">
              <div class="flex items-center justify-between text-[11px] font-extrabold text-emerald-400 border-b border-emerald-500/10 pb-1">
                <span>MORNING SHIFT</span>
                <span class="text-[10px] text-emerald-300 font-mono">{{ getSlotsByShift('MORNING').length }} Slots</span>
              </div>
              <div *ngFor="let slot of getSlotsByShift('MORNING')" class="flex items-center justify-between bg-[#1e293b] p-2 rounded-xl border border-[#1f2937] text-xs">
                <div>
                  <span class="font-bold text-white">{{ slot.slot_name }}</span>
                  <span class="text-emerald-300 font-mono text-[11px] font-extrabold ml-2">({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})</span>
                </div>
                <button type="button" (click)="deleteTimeSlotDefinition(slot)" title="Delete Time Slot" class="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/20 text-[10px] font-bold">
                  <i class="fa-solid fa-trash-can"></i> Delete
                </button>
              </div>
              <div *ngIf="getSlotsByShift('MORNING').length === 0" class="text-[10px] text-gray-500 italic py-1">
                No morning shift slots available
              </div>
            </div>

            <!-- Afternoon Shift Group -->
            <div class="space-y-1.5 bg-[#111827]/80 p-2.5 rounded-xl border border-amber-500/20">
              <div class="flex items-center justify-between text-[11px] font-extrabold text-amber-400 border-b border-amber-500/10 pb-1">
                <span>AFTERNOON SHIFT</span>
                <span class="text-[10px] text-amber-300 font-mono">{{ getSlotsByShift('AFTERNOON').length }} Slots</span>
              </div>
              <div *ngFor="let slot of getSlotsByShift('AFTERNOON')" class="flex items-center justify-between bg-[#1e293b] p-2 rounded-xl border border-[#1f2937] text-xs">
                <div>
                  <span class="font-bold text-white">{{ slot.slot_name }}</span>
                  <span class="text-amber-300 font-mono text-[11px] font-extrabold ml-2">({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})</span>
                </div>
                <button type="button" (click)="deleteTimeSlotDefinition(slot)" title="Delete Time Slot" class="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/20 text-[10px] font-bold">
                  <i class="fa-solid fa-trash-can"></i> Delete
                </button>
              </div>
              <div *ngIf="getSlotsByShift('AFTERNOON').length === 0" class="text-[10px] text-gray-500 italic py-1">
                No afternoon shift slots available
              </div>
            </div>

            <!-- Evening Shift Group -->
            <div class="space-y-1.5 bg-[#111827]/80 p-2.5 rounded-xl border border-indigo-500/20">
              <div class="flex items-center justify-between text-[11px] font-extrabold text-indigo-400 border-b border-indigo-500/10 pb-1">
                <span>EVENING SHIFT</span>
                <span class="text-[10px] text-indigo-300 font-mono">{{ getSlotsByShift('EVENING').length }} Slots</span>
              </div>
              <div *ngFor="let slot of getSlotsByShift('EVENING')" class="flex items-center justify-between bg-[#1e293b] p-2 rounded-xl border border-[#1f2937] text-xs">
                <div>
                  <span class="font-bold text-white">{{ slot.slot_name }}</span>
                  <span class="text-indigo-300 font-mono text-[11px] font-extrabold ml-2">({{ slot.start_time.slice(0,5) }} – {{ slot.end_time.slice(0,5) }})</span>
                </div>
                <button type="button" (click)="deleteTimeSlotDefinition(slot)" title="Delete Time Slot" class="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/20 text-[10px] font-bold">
                  <i class="fa-solid fa-trash-can"></i> Delete
                </button>
              </div>
              <div *ngIf="getSlotsByShift('EVENING').length === 0" class="text-[10px] text-gray-500 italic py-1">
                No evening shift slots available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TimetableManagementComponent implements OnInit {
  subjects: any[] = [];
  allClassSubjects: any[] = [];
  allMasterSubjects: any[] = [];
  curriculumHierarchy: any[] = [];
  teachers: any[] = [];
  groups: any[] = [];
  rooms: any[] = [];
  slots: any[] = [];
  timetables: any[] = [];

  selectedGroupSemester: number = 1;
  selectedGroupShift: string = 'MORNING';

  get filteredSlots(): any[] {
    if (!this.slots || !this.slots.length) return [];
    if (this.isTeacherView) return this.slots;

    const selectedGroupObj = this.groups.find(g => Number(g.group_id) === Number(this.form.group_id));
    const targetShift = selectedGroupObj?.shift || this.selectedGroupShift || 'MORNING';

    if (!targetShift) return this.slots;
    const shiftUpper = String(targetShift).toUpperCase();
    const matched = this.slots.filter(s => String(s.shift || 'MORNING').toUpperCase() === shiftUpper);
    return matched.length > 0 ? matched : this.slots;
  }

  getSlotsByShift(shiftName: string): any[] {
    if (!this.slots || !this.slots.length) return [];
    const targetShift = String(shiftName).toUpperCase();
    return this.slots.filter(s => String(s.shift || 'MORNING').toUpperCase() === targetShift);
  }
  showSlotModal = false;
  showEditSlotModal = false;
  showAssignSlotModal = false;
  editingSlot: any = {};

  openAssignSlotModal(): void {
    this.showAssignSlotModal = true;
  }

  saveSlotFromModal(): void {
    this.onSaveSlot();
    this.showAssignSlotModal = false;
  }

  openAssignSlotModalForDay(day: string): void {
    this.form.day_of_week = day;
    this.showAssignSlotModal = true;
    this.toast.info(`Assigning timetable slot for ${day}!`);
  }

  clickFreeSlot(slotId: number, day: string): void {
    this.form.slot_id = slotId;
    this.form.day_of_week = day;
    this.showAssignSlotModal = true;
  }

  openEditSlotModal(item: any): void {
    this.editingSlot = { ...item };
    this.showEditSlotModal = true;
  }

  onModalTeacherChange(): void {
    if (!this.editingSlot.teacher_id || !this.subjects.length) return;
    const selectedTeacher = this.teachers.find(t => Number(t.teacher_id) === Number(this.editingSlot.teacher_id));
    if (selectedTeacher && selectedTeacher.assigned_subject_ids) {
      let ids: number[] = [];
      if (Array.isArray(selectedTeacher.assigned_subject_ids)) {
        ids = selectedTeacher.assigned_subject_ids.map(Number);
      } else if (typeof selectedTeacher.assigned_subject_ids === 'string') {
        try { ids = JSON.parse(selectedTeacher.assigned_subject_ids).map(Number); } catch (e) { ids = selectedTeacher.assigned_subject_ids.split(',').map(Number); }
      }
      const matchedSub = this.subjects.find(s => ids.includes(Number(s.subject_id)));
      if (matchedSub) {
        this.editingSlot.subject_id = matchedSub.subject_id;
      }
    }
  }

  onUpdateSlot(): void {
    if (!this.editingSlot.timetable_id) return;
    this.api.put(`timetables/${this.editingSlot.timetable_id}`, this.editingSlot).subscribe({
      next: () => {
        this.toast.success('Timetable slot updated successfully!');
        this.showEditSlotModal = false;
        this.loadTimetables();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to update timetable slot')
    });
  }

  onDeleteSlotFromModal(): void {
    if (!this.editingSlot.timetable_id) return;
    this.deleteTimetableSlot(this.editingSlot);
    this.showEditSlotModal = false;
  }

  newSlot: any = {
    slot_name: 'Time',
    start_time: '17:00',
    end_time: '18:30',
    shift: 'EVENING'
  };

  form: any = {
    subject_id: null,
    teacher_id: null,
    group_id: null,
    day_of_week: 'MONDAY',
    slot_id: null,
    room_id: null,
    semester_id: 1
  };

  private realtimeSub!: Subscription;

  get isTeacherView(): boolean {
    return this.router.url.includes('/teacher/');
  }

  selectedTeacherGroupId: any = 'ALL';

  constructor(
    private api: ApiService,
    public toast: ToastService,
    private socketService: SocketService,
    private confirmService: ConfirmModalService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event === 'timetable_updated') {
        console.log('⚡ Auto-refreshing Timetable Grid on real-time event');
        this.loadTimetables();
      }
    });
  }

  loadDropdowns(): void {
    const groupParams: any = {};
    if (this.isTeacherView) groupParams.teacher_only = 'true';

    this.api.get<any>('groups', groupParams).subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
      if (this.groups.length > 0 && !this.form.group_id) {
        this.form.group_id = this.groups[0].group_id;
      }
      this.filterSubjectsForSelectedClass();
      this.loadTimetables();
    });

    this.api.get<any>('teachers').subscribe(res => {
      this.teachers = res.data?.teachers || res.data || [];
      if (this.teachers.length > 0 && !this.form.teacher_id) {
        this.form.teacher_id = this.teachers[0].teacher_id;
      }
    });

    this.api.get<any>('rooms').subscribe(res => {
      this.rooms = res.data?.rooms || res.data || [];
      if (this.rooms.length > 0 && !this.form.room_id) {
        this.form.room_id = this.rooms[0].room_id;
      }
    });

    this.api.get<any>('timetables/slots').subscribe(res => {
      this.slots = res.data?.slots || res.data || [];
      if (this.slots.length > 0 && !this.form.slot_id) {
        this.form.slot_id = this.slots[0].slot_id;
      }
    });

    this.api.get<any>('subjects').subscribe(res => {
      this.allMasterSubjects = res.data?.subjects || res.data || [];
      this.filterSubjectsForSelectedClass();
    });

    this.api.get<any>('curriculums/hierarchy').subscribe(res => {
      this.curriculumHierarchy = res.data?.hierarchy || [];
      this.filterSubjectsForSelectedClass();
    });
  }

  get filteredTeachers(): any[] {
    if (!this.teachers || !this.teachers.length) return [];
    if (!this.form.group_id) return this.teachers;

    const selectedGroup = this.groups.find(g => Number(g.group_id) === Number(this.form.group_id));
    const classSubjectIds = new Set(this.allClassSubjects.map(s => Number(s.subject_id)));

    const groupTeachers = this.teachers.filter(t => {
      // 1. Direct group_id match
      if (t.group_id && Number(t.group_id) === Number(this.form.group_id)) return true;

      // 2. Check if teacher has assigned subjects that match class subjects
      const teacherSubIds = this.getTeacherAssignedSubjectIds(t);
      if (teacherSubIds.some(id => classSubjectIds.has(id))) return true;

      // 3. Check if teacher's specialization matches group program/code/name
      if (selectedGroup && t.specialization) {
        const specUpper = String(t.specialization).toUpperCase();
        const pCode = String(selectedGroup.program_code || '').toUpperCase();
        const gName = String(selectedGroup.group_name || '').toUpperCase();
        if (pCode && specUpper.includes(pCode)) return true;
        if (gName && specUpper.includes(gName)) return true;
      }

      return false;
    });

    return groupTeachers.length > 0 ? groupTeachers : this.teachers;
  }

  onClassChange(): void {
    this.filterSubjectsForSelectedClass();
    const activeTeachers = this.filteredTeachers;
    if (activeTeachers.length > 0) {
      if (!activeTeachers.some(t => Number(t.teacher_id) === Number(this.form.teacher_id))) {
        this.form.teacher_id = activeTeachers[0].teacher_id;
      }
    }
    const activeSlots = this.filteredSlots;
    if (activeSlots.length > 0) {
      if (!activeSlots.some(s => Number(s.slot_id) === Number(this.form.slot_id))) {
        this.form.slot_id = activeSlots[0].slot_id;
      }
    }
    this.updateFilteredSubjectsForTeacher();
    this.loadTimetables();
  }

  getTeacherAssignedSubjectIds(teacher: any): number[] {
    if (!teacher) return [];
    if (teacher.assigned_subjects && Array.isArray(teacher.assigned_subjects)) {
      const idsFromObj = teacher.assigned_subjects.map((s: any) => Number(s.subject_id)).filter(Boolean);
      if (idsFromObj.length > 0) return idsFromObj;
    }
    if (!teacher.assigned_subject_ids) return [];
    let ids: number[] = [];
    if (Array.isArray(teacher.assigned_subject_ids)) {
      ids = teacher.assigned_subject_ids.map(Number);
    } else if (typeof teacher.assigned_subject_ids === 'string') {
      try {
        ids = JSON.parse(teacher.assigned_subject_ids).map(Number);
      } catch (e) {
        ids = teacher.assigned_subject_ids.split(',').map(Number);
      }
    }
    return ids.filter(n => !isNaN(n));
  }

  filterSubjectsForSelectedClass(): void {
    if (!this.groups.length || !this.form.group_id) return;

    const selectedGroupObj = this.groups.find(g => Number(g.group_id) === Number(this.form.group_id));
    this.selectedGroupSemester = selectedGroupObj ? Number(selectedGroupObj.current_semester || 1) : 1;
    this.selectedGroupShift = selectedGroupObj ? (selectedGroupObj.shift || 'MORNING') : 'MORNING';
    this.form.semester_id = this.selectedGroupSemester;
    const programId = selectedGroupObj?.program_id ? Number(selectedGroupObj.program_id) : null;
    const programCode = selectedGroupObj?.program_code || null;

    let classSubjects: any[] = [];

    // Extract subjects assigned in Curriculum Management strictly for THIS group's program & semester
    if (this.curriculumHierarchy.length > 0) {
      for (const fac of this.curriculumHierarchy) {
        for (const prog of fac.programs || []) {
          const matchProg = (programId && Number(prog.program_id) === programId) || (programCode && prog.program_code === programCode);
          if (matchProg) {
            if (prog.subjects && Array.isArray(prog.subjects)) {
              classSubjects = prog.subjects.filter((sub: any) => Number(sub.semester_id || sub.semester_number || sub.semester || 1) === this.selectedGroupSemester);
            }
          }
        }
      }
    }

    if (classSubjects.length === 0) {
      classSubjects = this.allMasterSubjects.filter(sub => {
        const subSem = Number(sub.semester_id || sub.semester_number || sub.semester || 1);
        const matchSem = subSem === this.selectedGroupSemester;
        const matchProg = !programId || !sub.program_id || Number(sub.program_id) === programId;
        return matchSem && matchProg;
      });
    }

    this.allClassSubjects = classSubjects;
    this.updateFilteredSubjectsForTeacher();
  }

  updateFilteredSubjectsForTeacher(): void {
    if (!this.form.teacher_id) {
      this.subjects = [...this.allClassSubjects];
    } else {
      const selectedTeacher = this.teachers.find(t => Number(t.teacher_id) === Number(this.form.teacher_id));
      const teacherSubIds = this.getTeacherAssignedSubjectIds(selectedTeacher);

      if (teacherSubIds.length > 0) {
        // First match against class subjects for this group
        let matched = this.allClassSubjects.filter(sub => teacherSubIds.includes(Number(sub.subject_id)));
        if (matched.length === 0) {
          // Fallback to match teacher's assigned subjects from all master subjects
          matched = this.allMasterSubjects.filter(sub => teacherSubIds.includes(Number(sub.subject_id)));
        }
        this.subjects = matched.length > 0 ? matched : [...this.allClassSubjects];
      } else {
        // Check teacher specialization match if assigned_subject_ids is empty
        if (selectedTeacher && selectedTeacher.specialization) {
          const specUpper = String(selectedTeacher.specialization).toUpperCase();
          const specMatched = this.allClassSubjects.filter(sub =>
            specUpper.includes(String(sub.subject_code || '').toUpperCase()) ||
            specUpper.includes(String(sub.subject_name || '').toUpperCase()) ||
            String(sub.subject_name || '').toUpperCase().includes(specUpper)
          );
          this.subjects = specMatched.length > 0 ? specMatched : [...this.allClassSubjects];
        } else {
          this.subjects = [...this.allClassSubjects];
        }
      }
    }

    if (this.subjects.length > 0) {
      if (!this.subjects.some(s => Number(s.subject_id) === Number(this.form.subject_id))) {
        this.form.subject_id = this.subjects[0].subject_id;
      }
    } else {
      this.form.subject_id = null;
    }
  }

  getAssignedTeacherName(s: any): string {
    if (s.teacher_fname || s.teacher_name) {
      return `${s.teacher_fname || s.teacher_name} ${s.teacher_lname || ''}`.trim();
    }
    const teacher = this.findTeacherForSubject(s.subject_id);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned';
  }

  findTeacherForSubject(subjectId: number): any {
    const subIdNum = Number(subjectId);
    return this.teachers.find(t => {
      const ids = this.getTeacherAssignedSubjectIds(t);
      return ids.includes(subIdNum);
    });
  }

  onSubjectChange(): void {
    if (!this.form.subject_id) return;
    const assignedTeacher = this.findTeacherForSubject(this.form.subject_id);
    if (assignedTeacher) {
      this.form.teacher_id = assignedTeacher.teacher_id;
    }
  }

  onTeacherChange(): void {
    this.updateFilteredSubjectsForTeacher();
  }

  loadTimetables(): void {
    const params: any = {};
    if (this.isTeacherView) {
      params.teacher_only = 'true';
      if (this.selectedTeacherGroupId && this.selectedTeacherGroupId !== 'ALL') {
        params.group_id = this.selectedTeacherGroupId;
      }
    } else {
      if (this.form.group_id) params.group_id = this.form.group_id;
    }

    this.api.get<any>('timetables', params).subscribe({
      next: (res) => {
        this.timetables = res.data?.timetables || res.data || [];
      }
    });
  }

  getSlotForDay(slotId: number, day: string): any {
    if (!this.timetables || !this.timetables.length) return null;
    return this.timetables.find(t =>
      Number(t.slot_id) === Number(slotId) &&
      t.day_of_week &&
      t.day_of_week.trim().toUpperCase() === day.trim().toUpperCase()
    );
  }

  onCreateTimeSlot(): void {
    this.api.post('timetables/slots', this.newSlot).subscribe({
      next: () => {
        this.toast.success('New Time Slot created successfully!');
        this.showSlotModal = false;
        this.loadDropdowns();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create time slot')
    });
  }

  onSaveSlot(): void {
    if (!this.form.group_id || !this.form.subject_id || !this.form.teacher_id || !this.form.slot_id || !this.form.room_id) {
      this.toast.error('Please select Class, Teacher, Subject, Time Slot, and Room!');
      return;
    }

    this.form.semester_id = this.selectedGroupSemester || 1;

    this.api.post('timetables', this.form).subscribe({
      next: () => {
        this.toast.success('Timetable slot assigned successfully!');
        this.showAssignSlotModal = false;
        this.loadTimetables();
      },
      error: (err) => this.toast.error(err.error?.message || 'Conflict detected: Slot unavailable')
    });
  }

  deleteTimetableSlot(item: any): void {
    this.confirmService.confirm({
      title: 'Delete Class Timetable Slot?',
      message: `Are you sure you want to delete the schedule for "${item.subject_name}" on ${item.day_of_week}?`,
      confirmText: 'Yes, Delete Slot',
      onConfirm: () => {
        this.api.delete(`timetables/${item.timetable_id}`).subscribe({
          next: () => {
            this.toast.success('Schedule deleted successfully!');
            this.loadTimetables();
          },
          error: (err) => this.toast.error(err.error?.message || 'Delete failed')
        });
      }
    });
  }

  clearClassTimetable(): void {
    if (!this.form.group_id) return;
    const selectedGroupObj = this.groups.find(g => Number(g.group_id) === Number(this.form.group_id));
    const groupName = selectedGroupObj ? selectedGroupObj.group_name : 'selected class';

    this.confirmService.confirm({
      title: 'Clear All Class Timetable Schedules?',
      message: `Are you sure you want to clear ALL scheduled class slots for "${groupName}"?`,
      confirmText: 'Yes, Clear Class Schedule',
      onConfirm: () => {
        this.api.delete(`timetables?group_id=${this.form.group_id}`).subscribe({
          next: () => {
            this.toast.success(`Cleared all schedules for class "${groupName}"!`);
            this.loadTimetables();
          },
          error: (err) => this.toast.error(err.error?.message || 'Clear failed')
        });
      }
    });
  }

  deleteTimeSlotDefinition(slot: any): void {
    this.confirmService.confirm({
      title: 'Delete Master Time Slot?',
      message: `Are you sure you want to delete time slot definition "${slot.slot_name} (${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)})"?`,
      confirmText: 'Yes, Delete Time Slot',
      onConfirm: () => {
        this.api.delete(`timetables/slots/${slot.slot_id}`).subscribe({
          next: () => {
            this.toast.success(`Time slot "${slot.slot_name}" deleted successfully!`);
            this.loadDropdowns();
            this.loadTimetables();
          },
          error: (err) => this.toast.error(err.error?.message || 'Delete failed')
        });
      }
    });
  }
}

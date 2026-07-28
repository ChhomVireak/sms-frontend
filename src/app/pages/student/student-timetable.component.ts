import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Class & Exam Timetable'" 
                [subtitle]="'Student Portal / Class & Exam Schedule'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Header Banner & View Tab Switcher -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <button (click)="activeTab = 'CLASS'"
                  [class.bg-emerald-600]="activeTab === 'CLASS'"
                  [class.text-white]="activeTab === 'CLASS'"
                  [class.text-gray-400]="activeTab !== 'CLASS'"
                  class="px-5 py-2.5 rounded-xl border border-[#1f2937] font-bold text-xs transition-all flex items-center gap-2 shadow-md">
            <i class="fa-solid fa-calendar-days text-emerald-300"></i>
            <span>Weekly Class Schedule (កាលវិភាគសិក្សា)</span>
          </button>

          <button (click)="activeTab = 'EXAM'; loadExamSchedules()"
                  [class.bg-purple-600]="activeTab === 'EXAM'"
                  [class.text-white]="activeTab === 'EXAM'"
                  [class.text-gray-400]="activeTab !== 'EXAM'"
                  class="px-5 py-2.5 rounded-xl border border-[#1f2937] font-bold text-xs transition-all flex items-center gap-2 shadow-md">
            <i class="fa-solid fa-graduation-cap text-amber-300"></i>
            <span>Exam Timetable Schedule (កាលវិភាគប្រឡង)</span>
            <span *ngIf="scheduledExams.length > 0" class="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold ml-1">
              {{ scheduledExams.length }}
            </span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <span *ngIf="classGroupName" class="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800 shadow">
            <i class="fa-solid fa-layer-group text-amber-400"></i> {{ classGroupName }}
          </span>
          <span class="status-badge status-badge-active">• {{ activeTab === 'CLASS' ? (timetables.length + ' Slots') : (scheduledExams.length + ' Exams') }}</span>
        </div>
      </div>

      <!-- TAB 1: WEEKLY CLASS TIMETABLE GRID -->
      <div *ngIf="activeTab === 'CLASS'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4 flex-wrap gap-3">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i class="fa-solid fa-calendar-days text-emerald-400"></i> Weekly Class Study Schedule
            </h3>
            <p class="text-[11px] text-gray-400 mt-0.5">Semester timetable schedule for your enrolled class section</p>
          </div>

          <!-- Semester History Selector -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-400">Semester View:</span>
            <select [(ngModel)]="selectedSemester" (change)="loadTimetables()" class="bg-[#111827] border border-emerald-500/50 text-xs font-extrabold text-emerald-400 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400">
              <option [ngValue]="null">Current Active Semester</option>
              <option *ngFor="let s of availableSemesters" [ngValue]="s">Semester {{ s }} (History)</option>
            </select>
          </div>
        </div>

        <!-- Days Header -->
        <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-2 items-center">
          <div class="py-1 font-mono text-cyan-400">TIME</div>
          <div *ngFor="let dayObj of [
            { code: 'MONDAY', label: 'MON' },
            { code: 'TUESDAY', label: 'TUE' },
            { code: 'WEDNESDAY', label: 'WED' },
            { code: 'THURSDAY', label: 'THU' },
            { code: 'FRIDAY', label: 'FRI' },
            { code: 'SATURDAY', label: 'SAT' }
          ]" class="py-1">
            <span>{{ dayObj.label }}</span>
          </div>
        </div>

        <!-- Dynamic Slots Grid -->
        <div *ngFor="let slot of activeSlots" class="grid grid-cols-7 gap-2 text-xs items-center">
          <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-2 rounded-xl border border-[#1f2937]">
            <div class="text-emerald-300 font-extrabold">{{ slot.slot_name }}</div>
            <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ (slot.start_time || '08:00').slice(0,5) }} – {{ (slot.end_time || '09:30').slice(0,5) }}</div>
          </div>

          <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
            <div *ngIf="getSlotForDay(slot.slot_id, day) as item; else emptySlot" 
                 class="bg-emerald-950/80 border border-emerald-700/80 p-2.5 rounded-xl space-y-1 relative shadow-sm transition-all hover:border-emerald-500">
              <div>
                <p class="font-extrabold text-emerald-300 truncate text-xs font-mono tracking-wide">📘 {{ item.subject_code }}</p>
                <p class="text-[10px] text-white truncate font-bold">{{ item.subject_name }}</p>
              </div>
              <p class="text-[10px] text-amber-400 truncate font-semibold">👨‍🏫 {{ item.teacher_fname || 'Prof.' }} {{ item.teacher_lname || 'Teacher' }}</p>
              <div class="flex items-center justify-between text-[9px] pt-0.5">
                <span class="bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">🚪 Room {{ item.room_number || 'TBA' }}</span>
              </div>
            </div>

            <ng-template #emptySlot>
              <div class="border border-dashed border-gray-800/80 p-2.5 rounded-xl text-center text-gray-600 font-bold text-[10px] flex flex-col items-center justify-center gap-1 min-h-[58px]">
                <span class="text-xs text-gray-600 font-mono">—</span>
              </div>
            </ng-template>
          </div>
        </div>

        <div *ngIf="activeSlots.length === 0" class="text-center py-8 text-xs text-gray-500 italic">
          No weekly timetable slots scheduled for your shift in database.
        </div>
      </div>

      <!-- TAB 2: EXAM TIMETABLE SCHEDULE (SEPARATE MIDTERM & FINAL DROPDOWN SECTIONS) -->
      <div *ngIf="activeTab === 'EXAM'" class="space-y-6">

        <!-- SECTION 1 (LATEST / TOP): FINAL EXAM TIMETABLE DROPDOWN SECTION -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 shadow-xl">
          <!-- Accordion Header Bar -->
          <div (click)="isFinalExpanded = !isFinalExpanded"
               class="flex items-center justify-between border-b border-[#1f2937] pb-4 cursor-pointer hover:opacity-90 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                <i class="fa-solid fa-graduation-cap text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Final Examination Schedule
                </h3>
                <p class="text-[11px] text-gray-400 mt-0.5">End-of-semester final examination timetable matrix & details</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-lg border border-purple-800 shadow">
                {{ finalExams.length }} Final Exams
              </span>
              <button class="px-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2 shadow-md">
                <i [class.fa-chevron-up]="isFinalExpanded" [class.fa-chevron-down]="!isFinalExpanded" class="fa-solid text-purple-400"></i>
                <span>{{ isFinalExpanded ? 'Hide Schedule' : 'Show Schedule' }}</span>
              </button>
            </div>
          </div>

          <!-- Final Collapsible Body -->
          <div *ngIf="isFinalExpanded" class="space-y-4 pt-2">
            <!-- Days Header -->
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-2 items-center">
              <div class="py-1 font-mono text-purple-400">EXAM TIME</div>
              <div *ngFor="let dayObj of [
                { code: 'MONDAY', label: 'MON' },
                { code: 'TUESDAY', label: 'TUE' },
                { code: 'WEDNESDAY', label: 'WED' },
                { code: 'THURSDAY', label: 'THU' },
                { code: 'FRIDAY', label: 'FRI' },
                { code: 'SATURDAY', label: 'SAT' }
              ]" class="py-1">
                <span>{{ dayObj.label }}</span>
              </div>
            </div>

            <!-- Dynamic Final Slots Grid -->
            <div *ngFor="let slot of activeSlots" class="grid grid-cols-7 gap-2 text-xs items-center">
              <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-2 rounded-xl border border-[#1f2937]">
                <div class="text-purple-300 font-extrabold">{{ slot.slot_name }}</div>
                <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ (slot.start_time || '08:00').slice(0,5) }} – {{ (slot.end_time || '09:30').slice(0,5) }}</div>
              </div>

              <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
                <div *ngIf="getExamForDay(slot.slot_id, day, finalExams) as item; else emptyFinalSlot" 
                     class="bg-purple-950/90 border border-purple-700/80 p-2.5 rounded-xl space-y-1 relative shadow-md transition-all hover:border-purple-400">
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 uppercase font-mono block w-max">FINAL EXAM</span>
                  <div>
                    <p class="font-extrabold text-amber-300 truncate text-xs font-mono tracking-wide">{{ item.subject_code }}</p>
                    <p class="text-[10px] text-white truncate font-bold">{{ item.subject_name }}</p>
                  </div>
                  <p class="text-[10px] text-cyan-300 truncate font-semibold">Date: {{ (item.exam_date | date:'dd/MM/yyyy') || 'TBA' }}</p>
                  <div class="flex items-center justify-between text-[9px] pt-0.5">
                    <span class="bg-purple-900/80 text-purple-100 px-1.5 py-0.5 rounded font-mono font-bold">Room {{ item.room_number || 'TBA' }}</span>
                  </div>
                </div>

                <ng-template #emptyFinalSlot>
                  <div class="border border-dashed border-gray-800/80 p-2.5 rounded-xl text-center text-gray-600 font-bold text-[10px] flex flex-col items-center justify-center gap-1 min-h-[64px]">
                    <span class="text-xs text-gray-600 font-mono">—</span>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- Final Cards List -->
            <div *ngIf="finalExams.length > 0" class="pt-4 border-t border-[#1f2937] grid grid-cols-1 md:grid-cols-3 gap-3">
              <div *ngFor="let ex of finalExams" class="bg-[#111827]/90 border border-purple-900/50 p-3.5 rounded-xl space-y-1.5 shadow">
                <div class="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
                  <span>FINAL EXAM</span>
                  <span>Date: {{ (ex.exam_date | date:'dd/MM/yyyy') }}</span>
                </div>
                <h5 class="text-xs font-mono font-extrabold text-emerald-400">{{ ex.subject_code }} — {{ ex.subject_name }}</h5>
                <div class="text-[11px] text-gray-300 font-sans flex items-center justify-between pt-1 border-t border-gray-800">
                  <span class="text-cyan-300 font-semibold">Time: {{ (ex.start_time || '08:00').slice(0,5) }} – {{ (ex.end_time || '09:30').slice(0,5) }}</span>
                  <span class="text-purple-300 font-bold">Room {{ ex.room_number || 'TBA' }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="finalExams.length === 0" class="py-6 text-center text-xs text-gray-500 italic font-sans">
              No Final exam schedules published for your class section yet.
            </div>
          </div>
        </div>


        <!-- SECTION 2: MIDTERM EXAM TIMETABLE DROPDOWN SECTION -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 shadow-xl">
          <!-- Accordion Header Bar -->
          <div (click)="isMidtermExpanded = !isMidtermExpanded"
               class="flex items-center justify-between border-b border-[#1f2937] pb-4 cursor-pointer hover:opacity-90 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                <i class="fa-solid fa-file-pen text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Midterm Examination Schedule
                </h3>
                <p class="text-[11px] text-gray-400 mt-0.5">Mid-semester examination timetable matrix & details</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800 shadow">
                {{ midtermExams.length }} Midterm Exams
              </span>
              <button class="px-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2 shadow-md">
                <i [class.fa-chevron-up]="isMidtermExpanded" [class.fa-chevron-down]="!isMidtermExpanded" class="fa-solid text-amber-400"></i>
                <span>{{ isMidtermExpanded ? 'Hide Schedule' : 'Show Schedule' }}</span>
              </button>
            </div>
          </div>

          <!-- Midterm Collapsible Body -->
          <div *ngIf="isMidtermExpanded" class="space-y-4 pt-2">
            <!-- Days Header -->
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 border-b border-[#1f2937] pb-2 items-center">
              <div class="py-1 font-mono text-amber-400">EXAM TIME</div>
              <div *ngFor="let dayObj of [
                { code: 'MONDAY', label: 'MON' },
                { code: 'TUESDAY', label: 'TUE' },
                { code: 'WEDNESDAY', label: 'WED' },
                { code: 'THURSDAY', label: 'THU' },
                { code: 'FRIDAY', label: 'FRI' },
                { code: 'SATURDAY', label: 'SAT' }
              ]" class="py-1">
                <span>{{ dayObj.label }}</span>
              </div>
            </div>

            <!-- Dynamic Midterm Slots Grid -->
            <div *ngFor="let slot of activeSlots" class="grid grid-cols-7 gap-2 text-xs items-center">
              <div class="font-mono text-gray-400 text-center text-[11px] font-bold bg-[#111827] p-2 rounded-xl border border-[#1f2937]">
                <div class="text-amber-300 font-extrabold">{{ slot.slot_name }}</div>
                <div class="text-gray-300 font-bold text-[10px] mt-0.5">{{ (slot.start_time || '08:00').slice(0,5) }} – {{ (slot.end_time || '09:30').slice(0,5) }}</div>
              </div>

              <div *ngFor="let day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']">
                <div *ngIf="getExamForDay(slot.slot_id, day, midtermExams) as item; else emptyMidtermSlot" 
                     class="bg-amber-950/80 border border-amber-700/80 p-2.5 rounded-xl space-y-1 relative shadow-md transition-all hover:border-amber-400">
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900 text-amber-200 uppercase font-mono block w-max">MIDTERM</span>
                  <div>
                    <p class="font-extrabold text-amber-300 truncate text-xs font-mono tracking-wide">{{ item.subject_code }}</p>
                    <p class="text-[10px] text-white truncate font-bold">{{ item.subject_name }}</p>
                  </div>
                  <p class="text-[10px] text-cyan-300 truncate font-semibold">Date: {{ (item.exam_date | date:'dd/MM/yyyy') || 'TBA' }}</p>
                  <div class="flex items-center justify-between text-[9px] pt-0.5">
                    <span class="bg-amber-900/80 text-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">Room {{ item.room_number || 'TBA' }}</span>
                  </div>
                </div>

                <ng-template #emptyMidtermSlot>
                  <div class="border border-dashed border-gray-800/80 p-2.5 rounded-xl text-center text-gray-600 font-bold text-[10px] flex flex-col items-center justify-center gap-1 min-h-[64px]">
                    <span class="text-xs text-gray-600 font-mono">—</span>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- Midterm Cards List -->
            <div *ngIf="midtermExams.length > 0" class="pt-4 border-t border-[#1f2937] grid grid-cols-1 md:grid-cols-3 gap-3">
              <div *ngFor="let ex of midtermExams" class="bg-[#111827]/90 border border-amber-900/50 p-3.5 rounded-xl space-y-1.5 shadow">
                <div class="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                  <span>MIDTERM EXAM</span>
                  <span>Date: {{ (ex.exam_date | date:'dd/MM/yyyy') }}</span>
                </div>
                <h5 class="text-xs font-mono font-extrabold text-emerald-400">{{ ex.subject_code }} — {{ ex.subject_name }}</h5>
                <div class="text-[11px] text-gray-300 font-sans flex items-center justify-between pt-1 border-t border-gray-800">
                  <span class="text-cyan-300 font-semibold">Time: {{ (ex.start_time || '08:00').slice(0,5) }} – {{ (ex.end_time || '09:30').slice(0,5) }}</span>
                  <span class="text-amber-300 font-bold">Room {{ ex.room_number || 'TBA' }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="midtermExams.length === 0" class="py-6 text-center text-xs text-gray-500 italic font-sans">
              No Midterm exam schedules published for your class section yet.
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class StudentTimetableComponent implements OnInit {
  activeTab: 'CLASS' | 'EXAM' = 'CLASS';
  isMidtermExpanded: boolean = true;
  isFinalExpanded: boolean = true;
  slots: any[] = [];
  timetables: any[] = [];
  scheduledExams: any[] = [];
  classGroupName: string = '';
  studentGroupId: number | null = null;

  selectedSemester: number | null = null;
  availableSemesters: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSlots();
    this.loadTimetables();
    this.loadExamSchedules();
  }

  loadSlots(): void {
    this.api.get<any>('timetables/slots').subscribe(res => {
      this.slots = res.data?.slots || res.data || [];
    });
  }

  loadTimetables(): void {
    const params: any = {};
    if (this.selectedSemester) {
      params.semester_id = this.selectedSemester;
    }

    this.api.get<any>('timetables', params).subscribe(res => {
      this.timetables = res.data?.timetables || res.data || [];
      if (this.timetables.length > 0) {
        const first = this.timetables[0];
        if (first.group_code) {
          this.classGroupName = `${first.group_code} — ${first.group_name || ''}`;
          this.studentGroupId = first.group_id;
        }
      }
    });
  }

  loadExamSchedules(): void {
    this.api.get<any>('exams').subscribe({
      next: (res) => {
        const raw = res.data?.exams || res.data || [];
        // Sort latest exam dates and IDs first (កាលវិភាគណា ក្រោយគេចេញនៅលើគេ)
        this.scheduledExams = raw.sort((a: any, b: any) => {
          const dateA = new Date(a.exam_date || a.created_at || 0).getTime();
          const dateB = new Date(b.exam_date || b.created_at || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.exam_id || 0) - (a.exam_id || 0);
        });

        this.updateExamExpandDefaults();
      },
      error: () => {
        this.scheduledExams = [];
      }
    });
  }

  updateExamExpandDefaults(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasUpcomingMidterm = this.midtermExams.some(e => {
      if (!e.exam_date) return true;
      const d = new Date(e.exam_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    });

    const hasUpcomingFinal = this.finalExams.some(e => {
      if (!e.exam_date) return true;
      const d = new Date(e.exam_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    });

    // If all exams in a schedule section have passed -> AUTO-HIDE (collapse)!
    this.isMidtermExpanded = hasUpcomingMidterm && this.midtermExams.length > 0;
    this.isFinalExpanded = hasUpcomingFinal && this.finalExams.length > 0;

    // Fallback: If both schedules have passed, keep the most recent section visible for student reference
    if (!this.isMidtermExpanded && !this.isFinalExpanded) {
      if (this.finalExams.length > 0) this.isFinalExpanded = true;
      else if (this.midtermExams.length > 0) this.isMidtermExpanded = true;
    }
  }

  isExamPassed(examDateStr: any): boolean {
    if (!examDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setHours(0, 0, 0, 0);
    return examDate.getTime() < today.getTime();
  }

  get midtermExams(): any[] {
    if (!this.scheduledExams || !this.scheduledExams.length) return [];
    return this.scheduledExams.filter(e => {
      const cat = (e.category || e.exam_title || e.exam_type || '').toLowerCase();
      return cat.includes('mid') || cat.includes('ពាក់កណ្តាល');
    });
  }

  get finalExams(): any[] {
    if (!this.scheduledExams || !this.scheduledExams.length) return [];
    return this.scheduledExams.filter(e => {
      const cat = (e.category || e.exam_title || e.exam_type || '').toLowerCase();
      return cat.includes('final') || cat.includes('បញ្ចប់');
    });
  }

  get activeSlots(): any[] {
    if (!this.slots || this.slots.length === 0) return [];
    if (!this.timetables || this.timetables.length === 0) return this.slots;
    
    const scheduledSlotIds = new Set(this.timetables.map(t => Number(t.slot_id)));
    return this.slots.filter(s => scheduledSlotIds.has(Number(s.slot_id)));
  }

  getSlotForDay(slotId: number, day: string): any {
    if (!this.timetables || !this.timetables.length) return null;
    return this.timetables.find(t => 
      Number(t.slot_id) === Number(slotId) && 
      String(t.day_of_week).toUpperCase() === String(day).toUpperCase()
    );
  }

  getExamForDay(slotId: number, dayCode: string, examList: any[]): any {
    if (!examList || !examList.length) return null;

    return examList.find(ex => {
      const isSlotMatch = Number(ex.slot_id) === Number(slotId) ||
        (ex.start_time && this.slots.some(s => Number(s.slot_id) === Number(slotId) && (s.start_time || '').slice(0,5) === (ex.start_time || '').slice(0,5)));

      let isDayMatch = false;
      if (ex.day_of_week) {
        isDayMatch = String(ex.day_of_week).toUpperCase() === String(dayCode).toUpperCase();
      } else if (ex.exam_date) {
        const d = new Date(ex.exam_date);
        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        isDayMatch = dayNames[d.getDay()] === String(dayCode).toUpperCase();
      }

      return isSlotMatch && isDayMatch;
    });
  }
}

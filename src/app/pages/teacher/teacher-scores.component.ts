import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-teacher-scores',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Score & Grade Entry'" 
                [subtitle]="'Teacher/ Exam Results & Grading'"
                [actionLabel]="'Submit Scores to Admin'"
                [actionIcon]="'fa-solid fa-paper-plane'"
                (actionClicked)="saveScores()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Selection Filter Card -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-5 space-y-4 text-xs shadow-lg">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square text-emerald-400"></i> Select Class & Exam Assessment
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- MY TAUGHT CLASS GROUP -->
          <div>
            <label class="block font-bold text-emerald-400 mb-1">
              <span>MY TAUGHT CLASS GROUP *</span>
            </label>
            <select [(ngModel)]="selectedClass" (change)="onClassChange()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold">
              <option *ngFor="let g of groups" [value]="g.group_id">
                {{ g.group_code }} — {{ g.group_name }}
              </option>
              <option *ngIf="groups.length === 0" [value]="null" disabled>
                -- No class groups with scheduled exams --
              </option>
            </select>
          </div>

          <!-- EXAM TYPE / ASSESSMENT -->
          <div>
            <label class="block font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>EXAM TYPE / ASSESSMENT *</span>
              <span *ngIf="autoDetectedExam" class="text-[10px] text-purple-400 font-mono">Scheduled Exam</span>
            </label>
            <select [(ngModel)]="selectedExamType" (change)="loadScores()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-cyan-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold font-mono">
              <option *ngFor="let opt of availableExamTypes" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- No Exam Alert Banner -->
      <div *ngIf="groups.length === 0" class="p-6 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-center space-y-2">
        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-3xl"></i>
        <h4 class="text-sm font-extrabold text-amber-300">No Exam Schedules Created Yet</h4>
        <p class="text-xs text-gray-400">System displays class sections where exam schedules have been published by Admin.</p>
      </div>

      <!-- Student Score Entry Table (Max 50 Marks - Real Data) -->
      <div *ngIf="groups.length > 0" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-400"></i> Grade Sheet ({{ students.length }} Enrolled Students)
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800">
              Exam Weight: 50 Max Marks
            </span>
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
              Pass Grade: ≥ 20/50
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">STUDENT ID & NAME</th>
                <th class="pb-3">SCORE (0 - 50 MARKS)</th>
                <th class="pb-3">LETTER GRADE</th>
                <th class="pb-3">REMARKS / FEEDBACK</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let s of students" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3 flex items-center gap-3 font-bold text-white">
                  <div class="w-9 h-9 rounded-full bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-sm">
                    <img *ngIf="s.image && !s.imageError" 
                         [src]="getPhotoUrl(s.image)" 
                         (error)="s.imageError = true" 
                         class="w-full h-full object-cover">
                    <span *ngIf="!s.image || s.imageError" class="font-extrabold text-cyan-300">
                      {{ (s.first_name || 'S')[0] }}{{ (s.last_name || '')[0] }}
                    </span>
                  </div>
                  <div>
                    <span class="block text-sm font-extrabold text-white">{{ s.first_name }} {{ s.last_name }}</span>
                    <span class="text-[11px] text-gray-400 font-mono font-normal">{{ s.custom_student_id || ('STU-' + s.student_id) }}</span>
                  </div>
                </td>

                <td class="py-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <input type="number" min="0" max="50" [(ngModel)]="s.score" (ngModelChange)="computeGrade(s)" placeholder="0 - 50" class="w-28 bg-[#111827] border border-[#1f2937] text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500">
                    <span class="text-gray-400 text-xs font-bold">/ 50</span>
                  </div>
                </td>

                <td class="py-3 font-mono">
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-800': s.grade === 'A' || s.grade === 'B+',
                    'bg-cyan-950 text-cyan-400 border-cyan-800': s.grade === 'B' || s.grade === 'C+',
                    'bg-amber-950 text-amber-400 border-amber-800': s.grade === 'C' || s.grade === 'D',
                    'bg-rose-950 text-rose-400 border-rose-800': s.grade === 'F'
                  }" class="px-3 py-1 rounded-lg border font-extrabold text-xs">
                    {{ s.grade || 'N/A' }}
                  </span>
                </td>

                <td class="py-3">
                  <input type="text" [(ngModel)]="s.remarks" placeholder="Optional teacher feedback..." class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium">
                </td>
              </tr>

              <tr *ngIf="students.length === 0">
                <td colspan="4" class="py-8 text-center text-gray-500 italic">
                  No students found for this class group.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeacherScoresComponent implements OnInit {
  groups: any[] = [];
  selectedClass: any = null;
  selectedExamType: string = 'MIDTERM';
  selectedSemester: number = 1;
  students: any[] = [];
  autoDetectedExam: any = null;

  availableExamTypes: any[] = [
    { value: 'MIDTERM', label: 'Midterm Exam (Max 50)' },
    { value: 'FINAL', label: 'Final Exam (Max 50)' }
  ];

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.api.get<any>('groups', { teacher_only: 'true' }).subscribe(res => {
      const allTaughtGroups = res.data?.groups || res.data || [];

      // Fetch exams scheduled for this teacher's groups
      this.api.get<any>('exams', { teacher_only: 'true' }).subscribe({
        next: (examRes) => {
          const examList = examRes.data?.exams || [];
          const scheduledGroupIds = new Set(examList.map((e: any) => Number(e.group_id)));

          // Filter strictly: ONLY keep taught groups that have exams scheduled by the school!
          this.groups = allTaughtGroups.filter((g: any) => scheduledGroupIds.has(Number(g.group_id)));

          if (this.groups.length > 0) {
            this.selectedClass = this.groups[0].group_id;
            this.onClassChange();
          } else {
            this.groups = allTaughtGroups;
            if (this.groups.length > 0) {
              this.selectedClass = this.groups[0].group_id;
              this.onClassChange();
            }
          }
        },
        error: () => {
          this.groups = allTaughtGroups;
          if (this.groups.length > 0) {
            this.selectedClass = this.groups[0].group_id;
            this.onClassChange();
          }
        }
      });
    });
  }

  onClassChange(): void {
    if (!this.selectedClass) return;

    // Auto-detect Semester from selected Class Group configuration created by Admin
    const selectedGroup = this.groups.find(g => Number(g.group_id) === Number(this.selectedClass));
    if (selectedGroup && selectedGroup.current_semester) {
      this.selectedSemester = Number(selectedGroup.current_semester);
    }

    this.checkAutoDetectExamSchedule();
    this.loadScores();
  }

  checkAutoDetectExamSchedule(): void {
    this.api.get<any>('exams', { group_id: this.selectedClass, teacher_only: 'true' }).subscribe({
      next: (res) => {
        const examsList = res.data?.exams || [];
        if (examsList.length > 0) {
          // Sort to get the LATEST exam schedule created by Admin
          const sortedExams = [...examsList].sort((a, b) => {
            const dateA = new Date(a.exam_date || 0).getTime();
            const dateB = new Date(b.exam_date || 0).getTime();
            return dateB - dateA;
          });

          const latestExam = sortedExams[0];
          this.autoDetectedExam = latestExam;

          if (latestExam.semester) {
            const semStr = String(latestExam.semester);
            if (semStr.includes('2')) this.selectedSemester = 2;
            else if (semStr.includes('1')) this.selectedSemester = 1;
            else if (!isNaN(Number(semStr))) this.selectedSemester = Number(semStr);
          }

          const val = String(latestExam.category || latestExam.exam_title).toUpperCase();
          this.availableExamTypes = [
            {
              value: val,
              label: ` ${latestExam.exam_title || latestExam.subject_name} (${latestExam.category || 'Latest Exam'} - Max 50)`
            }
          ];

          this.selectedExamType = val;
        } else {
          this.autoDetectedExam = null;
          this.availableExamTypes = [
            { value: 'MIDTERM', label: 'Midterm Exam (Max 50)' },
            { value: 'FINAL', label: 'Final Exam (Max 50)' }
          ];
          this.selectedExamType = 'MIDTERM';
        }
      },
      error: () => {
        this.autoDetectedExam = null;
        this.availableExamTypes = [
          { value: 'MIDTERM', label: 'Midterm Exam (Max 50)' },
          { value: 'FINAL', label: 'Final Exam (Max 50)' }
        ];
        this.selectedExamType = 'MIDTERM';
      }
    });
  }

  computeGrade(s: any): void {
    const sc = Number(s.score);
    if (isNaN(sc) || s.score === null || s.score === '') {
      s.grade = 'N/A';
      return;
    }

    // Scale out of 50 marks (Midterm 50 / Final 50)
    if (sc >= 45) s.grade = 'A';
    else if (sc >= 40) s.grade = 'B+';
    else if (sc >= 35) s.grade = 'B';
    else if (sc >= 30) s.grade = 'C+';
    else if (sc >= 20) s.grade = 'C';
    else s.grade = 'F';
  }

  loadScores(): void {
    if (!this.selectedClass) {
      this.students = [];
      return;
    }

    // Fetch REAL students & saved academic results directly from MySQL Database
    this.api.get<any>('students', { groupId: this.selectedClass }).subscribe({
      next: (stuRes) => {
        const list = stuRes.data?.students || stuRes.data || [];

        this.api.get<any>('results', { group_id: this.selectedClass, exam_id: this.autoDetectedExam?.exam_id }).subscribe({
          next: (res) => {
            const savedResults = res.data?.results || [];
            const resultMap = new Map<number, any>();
            savedResults.forEach((r: any) => resultMap.set(Number(r.student_id), r));

            this.students = list.map((s: any) => {
              const saved = resultMap.get(Number(s.student_id));
              const item = {
                student_id: s.student_id,
                custom_student_id: s.custom_student_id,
                first_name: s.first_name,
                last_name: s.last_name,
                image: s.image || s.photo || s.avatar || s.profile_image || null,
                imageError: false,
                score: saved ? Number(saved.raw_score) : null,
                grade: saved ? saved.letter_grade : 'N/A',
                remarks: saved ? saved.remarks || '' : ''
              };
              if (saved) {
                this.computeGrade(item);
              }
              return item;
            });
          },
          error: () => {
            this.students = list.map((s: any) => ({
              student_id: s.student_id,
              custom_student_id: s.custom_student_id,
              first_name: s.first_name,
              last_name: s.last_name,
              image: s.image || s.photo || s.avatar || s.profile_image || null,
              imageError: false,
              score: null,
              grade: 'N/A',
              remarks: ''
            }));
          }
        });
      },
      error: () => {
        this.students = [];
      }
    });
  }

  saveScores(): void {
    if (!this.selectedClass || this.students.length === 0) {
      this.toast.error('No student scores to save!');
      return;
    }

    const payload = {
      exam_id: this.autoDetectedExam?.exam_id || 1,
      group_id: this.selectedClass,
      assessmentType: this.selectedExamType,
      scores: this.students
        .filter(s => s.score !== null && s.score !== undefined && s.score !== '')
        .map(s => ({
          student_id: s.student_id,
          raw_score: Number(s.score),
          remarks: s.remarks || ''
        }))
    };

    if (payload.scores.length === 0) {
      this.toast.error('Please enter score (0 - 50) for at least one student before submitting!');
      return;
    }

    this.api.post('results', payload).subscribe({
      next: () => {
        this.toast.success('Scores submitted successfully to Admin for review & database storage!');
        this.loadScores();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to submit scores to Admin');
      }
    });
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  }
}

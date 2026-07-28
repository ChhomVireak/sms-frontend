import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Academic Grades & GPA'" 
                [subtitle]="'Student Portal / Transcripts & Academic Results'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- GPA Summary Banner -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card 1: FULL YEAR CUMULATIVE GPA -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CUMULATIVE YEARLY GPA</span>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2">
            {{ (yearlyGPA !== 'N/A' && yearlyGPA !== 'Pending Sem 2') ? (yearlyGPA + ' / 4.00') : 'Pending' }}
          </h3>
          <p class="text-xs mt-1 font-semibold" [ngClass]="(hasSem1Completed && hasSem2Completed) ? 'text-emerald-400' : 'text-amber-400'">
            {{ (hasSem1Completed && hasSem2Completed) ? 'Academic Year Complete (Semesters 1 & 2 Completed)' : 'Requires Completion of Both Semesters 1 & 2 for Cumulative GPA' }}
          </p>
        </div>

        <!-- Card 2: TOTAL CREDITS COMPLETED -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL CREDITS COMPLETED</span>
          <h3 class="text-3xl font-extrabold text-cyan-400 mt-2">{{ totalCredits }} Credits</h3>
          <p class="text-xs text-gray-400 mt-1">Calculated from published courses</p>
        </div>

        <!-- Card 3: ACADEMIC STATUS -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACADEMIC STATUS</span>
          <h3 class="text-3xl font-extrabold text-amber-400 mt-2">{{ grades.length > 0 ? 'ACTIVE' : 'PENDING' }}</h3>
          <p class="text-xs text-gray-400 mt-1">Student Academic Record</p>
        </div>
      </div>

      <!-- Grouped Academic Years Sections -->
      <div *ngFor="let yr of groupedAcademicYears" class="space-y-6">
        <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-6 space-y-6">
          <!-- Year Header Banner -->
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4 flex-wrap gap-3">
            <div>
              <h2 class="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-graduation-cap text-emerald-400"></i> {{ yr.yearLabel }} Academic Record
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">Academic transcripts grouped by semester (Semester 1 & Semester 2)</p>
            </div>

            <!-- Full Year GPA Badge & Show/Hide Toggle -->
            <div class="flex items-center gap-3">
              <span [ngClass]="(yr.hasSem1 && yr.hasSem2) ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold font-mono shadow-md">
                Full Year GPA: {{ (yr.yearGPA !== 'N/A' && yr.yearGPA !== 'Pending Sem 2') ? (yr.yearGPA + ' / 4.00') : (yr.yearGPA === 'Pending Sem 2' ? 'Pending ' : 'N/A') }}
              </span>

              <button (click)="toggleYear(yr.yearLabel)"
                      class="px-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] hover:bg-[#1f2937] text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2 shadow-md">
                <i [class.fa-chevron-up]="isYearExpanded(yr.yearLabel)" [class.fa-chevron-down]="!isYearExpanded(yr.yearLabel)" class="fa-solid text-emerald-400"></i>
                <span>{{ isYearExpanded(yr.yearLabel) ? 'Hide' : 'Show' }}</span>
              </button>
            </div>
          </div>

          <!-- Collapsible Year Body Container -->
          <div *ngIf="isYearExpanded(yr.yearLabel)" class="space-y-6">
            <!-- Semester 1 Matrix Table -->
            <div class="space-y-3">
              <div (click)="toggleSem1(yr.yearLabel)"
                   class="flex items-center justify-between bg-[#111827]/90 px-4 py-2.5 rounded-xl border border-[#1f2937] cursor-pointer hover:bg-[#111827] transition-all">
                <span class="text-xs font-extrabold text-cyan-400 flex items-center gap-2">
                  <i class="fa-solid fa-book-open"></i> Semester 1 Matrix
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono font-semibold text-gray-400">
                    {{ yr.sem1List.length }} Courses
                  </span>
                  <span class="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <span>{{ isSem1Expanded(yr.yearLabel) ? 'Hide' : 'Show' }}</span>
                    <i [class.fa-chevron-up]="isSem1Expanded(yr.yearLabel)" [class.fa-chevron-down]="!isSem1Expanded(yr.yearLabel)" class="fa-solid text-[10px] text-cyan-400"></i>
                  </span>
                </div>
              </div>

              <div *ngIf="isSem1Expanded(yr.yearLabel)" class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider text-center">
                      <th class="pb-3 text-left">SUBJECT CODE & NAME</th>
                      <th class="pb-3">MIDTERM (MID)</th>
                      <th class="pb-3">FINAL EXAM (FINAL)</th>
                      <th class="pb-3">TOTAL SCORE</th>
                      <th class="pb-3">LETTER GRADE</th>
                      <th class="pb-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#1f2937]/50 font-mono">
                    <tr *ngFor="let g of yr.sem1List" class="hover:bg-gray-800/40 transition-colors text-center">
                      <td class="py-3.5 text-left font-sans">
                        <span class="text-emerald-400 font-extrabold text-xs block font-mono">{{ g.subject_code || 'SUB-01' }}</span>
                        <span class="text-xs text-white font-bold block">{{ g.subject_name }}</span>
                      </td>
                      <td class="py-3.5 font-bold text-amber-300 text-sm">
                        {{ (g.mid_score !== null && g.mid_score !== undefined) ? (g.mid_score | number:'1.2-2') + '/50' : '—/50' }}
                      </td>
                      <td class="py-3.5 font-bold text-purple-300 text-sm">
                        {{ (g.final_score !== null && g.final_score !== undefined) ? (g.final_score | number:'1.2-2') + '/50' : '—/50' }}
                      </td>
                      <td class="py-3.5 font-extrabold text-white text-sm">
                        {{ g.total_score }}/100
                      </td>
                      <td class="py-3.5 font-sans">
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined" [ngClass]="{
                          'bg-emerald-950 text-emerald-400 border-emerald-800': g.letter_grade === 'A' || g.letter_grade === 'B+',
                          'bg-amber-950 text-amber-400 border-amber-800': g.letter_grade === 'B' || g.letter_grade === 'C+',
                          'bg-rose-950 text-rose-400 border-rose-800': g.letter_grade === 'C' || g.letter_grade === 'F'
                        }" class="px-2.5 py-1 rounded-lg border font-extrabold text-xs font-mono">
                          {{ g.letter_grade }}
                        </span>
                        <span *ngIf="g.final_score === null || g.final_score === undefined" class="text-gray-500 font-mono text-xs">
                          —
                        </span>
                      </td>
                      <td class="py-3.5 text-center font-sans">
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined && g.letter_grade !== 'F'" class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                          PASSED
                        </span>
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined && g.letter_grade === 'F'" class="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                          FAILED
                        </span>
                        <span *ngIf="g.final_score === null || g.final_score === undefined" class="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                          PENDING FINAL
                        </span>
                      </td>
                    </tr>

                    <tr *ngIf="yr.sem1List.length === 0">
                      <td colspan="6" class="py-6 text-center text-gray-500 italic font-sans text-xs">
                        No Semester 1 course grades recorded in database.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Semester 2 Matrix Table -->
            <div class="space-y-3 pt-4 border-t border-[#1f2937]">
              <div (click)="toggleSem2(yr.yearLabel)"
                   class="flex items-center justify-between bg-[#111827]/90 px-4 py-2.5 rounded-xl border border-[#1f2937] cursor-pointer hover:bg-[#111827] transition-all">
                <span class="text-xs font-extrabold text-purple-400 flex items-center gap-2">
                  <i class="fa-solid fa-book-bookmark"></i> Semester 2 Matrix
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono font-semibold text-gray-400">
                    {{ yr.sem2List.length }} Courses
                  </span>
                  <span class="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <span>{{ isSem2Expanded(yr.yearLabel) ? 'Hide' : 'Show' }}</span>
                    <i [class.fa-chevron-up]="isSem2Expanded(yr.yearLabel)" [class.fa-chevron-down]="!isSem2Expanded(yr.yearLabel)" class="fa-solid text-[10px] text-purple-400"></i>
                  </span>
                </div>
              </div>

              <div *ngIf="isSem2Expanded(yr.yearLabel)" class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider text-center">
                      <th class="pb-3 text-left">SUBJECT CODE & NAME</th>
                      <th class="pb-3">MIDTERM (MID)</th>
                      <th class="pb-3">FINAL EXAM (FINAL)</th>
                      <th class="pb-3">TOTAL SCORE</th>
                      <th class="pb-3">LETTER GRADE</th>
                      <th class="pb-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#1f2937]/50 font-mono">
                    <tr *ngFor="let g of yr.sem2List" class="hover:bg-gray-800/40 transition-colors text-center">
                      <td class="py-3.5 text-left font-sans">
                        <span class="text-emerald-400 font-extrabold text-xs block font-mono">{{ g.subject_code || 'SUB-01' }}</span>
                        <span class="text-xs text-white font-bold block">{{ g.subject_name }}</span>
                      </td>
                      <td class="py-3.5 font-bold text-amber-300 text-sm">
                        {{ (g.mid_score !== null && g.mid_score !== undefined) ? (g.mid_score | number:'1.2-2') + '/50' : '—/50' }}
                      </td>
                      <td class="py-3.5 font-bold text-purple-300 text-sm">
                        {{ (g.final_score !== null && g.final_score !== undefined) ? (g.final_score | number:'1.2-2') + '/50' : '—/50' }}
                      </td>
                      <td class="py-3.5 font-extrabold text-white text-sm">
                        {{ g.total_score }}/100
                      </td>
                      <td class="py-3.5 font-sans">
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined" [ngClass]="{
                          'bg-emerald-950 text-emerald-400 border-emerald-800': g.letter_grade === 'A' || g.letter_grade === 'B+',
                          'bg-amber-950 text-amber-400 border-amber-800': g.letter_grade === 'B' || g.letter_grade === 'C+',
                          'bg-rose-950 text-rose-400 border-rose-800': g.letter_grade === 'C' || g.letter_grade === 'F'
                        }" class="px-2.5 py-1 rounded-lg border font-extrabold text-xs font-mono">
                          {{ g.letter_grade }}
                        </span>
                        <span *ngIf="g.final_score === null || g.final_score === undefined" class="text-gray-500 font-mono text-xs">
                          —
                        </span>
                      </td>
                      <td class="py-3.5 text-center font-sans">
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined && g.letter_grade !== 'F'" class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                          PASSED
                        </span>
                        <span *ngIf="g.final_score !== null && g.final_score !== undefined && g.letter_grade === 'F'" class="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                          FAILED
                        </span>
                        <span *ngIf="g.final_score === null || g.final_score === undefined" class="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                          PENDING FINAL
                        </span>
                      </td>
                    </tr>

                    <tr *ngIf="yr.sem2List.length === 0">
                      <td colspan="6" class="py-6 text-center text-gray-500 italic font-sans text-xs">
                        ⏳ Semester 2 exams pending / Not published yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentGradesComponent implements OnInit {
  grades: any[] = [];
  selectedTableFilter: string = 'ALL';

  expandedYearsMap: { [key: string]: boolean } = {};
  expandedSem1Map: { [key: string]: boolean } = {};
  expandedSem2Map: { [key: string]: boolean } = {};

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadGrades();
  }

  toggleYear(yearLabel: string): void {
    this.expandedYearsMap[yearLabel] = !this.expandedYearsMap[yearLabel];
  }

  isYearExpanded(yearLabel: string): boolean {
    return !!this.expandedYearsMap[yearLabel];
  }

  toggleSem1(yearLabel: string): void {
    this.expandedSem1Map[yearLabel] = !this.expandedSem1Map[yearLabel];
  }

  isSem1Expanded(yearLabel: string): boolean {
    // If year is expanded, default sem1 to expanded or use sem1 map state
    return this.expandedSem1Map[yearLabel] !== undefined ? this.expandedSem1Map[yearLabel] : true;
  }

  toggleSem2(yearLabel: string): void {
    this.expandedSem2Map[yearLabel] = !this.expandedSem2Map[yearLabel];
  }

  isSem2Expanded(yearLabel: string): boolean {
    return this.expandedSem2Map[yearLabel] !== undefined ? this.expandedSem2Map[yearLabel] : true;
  }

  aggregateSubjects(rawList: any[]): any[] {
    if (!rawList || rawList.length === 0) return [];

    const map = new Map<string, any>();

    rawList.forEach(item => {
      const subKey = String(item.subject_id || item.subject_code || item.subject_name).trim();

      if (!map.has(subKey)) {
        map.set(subKey, {
          subject_id: item.subject_id,
          subject_code: item.subject_code || 'SUB-01',
          subject_name: item.subject_name || 'Subject',
          credits: item.credits || 3,
          mid_score: null,
          final_score: null,
          raw_score: item.raw_score,
          semester: item.semester,
          academic_year: item.academic_year
        });
      }

      const existing = map.get(subKey);

      if (item.mid_score !== null && item.mid_score !== undefined) {
        existing.mid_score = Number(item.mid_score);
      }
      if (item.final_score !== null && item.final_score !== undefined) {
        existing.final_score = Number(item.final_score);
      }

      const cat = String(item.category || item.exam_title || item.exam_type || '').toLowerCase();
      const isMid = cat.includes('mid') || cat.includes('ពាក់កណ្តាល');
      const isFinal = cat.includes('final') || cat.includes('បញ្ចប់');
      const scoreVal = Number(item.raw_score ?? item.score ?? 0);

      if (isFinal) {
        existing.final_score = scoreVal;
      } else if (isMid) {
        existing.mid_score = scoreVal;
      } else {
        if (existing.mid_score === null) {
          existing.mid_score = scoreVal;
        } else if (existing.final_score === null && existing.mid_score !== scoreVal) {
          existing.final_score = scoreVal;
        }
      }
    });

    const aggregated: any[] = [];
    map.forEach(sub => {
      const mid = sub.mid_score !== null ? Number(sub.mid_score) : null;
      const final = sub.final_score !== null ? Number(sub.final_score) : null;

      let total = 0;
      if (mid !== null && final !== null) {
        total = mid + final;
      } else if (mid !== null) {
        total = mid;
      } else if (final !== null) {
        total = final;
      } else {
        const raw = Number(sub.raw_score || 0);
        total = raw <= 50 ? raw * 2 : raw;
      }

      sub.total_score = total;

      if (total >= 90) { sub.letter_grade = 'A'; sub.grade_point = 4.0; sub.gpa_point = 4.0; }
      else if (total >= 80) { sub.letter_grade = 'B+'; sub.grade_point = 3.5; sub.gpa_point = 3.5; }
      else if (total >= 70) { sub.letter_grade = 'B'; sub.grade_point = 3.0; sub.gpa_point = 3.0; }
      else if (total >= 60) { sub.letter_grade = 'C+'; sub.grade_point = 2.5; sub.gpa_point = 2.5; }
      else if (total >= 50) { sub.letter_grade = 'C'; sub.grade_point = 2.0; sub.gpa_point = 2.0; }
      else { sub.letter_grade = 'F'; sub.grade_point = 0.0; sub.gpa_point = 0.0; }

      aggregated.push(sub);
    });

    return aggregated;
  }

  get groupedAcademicYears(): any[] {
    if (!this.grades || this.grades.length === 0) {
      return [{
        yearLabel: 'Year 1 (2025-2026)',
        sem1List: [],
        sem2List: [],
        yearGPA: 'N/A',
        hasSem1: false,
        hasSem2: false
      }];
    }

    const map = new Map<string, any[]>();
    this.grades.forEach(g => {
      const yr = g.academic_year || 'Year 1 (2025-2026)';
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr)!.push(g);
    });

    const result: any[] = [];
    map.forEach((items, yearLabel) => {
      const sem1List = items.filter(g => {
        const s = (g.semester || g.exam_title || '').toLowerCase();
        return s.includes('1') || s.includes('sem 1') || s.includes('semester 1') || s.includes('ឆមាសទី ១');
      });

      const sem2List = items.filter(g => {
        const s = (g.semester || g.exam_title || '').toLowerCase();
        return s.includes('2') || s.includes('sem 2') || s.includes('semester 2') || s.includes('ឆមាសទី ២');
      });

      const sem1FinalList = sem1List.length > 0 ? sem1List : (sem2List.length === 0 ? items : []);
      const sem2FinalList = sem2List;

      const sem1Aggregated = this.aggregateSubjects(sem1FinalList);
      const sem2Aggregated = this.aggregateSubjects(sem2FinalList);

      const hasSem1 = sem1Aggregated.length > 0 && sem1Aggregated.some(s => s.final_score !== null);
      const hasSem2 = sem2Aggregated.length > 0 && sem2Aggregated.some(s => s.final_score !== null);

      let yearGPA = 'N/A';
      if (hasSem1 && hasSem2) {
        const allSub = [...sem1Aggregated, ...sem2Aggregated];
        const sum = allSub.reduce((acc, g) => acc + (Number(g.grade_point || g.gpa_point) || 0), 0);
        yearGPA = (sum / allSub.length).toFixed(2);
      } else if (hasSem1 && !hasSem2) {
        yearGPA = 'Pending Sem 2';
      }

      result.push({
        yearLabel,
        items,
        sem1List: sem1Aggregated,
        sem2List: sem2Aggregated,
        yearGPA,
        hasSem1,
        hasSem2
      });
    });

    return result;
  }

  get filteredTableGrades(): any[] {
    if (this.selectedTableFilter === 'SEM1') {
      return this.sem1Grades;
    } else if (this.selectedTableFilter === 'SEM2') {
      return this.sem2Grades;
    }
    return this.grades;
  }

  get sem1Grades(): any[] {
    if (!this.grades || this.grades.length === 0) return [];
    return this.grades.filter(g => {
      const s = (g.semester || g.exam_title || '').toLowerCase();
      return s.includes('1') || s.includes('sem 1') || s.includes('semester 1') || s.includes('ឆមាសទី ១');
    });
  }

  get sem2Grades(): any[] {
    if (!this.grades || this.grades.length === 0) return [];
    return this.grades.filter(g => {
      const s = (g.semester || g.exam_title || '').toLowerCase();
      return s.includes('2') || s.includes('sem 2') || s.includes('semester 2') || s.includes('ឆមាសទី ២');
    });
  }

  get hasSem1Completed(): boolean {
    return this.sem1Grades.length > 0;
  }

  get hasSem2Completed(): boolean {
    return this.sem2Grades.length > 0;
  }

  get sem1GPA(): string {
    if (this.sem1Grades.length === 0) return 'N/A';
    const sum = this.sem1Grades.reduce((acc, g) => acc + (Number(g.grade_point || g.gpa_point) || 0), 0);
    return (sum / this.sem1Grades.length).toFixed(2);
  }

  get sem2GPA(): string {
    if (this.sem2Grades.length === 0) return 'N/A';
    const sum = this.sem2Grades.reduce((acc, g) => acc + (Number(g.grade_point || g.gpa_point) || 0), 0);
    return (sum / this.sem2Grades.length).toFixed(2);
  }

  get yearlyGPA(): string {
    if (this.grades.length === 0) return 'N/A';
    // Requires both Semester 1 and Semester 2 to calculate Full Academic Year GPA!
    if (this.hasSem1Completed && this.hasSem2Completed) {
      const sum = this.grades.reduce((acc, g) => acc + (Number(g.grade_point || g.gpa_point) || 0), 0);
      return (sum / this.grades.length).toFixed(2);
    }
    if (this.hasSem1Completed && !this.hasSem2Completed) {
      return 'Pending Sem 2';
    }
    const sum = this.grades.reduce((acc, g) => acc + (Number(g.grade_point || g.gpa_point) || 0), 0);
    return (sum / this.grades.length).toFixed(2);
  }

  get totalCredits(): number {
    return this.grades.reduce((acc, g) => acc + (Number(g.credits) || 3), 0);
  }

  getCalculatedTotalScore(g: any): number {
    if (g.total_score) return Number(g.total_score);
    const mid = Number(g.mid_score ?? (g.category === 'Midterm' || (g.exam_title || '').includes('Mid') ? g.raw_score : 0));
    const final = Number(g.final_score ?? (g.category === 'Final' || (g.exam_title || '').includes('Final') ? g.raw_score : 0));
    if (mid > 0 || final > 0) return mid + final;
    return Number(g.raw_score || 0) <= 50 ? Number(g.raw_score || 0) * 2 : Number(g.raw_score || 0);
  }

  loadGrades(): void {
    this.api.get<any>('dashboard/student').subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.grades) {
          this.grades = res.data.grades;
        }
      },
      error: () => {
        this.grades = [];
      }
    });
  }
}

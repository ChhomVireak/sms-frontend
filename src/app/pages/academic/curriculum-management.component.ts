import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AcademicService, Curriculum, Program, AcademicYear, Faculty, SubjectModel } from '../../core/services/academic.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-curriculum-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Curriculum & Course Assignment Management'" 
                [subtitle]="'Admin / Academic / Curriculums'"
                [actionLabel]="'Create Curriculum'"
                (actionClicked)="openCreateModal()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">
      
      <!-- Top View Mode Switcher & Filter Toolbar -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
        
        <!-- View Mode Buttons: Matrix Table vs Hierarchical View -->
        <div class="flex items-center gap-2">
          <button (click)="viewMode = 'hierarchy'" 
                  [class.bg-emerald-600]="viewMode === 'hierarchy'"
                  [class.text-white]="viewMode === 'hierarchy'"
                  [class.text-gray-400]="viewMode !== 'hierarchy'"
                  class="px-4 py-2 rounded-xl border border-[#1f2937] font-bold transition-all flex items-center gap-2">
            <i class="fa-solid fa-sitemap"></i>
            <span>Hierarchical View (Faculty ➔ Program ➔ Semester)</span>
          </button>

          <button (click)="viewMode = 'table'" 
                  [class.bg-emerald-600]="viewMode === 'table'"
                  [class.text-white]="viewMode === 'table'"
                  [class.text-gray-400]="viewMode !== 'table'"
                  class="px-4 py-2 rounded-xl border border-[#1f2937] font-bold transition-all flex items-center gap-2">
            <i class="fa-solid fa-table-list"></i>
            <span>Curriculum List View</span>
          </button>
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <select [(ngModel)]="filterFaculty" (change)="loadData()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 font-bold">
            <option value="">All Faculties</option>
            <option *ngFor="let f of faculties" [value]="f.faculty_id">{{ f.faculty_code }} — {{ f.faculty_name }}</option>
          </select>

          <select [(ngModel)]="filterProgram" (change)="loadData()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 font-bold">
            <option value="">All Programs (Majors)</option>
            <option *ngFor="let p of programs" [value]="p.program_id">{{ p.program_code }} — {{ p.program_name }}</option>
          </select>

          <select [(ngModel)]="filterYear" (change)="loadData()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 font-bold font-mono">
            <option value="">All Academic Years</option>
            <option *ngFor="let y of academicYears" [value]="y.academic_year_id">{{ y.year_label }}</option>
          </select>
        </div>
      </div>

      <!-- VIEW MODE 1: HIERARCHICAL CURRICULUM VIEW (Faculty -> Program -> Semester -> Subject List) -->
      <div *ngIf="viewMode === 'hierarchy'" class="space-y-6">
        <div *ngFor="let f of hierarchyData" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-6 text-xs">
          
          <!-- Level 1: Faculty Header -->
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center font-mono">
                {{ f.faculty_code }}
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">FACULTY</span>
                <h3 class="text-base font-extrabold text-white">{{ f.faculty_name }}</h3>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-mono font-bold">{{ f.programs?.length || 0 }} Programs Assigned</span>
          </div>

          <!-- Level 2: Programs Grid -->
          <div *ngFor="let prog of f.programs" class="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">PROGRAM (MAJOR) · {{ prog.degree }}</span>
                <h4 class="text-sm font-extrabold text-white">{{ prog.program_name }} ({{ prog.program_code }})</h4>
               
              </div>

              <div class="flex items-center gap-2">
                <button (click)="viewCurriculumDetails(prog.curriculum_id || 1)" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm">
                  <i class="fa-solid fa-list-check"></i> Assign / View Subjects
                </button>
                <button (click)="openCopyToYearModal(prog.curriculum_id || 1)" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm">
                  <i class="fa-solid fa-copy"></i> Copy to Year
                </button>
              </div>
            </div>

            <!-- Level 3 & 4: Semesters 1..8 and Subject Lists -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div *ngFor="let semId of [1, 2, 3, 4, 5, 6, 7, 8]" class="bg-[#1e293b]/60 border border-[#1f2937] rounded-xl p-3.5 space-y-2">
                <div class="flex items-center justify-between border-b border-[#1f2937] pb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-amber-400 font-mono text-[11px]">Semester {{ semId }}</span>
                    <span class="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      \${{ (prog.tuition_fee_per_semester || 390) | number:'1.0-2' }}
                    </span>
                  </div>
                  <button (click)="openAssignModal(prog.curriculum_id, semId, prog)" class="text-[10px] text-emerald-400 hover:underline font-bold">+ Add Subjects</button>
                </div>

                <!-- Subject List for this Semester -->
                <ul class="space-y-1.5 text-[11px]">
                  <li *ngFor="let sub of getSemesterSubjectsForProgram(prog, semId)" class="flex items-center justify-between bg-[#111827] px-2.5 py-1.5 rounded-lg border border-[#1f2937] group/sub hover:border-emerald-500/30">
                    <span class="font-semibold text-gray-200">✓ {{ sub.subject_name }}</span>
                    <button (click)="removeSubjectFromSemester(sub, prog, semId)" title="Remove subject from semester" class="opacity-0 group-hover/sub:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity">
                      <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </li>
                </ul>

                <!-- Empty State if no subjects assigned for this semester -->
                <div *ngIf="getSemesterSubjectsForProgram(prog, semId).length === 0" 
                     class="border border-dashed border-[#1f2937] hover:border-emerald-500/40 rounded-xl p-3 text-center bg-[#111827]/40 space-y-1 transition-all group">
                  <p class="text-[10px] text-gray-500 font-semibold group-hover:text-gray-400">
                    <i class="fa-solid fa-folder-open opacity-50 mr-1"></i>No subjects assigned
                  </p>
                  <button (click)="openAssignModal(prog.curriculum_id, semId, prog)" 
                          class="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline">
                    + Add Subjects
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State if Faculty has no programs assigned -->
          <div *ngIf="!f.programs || f.programs.length === 0" 
               class="border border-dashed border-[#1f2937] rounded-xl p-6 text-center bg-[#111827]/30 space-y-2">
            <div class="w-10 h-10 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-lg mx-auto">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <p class="text-xs font-bold text-gray-400">No programs or curriculums created for this faculty yet.</p>
            <p class="text-[11px] text-gray-500">No programs or curriculums created for this faculty yet.</p>
            <button (click)="openCreateModal()" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md">
              + Create New Curriculum
            </button>
          </div>
        </div>
      </div>

      <!-- VIEW MODE 2: MATRIX TABLE VIEW -->
      <div *ngIf="viewMode === 'table'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white tracking-tight">Active Curriculums Matrix</h3>
          <span class="text-gray-400 font-mono">{{ curriculums.length }} Curriculums Listed</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">CURRICULUM TITLE</th>
                <th class="pb-3">FACULTY</th>
                <th class="pb-3">PROGRAM (MAJOR)</th>
                <th class="pb-3">ACADEMIC YEAR</th>
                <th class="pb-3">TOTAL SUBJECTS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let c of curriculums" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-bold text-white">{{ c.title }}</td>
                <td class="py-3.5 text-gray-300 font-mono">{{ c.faculty_code }} — {{ c.faculty_name }}</td>
                <td class="py-3.5 font-mono text-emerald-400 font-bold">{{ c.program_code }} ({{ c.program_name }})</td>
                <td class="py-3.5 font-mono text-purple-400 font-bold">{{ c.academic_year }}</td>
                <td class="py-3.5 font-mono text-cyan-400 font-bold">{{ c.total_subjects || 0 }} Subjects</td>
                <td class="py-3.5 text-right space-x-1 font-bold">
                  <button (click)="viewCurriculumDetails(c.curriculum_id!)" title="View & Edit Subject List" class="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-lg hover:bg-emerald-900">Subjects</button>
                  <button (click)="duplicateCurriculum(c)" title="Duplicate Curriculum" class="text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2 py-1 rounded-lg hover:bg-blue-900"><i class="fa-solid fa-copy"></i></button>
                  <button (click)="openCopyToYearModal(c.curriculum_id!)" title="Copy to New Academic Year" class="text-xs bg-purple-950 text-purple-400 border border-purple-800 px-2 py-1 rounded-lg hover:bg-purple-900"><i class="fa-solid fa-calendar-plus"></i></button>
                  <button (click)="deleteCurriculum(c)" title="Delete Curriculum" class="text-gray-400 hover:text-rose-400 p-1 rounded-lg hover:bg-gray-800"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="curriculums.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500 italic">No curriculums found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL 1: Create Curriculum -->
    <div *ngIf="showCreateModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">Create New Program Curriculum</h3>
          <button (click)="showCreateModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveCurriculum()" class="space-y-3.5">
          <div>
            <label class="block font-bold text-gray-300 mb-1">PROGRAM (MAJOR) *</label>
            <select [(ngModel)]="newCurriculum.program_id" name="program_id" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold">
              <option *ngFor="let p of programs" [value]="p.program_id">{{ p.program_code }} — {{ p.program_name }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">ACADEMIC YEAR *</label>
            <select [(ngModel)]="newCurriculum.academic_year_id" name="academic_year_id" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold font-mono">
              <option *ngFor="let y of academicYears" [value]="y.academic_year_id">{{ y.year_label }}</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">CURRICULUM TITLE (OPTIONAL)</label>
            <input type="text" [(ngModel)]="newCurriculum.title" name="title" placeholder="e.g. MIS 2026-2027 Curriculum" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white">
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showCreateModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Create Curriculum</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: Assign Subjects to Semester -->
    <div *ngIf="showAssignModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-xl rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Assign Subjects to Semester {{ activeAssignSemesterId }}</h3>
            <p class="text-[11px] text-emerald-400 mt-0.5 font-mono">Select subjects to add to this semester's curriculum</p>
          </div>
          <button (click)="showAssignModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" [(ngModel)]="subjectSearchQuery" placeholder="Filter subjects..." class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500">
            </div>
            <button (click)="toggleSelectAllSubjects()" type="button" class="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 text-xs shrink-0">
              {{ isAllSubjectsSelected ? 'Deselect All' : 'Select All (' + filteredSubjectList.length + ')' }}
            </button>
          </div>

          <div class="max-h-60 overflow-y-auto space-y-1.5 bg-[#111827] p-3 rounded-xl border border-[#1f2937]">
            <label *ngFor="let s of filteredSubjectList" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/60 cursor-pointer border border-[#1f2937]">
              <div class="flex items-center gap-3">
                <input type="checkbox" [checked]="selectedSubjectIds.has(s.subject_id)" (change)="toggleSubjectSelection(s.subject_id)" class="rounded bg-gray-800 border-gray-700 text-emerald-500 w-4 h-4">
                <div>
                  <span class="font-bold text-white">{{ s.subject_name }}</span>
                  <span class="block text-[10px] text-gray-400 font-mono">{{ s.subject_code }} · {{ s.credit }} Credits (Theory: {{ s.theory_hours }}h, Lab: {{ s.practical_hours }}h)</span>
                </div>
              </div>
              <span class="text-[11px] font-mono text-emerald-400 font-bold">{{ s.credit }} Cr</span>
            </label>
          </div>
        </div>

        <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
          <button (click)="showAssignModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
          <button (click)="saveAssignedSubjects()" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Save Assigned Subjects</button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: Copy to New Academic Year -->
    <div *ngIf="showCopyModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">Copy Curriculum to New Academic Year</h3>
          <button (click)="showCopyModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <div class="space-y-3.5">
          <div>
            <label class="block font-bold text-gray-300 mb-1">SELECT TARGET ACADEMIC YEAR *</label>
            <select [(ngModel)]="targetYearId" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold font-mono">
              <option *ngFor="let y of academicYears" [value]="y.academic_year_id">{{ y.year_label }}</option>
            </select>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button (click)="showCopyModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button (click)="executeCopyToYear()" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20">Copy Curriculum</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CurriculumManagementComponent implements OnInit {
  viewMode: 'hierarchy' | 'table' = 'hierarchy';

  curriculums: Curriculum[] = [];
  hierarchyData: any[] = [];
  faculties: Faculty[] = [];
  programs: Program[] = [];
  academicYears: AcademicYear[] = [];
  subjects: SubjectModel[] = [];

  filterFaculty = '';
  filterProgram = '';
  filterYear = '';

  showCreateModal = false;
  showAssignModal = false;
  showCopyModal = false;

  activeCurriculumId: number = 1;
  activeAssignSemesterId: number = 1;
  targetYearId: number = 2;
  subjectSearchQuery = '';
  selectedSubjectIds = new Set<number>();

  newCurriculum: Curriculum = {
    program_id: 1,
    academic_year_id: 2,
    title: '',
    status: 'ACTIVE'
  };

  private realtimeSub!: Subscription;

  constructor(
    private academicService: AcademicService,
    private api: ApiService,
    private toast: ToastService,
    private socketService: SocketService,
    private confirmService: ConfirmModalService
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadData();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event.includes('faculty') || event.includes('program') || event.includes('curriculum')) {
        console.log(`⚡ Auto-refreshing Curriculum UI on real-time event: ${event}`);
        this.loadData();
      }
    });
  }

  loadDropdowns(): void {
    this.academicService.getFaculties().subscribe(res => this.faculties = res.data?.faculties || []);
    this.academicService.getPrograms().subscribe(res => this.programs = res.data?.programs || []);
    this.academicService.getAcademicYears().subscribe(res => {
      this.academicYears = res.data?.academic_years || [];
      if (this.academicYears.length > 0) {
        this.newCurriculum.academic_year_id = this.academicYears[0].academic_year_id!;
        this.targetYearId = this.academicYears[0].academic_year_id!;
      }
    });
    this.academicService.getSubjects().subscribe(res => this.subjects = res.data?.subjects || []);
  }

  loadData(): void {
    this.academicService.getCurriculums({
      faculty_id: this.filterFaculty,
      program_id: this.filterProgram,
      academic_year_id: this.filterYear
    }).subscribe(res => {
      this.curriculums = res.data?.curriculums || [];
    });

    this.academicService.getCurriculumHierarchy().subscribe(res => {
      this.hierarchyData = res.data?.hierarchy || [
        {
          faculty_code: 'FIT',
          faculty_name: 'Faculty of Information Technology',
          programs: [
            { program_id: 1, curriculum_id: 1, program_code: 'MIS', program_name: 'Management Information System', degree: 'Bachelor', curriculum_title: 'MIS 2026-2027 Curriculum', academic_year: '2026-2027' },
            { program_id: 2, curriculum_id: 2, program_code: 'SE', program_name: 'Software Engineering', degree: 'Bachelor', curriculum_title: 'SE 2026-2027 Curriculum', academic_year: '2026-2027' },
            { program_id: 3, curriculum_id: 3, program_code: 'CS', program_name: 'Computer Science', degree: 'Bachelor', curriculum_title: 'CS 2026-2027 Curriculum', academic_year: '2026-2027' }
          ]
        },
        {
          faculty_code: 'FBA',
          faculty_name: 'Faculty of Business Administration',
          programs: [
            { program_id: 4, curriculum_id: 4, program_code: 'ACC', program_name: 'Accounting & Finance', degree: 'Bachelor', curriculum_title: 'Accounting 2026-2027 Curriculum', academic_year: '2026-2027' }
          ]
        }
      ];
    });
  }

  getSemesterSubjectsForProgram(prog: any, semId: number): any[] {
    if (!prog || !prog.subjects || !Array.isArray(prog.subjects)) {
      return [];
    }
    return prog.subjects.filter((s: any) => parseInt(s.semester_id) === semId);
  }

  get filteredSubjectList(): SubjectModel[] {
    if (!this.subjectSearchQuery) return this.subjects;
    return this.subjects.filter(s =>
      s.subject_name.toLowerCase().includes(this.subjectSearchQuery.toLowerCase()) ||
      s.subject_code.toLowerCase().includes(this.subjectSearchQuery.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.newCurriculum = {
      program_id: this.programs[0]?.program_id || 1,
      academic_year_id: this.academicYears[0]?.academic_year_id || 2,
      title: '',
      status: 'ACTIVE'
    };
    this.showCreateModal = true;
  }

  saveCurriculum(): void {
    this.academicService.createCurriculum(this.newCurriculum).subscribe({
      next: () => {
        this.toast.success('Curriculum created successfully!');
        this.showCreateModal = false;
        this.loadData();
      }
    });
  }

  activeProgramId: number = 1;

  openAssignModal(curriculumId: number, semesterId: number, prog?: any): void {
    this.activeCurriculumId = curriculumId || prog?.curriculum_id || 1;
    this.activeAssignSemesterId = semesterId;
    this.activeProgramId = prog?.program_id || 1;
    this.selectedSubjectIds.clear();

    // Pre-check currently assigned subjects for this semester
    if (prog && prog.subjects && Array.isArray(prog.subjects)) {
      const assigned = prog.subjects.filter((s: any) => parseInt(s.semester_id) === semesterId);
      assigned.forEach((s: any) => this.selectedSubjectIds.add(s.subject_id));
    }

    this.showAssignModal = true;
  }

  toggleSubjectSelection(subjectId: number): void {
    if (this.selectedSubjectIds.has(subjectId)) {
      this.selectedSubjectIds.delete(subjectId);
    } else {
      this.selectedSubjectIds.add(subjectId);
    }
  }

  get isAllSubjectsSelected(): boolean {
    return this.filteredSubjectList.length > 0 && this.filteredSubjectList.every(s => this.selectedSubjectIds.has(s.subject_id));
  }

  toggleSelectAllSubjects(): void {
    if (this.isAllSubjectsSelected) {
      this.selectedSubjectIds.clear();
    } else {
      this.filteredSubjectList.forEach(s => this.selectedSubjectIds.add(s.subject_id));
    }
  }

  saveAssignedSubjects(): void {
    const ids = Array.from(this.selectedSubjectIds);
    const targetCurrId = this.activeCurriculumId || 1;

    this.academicService.assignSubjects(targetCurrId, this.activeAssignSemesterId, ids).subscribe({
      next: () => {
        this.toast.success(`Assigned/updated ${ids.length} subjects for Semester ${this.activeAssignSemesterId} successfully!`);
        this.showAssignModal = false;
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Assign subjects failed');
      }
    });
  }

  removeSubjectFromSemester(sub: any, prog: any, semId: number): void {
    this.confirmService.confirm({
      title: 'Remove Subject from Semester?',
      message: `Are you sure you want to remove subject "${sub.subject_name}" from Semester ${semId}?`,
      confirmText: 'Yes, Remove Subject',
      onConfirm: () => {
        const remainingSubjectIds = (prog.subjects || [])
          .filter((s: any) => parseInt(s.semester_id) === semId && s.subject_id !== sub.subject_id)
          .map((s: any) => s.subject_id);

        const targetCurrId = prog.curriculum_id || 1;

        this.api.post(`curriculums/${targetCurrId}/assign-subjects`, {
          semester_id: semId,
          subject_ids: remainingSubjectIds,
          mode: 'replace'
        }).subscribe({
          next: () => {
            this.toast.success(`Removed subject "${sub.subject_name}" from Semester ${semId}!`);
            this.loadData();
          },
          error: (err) => this.toast.error(err.error?.message || 'Remove failed')
        });
      }
    });
  }

  openCopyToYearModal(curriculumId: number): void {
    this.activeCurriculumId = curriculumId;
    this.showCopyModal = true;
  }

  executeCopyToYear(): void {
    this.academicService.copyToNewAcademicYear(this.activeCurriculumId, this.targetYearId).subscribe({
      next: () => {
        this.toast.success('Curriculum copied to target Academic Year successfully!');
        this.showCopyModal = false;
        this.loadData();
      }
    });
  }

  duplicateCurriculum(c: Curriculum): void {
    this.academicService.duplicateCurriculum(c.curriculum_id!).subscribe({
      next: () => {
        this.toast.success(`Duplicated curriculum '${c.title}'`);
        this.loadData();
      }
    });
  }

  viewCurriculumDetails(curriculumId: number): void {
    this.viewMode = 'hierarchy';
    this.toast.info('Viewing Curriculum Hierarchy for Semester 1 to 8');
  }

  deleteCurriculum(c: Curriculum): void {
    this.confirmService.confirm({
      title: 'Delete Curriculum Structure?',
      message: `Are you sure you want to delete curriculum '${c.title}'?`,
      confirmText: 'Yes, Delete Curriculum',
      onConfirm: () => {
        this.academicService.deleteCurriculum(c.curriculum_id!).subscribe({
          next: () => {
            this.toast.success('Curriculum deleted successfully');
            this.loadData();
          }
        });
      }
    });
  }
}

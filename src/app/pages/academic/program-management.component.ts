import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AcademicService, Program, Faculty } from '../../core/services/academic.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-program-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Program (Major) Management'" 
                [subtitle]="'Admin / Academic / Programs'"
                [actionLabel]="'Create Program'"
                (actionClicked)="openModal()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">
      <!-- Search & Filters Toolbar -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div class="relative w-full md:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" [(ngModel)]="searchQuery" (input)="loadPrograms()" placeholder="Search program code or name (MIS, SE...)" class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500">
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <select [(ngModel)]="selectedFaculty" (change)="loadPrograms()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3.5 py-2.5 font-bold">
            <option value="">All Faculties</option>
            <option *ngFor="let f of faculties" [value]="f.faculty_id">{{ f.faculty_code }} — {{ f.faculty_name }}</option>
          </select>

          <select [(ngModel)]="selectedDegree" (change)="loadPrograms()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3.5 py-2.5 font-bold">
            <option value="">All Degrees</option>
            <option value="Associate">Associate</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
          </select>
        </div>
      </div>

      <!-- Programs Grid / Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white tracking-tight">Academic Majors & Degree Programs</h3>
          <span class="text-gray-400 font-mono">{{ programs.length }} Programs Total</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">CODE</th>
                <th class="pb-3">PROGRAM / MAJOR NAME</th>
                <th class="pb-3">FACULTY</th>
                <th class="pb-3">DEGREE</th>
                <th class="pb-3">FEE / SEMESTER</th>
                <th class="pb-3">STATUS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let p of programs" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-mono text-emerald-400 font-extrabold">{{ p.program_code }}</td>
                <td class="py-3.5 font-bold text-white">{{ p.program_name }}</td>
                <td class="py-3.5 text-blue-400 font-bold font-mono">{{ p.faculty_code }} — {{ p.faculty_name }}</td>
                <td class="py-3.5 font-bold text-purple-400">{{ p.degree }}</td>
                <td class="py-3.5 font-mono text-emerald-400 font-bold">\${{ p.tuition_fee_per_semester || 390 | number:'1.2-2' }} / Sem</td>
                <td class="py-3.5">
                  <span [class.bg-emerald-950]="p.status === 'ACTIVE'" [class.text-emerald-400]="p.status === 'ACTIVE'" [class.border-emerald-800]="p.status === 'ACTIVE'"
                        [class.bg-rose-950]="p.status !== 'ACTIVE'" [class.text-rose-400]="p.status !== 'ACTIVE'" [class.border-rose-800]="p.status !== 'ACTIVE'"
                        class="px-2.5 py-1 rounded-full border text-[10px] font-bold">
                    • {{ p.status }}
                  </span>
                </td>
                <td class="py-3.5 text-right space-x-1.5">
                  <button (click)="viewProgramDetails(p)" title="View Detailed Program Overview" class="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/20 transition-colors"><i class="fa-solid fa-eye"></i></button>
                  <button (click)="editProgram(p)" title="Edit Program" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteProgram(p)" title="Delete Program" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="programs.length === 0">
                <td colspan="10" class="py-8 text-center text-gray-500 italic">No program records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal Dialog -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-lg rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEditing ? 'Edit Program' : 'Create New Program (Major)' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveProgram()" class="space-y-3.5">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">PROGRAM CODE *</label>
              <input type="text" [(ngModel)]="currentProgram.program_code" name="program_code" required placeholder="e.g. MIS, SE, CS" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono uppercase">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">FACULTY *</label>
              <select [(ngModel)]="currentProgram.faculty_id" name="faculty_id" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold">
                <option *ngFor="let f of faculties" [value]="f.faculty_id">{{ f.faculty_code }} — {{ f.faculty_name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">PROGRAM / MAJOR NAME *</label>
            <input type="text" [(ngModel)]="currentProgram.program_name" name="program_name" required placeholder="e.g. Management Information System" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white">
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">DEGREE *</label>
              <select [(ngModel)]="currentProgram.degree" name="degree" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold">
                <option value="Associate">Associate</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">DURATION (YEARS)</label>
              <input type="number" [(ngModel)]="currentProgram.duration_years" (ngModelChange)="onDurationChange()" name="duration_years" min="1" max="6" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">TOTAL SEMESTERS</label>
              <input type="number" [(ngModel)]="currentProgram.total_semesters" name="total_semesters" min="1" max="12" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono">
            </div>
          </div>

          <!-- Tuition Fee & Calculation Box -->
          <div class="bg-[#111827] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">TUITION FEE & AUTOMATIC CALCULATION</h4>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">FEE PER SEMESTER ($) *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" [(ngModel)]="currentProgram.tuition_fee_per_semester" name="tuition_fee_per_semester" min="0" step="10" required placeholder="390" class="w-full bg-[#1e293b] border border-emerald-500/50 rounded-xl pl-8 pr-3 py-2 text-white font-mono font-bold text-sm">
                </div>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">CALCULATED TOTAL FEE ($)</label>
                <div class="w-full bg-[#1e293b] border border-cyan-500/40 rounded-xl px-3 py-1.5 text-cyan-400 font-mono font-extrabold text-sm">
                  \${{ calculatedTotalFee | number:'1.2-2' }}
                  <span class="block text-[10px] text-gray-400 font-normal">({{ currentProgram.tuition_fee_per_semester || 0 }}$ x {{ currentProgram.total_semesters || 8 }} Semesters)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">STATUS</label>
            <select [(ngModel)]="currentProgram.status" name="status" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Save Program</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Program Details Modal Overlay -->
    <div *ngIf="activeViewProgram" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-xl rounded-3xl p-6 space-y-6 text-white shadow-2xl relative">
        
        <!-- Modal Controls Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">
              🎓
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white flex items-center gap-2">
                {{ activeViewProgram.program_name }}
              </h3>
              <p class="text-xs text-emerald-400 font-mono font-bold">{{ activeViewProgram.program_code }} · {{ activeViewProgram.degree }} Degree</p>
            </div>
          </div>
          <button (click)="activeViewProgram = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
            <span class="text-gray-400 block text-[11px]">FACULTY</span>
            <span class="font-bold text-blue-400 text-sm font-mono">{{ activeViewProgram.faculty_code }} — {{ activeViewProgram.faculty_name }}</span>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
            <span class="text-gray-400 block text-[11px]">DEGREE LEVEL</span>
            <span class="font-bold text-purple-400 text-sm">{{ activeViewProgram.degree }} Degree</span>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
            <span class="text-gray-400 block text-[11px]">DURATION</span>
            <span class="font-bold text-white text-sm font-mono">{{ activeViewProgram.duration_years }} Years ({{ activeViewProgram.total_semesters }} Semesters)</span>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
            <span class="text-gray-400 block text-[11px]">TUITION FEE (PER SEMESTER)</span>
            <span class="font-bold text-emerald-400 text-sm font-mono">\${{ activeViewProgram.tuition_fee_per_semester || 390 | number:'1.2-2' }} / Sem</span>
          </div>

          <div class="bg-[#111827] p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
            <span class="text-gray-400 block text-[11px]">TOTAL PROGRAM FEE</span>
            <span class="font-bold text-cyan-400 text-sm font-mono">\${{ (activeViewProgram.total_tuition_fee || ((activeViewProgram.tuition_fee_per_semester || 390) * (activeViewProgram.total_semesters || 8))) | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Status & Footer Actions -->
        <div class="flex items-center justify-between border-t border-[#1f2937] pt-4">
          <div class="flex items-center gap-2">
            <span class="text-gray-400 text-xs">Status:</span>
            <span [class.bg-emerald-950]="activeViewProgram.status === 'ACTIVE'" [class.text-emerald-400]="activeViewProgram.status === 'ACTIVE'"
                  class="px-3 py-1 rounded-full border border-emerald-800 text-xs font-bold">
              • {{ activeViewProgram.status }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="activeViewProgram = null" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">Close</button>
            <button (click)="editProgram(activeViewProgram); activeViewProgram = null" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20">Edit Program</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProgramManagementComponent implements OnInit {
  programs: Program[] = [];
  faculties: Faculty[] = [];
  studentsList: any[] = [];
  searchQuery = '';
  selectedFaculty = '';
  selectedDegree = '';
  showModal = false;
  isEditing = false;
  activeViewProgram: any = null;

  currentProgram: Program = {
    program_code: '',
    program_name: '',
    faculty_id: 1,
    degree: 'Bachelor',
    duration_years: 4,
    total_semesters: 8,
    tuition_fee_per_semester: 390,
    total_tuition_fee: 3120,
    semester_duration_months: 5,
    status: 'ACTIVE'
  };

  constructor(
    private academicService: AcademicService,
    private api: ApiService,
    private toast: ToastService,
    private confirmService: ConfirmModalService
  ) { }

  ngOnInit(): void {
    this.loadFaculties();
    this.loadPrograms();
    this.loadStudents();
  }

  loadStudents(): void {
    this.api.get<any>('students').subscribe(res => {
      this.studentsList = res.data?.students || res.data || [];
    });
  }

  getStudentEnrollmentInfo(programId?: number): any {
    if (!this.studentsList.length) {
      return { enrollment_date: '2025-09-01', months_elapsed: 10, calculated_semester: 2 };
    }

    let filtered = this.studentsList;
    if (programId) {
      const match = this.studentsList.filter(s => Number(s.program_id) === Number(programId));
      if (match.length > 0) filtered = match;
    }

    const validDates = filtered.filter(s => s.enrollment_date).sort(
      (a, b) => new Date(a.enrollment_date).getTime() - new Date(b.enrollment_date).getTime()
    );

    const earliestDateStr = validDates[0]?.enrollment_date || '2025-09-01';
    const enrollDate = new Date(earliestDateStr);
    const today = new Date();

    const monthsElapsed = Math.max(1, (today.getFullYear() - enrollDate.getFullYear()) * 12 + (today.getMonth() - enrollDate.getMonth()));
    const durationPerSem = Number(this.currentProgram.semester_duration_months || 5);
    const calculatedSem = Math.min(Number(this.currentProgram.total_semesters || 8), Math.floor(monthsElapsed / durationPerSem) + 1);

    return {
      enrollment_date: earliestDateStr.slice(0, 10),
      months_elapsed: monthsElapsed,
      calculated_semester: calculatedSem
    };
  }

  loadFaculties(): void {
    this.academicService.getFaculties().subscribe(res => {
      this.faculties = res.data?.faculties || [];
      if (this.faculties.length > 0 && !this.currentProgram.faculty_id) {
        this.currentProgram.faculty_id = this.faculties[0].faculty_id!;
      }
    });
  }

  loadPrograms(): void {
    this.academicService.getPrograms({
      search: this.searchQuery,
      faculty_id: this.selectedFaculty,
      degree: this.selectedDegree
    }).subscribe({
      next: (res) => {
        this.programs = res.data?.programs || [];
      }
    });
  }

  onDurationChange(): void {
    if (this.currentProgram.duration_years) {
      this.currentProgram.total_semesters = this.currentProgram.duration_years * 2;
    }
  }

  get calculatedTotalFee(): number {
    const feePerSem = Number(this.currentProgram.tuition_fee_per_semester || 0);
    const sems = Number(this.currentProgram.total_semesters || (this.currentProgram.duration_years ? this.currentProgram.duration_years * 2 : 8));
    return feePerSem * sems;
  }

  openModal(): void {
    this.isEditing = false;
    this.currentProgram = {
      program_code: '',
      program_name: '',
      faculty_id: this.faculties[0]?.faculty_id || 1,
      degree: 'Bachelor',
      duration_years: 4,
      total_semesters: 8,
      tuition_fee_per_semester: 390,
      total_tuition_fee: 3120,
      semester_duration_months: 5,
      status: 'ACTIVE'
    };
    this.showModal = true;
  }

  editProgram(p: Program): void {
    this.isEditing = true;
    this.currentProgram = {
      ...p,
      tuition_fee_per_semester: p.tuition_fee_per_semester || 390,
      semester_duration_months: p.semester_duration_months || 5
    };
    this.showModal = true;
  }

  saveProgram(): void {
    this.currentProgram.total_tuition_fee = this.calculatedTotalFee;

    if (this.isEditing && this.currentProgram.program_id) {
      this.academicService.updateProgram(this.currentProgram.program_id, this.currentProgram).subscribe({
        next: () => {
          this.toast.success('Program updated successfully');
          this.showModal = false;
          this.loadPrograms();
        }
      });
    } else {
      this.academicService.createProgram(this.currentProgram).subscribe({
        next: () => {
          this.toast.success('Program created successfully');
          this.showModal = false;
          this.loadPrograms();
        }
      });
    }
  }

  viewProgramDetails(p: any): void {
    this.activeViewProgram = p;
  }

  deleteProgram(p: Program): void {
    this.confirmService.confirm({
      title: 'Delete Academic Major Program?',
      message: `Are you sure you want to delete program "${p.program_name}" (${p.program_code})?`,
      confirmText: 'Yes, Delete Program',
      onConfirm: () => {
        this.academicService.deleteProgram(p.program_id!).subscribe({
          next: () => {
            this.toast.success(`Program '${p.program_name}' deleted successfully!`);
            this.loadPrograms();
          }
        });
      }
    });
  }
}

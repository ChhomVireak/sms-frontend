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
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="isStudent ? 'My Enrolled Subjects' : 'Academic Subject Management'" 
                [subtitle]="isStudent ? 'Student / My Curriculum Courses' : 'Admin / Subjects'"
                [actionLabel]="isStudent ? '' : 'Add New Subject'"
                (actionClicked)="openCreateModal()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Top Subject Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ isStudent ? 'ENROLLED SUBJECTS' : 'TOTAL SUBJECTS' }}</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">{{ subjects.length }}</h3>
          <p class="text-xs text-purple-400 mt-1">Active curriculum courses</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL CREDITS</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ totalCredits }} Credits</h3>
          <p class="text-xs text-gray-400 mt-1">Sum of course credits</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE COURSES</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ activeSubjectsCount }} Subjects</h3>
          <p class="text-xs text-gray-400 mt-1">Enrolled this term</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">THEORY vs PRACTICAL</span>
          <h3 class="text-2xl font-extrabold text-blue-400 mt-2">50% / 50%</h3>
          <p class="text-xs text-gray-400 mt-1">Balanced learning curriculum</p>
        </div>
      </div>

      <!-- Subjects List Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <!-- Search & Filter Header Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-bold text-white tracking-tight">{{ isStudent ? 'My Enrolled Academic Courses' : 'Curriculum Course List' }}</h3>
            <button *ngIf="!isStudent && selectedSubjectIds.size > 0" 
                    (click)="deleteSelectedSubjects()" 
                    class="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse">
              <i class="fa-solid fa-trash"></i> Delete Selected ({{ selectedSubjectIds.size }})
            </button>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="relative w-full sm:w-72">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="Search Subject Code or Name..." class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 font-bold shadow-inner">
            </div>
            <span class="text-xs font-semibold text-gray-400 font-mono whitespace-nowrap">{{ filteredSubjects.length }} / {{ subjects.length }} courses</span>
          </div>
        </div>

        <div class="overflow-x-auto overflow-y-auto max-h-[420px] rounded-xl border border-[#1f2937] shadow-inner">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th *ngIf="!isStudent" class="py-3.5 px-3 w-10">
                  <input type="checkbox" [checked]="isSubjectAllSelected" (change)="toggleSubjectSelectAll($event)" class="rounded border-[#1f2937] bg-[#111827] text-emerald-500 focus:ring-0 cursor-pointer">
                </th>
                <th class="py-3.5 px-3">SUBJECT CODE</th>
                <th class="py-3.5 px-3">SUBJECT NAME</th>
                <th *ngIf="isStudent" class="py-3.5 px-3">LECTURER & SCHEDULE</th>
                <th class="py-3.5 px-3">CREDITS</th>
                <th class="py-3.5 px-3">HOURS (TH / PR)</th>
                <th class="py-3.5 px-3">STATUS</th>
                <th class="py-3.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let sub of paginatedSubjects" [ngClass]="{'bg-emerald-950/20': isSubjectSelected(sub.subject_id)}" class="hover:bg-gray-800/40 transition-colors">
                <td *ngIf="!isStudent" class="py-3.5 px-3">
                  <input type="checkbox" [checked]="isSubjectSelected(sub.subject_id)" (change)="toggleSubjectSelect(sub.subject_id)" class="rounded border-[#1f2937] bg-[#111827] text-emerald-500 focus:ring-0 cursor-pointer">
                </td>
                <td class="py-3.5 px-3 font-mono text-purple-400 font-bold text-sm">{{ sub.subject_code }}</td>
                <td class="py-3.5 px-3 font-bold text-white">{{ sub.subject_name }}</td>
                <td *ngIf="isStudent" class="py-3.5 px-3 text-gray-300">
                  <div class="font-extrabold text-emerald-400 text-xs">
                    <i class="fa-solid fa-chalkboard-user text-amber-300 mr-1"></i>{{ sub.teacher_fname ? (sub.teacher_fname + ' ' + (sub.teacher_lname || '')) : 'Faculty Professor' }}
                  </div>
                  <div class="text-[11px] text-gray-400 font-mono mt-0.5">
                    <i class="fa-regular fa-calendar text-cyan-400 mr-1"></i>{{ sub.day_of_week || 'Scheduled' }} • {{ sub.start_time ? (sub.start_time.slice(0,5) + ' - ' + sub.end_time.slice(0,5)) : 'Regular Hours' }} ({{ sub.room_name || 'Room 1A' }})
                  </div>
                </td>
                <td class="py-3.5 px-3 font-mono font-bold text-emerald-400">{{ sub.credit || sub.credits || 3 }} Credits</td>
                <td class="py-3.5 px-3 text-gray-300 font-mono">{{ sub.theory_hours || 30 }}h / {{ sub.practical_hours || 30 }}h</td>
                <td class="py-3.5 px-3">
                  <span class="status-badge status-badge-active">• {{ sub.status || 'ACTIVE' }}</span>
                </td>
                <td class="py-3.5 px-3 text-right space-x-2">
                  <button *ngIf="!isStudent" (click)="editSubject(sub)" title="Edit Subject" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="viewSyllabus(sub)" title="View Subject Syllabus" class="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-book-open"></i>
                  </button>
                  <button *ngIf="!isStudent" (click)="deleteSubject(sub)" title="Delete Subject" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>

              <tr *ngIf="subjects.length === 0">
                <td [attr.colspan]="isStudent ? 6 : 7" class="py-8 text-center text-gray-500 italic">No subject records found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Interactive Pagination & Selection Footer Bar -->
        <div class="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div class="flex items-center gap-3">
            <span *ngIf="!isStudent && selectedSubjectIds.size > 0" class="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center gap-2">
              <i class="fa-solid fa-check-double"></i> {{ selectedSubjectIds.size }} selected
              <button (click)="deleteSelectedSubjects()" title="Delete Selected Subjects" class="px-2 py-0.5 rounded bg-rose-900/80 text-rose-300 hover:bg-rose-800 text-[10px] font-extrabold ml-1 border border-rose-700 flex items-center gap-1">
                <i class="fa-solid fa-trash"></i> Delete Selected
              </button>
              <button (click)="clearSubjectSelection()" class="text-xs text-gray-400 hover:text-white ml-1">✕</button>
            </span>
            <span>
              Showing <strong class="text-white font-mono">{{ filteredSubjects.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-emerald-400 font-mono">{{ filteredSubjects.length }}</strong> active courses
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

    <!-- Create / Edit Subject Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEdit ? 'Edit Subject Details' : 'Create New Subject' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveSubject()" class="space-y-3">
          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT CODE *</label>
            <input type="text" [(ngModel)]="formSubject.subject_code" name="subject_code" required placeholder="e.g. CS-101" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono">
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">SUBJECT NAME *</label>
            <input type="text" [(ngModel)]="formSubject.subject_name" name="subject_name" required placeholder="e.g. Computer Science" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white">
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CREDITS</label>
              <input type="number" [(ngModel)]="formSubject.credit" name="credit" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-bold">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">THEORY (H)</label>
              <input type="number" [(ngModel)]="formSubject.theory_hours" name="theory_hours" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">PRACTICE (H)</label>
              <input type="number" [(ngModel)]="formSubject.practical_hours" name="practical_hours" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white font-mono">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">DESCRIPTION</label>
            <textarea [(ngModel)]="formSubject.description" name="description" rows="2" placeholder="Course outline & details" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2.5 text-white"></textarea>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20">
              {{ isEdit ? 'Update Subject' : 'Save Subject' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subject Syllabus & Course Outline Modal -->
    <div *ngIf="activeSyllabus" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-2xl rounded-2xl p-6 space-y-6 text-xs text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold flex items-center justify-center text-lg shadow-lg">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <div>
              <h3 class="text-lg font-extrabold text-white">{{ activeSyllabus.subject_name }}</h3>
              <p class="text-xs text-purple-400 font-mono">{{ activeSyllabus.subject_code }} · {{ activeSyllabus.credit || 3 }} Credits ({{ activeSyllabus.theory_hours || 30 }}h Theory / {{ activeSyllabus.practical_hours || 30 }}h Practice)</p>
            </div>
          </div>
          <button (click)="activeSyllabus = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <!-- Course Description -->
        <div class="bg-[#111827] border border-[#1f2937] p-4 rounded-xl space-y-2">
          <h4 class="font-bold text-gray-300 uppercase tracking-wider text-[11px]">Course Overview & Description</h4>
          <p class="text-gray-300 text-xs leading-relaxed">
            {{ activeSyllabus.description || 'This course covers fundamental theoretical principles, core problem-solving methodologies, and practical laboratory exercises.' }}
          </p>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-[#1f2937] pt-4">
          <button (click)="activeSyllabus = null" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Close</button>
          <button (click)="editSubject(activeSyllabus); activeSyllabus = null" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20">Edit Subject Details</button>
        </div>
      </div>
    </div>
  `
})
export class SubjectManagementComponent implements OnInit, OnDestroy {
  subjects: any[] = [];
  showModal = false;
  isEdit = false;
  editingSubjectId: number | null = null;
  activeSyllabus: any = null;
  private realtimeSub!: Subscription;

  selectedSubjectIds: Set<number> = new Set<number>();

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  toggleSubjectSelectAll(event: any): void {
    if (event.target.checked) {
      this.paginatedSubjects.forEach(s => this.selectedSubjectIds.add(s.subject_id));
    } else {
      this.paginatedSubjects.forEach(s => this.selectedSubjectIds.delete(s.subject_id));
    }
  }

  toggleSubjectSelect(subjectId: number): void {
    if (this.selectedSubjectIds.has(subjectId)) {
      this.selectedSubjectIds.delete(subjectId);
    } else {
      this.selectedSubjectIds.add(subjectId);
    }
  }

  isSubjectSelected(subjectId: number): boolean {
    return this.selectedSubjectIds.has(subjectId);
  }

  get isSubjectAllSelected(): boolean {
    if (!this.paginatedSubjects || this.paginatedSubjects.length === 0) return false;
    return this.paginatedSubjects.every(s => this.selectedSubjectIds.has(s.subject_id));
  }

  clearSubjectSelection(): void {
    this.selectedSubjectIds.clear();
  }

  deleteSelectedSubjects(): void {
    if (this.selectedSubjectIds.size === 0) return;
    const count = this.selectedSubjectIds.size;

    this.confirmService.confirm({
      title: 'Delete Selected Subjects?',
      message: `Are you sure you want to delete ${count} selected curriculum subject(s)? This action cannot be undone.`,
      confirmText: `Yes, Delete ${count} Subject(s)`,
      onConfirm: () => {
        const idsToDelete = Array.from(this.selectedSubjectIds);
        let successCount = 0;
        let completedCount = 0;

        idsToDelete.forEach((id) => {
          this.api.delete(`subjects/${id}`).subscribe({
            next: () => {
              successCount++;
              completedCount++;
              if (completedCount === idsToDelete.length) {
                this.toast.success(`Successfully deleted ${successCount} selected subject(s)!`);
                this.selectedSubjectIds.clear();
                this.loadSubjects();
              }
            },
            error: () => {
              completedCount++;
              if (completedCount === idsToDelete.length) {
                this.toast.success(`Successfully deleted ${successCount} selected subject(s)!`);
                this.selectedSubjectIds.clear();
                this.loadSubjects();
              }
            }
          });
        });
      }
    });
  }

  searchQuery: string = '';

  get filteredSubjects(): any[] {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      return this.subjects;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.subjects.filter(s => {
      const code = (s.subject_code || '').toLowerCase();
      const name = (s.subject_name || '').toLowerCase();
      const lecturer = `${s.teacher_fname || ''} ${s.teacher_lname || ''}`.toLowerCase();
      return code.includes(q) || name.includes(q) || lecturer.includes(q);
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSubjects.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredSubjects.length);
  }

  get paginatedSubjects(): any[] {
    return this.filteredSubjects.slice(this.startIndex, this.endIndex);
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

  formSubject: any = {
    subject_code: '',
    subject_name: '',
    credit: 3,
    theory_hours: 30,
    practical_hours: 30,
    description: '',
    status: 'ACTIVE'
  };

  get isStudent(): boolean {
    return this.router.url ? this.router.url.includes('/student/') : false;
  }

  constructor(
    private api: ApiService,
    public toast: ToastService,
    private socketService: SocketService,
    private confirmService: ConfirmModalService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadSubjects();
    this.initRealtimeSubscription();
  }

  ngOnDestroy(): void {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }

  initRealtimeSubscription(): void {
    this.realtimeSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event.startsWith('subject_')) {
        console.log(`⚡ Auto-refreshing Subjects UI on real-time event: ${event}`);
        this.loadSubjects();
      }
    });
  }

  get totalCredits(): number {
    return this.subjects.reduce((sum, s) => sum + (s.credit || s.credits || 3), 0);
  }

  get activeSubjectsCount(): number {
    return this.subjects.filter(s => s.status === 'ACTIVE' || !s.status).length;
  }

  loadSubjects(): void {
    this.api.get<any>('subjects').subscribe({
      next: (res) => {
        this.subjects = res.data?.subjects || res.data || [];
      }
    });
  }

  openCreateModal(): void {
    this.isEdit = false;
    this.editingSubjectId = null;
    this.formSubject = {
      subject_code: '',
      subject_name: '',
      credit: 3,
      theory_hours: 30,
      practical_hours: 30,
      description: '',
      status: 'ACTIVE'
    };
    this.showModal = true;
  }

  editSubject(sub: any): void {
    this.isEdit = true;
    this.editingSubjectId = sub.subject_id;
    this.formSubject = {
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      credit: sub.credit || sub.credits || 3,
      theory_hours: sub.theory_hours || 30,
      practical_hours: sub.practical_hours || 30,
      description: sub.description || '',
      status: sub.status || 'ACTIVE'
    };
    this.showModal = true;
  }

  deleteSubject(sub: any): void {
    this.confirmService.confirm({
      title: 'Delete Course Subject?',
      message: `Are you sure you want to delete subject "${sub.subject_code} — ${sub.subject_name}"?`,
      confirmText: 'Yes, Delete Subject',
      onConfirm: () => {
        this.api.delete(`subjects/${sub.subject_id}`).subscribe({
          next: () => {
            this.toast.success(`Subject '${sub.subject_code}' deleted successfully!`);
            this.loadSubjects();
          },
          error: (err) => this.toast.error(err.error?.message || 'Failed to delete subject')
        });
      }
    });
  }

  viewSyllabus(sub: any): void {
    this.activeSyllabus = sub;
  }

  saveSubject(): void {
    if (!this.formSubject.subject_code || !this.formSubject.subject_name) {
      this.toast.error('Please enter Subject Code and Subject Name!');
      return;
    }

    if (this.isEdit && this.editingSubjectId) {
      this.api.put(`subjects/${this.editingSubjectId}`, this.formSubject).subscribe({
        next: () => {
          this.toast.success('Subject updated successfully!');
          this.showModal = false;
          this.loadSubjects();
        },
        error: (err) => this.toast.error(err.error?.message || 'Failed to update subject')
      });
    } else {
      this.api.post('subjects', this.formSubject).subscribe({
        next: () => {
          this.loadSubjects();
        },
        error: (err) => this.toast.error(err.error?.message || 'Create failed')
      });
    }
  }
}

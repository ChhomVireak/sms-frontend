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
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white tracking-tight">{{ isStudent ? 'My Enrolled Academic Courses' : 'Curriculum Course List' }}</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">SUBJECT CODE</th>
                <th class="pb-3">SUBJECT NAME</th>
                <th *ngIf="isStudent" class="pb-3">LECTURER & SCHEDULE</th>
                <th class="pb-3">CREDITS</th>
                <th class="pb-3">HOURS (TH / PR)</th>
                <th class="pb-3">STATUS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let sub of subjects" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-mono text-purple-400 font-bold text-sm">{{ sub.subject_code }}</td>
                <td class="py-3.5 font-bold text-white">{{ sub.subject_name }}</td>
                <td *ngIf="isStudent" class="py-3.5 text-gray-300">
                  <div class="font-extrabold text-emerald-400 text-xs">
                    👨‍🏫 {{ sub.teacher_fname ? (sub.teacher_fname + ' ' + (sub.teacher_lname || '')) : 'Faculty Professor' }}
                  </div>
                  <div class="text-[11px] text-gray-400 font-mono mt-0.5">
                    📅 {{ sub.day_of_week || 'Scheduled' }} • {{ sub.start_time ? (sub.start_time.slice(0,5) + ' - ' + sub.end_time.slice(0,5)) : 'Regular Hours' }} ({{ sub.room_name || 'Room 1A' }})
                  </div>
                </td>
                <td class="py-3.5 font-mono font-bold text-emerald-400">{{ sub.credit || sub.credits || 3 }} Credits</td>
                <td class="py-3.5 text-gray-300 font-mono">{{ sub.theory_hours || 30 }}h / {{ sub.practical_hours || 30 }}h</td>
                <td class="py-3.5">
                  <span class="status-badge status-badge-active">• {{ sub.status || 'ACTIVE' }}</span>
                </td>
                <td class="py-3.5 text-right space-x-2">
                  <button *ngIf="!isStudent" (click)="editSubject(sub)" title="Edit Subject" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition-colors border border-blue-500/20">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button (click)="viewSyllabus(sub)" title="View Subject Syllabus" class="text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 p-2 rounded-lg transition-colors border border-purple-500/20">
                    <i class="fa-solid fa-book-open"></i>
                  </button>
                  <button *ngIf="!isStudent" (click)="deleteSubject(sub)" title="Delete Subject" class="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-lg transition-colors border border-rose-500/20">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-fee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Fee Structure & Schedules'" 
                [subtitle]="'Admin / Finance / Fees'"
                [actionLabel]="'Create Fee Schedule'"
                (actionClicked)="openFeeModal()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Top Metrics Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL SCHEDULED FEES</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">\${{ getTotalExpectedFees() | number:'1.2-2' }}</h3>
          <p class="text-xs text-emerald-400 mt-1 font-semibold">Active Academic Schedules</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SEMESTER RATE</span>
          <h3 class="text-xl font-extrabold text-emerald-400 mt-1 font-mono">$390.00 / Sem</h3>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FULL YEAR RATE</span>
          <h3 class="text-xl font-extrabold text-purple-400 mt-1 font-mono">$780.00 / Year</h3>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">DEFAULT LATE PENALTY</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">0%</h3>
          <p class="text-xs text-gray-400 mt-1">After due date deadline</p>
        </div>
      </div>

      <!-- Active Fee Schedules Table (Full Width) -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs shadow-lg">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Fee Schedules (4-Year Degree & Semester Structure)</h3>
            <p class="text-[11px] text-gray-400 mt-0.5">Manage degree tuition schedules, semester billing cycles, and due dates</p>
          </div>
          <span class="text-xs text-gray-400 font-mono">Total Schedules: <strong class="text-emerald-400 font-bold">{{ feeSchedules.length }}</strong></span>
        </div>

        <div class="overflow-x-auto overflow-y-auto max-h-[620px] rounded-xl border border-[#1f2937]/50">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                <th class="py-3 px-3 w-8">#</th>
                <th class="py-3 px-3">FEE TITLE</th>
                <th class="py-3 px-3">YEAR / SEMESTER</th>
                <th class="py-3 px-3">CLASS GROUP</th>
                <th class="py-3 px-3">AMOUNT ($)</th>
                <th class="py-3 px-3">DUE DATE</th>
                <th class="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let fee of paginatedFeeSchedules; let i = index" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 px-3 font-mono text-gray-500">{{ (startIndex + i + 1) < 10 ? '0' + (startIndex + i + 1) : (startIndex + i + 1) }}</td>
                <td class="py-3.5 px-3 font-bold text-white">{{ fee.fee_title }}</td>
                <td class="py-3.5 px-3 font-mono">
                  <span class="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 font-bold text-[10px]">
                    {{ fee.semester_name || 'Semester 2' }} ({{ fee.academic_year || 'Year 3' }})
                  </span>
                </td>
                <td class="py-3.5 px-3 text-gray-300 font-mono font-bold">{{ fee.group_code || fee.group_name || 'All Classes' }}</td>
                <td class="py-3.5 px-3 font-extrabold text-emerald-400 font-mono text-sm">\${{ fee.amount | number:'1.2-2' }}</td>
                <td class="py-3.5 px-3 text-gray-300 font-mono">{{ fee.due_date | date:'mediumDate' }}</td>
                <td class="py-3.5 px-3 text-right space-x-2">
                  <button (click)="editFeeSchedule(fee)" title="Edit Fee Schedule" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-all"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteFeeSchedule(fee)" title="Delete Fee Schedule" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-all"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="feeSchedules.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500 italic font-bold">No active fee schedules found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls Bar -->
        <div *ngIf="feeSchedules.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1f2937] text-xs">
          <div class="flex items-center gap-3 text-gray-400">
            <span>Showing <strong class="text-white font-mono">{{ startIndex + 1 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-white font-mono">{{ feeSchedules.length }}</strong> schedules</span>
            <div class="flex items-center gap-1.5 ml-2">
              <span class="text-gray-400">Per page:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#111827] border border-[#1f2937] text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 font-mono font-bold cursor-pointer">
                <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button (click)="setPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button (click)="setPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="px-3 py-1 font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 rounded-lg">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button (click)="setPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
            <button (click)="setPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Fee Schedule Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEdit ? 'Edit Fee Schedule' : 'Create Fee Schedule' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveFeeSchedule()" class="space-y-3">
          <div>
            <label class="block font-bold text-gray-300 mb-1">FEE TITLE *</label>
            <input type="text" [(ngModel)]="newFee.fee_title" name="fee_title" required placeholder="e.g. Year 3 Semester 2 Tuition" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-bold">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">ACADEMIC YEAR LEVEL *</label>
              <select [(ngModel)]="newFee.year_level" name="year_level" required class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 text-xs font-bold">
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">SEMESTER / TERM *</label>
              <select [(ngModel)]="newFee.term_cycle" (change)="onCycleChange()" name="term_cycle" required class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-2 text-xs font-bold">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Full Year">Full Year</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CLASS GROUP *</label>
              <select [(ngModel)]="newFee.group_id" (change)="onGroupChange()" name="group_id" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500">
                <option *ngFor="let g of groups" [value]="g.group_id">
                  {{ g.group_code }} — {{ g.group_name }} (Year {{ g.academic_year_level || 1 }})
                </option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-emerald-400 mb-1">AMOUNT ($) *</label>
              <div class="relative">
                <input type="number" [(ngModel)]="newFee.amount" name="amount" required placeholder="390.00" class="w-full bg-[#111827] border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500 text-sm font-mono shadow-sm">
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  / ឆមាស (Sem)
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">DUE DATE *</label>
              <input type="date" [(ngModel)]="newFee.due_date" name="due_date" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">PENALTY RATE (%)</label>
              <input type="number" [(ngModel)]="newFee.late_penalty_rate" name="late_penalty_rate" placeholder="5.0" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
              {{ isEdit ? 'Update Fee Schedule' : 'Save Fee Schedule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FeeManagementComponent implements OnInit {
  showModal = false;
  isEdit = false;
  editingScheduleId: number | null = null;

  feeSchedules: any[] = [];
  groups: any[] = [];

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  get paginatedFeeSchedules(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.feeSchedules.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.feeSchedules.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.feeSchedules.length);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  newFee: any = {
    fee_title: 'Semester 2 Tuition Fee',
    year_level: 'Year 3',
    term_cycle: 'Semester 2',
    group_id: 1,
    amount: 400.00,
    due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    late_penalty_rate: 0.0
  };

  constructor(private api: ApiService, public toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadFeeSchedules();
    this.loadGroups();
  }


  onGroupChange(): void {
    if (!this.groups || !this.groups.length) return;
    const selectedGroup = this.groups.find(g => Number(g.group_id) === Number(this.newFee.group_id));
    if (selectedGroup) {
      const yearLevel = selectedGroup.academic_year_level || 1;
      const semNumber = selectedGroup.current_semester || 1;
      this.newFee.year_level = `Year ${yearLevel}`;

      const baseSemFee = Number(selectedGroup.tuition_fee || selectedGroup.fee_amount) || 390.00;
      if (this.newFee.term_cycle === 'Full Year') {
        this.newFee.amount = baseSemFee * 2;
        this.newFee.fee_title = `${selectedGroup.group_code} — Year ${yearLevel} Full Year Tuition Fee`;
      } else {
        this.newFee.amount = baseSemFee;
        this.newFee.fee_title = `${selectedGroup.group_code} — Year ${yearLevel} ${this.newFee.term_cycle || 'Semester ' + semNumber} Tuition Fee`;
      }
      this.toast.success(`Selected group ${selectedGroup.group_code}: auto-set to $${this.newFee.amount.toFixed(2)}!`);
    }
  }

  onCycleChange(): void {
    const selectedGroup = this.groups.find(g => Number(g.group_id) === Number(this.newFee.group_id));
    const baseSemFee = selectedGroup ? (Number(selectedGroup.tuition_fee || selectedGroup.fee_amount) || 390.00) : 390.00;

    if (this.newFee.term_cycle === 'Full Year') {
      this.newFee.amount = baseSemFee * 2;
      this.newFee.fee_title = `${selectedGroup?.group_code || 'Class'} — ${this.newFee.year_level} Full Year Tuition Fee`;
    } else {
      this.newFee.amount = baseSemFee;
      this.newFee.fee_title = `${selectedGroup?.group_code || 'Class'} — ${this.newFee.year_level} ${this.newFee.term_cycle} Tuition Fee`;
    }
  }

  loadFeeSchedules(): void {
    this.api.get<any>('fees/schedules').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.feeSchedules = res.data.schedules || res.data.feeSchedules || res.data || [];
        }
      }
    });
  }

  loadGroups(): void {
    this.api.get<any>('groups').subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
      if (this.groups.length > 0 && !this.newFee.group_id) {
        this.newFee.group_id = this.groups[0].group_id;
        this.onGroupChange();
      }
    });
  }

  getTotalExpectedFees(): number {
    return this.feeSchedules.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  }

  openFeeModal(): void {
    this.isEdit = false;
    this.editingScheduleId = null;
    const defaultGroup = this.groups.length > 0 ? this.groups[0] : null;
    const defaultGroupId = defaultGroup ? defaultGroup.group_id : 1;
    const baseSemFee = defaultGroup ? (Number(defaultGroup.tuition_fee || defaultGroup.fee_amount) || 390.00) : 390.00;

    this.newFee = {
      fee_title: defaultGroup ? `${defaultGroup.group_code} — Year ${defaultGroup.academic_year_level || 1} Semester 1 Tuition` : 'Semester 1 Tuition Fee',
      year_level: defaultGroup ? `Year ${defaultGroup.academic_year_level || 1}` : 'Year 1',
      term_cycle: 'Semester 1',
      group_id: defaultGroupId,
      amount: baseSemFee,
      due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      late_penalty_rate: 0.0
    };
    this.showModal = true;
  }

  editFeeSchedule(fee: any): void {
    this.isEdit = true;
    this.editingScheduleId = fee.fee_schedule_id;
    this.newFee = {
      fee_title: fee.fee_title,
      year_level: fee.academic_year || 'Year 3',
      term_cycle: fee.semester_name || 'Semester 2',
      group_id: fee.group_id || 1,
      amount: fee.amount,
      due_date: fee.due_date ? fee.due_date.slice(0, 10) : '',
      late_penalty_rate: fee.late_penalty_rate || 5.0
    };
    this.showModal = true;
  }

  deleteFeeSchedule(fee: any): void {
    this.confirmService.confirm({
      title: 'Delete Fee Schedule?',
      message: `Are you sure you want to delete fee schedule "${fee.fee_title}" ($${fee.amount})? This will remove the scheduled tuition fee entry.`,
      confirmText: 'Yes, Delete Fee',
      onConfirm: () => {
        this.api.delete(`fees/${fee.fee_schedule_id}`).subscribe({
          next: () => {
            this.toast.success(`Fee Schedule '${fee.fee_title}' deleted successfully!`);
            this.loadFeeSchedules();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Failed to delete fee schedule');
          }
        });
      }
    });
  }


  saveFeeSchedule(): void {
    if (!this.newFee.fee_title || !this.newFee.due_date) {
      this.toast.error('Fee title and due date are required!');
      return;
    }
    if (Number(this.newFee.amount) <= 0 || isNaN(Number(this.newFee.amount))) {
      this.toast.error('Fee amount must be greater than $0!');
      return;
    }

    if (this.isEdit && this.editingScheduleId) {
      this.api.put(`fees/${this.editingScheduleId}`, this.newFee).subscribe({
        next: () => {
          this.toast.success('Fee Schedule updated successfully!');
          this.showModal = false;
          this.loadFeeSchedules();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to update fee schedule');
        }
      });
    } else {
      this.api.post('fees/schedules', this.newFee).subscribe({
        next: () => {
          this.toast.success('Fee Schedule saved successfully!');
          this.showModal = false;
          this.loadFeeSchedules();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to save fee schedule');
        }
      });
    }
  }
}

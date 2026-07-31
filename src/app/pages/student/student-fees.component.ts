import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-fees',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Fee Structure & Schedules'" 
                [subtitle]="'Student Portal / Tuition Fee Schedules & Payments'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL TUITION SCHEDULED</span>
          <h3 class="text-3xl font-extrabold text-white mt-2">\${{ totalScheduledAmount | number:'1.2-2' }}</h3>
          <p class="text-xs text-cyan-400 mt-1">Academic Year Fee Structure</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL AMOUNT PAID</span>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2">\${{ totalPaid | number:'1.2-2' }}</h3>
          <p class="text-xs text-emerald-400 mt-1">Verified Payments</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">REMAINING BALANCE DUE</span>
          <h3 class="text-3xl font-extrabold text-rose-400 mt-2">\${{ balanceDue | number:'1.2-2' }}</h3>
          <p class="text-xs mt-1 font-semibold" [ngClass]="balanceDue === 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ balanceDue === 0 ? 'Fully Paid' : 'Outstanding Tuition Balance' }}
          </p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PAYMENT CYCLE / MODE</span>
          <h3 class="text-2xl font-extrabold mt-2 font-mono" [ngClass]="isHasYearlyPayment ? 'text-purple-400' : 'text-cyan-400'">
            {{ isHasYearlyPayment ? 'YEARLY' : 'SEMESTER' }}
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            {{ isHasYearlyPayment ? 'Full Academic Year Payment Plan' : 'Per Semester Payment Plan' }}
          </p>
        </div>
      </div>

      <!-- Active Fee Schedules Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-receipt text-emerald-400"></i> Tuition Fee Schedules & Payment Plan
          </h3>
          <div class="flex items-center gap-2">
            <span *ngIf="studentGroup" class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-800 flex items-center gap-1">
              <i class="fa-solid fa-users-rectangle"></i> Class Group: {{ studentGroup.group_code || studentGroup.group_name }}
            </span>
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
              {{ filteredFeeSchedules.length }} Schedules ({{ activePaymentPlanType === 'YEARLY' ? 'Yearly' : (activePaymentPlanType === 'SEMESTER' ? 'Semester' : 'Installment') }})
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">FEE TITLE</th>
                <th class="pb-3">PAYMENT CYCLE / TERM</th>
                <th class="pb-3">FEE AMOUNT ($)</th>
                <th class="pb-3">DUE DATE</th>
                <th class="pb-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50 font-mono">
              <tr *ngFor="let fee of filteredFeeSchedules" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-bold text-white font-sans">{{ fee.fee_title }}</td>
                <td class="py-3.5 font-bold">
                  <!-- If Paid by Year: Show ONLY Academic Year -->
                  <span *ngIf="isYearlyPayment(fee)" class="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs inline-block font-sans">
                    {{ fee.academic_year || 'Year 1' }} (Full Academic Year)
                  </span>
                  <!-- If Paid by Semester: Show Semester Name -->
                  <span *ngIf="isSemesterPayment(fee) && !isYearlyPayment(fee)" class="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs inline-block font-sans">
                    {{ fee.semester_name || 'Semester 1' }} ({{ fee.academic_year || 'Year 1' }})
                  </span>
                  <!-- If Paid by Installment: Show Installment Name -->
                  <span *ngIf="isInstallmentPayment(fee)" class="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs inline-block font-sans">
                    {{ fee.term_cycle || 'Installment' }}
                  </span>
                </td>
                <td class="py-3.5 text-white font-extrabold text-sm">\${{ fee.amount | number:'1.2-2' }}</td>
                <td class="py-3.5 text-gray-300">{{ (fee.due_date | date:'dd/MM/yyyy') || '01/09/2026' }}</td>
                <td class="py-3.5 text-center font-sans">
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-800': isPaid(fee),
                    'bg-rose-950 text-rose-400 border-rose-800': !isPaid(fee)
                  }" class="px-2.5 py-1 rounded-lg border font-extrabold text-[10px] uppercase">
                    {{ isPaid(fee) ? 'PAID' : 'DUE / UNPAID' }}
                  </span>
                </td>
              </tr>

              <tr *ngIf="filteredFeeSchedules.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500 italic font-sans">
                  No active fee schedules found in database.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment History Log Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-cyan-400"></i> My Payment Receipt History
          </h3>
          <span class="text-xs font-semibold text-gray-400">{{ payments.length }} Transactions</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">RECEIPT NO</th>
                <th class="pb-3">PAYMENT CYCLE</th>
                <th class="pb-3">PAYMENT DATE</th>
                <th class="pb-3">METHOD</th>
                <th class="pb-3">AMOUNT PAID ($)</th>
                <th class="pb-3 text-center">VERIFICATION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50 font-mono">
              <tr *ngFor="let p of payments" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 text-emerald-400 font-extrabold">{{ p.receipt_number || ('REC-' + p.payment_id) }}</td>
                <td class="py-3.5 font-sans">
                  <span *ngIf="isYearlyPayment(p)" class="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-bold">
                    Full Year
                  </span>
                  <span *ngIf="isSemesterPayment(p) && !isYearlyPayment(p)" class="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-bold">
                    Semester
                  </span>
                  <span *ngIf="isInstallmentPayment(p)" class="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                    Installment
                  </span>
                </td>
                <td class="py-3.5 text-gray-300">{{ p.payment_date | date:'dd/MM/yyyy · HH:mm' }}</td>
                <td class="py-3.5 font-sans font-bold text-gray-200 uppercase">{{ p.payment_method || 'Bank Transfer / ABA' }}</td>
                <td class="py-3.5 text-emerald-400 font-extrabold text-sm">\${{ p.amount_paid | number:'1.2-2' }}</td>
                <td class="py-3.5 text-center font-sans">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                    VERIFIED & APPROVED
                  </span>
                </td>
              </tr>

              <tr *ngIf="payments.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500 italic font-sans">
                  No payment receipt history recorded in database.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StudentFeesComponent implements OnInit {
  feeSchedules: any[] = [];
  payments: any[] = [];
  studentGroup: any = null;
  totalScheduled: number = 0;
  totalPaid: number = 0;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadFeeData();
  }

  get totalScheduledAmount(): number {
    const list = this.filteredFeeSchedules;
    if (list.length > 0) {
      return list.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
    }
    return this.totalScheduled;
  }

  get balanceDue(): number {
    return Math.max(0, this.totalScheduledAmount - this.totalPaid);
  }

  get activePaymentPlanType(): 'YEARLY' | 'SEMESTER' | 'INSTALLMENT' {
    const hasYearlyPaid = this.payments.some(p => this.isYearlyPayment(p)) || this.feeSchedules.some(f => this.isYearlyPayment(f) && this.isPaid(f));
    if (hasYearlyPaid) return 'YEARLY';

    const hasSemester = this.feeSchedules.some(f => this.isSemesterPayment(f)) || this.payments.some(p => this.isSemesterPayment(p));
    if (hasSemester) return 'SEMESTER';

    const hasInstallment = this.feeSchedules.some(f => this.isInstallmentPayment(f)) || this.payments.some(p => this.isInstallmentPayment(p));
    if (hasInstallment) return 'INSTALLMENT';

    return 'YEARLY';
  }

  get isHasYearlyPayment(): boolean {
    return this.activePaymentPlanType === 'YEARLY';
  }

  get filteredFeeSchedules(): any[] {
    if (!this.feeSchedules || this.feeSchedules.length === 0) return [];

    // Filter strictly by student's assigned class group
    let groupFiltered = this.feeSchedules;
    if (this.studentGroup && this.studentGroup.group_id) {
      const targetGroupId = Number(this.studentGroup.group_id);
      groupFiltered = this.feeSchedules.filter(f => !f.group_id || Number(f.group_id) === targetGroupId);
    }

    // Filter strictly: ONLY display PAID schedules for student portal
    const paidOnly = groupFiltered.filter(f => this.isPaid(f));

    const planType = this.activePaymentPlanType;

    if (planType === 'YEARLY') {
      const yearly = paidOnly.filter(f => this.isYearlyPayment(f));
      return yearly.length > 0 ? yearly : paidOnly;
    } else if (planType === 'SEMESTER') {
      const semester = paidOnly.filter(f => this.isSemesterPayment(f) && !this.isYearlyPayment(f));
      return semester.length > 0 ? semester : paidOnly;
    } else if (planType === 'INSTALLMENT') {
      const installment = paidOnly.filter(f => this.isInstallmentPayment(f));
      return installment.length > 0 ? installment : paidOnly;
    }

    return paidOnly;
  }

  isYearlyPayment(item: any): boolean {
    if (!item) return false;
    const title = (item.fee_title || item.title || '').toLowerCase();
    const cycle = (item.term_cycle || item.term || item.payment_type || item.fee_type || '').toLowerCase();

    // If title or cycle explicitly references semester, sem 1, sem 2, or ឆមាស -> NOT a Yearly Schedule!
    if (title.includes('semester') || title.includes('sem ') || title.includes('sem1') || title.includes('sem2') || title.includes('ឆមាស') ||
      cycle.includes('semester') || cycle.includes('sem ') || cycle.includes('sem1') || cycle.includes('sem2') || cycle.includes('ឆមាស')) {
      return false;
    }

    const amount = Number(item.amount || item.amount_paid || 0);

    return (
      title.includes('full year') ||
      title.includes('yearly') ||
      title.includes('annual') ||
      title.includes('បង់ជាឆ្នាំ') ||
      cycle.includes('full year') ||
      cycle.includes('yearly') ||
      cycle.includes('annual') ||
      cycle.includes('បង់ជាឆ្នាំ') ||
      amount >= 700
    );
  }

  isSemesterPayment(item: any): boolean {
    if (!item) return false;
    const title = (item.fee_title || item.title || '').toLowerCase();
    const cycle = (item.term_cycle || item.term || item.payment_type || item.fee_type || '').toLowerCase();

    return (
      title.includes('semester') ||
      title.includes('sem') ||
      title.includes('បង់ជាឆមាស') ||
      title.includes('ឆមាស') ||
      cycle.includes('semester') ||
      cycle.includes('sem') ||
      cycle.includes('បង់ជាឆមាស') ||
      cycle.includes('ឆមាស')
    );
  }

  isInstallmentPayment(item: any): boolean {
    if (!item) return false;
    const title = (item.fee_title || item.title || '').toLowerCase();
    const cycle = (item.term_cycle || item.term || item.payment_type || item.fee_type || '').toLowerCase();

    return (
      title.includes('installment') ||
      title.includes('monthly') ||
      title.includes('quarterly') ||
      title.includes('បង់ជារំលោះ') ||
      title.includes('រំលោះ') ||
      cycle.includes('installment') ||
      cycle.includes('monthly')
    );
  }

  isPaid(fee: any): boolean {
    if (!fee) return false;
    const st = String(fee.status || fee.payment_status || '').toUpperCase();
    if (st === 'PAID' || st === 'VERIFIED' || fee.is_paid) return true;
    return this.totalPaid >= Number(fee.amount || 0);
  }

  loadFeeData(): void {
    this.api.get<any>('fees/schedules').subscribe({
      next: (res) => {
        this.feeSchedules = res.data?.schedules || res.data || [];
        this.studentGroup = res.data?.studentGroup || null;
        this.totalScheduled = this.feeSchedules.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
      }
    });

    this.api.get<any>('payments').subscribe({
      next: (res) => {
        this.payments = res.data?.payments || res.data || [];
        this.totalPaid = this.payments.reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0);
      }
    });
  }
}

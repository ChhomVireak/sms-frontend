import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-finance-module',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Finance Module'" [subtitle]="'Admin / Finance'"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Top Split: Fee Categories + Fee Schedule -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Fee Categories -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white tracking-tight">Fee Categories</h3>
            <button class="text-emerald-400 font-semibold hover:underline">+ Add</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CATEGORY NAME *</label>
              <input type="text" [(ngModel)]="catName" placeholder="Laboratory" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">DESCRIPTION</label>
              <textarea rows="2" [(ngModel)]="catDesc" placeholder="Fee for lab usage and materials" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5"></textarea>
            </div>

            <div class="pt-2 flex justify-end">
              <button (click)="toast.success('Category saved')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Save Category</button>
            </div>
          </div>

          <div class="pt-4 border-t border-[#1f2937] space-y-2">
            <h4 class="font-bold text-gray-400 uppercase tracking-wider text-[11px]">EXISTING CATEGORIES</h4>
            <div class="p-2.5 bg-[#111827] rounded-xl flex items-center justify-between">
              <span class="font-bold text-white">• Tuition</span>
              <span class="text-gray-400">Main fee</span>
            </div>
            <div class="p-2.5 bg-[#111827] rounded-xl flex items-center justify-between">
              <span class="font-bold text-white">• Library</span>
              <span class="text-gray-400">Library access</span>
            </div>
            <div class="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center justify-between">
              <span class="font-bold text-emerald-300">• Laboratory</span>
              <span class="text-emerald-400">Editing...</span>
            </div>
          </div>
        </div>

        <!-- Fee Schedule -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white tracking-tight">Fee Schedule</h3>
            <button class="text-emerald-400 font-semibold hover:underline">+ Add Schedule</button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">AMOUNT *</label>
              <input type="number" value="160.00" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">DUE DATE *</label>
              <input type="date" [value]="currentDueDate" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
            </div>
          </div>

          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                  <th class="pb-2">CATEGORY</th>
                  <th class="pb-2">AMOUNT</th>
                  <th class="pb-2">DUE DATE</th>
                  <th class="pb-2">TERM</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr>
                  <td class="py-2.5 font-bold text-white">Tuition</td>
                  <td class="py-2.5 text-emerald-400 font-bold">$800.00</td>
                  <td class="py-2.5 text-gray-300">Jun 1, 2025</td>
                  <td class="py-2.5 text-gray-400">T2 24–25</td>
                </tr>
                <tr>
                  <td class="py-2.5 font-bold text-white">Library</td>
                  <td class="py-2.5 text-emerald-400 font-bold">$80.00</td>
                  <td class="py-2.5 text-gray-300">Jun 1, 2025</td>
                  <td class="py-2.5 text-gray-400">T2 24–25</td>
                </tr>
                <tr>
                  <td class="py-2.5 font-bold text-emerald-400">Laboratory</td>
                  <td class="py-2.5 text-emerald-400 font-bold">$160.00</td>
                  <td class="py-2.5 text-gray-300">{{ currentDueDate | date:'mediumDate' }}</td>
                  <td class="py-2.5 text-gray-400">T2 24–25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bottom Split: Record Payment + Receipt Preview + Recent Payments -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Record Payment Form (1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <h3 class="text-base font-bold text-white tracking-tight">Record Payment</h3>

          <form (ngSubmit)="onRecordPayment()" class="space-y-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">STUDENT *</label>
              <select [(ngModel)]="paymentForm.student_id" name="student_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5">
                <option [value]="1">Brian Kofi (STU-2847)</option>
                <option [value]="2">Amara Lopes (STU-2901)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">FEE SCHEDULE *</label>
              <select [(ngModel)]="paymentForm.fee_schedule_id" name="fee_schedule_id" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5">
                <option [value]="3">Laboratory — $160.00</option>
                <option [value]="1">Tuition — $800.00</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">AMOUNT PAID ($) *</label>
              <input type="number" [(ngModel)]="paymentForm.amount_paid" name="amount_paid" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">RECEIPT NUMBER</label>
              <input type="text" [value]="dynamicReceiptNo" readonly class="w-full bg-[#111827] border border-[#1f2937] text-xs font-mono text-emerald-400 rounded-xl px-3 py-2.5">
            </div>

            <div class="pt-2">
              <button type="submit" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Save Payment</button>
            </div>
          </form>
        </div>

        <!-- Payment Receipt Modal Card (1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 class="text-base font-bold text-white tracking-tight">Payment Receipt</h3>
            <span class="text-xs font-mono text-emerald-400 font-bold">{{ dynamicReceiptNo }}</span>
          </div>

          <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono">
            <div class="text-center border-b border-[#1f2937] pb-3">
              <h4 class="font-bold text-white text-sm">EduTrack SMS</h4>
              <p class="text-[10px] text-gray-400">Official Payment Receipt</p>
              <p class="text-[10px] text-gray-500 mt-1">{{ currentDateStr }}</p>
            </div>

            <div class="space-y-1.5 text-[11px]">
              <div class="flex justify-between"><span class="text-gray-400">Student</span><span class="text-white font-bold">Brian Kofi</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Student ID</span><span class="text-gray-300">STU-2847</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Class</span><span class="text-gray-300">Form 3A</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Fee Category</span><span class="text-gray-300">Laboratory</span></div>
              <div class="flex justify-between border-t border-[#1f2937] pt-2 font-bold"><span class="text-white">Amount Paid</span><span class="text-emerald-400">$160.00</span></div>
            </div>

            <div class="pt-2 text-center">
              <p class="text-[10px] text-gray-500">Received by: Admin · Thank you!</p>
            </div>
          </div>

          <button (click)="printReceipt()" class="w-full py-2.5 rounded-xl border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-bold flex items-center justify-center gap-2">
            <i class="fa-solid fa-print"></i> Print Receipt
          </button>
        </div>

        <!-- Recent Payments Table (1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 text-xs space-y-4">
          <h3 class="text-base font-bold text-white tracking-tight">Recent Payments</h3>

          <div class="space-y-3">
            <div *ngFor="let p of recentPayments" class="bg-[#111827] border border-[#1f2937] p-3 rounded-xl flex items-center justify-between">
              <div>
                <p class="font-bold text-white">{{ p.first_name }} {{ p.last_name }}</p>
                <p class="text-[10px] text-gray-400">{{ p.fee_title }} · {{ p.receipt_number }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-emerald-400 font-mono">\${{ p.amount_paid }}</p>
                <span class="status-badge status-badge-paid">• {{ p.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FinanceModuleComponent implements OnInit {
  catName = 'Laboratory';
  catDesc = 'Fee for lab usage and materials';

  currentDueDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  dynamicReceiptNo = `RCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0024`;

  paymentForm: any = {
    student_id: 1,
    fee_schedule_id: 3,
    amount_paid: 160.00
  };

  recentPayments: any[] = [
    { first_name: 'Brian', last_name: 'Kofi', fee_title: 'Tuition', receipt_number: 'RCT-0020', amount_paid: 800, status: 'Paid' },
    { first_name: 'Amara', last_name: 'Lopes', fee_title: 'Tuition', receipt_number: 'RCT-0021', amount_paid: 800, status: 'Paid' },
    { first_name: 'Brian', last_name: 'Kofi', fee_title: 'Laboratory', receipt_number: 'RCT-20250618-0024', amount_paid: 160, status: 'Paid' }
  ];

  constructor(private api: ApiService, public toast: ToastService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.api.get<any>('payments').subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.payments?.length) {
          this.recentPayments = res.data.payments;
        }
      }
    });
  }

  onRecordPayment(): void {
    this.api.post<any>('payments', this.paymentForm).subscribe({
      next: (res: any) => {
        this.toast.success(`Payment recorded! Receipt: ${res.data?.receipt_number}`);
        this.loadPayments();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Payment recording failed')
    });
  }

  printReceipt(): void {
    window.print();
  }
}

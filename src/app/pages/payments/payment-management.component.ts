import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Payment Transactions'" 
                [subtitle]="'Admin / Finance / Payments'"
                [actionLabel]="'Record Payment'"
                (actionClicked)="scrollToRecord()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Payment Metrics Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL COLLECTED</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">\${{ getTotalCollected() | number:'1.2-2' }}</h3>
          <p class="text-xs text-emerald-400 mt-1 font-semibold">Verified Payments</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">KHQR TRANSACTIONS</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">{{ getKhqrCount() }}</h3>
          <p class="text-xs text-rose-400 mt-1 font-semibold">Bakong KHQR Instant</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PENDING PAYMENTS</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">\${{ getPendingTotal() | number:'1.2-2' }}</h3>
          <p class="text-xs text-amber-400 mt-1 font-semibold">{{ getPendingStudentCount() }} students awaiting payment</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">RECEIPTS ISSUED</span>
          <h3 class="text-2xl font-extrabold text-cyan-400 mt-2">{{ payments.length }}</h3>
          <p class="text-xs text-cyan-400 mt-1 font-semibold">Official Receipts</p>
        </div>
      </div>

      <!-- Main Payment Grid: Record Form & Receipt Preview (Left) + All Payments Table (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Record Payment & KHQR Action (1 Col) -->
        <div class="space-y-6">
          <div id="recordFormCard" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 class="text-base font-bold text-white tracking-tight">Record New Payment</h3>
              <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full">• BAKONG KHQR</span>
            </div>

            <form (ngSubmit)="onRecordPayment()" class="space-y-3">
              
              <!-- Select Class Group Filter -->
              <div>
                <label class="block font-bold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>SELECT CLASS GROUP *</span>
                  <span class="text-[10px] text-emerald-400 font-bold">Filter Students by Class Group</span>
                </label>
                <select [(ngModel)]="selectedGroupFilter" (change)="onGroupFilterChange()" name="selectedGroupFilter" class="w-full bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500">
                  <option value="">All Class Groups</option>
                  <option *ngFor="let g of groups" [value]="g.group_id">
                    {{ g.group_code }} — {{ g.group_name }} (Year {{ g.academic_year_level || 1 }})
                  </option>
                </select>
              </div>

              <!-- Live Student Search by Name, Phone Number, or Student ID -->
              <div class="relative">
                <label class="block font-bold text-gray-300 mb-1 flex items-center justify-between">
                  <span>SEARCH STUDENT *</span>
                  <span class="text-[10px] text-emerald-400 font-normal">Search Name, Phone, or ID</span>
                </label>

                <!-- Search Input Box -->
                <div class="relative">
                  <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input type="text" 
                         [(ngModel)]="studentSearchQuery" 
                         (focus)="onStudentSearchFocus()"
                         (input)="onStudentSearchInput()"
                         name="studentSearchQuery"
                         placeholder="Type student name, phone (e.g. 012...), or ID..." 
                         class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white placeholder-gray-400 rounded-xl pl-9 pr-8 py-2.5 font-bold focus:outline-none focus:border-emerald-500 transition-all">
                  
                  <button type="button" *ngIf="studentSearchQuery" (click)="clearStudentSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <i class="fa-solid fa-xmark text-xs"></i>
                  </button>
                </div>

                <!-- Floating Search Results Dropdown List (Shows when searching) -->
                <div *ngIf="isStudentDropdownOpen && filteredStudentsSearch.length > 0" class="absolute z-20 left-0 right-0 mt-1 bg-[#111827] border border-[#1f2937] rounded-xl max-h-56 overflow-y-auto shadow-2xl divide-y divide-[#1f2937]">
                  <div *ngFor="let s of filteredStudentsSearch" (click)="selectStudentForPayment(s)" class="p-2.5 hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-between">
                    <div>
                      <p class="font-bold text-white text-xs">{{ s.first_name }} {{ s.last_name }} <span class="text-emerald-400 font-mono font-normal">({{ s.custom_student_id }})</span></p>
                      <p class="text-[10px] text-gray-400 font-mono">Phone: {{ s.phone || s.parent_phone || 'N/A' }} · {{ s.group_code || 'N/A' }}</p>
                    </div>
                    <span class="text-[10px] text-emerald-400 font-bold">Select →</span>
                  </div>
                </div>

                <!-- Selected Student Preview Card -->
                <div *ngIf="selectedStudent" class="mt-2 p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span class="font-bold text-emerald-300 text-xs">{{ selectedStudent.first_name }} {{ selectedStudent.last_name }}</span>
                    <span class="text-[10px] text-gray-400 ml-2 font-mono">({{ selectedStudent.custom_student_id }})</span>
                    <p class="text-[10px] text-gray-300 font-mono mt-0.5">📞 {{ selectedStudent.phone || selectedStudent.parent_phone || 'No phone' }} · Group: {{ selectedStudent.group_code || 'N/A' }}</p>
                  </div>
                  <span [ngClass]="{
                    'bg-emerald-900 text-emerald-300': (selectedStudent.fee_status || '').toUpperCase() === 'PAID',
                    'bg-amber-900 text-amber-300': (selectedStudent.fee_status || '').toUpperCase() === 'PENDING',
                    'bg-rose-900 text-rose-300': (selectedStudent.fee_status || '').toUpperCase() === 'OVERDUE'
                  }" class="px-2 py-0.5 rounded text-[10px] font-bold">
                    • {{ selectedStudent.fee_status || 'Paid' }}
                  </span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1 flex items-center justify-between">
                  <span>FEE ITEM SCHEDULE *</span>
                  <span *ngIf="selectedGroupFilter" class="text-[10px] text-emerald-400 font-bold">✓ Filtered for Class Group</span>
                </label>
                <select [(ngModel)]="paymentForm.fee_schedule_id" (change)="onFeeScheduleChange()" name="fee_schedule_id" class="w-full bg-[#111827] border border-emerald-500/50 text-xs text-emerald-400 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500 font-mono shadow-sm">
                  <option *ngFor="let f of filteredFeeSchedules" [value]="f.fee_schedule_id">{{ f.fee_title }} — \${{ f.amount | number:'1.2-2' }} ({{ f.group_code || f.academic_year || 'All Groups' }})</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">PAYMENT METHOD *</label>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" (click)="paymentForm.payment_method = 'KHQR'" [class.bg-rose-950]="paymentForm.payment_method === 'KHQR'" [class.border-rose-500]="paymentForm.payment_method === 'KHQR'" [class.text-rose-400]="paymentForm.payment_method === 'KHQR'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-xs font-bold text-gray-300 flex items-center justify-center gap-1.5 transition-all">
                    <i class="fa-solid fa-qrcode"></i> KHQR
                  </button>
                  <button type="button" (click)="paymentForm.payment_method = 'CASH'" [class.bg-emerald-950]="paymentForm.payment_method === 'CASH'" [class.border-emerald-500]="paymentForm.payment_method === 'CASH'" [class.text-emerald-400]="paymentForm.payment_method === 'CASH'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-xs font-bold text-gray-300 flex items-center justify-center gap-1.5 transition-all">
                    <i class="fa-solid fa-money-bill-wave"></i> Cash
                  </button>
                  <button type="button" (click)="paymentForm.payment_method = 'BANK_TRANSFER'" [class.bg-blue-950]="paymentForm.payment_method === 'BANK_TRANSFER'" [class.border-blue-500]="paymentForm.payment_method === 'BANK_TRANSFER'" [class.text-blue-400]="paymentForm.payment_method === 'BANK_TRANSFER'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-xs font-bold text-gray-300 flex items-center justify-center gap-1.5 transition-all">
                    <i class="fa-solid fa-building-columns"></i> Bank
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">AMOUNT PAID ($) *</label>
                <input type="number" [(ngModel)]="paymentForm.amount_paid" name="amount_paid" required class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3.5 py-2.5 font-bold font-mono focus:outline-none focus:border-emerald-500">
              </div>

              <!-- KHQR Generator Button -->
              <div *ngIf="paymentForm.payment_method === 'KHQR'" class="pt-1">
                <button type="button" (click)="showKhqrModal = true" class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20">
                  <i class="fa-solid fa-qrcode text-sm"></i> Generate Bakong KHQR Code
                </button>
              </div>

              <div class="pt-2">
                <button type="submit" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>

          <!-- Live Receipt Preview Widget -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 class="text-base font-bold text-white tracking-tight">Receipt Live Preview</h3>
              <span class="text-xs font-mono text-emerald-400 font-bold">{{ dynamicReceiptNo }}</span>
            </div>

            <!-- Receipt Box -->
            <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-5 space-y-4 font-mono relative overflow-hidden">
              <div class="text-center border-b border-[#1f2937] pb-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto mb-1 text-sm shadow-md">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h4 class="font-bold text-white text-sm">EduTrack SMS</h4>
                <p class="text-[10px] text-gray-400">Official Payment Receipt</p>
                <p class="text-[10px] text-gray-500 mt-1">{{ currentDateStr }}</p>
              </div>

              <div class="space-y-2 text-[11px]">
                <div class="flex justify-between"><span class="text-gray-400">Receipt No:</span><span class="text-emerald-400 font-bold">{{ dynamicReceiptNo }}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Student:</span><span class="text-white font-bold">{{ selectedStudentName }}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Fee Item:</span><span class="text-gray-300">{{ selectedFeeTitle }}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Method:</span><span class="text-emerald-400 font-bold">{{ paymentForm.payment_method }}</span></div>
                <div class="flex justify-between border-t border-[#1f2937] pt-2 font-bold text-xs"><span class="text-white">Total Amount Paid:</span><span class="text-emerald-400">\${{ paymentForm.amount_paid | number:'1.2-2' }}</span></div>
              </div>

              <div class="pt-2 text-center border-t border-[#1f2937]/50">
                <span class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">PAID & VERIFIED</span>
              </div>
            </div>

            <button (click)="openReceiptModal(currentReceiptData)" class="w-full py-2.5 rounded-xl border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-bold flex items-center justify-center gap-2 transition-all">
              <i class="fa-solid fa-expand"></i> Open Printable Receipt Modal
            </button>
          </div>
        </div>

        <!-- Payments Log Table (2 Cols) -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 mb-2">
            <h3 class="text-base font-bold text-white tracking-tight">Payment Transactions Log</h3>

            <!-- Transactions Log Search Bar -->
            <div class="relative w-full md:w-64">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" 
                     [(ngModel)]="transactionSearchQuery" 
                     (input)="filterTransactions()" 
                     placeholder="Search student, phone, or receipt..." 
                     class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white placeholder-gray-400 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                  <th class="pb-3 px-3">RECEIPT NO</th>
                  <th class="pb-3 px-3">STUDENT</th>
                  <th class="pb-3 px-3">FEE TITLE</th>
                  <th class="pb-3 px-3">METHOD</th>
                  <th class="pb-3 px-3">AMOUNT</th>
                  <th class="pb-3 px-3">DATE</th>
                  <th class="pb-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let p of filteredPayments" class="hover:bg-gray-800/40 transition-colors">
                  <td class="py-3.5 px-3 font-mono text-emerald-400 font-bold">{{ p.receipt_number }}</td>
                  <td class="py-3.5 px-3 font-bold text-white">
                    {{ p.first_name }} {{ p.last_name }}
                    <span class="block text-[10px] text-gray-400 font-mono font-normal">📞 {{ p.phone || p.parent_phone || 'N/A' }}</span>
                  </td>
                  <td class="py-3.5 px-3 text-gray-300">{{ p.fee_title || 'Tuition' }}</td>
                  <td class="py-3.5 px-3">
                    <span [ngClass]="{
                      'bg-rose-950 text-rose-400 border-rose-800': p.payment_method === 'KHQR',
                      'bg-emerald-950 text-emerald-400 border-emerald-800': p.payment_method === 'CASH',
                      'bg-blue-950 text-blue-400 border-blue-800': p.payment_method === 'BANK_TRANSFER'
                    }" class="px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold">
                      {{ p.payment_method || 'KHQR' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-3 font-bold text-emerald-400 font-mono">\${{ p.amount_paid | number:'1.2-2' }}</td>
                  <td class="py-3.5 px-3 text-gray-400 font-mono">{{ p.payment_date | date:'shortDate' }}</td>
                  <td class="py-3.5 px-3 text-right">
                    <button (click)="openReceiptModal(p)" title="View Receipt Preview" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 ml-auto transition-all">
                      <i class="fa-solid fa-receipt text-xs"></i> Receipt
                    </button>
                  </td>
                </tr>

                <tr *ngIf="filteredPayments.length === 0">
                  <td colspan="7" class="py-8 text-center text-gray-500 italic">No payment transactions found matching your search.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- BAKONG KHQR MODAL -->
    <div *ngIf="showKhqrModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-sm rounded-3xl p-6 space-y-5 text-center text-white shadow-2xl relative overflow-hidden">
        <!-- KHQR Header -->
        <div class="bg-rose-600 -mx-6 -mt-6 p-4 text-white text-center font-bold relative">
          <h3 class="text-lg font-black tracking-wider flex items-center justify-center gap-2">
            <i class="fa-solid fa-qrcode"></i> KHQR PAYMENT
          </h3>
          <p class="text-[10px] opacity-90 font-normal mt-0.5">Scan with ABA Mobile, Bakong, or any Mobile Banking App</p>
          <button (click)="showKhqrModal = false" class="absolute right-4 top-4 text-white/80 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <!-- KHQR Merchant & Amount Info -->
        <div class="space-y-1">
          <p class="text-xs text-gray-400 uppercase tracking-wider font-bold">EduTrack International School</p>
          <h2 class="text-3xl font-black text-emerald-400 font-mono">\${{ paymentForm.amount_paid | number:'1.2-2' }}</h2>
          <p class="text-[11px] text-gray-400 font-mono font-semibold">{{ selectedStudentName }} · {{ selectedFeeTitle }}</p>
        </div>

        <!-- Dynamic KHQR Code Container -->
        <div class="p-4 bg-white rounded-2xl inline-block shadow-xl border-4 border-rose-500/30 relative group">
          <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=EduTrack_KHQR_Payment_' + paymentForm.amount_paid" alt="Bakong KHQR Code" class="w-48 h-48 mx-auto">
          <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <span class="text-xs font-bold text-white bg-rose-600 px-3 py-1.5 rounded-lg shadow-lg">Scan to Pay</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-400">Accepted by 85+ Cambodian Banks via National Bank of Cambodia Bakong System</p>

        <!-- Actions -->
        <div class="space-y-2 pt-2 border-t border-[#1f2937]">
          <button (click)="confirmKhqrPaid()" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            Simulate KHQR Scan Payment Success
          </button>
          <button (click)="showKhqrModal = false" class="w-full py-2 rounded-xl border border-[#1f2937] text-gray-400 hover:text-white text-xs">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Official Printable Receipt Preview Modal (Compact Slip Size) -->
    <div *ngIf="activeReceipt" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-sm rounded-2xl p-5 space-y-4 text-xs text-white shadow-2xl relative overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-emerald-500/20">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-white">Official Payment Receipt</h3>
              <p class="text-[10px] text-emerald-400 font-mono">{{ activeReceipt.receipt_number || dynamicReceiptNo }}</p>
            </div>
          </div>
          <button (click)="activeReceipt = null" class="w-7 h-7 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Receipt Card Body (Compact 80mm POS Thermal Slip Size) -->
        <div id="printableReceiptArea" class="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono text-[11px] relative shadow-inner">
          <!-- Stamp Watermark -->
          <div class="absolute right-4 top-4 border-2 border-emerald-500/40 text-emerald-400/40 font-black text-lg px-2 py-0.5 rounded rotate-[-12deg] pointer-events-none select-none uppercase tracking-widest">
            PAID
          </div>

          <!-- School Header -->
          <div class="text-center border-b border-dashed border-gray-700 pb-2.5">
            <h2 class="text-sm font-extrabold text-white tracking-tight uppercase">EduTrack School System</h2>
            <p class="text-[9px] text-gray-400 mt-0.5">Phnom Penh, Cambodia · Tel: +855 23 999 888</p>
            <p class="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-wider">OFFICIAL TUITION RECEIPT</p>
          </div>

          <!-- Receipt Metadata -->
          <div class="space-y-1 text-[10px] bg-[#1e293b]/70 p-2.5 rounded-lg border border-[#1f2937]">
            <div class="flex justify-between"><span class="text-gray-400">Receipt No:</span> <span class="font-bold text-emerald-400">{{ activeReceipt.receipt_number || dynamicReceiptNo }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Date:</span> <span class="font-bold text-white">{{ (activeReceipt.payment_date || currentDateStr) | date:'mediumDate' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Student:</span> <span class="font-bold text-white">{{ activeReceipt.first_name || selectedStudentName }} {{ activeReceipt.last_name || '' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Method:</span> <span class="font-bold text-emerald-400">{{ activeReceipt.payment_method || paymentForm.payment_method }}</span></div>
          </div>

          <!-- Fee Items Table -->
          <div class="pt-1">
            <table class="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr class="border-b border-dashed border-gray-700 font-bold text-gray-400">
                  <th class="pb-1">DESCRIPTION</th>
                  <th class="pb-1 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr>
                  <td class="py-1.5 font-bold text-white">{{ activeReceipt.fee_title || selectedFeeTitle }}</td>
                  <td class="py-1.5 text-right font-bold text-emerald-400">\${{ (activeReceipt.amount_paid || paymentForm.amount_paid) | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Footer -->
          <div class="border-t-2 border-dashed border-gray-600 pt-2 flex justify-between items-center text-xs font-bold">
            <span class="text-white">TOTAL PAID:</span>
            <span class="text-emerald-400 text-sm font-mono font-black">\${{ (activeReceipt.amount_paid || paymentForm.amount_paid) | number:'1.2-2' }}</span>
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-2 gap-2 pt-4 border-t border-dashed border-gray-700 text-[9px] text-gray-400 text-center">
            <div>
              <p class="border-b border-gray-700 pb-5"></p>
              <p class="mt-0.5 font-bold">Payer Signature</p>
            </div>
            <div>
              <p class="border-b border-gray-700 pb-5 text-emerald-400 font-bold flex items-end justify-center pb-0.5">Verified Admin</p>
              <p class="mt-0.5 font-bold">Cashier Signature</p>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2 border-t border-[#1f2937] pt-3">
          <button (click)="activeReceipt = null" class="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">Close</button>
          <button (click)="printReceipt()" class="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
            <i class="fa-solid fa-print"></i> Print Slip Receipt
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaymentManagementComponent implements OnInit {
  students: any[] = [];
  feeSchedules: any[] = [];
  payments: any[] = [];
  filteredPayments: any[] = [];

  studentSearchQuery = '';
  filteredStudentsSearch: any[] = [];
  groups: any[] = [];
  selectedGroupFilter: any = '';
  isStudentDropdownOpen = false;
  selectedStudent: any = null;

  transactionSearchQuery = '';
  activeReceipt: any = null;
  showKhqrModal = false;

  currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  dynamicReceiptNo = `RCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0024`;

  paymentForm: any = {
    student_id: null,
    fee_schedule_id: 1,
    amount_paid: 800.00,
    payment_method: 'KHQR'
  };

  constructor(private api: ApiService, public toast: ToastService) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadStudents();
    this.loadFeeSchedules();
    this.loadPayments();
  }

  loadGroups(): void {
    this.api.get<any>('groups').subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
    });
  }

  get filteredFeeSchedules(): any[] {
    if (!this.selectedGroupFilter) {
      return this.feeSchedules;
    }

    const selectedGroupId = Number(this.selectedGroupFilter);
    const group = this.groups.find(g => Number(g.group_id) === selectedGroupId);

    // Strictly filter fee schedules created for this exact class group (by group_id or group_code)
    const list = this.feeSchedules.filter(f => {
      if (f.group_id && Number(f.group_id) === selectedGroupId) {
        return true;
      }
      if (group && group.group_code && f.group_code && f.group_code.toLowerCase() === group.group_code.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (list.length > 0) {
      return list;
    }

    // If no specific fee schedule exists in database for this group, generate a dedicated fee item schedule for this group
    if (group) {
      return [
        {
          fee_schedule_id: 999000 + Number(group.group_id),
          group_id: group.group_id,
          group_code: group.group_code,
          fee_title: `${group.group_code} — Semester Tuition Fee`,
          amount: group.tuition_fee || 390.00,
          academic_year: `Year ${group.academic_year_level || 1}`
        }
      ];
    }

    return [];
  }

  onGroupFilterChange(): void {
    this.studentSearchQuery = '';
    this.selectedStudent = null;
    this.paymentForm.student_id = null;
    this.isStudentDropdownOpen = false;
    this.filterStudentsSearch();

    // Auto-select fee item schedule corresponding to selected class group
    const list = this.filteredFeeSchedules;
    if (list.length > 0) {
      this.paymentForm.fee_schedule_id = list[0].fee_schedule_id;
      this.paymentForm.amount_paid = list[0].amount;
    }
  }

  get selectedStudentName(): string {
    if (this.selectedStudent) {
      return `${this.selectedStudent.first_name} ${this.selectedStudent.last_name}`;
    }
    const s = this.students.find(x => x.student_id == this.paymentForm.student_id);
    return s ? `${s.first_name} ${s.last_name}` : 'Student Name';
  }

  get selectedFeeTitle(): string {
    const f = this.feeSchedules.find(x => x.fee_schedule_id == this.paymentForm.fee_schedule_id);
    return f ? f.fee_title : 'Tuition Fee';
  }

  get currentReceiptData(): any {
    return {
      receipt_number: this.dynamicReceiptNo,
      first_name: this.selectedStudentName,
      last_name: '',
      fee_title: this.selectedFeeTitle,
      payment_method: this.paymentForm.payment_method,
      amount_paid: this.paymentForm.amount_paid,
      payment_date: new Date()
    };
  }

  getPendingTotal(): number {
    const pendingCount = this.students.filter(s => s.fee_status === 'Pending' || s.fee_status === 'Overdue').length;
    const defaultAmount = this.feeSchedules.length > 0 ? (Number(this.feeSchedules[0].amount) || 400) : 400;
    return pendingCount * defaultAmount;
  }

  getPendingStudentCount(): number {
    return this.students.filter(s => s.fee_status === 'Pending' || s.fee_status === 'Overdue').length;
  }

  loadStudents(): void {
    this.api.get<any>('students').subscribe(res => {
      this.students = res.data?.students || res.data || [];
      this.filterStudentsSearch();
    });
  }

  onStudentSearchFocus(): void {
    this.filterStudentsSearch();
    this.isStudentDropdownOpen = true;
  }

  onStudentSearchInput(): void {
    this.filterStudentsSearch();
    this.isStudentDropdownOpen = true;
  }

  filterStudentsSearch(): void {
    let list = this.students;
    if (this.selectedGroupFilter) {
      list = list.filter(s => Number(s.group_id) === Number(this.selectedGroupFilter));
    }

    const q = this.studentSearchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(s => {
        const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const phone = (s.phone || s.parent_phone || '').toLowerCase();
        const customId = (s.custom_student_id || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || customId.includes(q);
      });
    }

    this.filteredStudentsSearch = list;
  }

  selectStudentForPayment(s: any): void {
    this.selectedStudent = s;
    this.paymentForm.student_id = s.student_id;
    this.studentSearchQuery = `${s.first_name} ${s.last_name} (${s.custom_student_id})`;
    this.isStudentDropdownOpen = false;

    // Auto-match FEE ITEM SCHEDULE * for selected student
    this.autoMatchFeeScheduleForStudent(s);
  }

  autoMatchFeeScheduleForStudent(s: any): void {
    if (!s || !this.feeSchedules || !this.feeSchedules.length) return;

    let matchedFee = null;

    // 1. Match by group_id
    if (s.group_id) {
      matchedFee = this.feeSchedules.find(f => Number(f.group_id) === Number(s.group_id));
    }

    // 2. Match by group_code
    if (!matchedFee && s.group_code) {
      matchedFee = this.feeSchedules.find(f => f.group_code && f.group_code.toLowerCase() === s.group_code.toLowerCase());
    }

    // 3. Match by academic_year_level
    if (!matchedFee && s.academic_year_level) {
      const yearStr = `Year ${s.academic_year_level}`;
      matchedFee = this.feeSchedules.find(f => (f.academic_year && f.academic_year.includes(yearStr)) || (f.fee_title && f.fee_title.includes(yearStr)));
    }

    // 4. Default to first schedule
    if (!matchedFee) {
      matchedFee = this.feeSchedules[0];
    }

    if (matchedFee) {
      this.paymentForm.fee_schedule_id = matchedFee.fee_schedule_id;
      this.paymentForm.amount_paid = matchedFee.amount;
      this.toast.success(`Auto-matched fee item "${matchedFee.fee_title}" ($${matchedFee.amount}) for ${s.first_name} ${s.last_name}!`);
    }
  }

  clearStudentSearch(): void {
    this.studentSearchQuery = '';
    this.selectedStudent = null;
    this.filteredStudentsSearch = [...this.students];
    this.isStudentDropdownOpen = true;
  }

  loadFeeSchedules(): void {
    this.api.get<any>('fees/schedules').subscribe(res => {
      this.feeSchedules = res.data?.schedules || res.data?.feeSchedules || res.data || [
        { fee_schedule_id: 1, fee_title: 'Tuition Fee', amount: 390.00, group_code: 'Form 3A' },
        { fee_schedule_id: 2, fee_title: 'Laboratory Fee', amount: 50.00, group_code: 'Form 3A' },
        { fee_schedule_id: 3, fee_title: 'Library Fee', amount: 20.00, group_code: 'Form 3A' }
      ];
      if (this.feeSchedules.length > 0 && !this.paymentForm.fee_schedule_id) {
        this.paymentForm.fee_schedule_id = this.feeSchedules[0].fee_schedule_id;
        this.paymentForm.amount_paid = this.feeSchedules[0].amount;
      }
      if (this.selectedStudent) {
        this.autoMatchFeeScheduleForStudent(this.selectedStudent);
      }
    });
  }

  loadPayments(): void {
    this.api.get<any>('payments').subscribe({
      next: (res: any) => {
        this.payments = res.data?.payments || res.data || [];
        this.filterTransactions();
      }
    });
  }

  filterTransactions(): void {
    const q = this.transactionSearchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredPayments = [...this.payments];
      return;
    }

    this.filteredPayments = this.payments.filter(p => {
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const receipt = (p.receipt_number || '').toLowerCase();
      const phone = (p.phone || p.parent_phone || '').toLowerCase();
      return name.includes(q) || receipt.includes(q) || phone.includes(q);
    });
  }

  getTotalCollected(): number {
    return this.payments.reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0);
  }

  getKhqrCount(): number {
    return this.payments.filter(p => (p.payment_method || '').toUpperCase() === 'KHQR').length;
  }

  onFeeScheduleChange(): void {
    const f = this.feeSchedules.find(x => x.fee_schedule_id == this.paymentForm.fee_schedule_id);
    if (f) {
      this.paymentForm.amount_paid = f.amount;
    }
  }

  confirmKhqrPaid(): void {
    this.showKhqrModal = false;
    this.onRecordPayment();
  }

  openReceiptModal(p: any): void {
    this.activeReceipt = p || this.currentReceiptData;
  }

  scrollToRecord(): void {
    const el = document.getElementById('recordFormCard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  onRecordPayment(): void {
    if (!this.paymentForm.student_id) {
      this.toast.error('Please search and select a student first');
      return;
    }

    if (!this.paymentForm.amount_paid || this.paymentForm.amount_paid <= 0) {
      this.toast.error('Please enter a valid amount paid');
      return;
    }

    const payload = {
      student_id: Number(this.paymentForm.student_id),
      fee_schedule_id: this.paymentForm.fee_schedule_id ? Number(this.paymentForm.fee_schedule_id) : null,
      amount_paid: Number(this.paymentForm.amount_paid),
      payment_method: this.paymentForm.payment_method || 'KHQR',
      penalty_paid: 0.00
    };

    this.api.post<any>('payments', payload).subscribe({
      next: (res: any) => {
        const receiptNo = res.data?.receipt_number || res.data?.payment?.receipt_number || this.dynamicReceiptNo;
        this.toast.success(`Payment recorded in MySQL DB! Receipt: ${receiptNo}`);

        // Refresh transactions log & student list from backend
        this.loadPayments();
        this.loadStudents();

        this.openReceiptModal({
          receipt_number: receiptNo,
          first_name: this.selectedStudentName,
          last_name: '',
          fee_title: this.selectedFeeTitle,
          payment_method: this.paymentForm.payment_method,
          amount_paid: this.paymentForm.amount_paid,
          payment_date: new Date()
        });
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'Failed to save payment in MySQL';
        this.toast.error(errorMsg);
        console.error('Record payment error:', err);
      }
    });
  }

  printReceipt(): void {
    const receiptNo = this.activeReceipt?.receipt_number || this.dynamicReceiptNo;
    const studentName = `${this.activeReceipt?.first_name || this.selectedStudentName || ''} ${this.activeReceipt?.last_name || ''}`.trim() || 'Student';
    const feeTitle = this.activeReceipt?.fee_title || this.selectedFeeTitle || 'Tuition Fee';
    const paymentMethod = this.activeReceipt?.payment_method || this.paymentForm.payment_method || 'KHQR';
    const amountPaid = Number(this.activeReceipt?.amount_paid || this.paymentForm.amount_paid || 0).toFixed(2);
    const dateStr = new Date(this.activeReceipt?.payment_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const printWin = window.open('', '_blank', 'width=450,height=650');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${receiptNo}</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              background: #ffffff;
              color: #000000;
              margin: 0;
              padding: 10px;
              display: flex;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-card {
              width: 310px;
              border: 1px solid #111;
              border-radius: 8px;
              padding: 12px;
              box-sizing: border-box;
              background: #ffffff;
              position: relative;
            }
            .receipt-card * {
              color: #000000 !important;
            }
            .text-center { text-align: center; }
            .flex-between { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; }
            .bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .border-dashed-b { border-bottom: 1px dashed #666; padding-bottom: 6px; margin-bottom: 6px; }
            .border-dashed-t { border-top: 1px dashed #666; padding-top: 6px; margin-top: 6px; }
            .border-thick-t { border-top: 2px dashed #000; padding-top: 6px; margin-top: 6px; }
            .stamp {
              position: absolute;
              right: 10px;
              top: 10px;
              border: 2px solid #059669;
              color: #059669 !important;
              font-weight: 900;
              font-size: 12px;
              padding: 1px 5px;
              border-radius: 4px;
              transform: rotate(-10deg);
              letter-spacing: 1.5px;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
            th { border-bottom: 1px dashed #666; text-align: left; padding-bottom: 4px; font-size: 9px; font-weight: bold; }
            td { padding: 5px 0; }
            .text-right { text-align: right; }
            .text-emerald { color: #059669 !important; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: center; margin-top: 16px; font-size: 8px; }
            .sig-line { border-bottom: 1px solid #555; height: 20px; margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="stamp">PAID</div>
            <div class="text-center border-dashed-b">
              <h3 style="margin:0; font-size:13px;" class="uppercase bold">EduTrack School System</h3>
              <div style="font-size:8.5px; color:#444; margin-top:2px;">Phnom Penh, Cambodia · Tel: +855 23 999 888</div>
              <div style="font-size:9.5px; font-weight:bold; margin-top:3px;" class="uppercase text-emerald">OFFICIAL TUITION RECEIPT</div>
            </div>

            <div style="background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
              <div class="flex-between"><span>Receipt No:</span> <span class="bold text-emerald">${receiptNo}</span></div>
              <div class="flex-between"><span>Date:</span> <span class="bold">${dateStr}</span></div>
              <div class="flex-between"><span>Student:</span> <span class="bold">${studentName}</span></div>
              <div class="flex-between"><span>Payment Method:</span> <span class="bold text-emerald">${paymentMethod}</span></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th class="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="bold">${feeTitle}</td>
                  <td class="text-right bold text-emerald">$${amountPaid}</td>
                </tr>
              </tbody>
            </table>

            <div class="flex-between border-thick-t bold" style="font-size:11px;">
              <span>TOTAL PAID:</span>
              <span class="text-emerald" style="font-size:13px;">$${amountPaid}</span>
            </div>

            <div class="signatures border-dashed-t">
              <div>
                <div class="sig-line"></div>
                <div class="bold">Payer Signature</div>
              </div>
              <div>
                <div class="sig-line" style="line-height:20px; font-weight:bold; color:#059669 !important;">Verified Admin</div>
                <div class="bold">Cashier Signature</div>
              </div>
            </div>

            <div style="font-size:7.5px; color:#666; text-align:center; margin-top:8px; font-style:italic;">
              • Thank you for your payment! •
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-classes-subjects-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Classes, Subjects & Exam Schedule'" [subtitle]="'Admin / Classes & Subjects'"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Top Split: Add/Edit Class + All Classes Table -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Add Class Form -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <h3 class="text-base font-bold text-white tracking-tight">Add / Edit Class</h3>
          <form (ngSubmit)="onSaveClass()" class="space-y-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">CLASS NAME *</label>
              <input type="text" [(ngModel)]="classForm.group_code" name="group_code" placeholder="Form 3A" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">SHIFT *</label>
              <select [(ngModel)]="classForm.shift" name="shift" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div class="pt-2 flex justify-end">
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Save Class</button>
            </div>
          </form>
        </div>

        <!-- All Classes Table -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <h3 class="text-base font-bold text-white tracking-tight mb-4">All Classes</h3>
          <div class="overflow-x-auto text-xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase">
                  <th class="pb-3">CLASS NAME</th>
                  <th class="pb-3">SHIFT</th>
                  <th class="pb-3">STUDENTS</th>
                  <th class="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let g of groups" class="hover:bg-gray-800/40">
                  <td class="py-3 font-bold text-white">{{ g.group_code }}</td>
                  <td class="py-3 text-gray-300 capitalize">{{ g.shift?.toLowerCase() }}</td>
                  <td class="py-3 text-emerald-400 font-bold font-mono">{{ g.student_count || 34 }}</td>
                  <td class="py-3 text-right space-x-2">
                    <button class="text-gray-400 hover:text-emerald-400"><i class="fa-solid fa-eye"></i></button>
                    <button class="text-gray-400 hover:text-rose-400"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bottom Split: Subjects List + Exam Schedule -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Subjects Table -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <h3 class="text-base font-bold text-white tracking-tight mb-4">All Subjects</h3>
          <div class="overflow-x-auto text-xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase">
                  <th class="pb-3">SUBJECT</th>
                  <th class="pb-3">DEPARTMENT</th>
                  <th class="pb-3">CREDITS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let sub of subjects" class="hover:bg-gray-800/40">
                  <td class="py-3 font-bold text-white">{{ sub.subject_name }}</td>
                  <td class="py-3 text-gray-300">{{ sub.department || 'Sciences' }}</td>
                  <td class="py-3 font-mono font-bold text-emerald-400">{{ sub.credits }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Exam Schedule List -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <h3 class="text-base font-bold text-white tracking-tight mb-4">Exam Schedule — Term 2</h3>
          <div class="overflow-x-auto text-xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase">
                  <th class="pb-3">EXAM</th>
                  <th class="pb-3">CLASS</th>
                  <th class="pb-3">DATE</th>
                  <th class="pb-3">STATUS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1f2937]/50">
                <tr *ngFor="let ex of exams" class="hover:bg-gray-800/40">
                  <td class="py-3 font-bold text-white">{{ ex.exam_title }}</td>
                  <td class="py-3 text-gray-300">{{ ex.group_code }}</td>
                  <td class="py-3 text-gray-400">{{ ex.exam_date | date:'MMM d' }}</td>
                  <td class="py-3">
                    <span class="status-badge status-badge-active">• {{ ex.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClassesSubjectsScheduleComponent implements OnInit {
  groups: any[] = [];
  subjects: any[] = [];
  exams: any[] = [];

  classForm: any = { group_code: 'Form 3A', group_name: 'Form 3 Section A', shift: 'MORNING' };

  constructor(private api: ApiService, public toast: ToastService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.get<any>('groups').subscribe(res => this.groups = res.data?.groups || []);
    this.api.get<any>('subjects').subscribe(res => this.subjects = res.data?.subjects || []);
    this.api.get<any>('exams').subscribe(res => this.exams = res.data?.exams || []);
  }

  onSaveClass(): void {
    this.api.post('groups', { ...this.classForm, group_name: this.classForm.group_code }).subscribe({
      next: () => {
        this.toast.success('Class group saved');
        this.loadData();
      }
    });
  }
}

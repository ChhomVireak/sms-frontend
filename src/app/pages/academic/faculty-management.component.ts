import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AcademicService, Faculty } from '../../core/services/academic.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-faculty-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Faculty Management'" 
                [subtitle]="'Admin / Academic / Faculties'"
                [actionLabel]="'Create Faculty'"
                (actionClicked)="openModal()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto">
      <!-- Search & Filters Toolbar -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div class="relative w-full md:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" [(ngModel)]="searchQuery" (input)="loadFaculties()" placeholder="Search faculty code or name..." class="w-full bg-[#111827] border border-[#1f2937] text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500">
        </div>

        <div class="flex items-center gap-3">
          <select [(ngModel)]="selectedStatus" (change)="loadFaculties()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3.5 py-2.5 font-bold">
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="INACTIVE">INACTIVE Only</option>
          </select>
        </div>
      </div>

      <!-- Faculty List Cards & Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white tracking-tight">University Faculties</h3>
          <span class="text-gray-400 font-mono">{{ faculties.length }} Faculties Total</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">FACULTY CODE</th>
                <th class="pb-3">FACULTY NAME</th>
                <th class="pb-3">DESCRIPTION</th>
                <th class="pb-3">TOTAL MAJORS</th>
                <th class="pb-3">STATUS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let f of faculties" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-mono text-emerald-400 font-extrabold">{{ f.faculty_code }}</td>
                <td class="py-3.5 font-bold text-white">{{ f.faculty_name }}</td>
                <td class="py-3.5 text-gray-300 max-w-xs truncate">{{ f.description || 'N/A' }}</td>
                <td class="py-3.5 font-mono text-cyan-400 font-bold">{{ f.total_programs || 0 }} Programs</td>
                <td class="py-3.5">
                  <span [class.bg-emerald-950]="f.status === 'ACTIVE'" [class.text-emerald-400]="f.status === 'ACTIVE'" [class.border-emerald-800]="f.status === 'ACTIVE'"
                        [class.bg-rose-950]="f.status !== 'ACTIVE'" [class.text-rose-400]="f.status !== 'ACTIVE'" [class.border-rose-800]="f.status !== 'ACTIVE'"
                        class="px-2.5 py-1 rounded-full border text-[10px] font-bold">
                    • {{ f.status }}
                  </span>
                </td>
                <td class="py-3.5 text-right space-x-1.5">
                  <button (click)="editFaculty(f)" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteFaculty(f)" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="faculties.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500 italic">No faculty records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal Dialog -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">{{ isEditing ? 'Edit Faculty' : 'Create New Faculty' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveFaculty()" class="space-y-3.5">
          <div>
            <label class="block font-bold text-gray-300 mb-1">FACULTY CODE *</label>
            <input type="text" [(ngModel)]="currentFaculty.faculty_code" name="faculty_code" required placeholder="e.g. FIT, FBA" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono uppercase">
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">FACULTY NAME *</label>
            <input type="text" [(ngModel)]="currentFaculty.faculty_name" name="faculty_name" required placeholder="e.g. Faculty of Information Technology" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white">
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">DESCRIPTION</label>
            <textarea [(ngModel)]="currentFaculty.description" name="description" rows="3" placeholder="Brief description..." class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white"></textarea>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">STATUS</label>
            <select [(ngModel)]="currentFaculty.status" name="status" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Save Faculty</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FacultyManagementComponent implements OnInit {
  faculties: Faculty[] = [];
  searchQuery = '';
  selectedStatus = '';
  showModal = false;
  isEditing = false;

  currentFaculty: Faculty = {
    faculty_code: '',
    faculty_name: '',
    description: '',
    status: 'ACTIVE'
  };

  constructor(private academicService: AcademicService, private toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadFaculties();
  }

  loadFaculties(): void {
    this.academicService.getFaculties({ search: this.searchQuery, status: this.selectedStatus }).subscribe({
      next: (res) => {
        this.faculties = res.data?.faculties || [];
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.currentFaculty = { faculty_code: '', faculty_name: '', description: '', status: 'ACTIVE' };
    this.showModal = true;
  }

  editFaculty(f: Faculty): void {
    this.isEditing = true;
    this.currentFaculty = { ...f };
    this.showModal = true;
  }

  saveFaculty(): void {
    if (this.isEditing && this.currentFaculty.faculty_id) {
      this.academicService.updateFaculty(this.currentFaculty.faculty_id, this.currentFaculty).subscribe({
        next: () => {
          this.toast.success('Faculty updated successfully');
          this.showModal = false;
          this.loadFaculties();
        }
      });
    } else {
      this.academicService.createFaculty(this.currentFaculty).subscribe({
        next: () => {
          this.toast.success('Faculty created successfully');
          this.showModal = false;
          this.loadFaculties();
        }
      });
    }
  }

  deleteFaculty(f: Faculty): void {
    this.confirmService.confirm({
      title: 'Delete Faculty Department?',
      message: `Are you sure you want to delete faculty "${f.faculty_name}" (${f.faculty_code})?`,
      confirmText: 'Yes, Delete Faculty',
      onConfirm: () => {
        this.academicService.deleteFaculty(f.faculty_id!).subscribe({
          next: () => {
            this.toast.success(`Faculty '${f.faculty_name}' deleted successfully!`);
            this.loadFaculties();
          }
        });
      }
    });
  }
}

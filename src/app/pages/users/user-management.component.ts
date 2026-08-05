import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'User Management'" [subtitle]="'Admin / User Management'"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">


        <!-- User Categories Stat Pills + Users List (Right 2 Cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 4 User Category Stat Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-[#1e293b]/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">Administrator</p>
                <p class="text-[10px] text-gray-400">Full system access</p>
              </div>
              <span class="text-xl font-extrabold text-emerald-400">{{ adminCount }}</span>
            </div>

            <div class="bg-[#1e293b]/70 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">Teacher</p>
                <p class="text-[10px] text-gray-400">Academic portal</p>
              </div>
              <span class="text-xl font-extrabold text-blue-400">{{ teacherCount }}</span>
            </div>

            <div class="bg-[#1e293b]/70 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">Student</p>
                <p class="text-[10px] text-gray-400">Student portal</p>
              </div>
              <span class="text-xl font-extrabold text-amber-400">{{ studentCount }}</span>
            </div>

            <div class="bg-[#1e293b]/70 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-white">Total Users</p>
                <p class="text-[10px] text-gray-400">Active accounts</p>
              </div>
              <span class="text-xl font-extrabold text-purple-400">{{ users.length }}</span>
            </div>
          </div>

          <!-- Top Toolbar with Search & Role Filter -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="relative w-full md:w-80">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" 
                     [(ngModel)]="searchQuery" 
                     (input)="onFilterChange()" 
                     placeholder="Search username or email..." 
                     class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white placeholder-gray-400 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
            </div>

            <div class="flex items-center gap-2 bg-[#111827] px-3.5 py-2 rounded-xl border border-[#1f2937] text-xs font-bold text-white shadow-sm w-full md:w-auto">
              <i class="fa-solid fa-user-shield text-emerald-400 text-xs"></i>
              <span>Role:</span>
              <select [(ngModel)]="selectedRole" (change)="onFilterChange()" class="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer">
                <option value="" class="bg-[#111827] text-white">All Roles</option>
                <option value="ADMIN" class="bg-[#111827] text-emerald-400">ADMIN</option>
                <option value="TEACHER" class="bg-[#111827] text-blue-400">TEACHER</option>
                <option value="STUDENT" class="bg-[#111827] text-amber-400">STUDENT</option>
              </select>
            </div>
          </div>

          <!-- Users Table Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-white tracking-tight">
                System Users <span class="text-xs font-normal text-gray-400 ml-2">{{ filteredUsers.length }} of {{ users.length }} total</span>
              </h3>
            </div>

            <div class="overflow-x-auto overflow-y-auto max-h-[420px] rounded-xl border border-[#1f2937] shadow-inner">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="sticky top-0 z-10 bg-[#111827] shadow-md">
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                    <th class="py-3 px-3">USERNAME</th>
                    <th class="py-3 px-3">EMAIL</th>
                    <th class="py-3 px-3">ROLE</th>
                    <th class="py-3 px-3">STATUS</th>
                    <th class="py-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let u of paginatedUsers" class="hover:bg-gray-800/40">
                    <td class="py-3 px-3 flex items-center gap-2.5 font-bold text-white">
                      <div class="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {{ u.username ? u.username[0].toUpperCase() : 'U' }}
                      </div>
                      <span>{{ u.username }}</span>
                    </td>
                    <td class="py-3 px-3 text-gray-300">{{ u.email }}</td>
                    <td class="py-3 px-3">
                      <span [ngClass]="{
                        'bg-emerald-950 text-emerald-400 border-emerald-800': u.role === 'ADMIN',
                        'bg-blue-950 text-blue-400 border-blue-800': u.role === 'TEACHER',
                        'bg-amber-950 text-amber-400 border-amber-800': u.role === 'STUDENT'
                      }" class="px-2 py-0.5 rounded font-bold border text-[10px]">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="py-3 px-3">
                      <button (click)="toggleStatus(u)" class="status-badge status-badge-active">
                        • {{ u.status }}
                      </button>
                    </td>
                    <td class="py-3 px-3 text-right space-x-2">
                      <button (click)="deleteUser(u)" class="text-gray-400 hover:text-rose-400 p-1"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>

                  <tr *ngIf="filteredUsers.length === 0">
                    <td colspan="5" class="py-8 text-center text-gray-500 italic">No user accounts found matching your search or role filter.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Interactive Pagination Footer Bar -->
            <div class="mt-4 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div class="flex items-center gap-3">
                <span>
                  Showing <strong class="text-white font-mono">{{ filteredUsers.length > 0 ? startIndex + 1 : 0 }}</strong> to <strong class="text-white font-mono">{{ endIndex }}</strong> of <strong class="text-emerald-400 font-mono">{{ filteredUsers.length }}</strong> users
                </span>
                <div class="flex items-center gap-1.5 ml-2 border-l border-[#1f2937] pl-3">
                  <span>Per page:</span>
                  <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#111827] border border-[#1f2937] text-emerald-400 font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                    <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <!-- First Page -->
                <button (click)="setPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
                  <i class="fa-solid fa-angles-left"></i>
                </button>
                <!-- Prev Page -->
                <button (click)="setPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
                  <i class="fa-solid fa-angle-left"></i> Prev
                </button>

                <!-- Page Number Buttons -->
                <button *ngFor="let p of pageRange" 
                        (click)="setPage(p)" 
                        [ngClass]="p === currentPage ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/30' : 'bg-[#111827] border-[#1f2937] text-gray-300 hover:text-white hover:border-emerald-500/40'"
                        class="w-8 h-8 rounded-lg border font-mono text-xs flex items-center justify-center transition-all cursor-pointer">
                  {{ p }}
                </button>

                <!-- Next Page -->
                <button (click)="setPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all flex items-center gap-1">
                  Next <i class="fa-solid fa-angle-right"></i>
                </button>
                <!-- Last Page -->
                <button (click)="setPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-emerald-500/50 disabled:opacity-40 disabled:hover:border-[#1f2937] text-white font-bold transition-all">
                  <i class="fa-solid fa-angles-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];

  searchQuery = '';
  selectedRole = '';

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  form: any = {
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  };

  constructor(private api: ApiService, private toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  onEmailInput(): void {
    if (this.form.email && this.form.email.includes('@')) {
      if (!this.form.username) {
        this.form.username = this.form.email.split('@')[0];
      }
      if (this.form.role === 'TEACHER' || !this.form.password) {
        this.form.password = this.form.email.split('@')[0];
      }
    }
  }

  onRoleChange(): void {
    if (this.form.role === 'TEACHER' && this.form.email && this.form.email.includes('@')) {
      this.form.password = this.form.email.split('@')[0];
    }
  }

  get adminCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  get teacherCount(): number {
    return this.users.filter(u => u.role === 'TEACHER').length;
  }

  get studentCount(): number {
    return this.users.filter(u => u.role === 'STUDENT').length;
  }

  get filteredUsers(): any[] {
    const q = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';
    const r = this.selectedRole ? this.selectedRole.trim().toUpperCase() : '';

    return this.users.filter(u => {
      const matchSearch = !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchRole = !r || u.role === r;
      return matchSearch && matchRole;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredUsers.length);
  }

  get paginatedUsers(): any[] {
    return this.filteredUsers.slice(this.startIndex, this.endIndex);
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

  onFilterChange(): void {
    this.currentPage = 1;
  }

  loadUsers(): void {
    this.api.get<any>('users').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users = res.data.users || [];
        }
      }
    });
  }

  onCreateUser(): void {
    this.api.post('users', this.form).subscribe({
      next: () => {
        this.toast.success('User account created successfully');
        this.loadUsers();
        this.form = { username: '', email: '', password: '', role: 'STUDENT' };
      },
      error: (err) => this.toast.error(err.error?.message || 'Creation failed')
    });
  }

  toggleStatus(u: any): void {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.api.patch(`users/${u.user_id}/status`, { status: newStatus }).subscribe({
      next: () => {
        u.status = newStatus;
        this.toast.success(`User ${u.username} status set to ${newStatus}`);
      }
    });
  }

  deleteUser(u: any): void {
    this.confirmService.confirm({
      title: 'Delete System User Account?',
      message: `Are you sure you want to delete user account "${u.username}" (${u.email})? This user will no longer be able to log in.`,
      confirmText: 'Yes, Delete Account',
      onConfirm: () => {
        this.api.delete(`users/${u.user_id}`).subscribe({
          next: () => {
            this.toast.success(`User '${u.username}' deleted successfully!`);
            this.loadUsers();
          }
        });
      }
    });
  }
}

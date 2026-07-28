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

          <!-- Users Table -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-white tracking-tight">System Users</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                    <th class="pb-3">USERNAME</th>
                    <th class="pb-3">EMAIL</th>
                    <th class="pb-3">ROLE</th>
                    <th class="pb-3">STATUS</th>
                    <th class="pb-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1f2937]/50">
                  <tr *ngFor="let u of users" class="hover:bg-gray-800/40">
                    <td class="py-3 flex items-center gap-2.5 font-bold text-white">
                      <div class="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {{ u.username[0].toUpperCase() }}
                      </div>
                      <span>{{ u.username }}</span>
                    </td>
                    <td class="py-3 text-gray-300">{{ u.email }}</td>
                    <td class="py-3">
                      <span [ngClass]="{
                        'bg-emerald-950 text-emerald-400 border-emerald-800': u.role === 'ADMIN',
                        'bg-blue-950 text-blue-400 border-blue-800': u.role === 'TEACHER',
                        'bg-amber-950 text-amber-400 border-amber-800': u.role === 'STUDENT'
                      }" class="px-2 py-0.5 rounded font-bold border text-[10px]">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="py-3">
                      <button (click)="toggleStatus(u)" class="status-badge status-badge-active">
                        • {{ u.status }}
                      </button>
                    </td>
                    <td class="py-3 text-right space-x-2">
                      <button (click)="deleteUser(u)" class="text-gray-400 hover:text-rose-400 p-1"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
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

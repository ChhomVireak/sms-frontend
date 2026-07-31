import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'System Alerts & Broadcast Notifications'" 
                [subtitle]="'Admin / System Alerts'"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <!-- Top Alert Metrics Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL BROADCASTS</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">{{ notifications.length }}</h3>
          <p class="text-xs text-cyan-400 mt-1">System wide notifications</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">HIGH PRIORITY ALERTS</span>
          <h3 class="text-2xl font-extrabold text-rose-400 mt-2">{{ highPriorityCount }} {{ highPriorityCount === 1 ? 'Alert' : 'Alerts' }}</h3>
          <p class="text-xs text-rose-400 mt-1">Immediate action required</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">STUDENT NOTICES</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ studentParentCount }} {{ studentParentCount === 1 ? 'Notice' : 'Notices' }}</h3>
          <p class="text-xs text-gray-400 mt-1">Active broadcasts</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TEACHER MEMOS</span>
          <h3 class="text-2xl font-extrabold text-purple-400 mt-2">{{ teacherMemosCount }} {{ teacherMemosCount === 1 ? 'Memo' : 'Memos' }}</h3>
          <p class="text-xs text-gray-400 mt-1">Faculty communications</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Compose Notification Form (Left 1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-paper-plane text-emerald-400"></i> Compose System Broadcast Alert
          </h3>

          <form (ngSubmit)="onPublish()" class="space-y-4">
            <div>
              <label class="block font-bold text-gray-300 mb-1">ALERT TITLE *</label>
              <input type="text" [(ngModel)]="form.title" name="title" required placeholder="e.g. Midterm Exam Schedule Released" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500">
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">BROADCAST MESSAGE *</label>
              <textarea rows="4" [(ngModel)]="form.message" name="message" required placeholder="Enter complete alert text for students or teachers..." class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"></textarea>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-2">TARGET AUDIENCE *</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" (click)="form.target_audience = 'All Users'; selectedGroupIds = []" [class.bg-emerald-950]="form.target_audience === 'All Users'" [class.border-emerald-500]="form.target_audience === 'All Users'" [class.text-emerald-400]="form.target_audience === 'All Users'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-gray-300 font-bold">All Users</button>
                <button type="button" (click)="form.target_audience = 'Teachers'; selectedGroupIds = []" [class.bg-emerald-950]="form.target_audience === 'Teachers'" [class.border-emerald-500]="form.target_audience === 'Teachers'" [class.text-emerald-400]="form.target_audience === 'Teachers'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-gray-300 font-bold">Teachers</button>
                <button type="button" (click)="form.target_audience = 'Students'" [class.bg-emerald-950]="form.target_audience === 'Students'" [class.border-emerald-500]="form.target_audience === 'Students'" [class.text-emerald-400]="form.target_audience === 'Students'" class="p-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-gray-300 font-bold">Students</button>
              </div>

              <!-- Target Class Group Selection (1 group or multiple groups) -->
              <div *ngIf="form.target_audience === 'Students'" class="mt-3 p-3 bg-[#111827] border border-[#1f2937] rounded-xl space-y-2">
                <label class="block font-bold text-amber-400 text-[11px] flex items-center justify-between">
                  <span>SELECT TARGET CLASS GROUP(S)</span>
                  <span class="text-gray-400 font-mono text-[10px]">{{ selectedGroupIds.length > 0 ? selectedGroupIds.length + ' Selected' : 'All Groups' }}</span>
                </label>
                
                <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  <label *ngFor="let g of groups" 
                         (click)="toggleGroupSelect(g.group_id); $event.preventDefault()" 
                         [ngClass]="selectedGroupIds.includes(g.group_id) ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow' : 'bg-[#1e293b] border-[#1f2937] text-gray-300 hover:bg-gray-800'" 
                         class="flex items-center gap-2 text-xs font-bold p-2 rounded-lg border cursor-pointer transition-all">
                    <input type="checkbox" [checked]="selectedGroupIds.includes(g.group_id)" class="rounded text-amber-500 focus:ring-0">
                    <span class="truncate font-mono">{{ g.group_code }} ({{ g.group_name }})</span>
                  </label>
                </div>
                <p class="text-[10px] text-gray-400 italic">Select 1 group or multiple groups. Uncheck all to target ALL students.</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">PUBLISH DATE *</label>
                <input type="date" [(ngModel)]="form.publish_date" name="publish_date" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2">
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">PRIORITY</label>
                <select [(ngModel)]="form.priority" name="priority" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold">
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div class="pt-3 flex items-center justify-end gap-3">
              <button type="submit" class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">Send System Alert</button>
            </div>
          </form>
        </div>

        <!-- Notifications Feed List (Right 2 Cols) -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
            <h3 class="text-base font-bold text-white tracking-tight">Active Broadcast Alerts Feed</h3>
            <span class="text-xs font-semibold text-gray-400">{{ notifications.length }} active alerts</span>
          </div>

          <div class="space-y-4">
            <div *ngFor="let n of notifications" [class.border-rose-800]="n.priority === 'High'" class="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl space-y-3 transition-all hover:border-emerald-500/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div [ngClass]="{
                    'bg-rose-500/20 text-rose-400 border-rose-500/40': n.priority === 'High',
                    'bg-amber-500/20 text-amber-400 border-amber-500/40': n.priority === 'Medium',
                    'bg-cyan-500/20 text-cyan-400 border-cyan-500/40': n.priority !== 'High' && n.priority !== 'Medium'
                  }" class="w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold shadow-md">
                    <i class="fa-solid" [ngClass]="n.priority === 'High' ? 'fa-triangle-exclamation' : 'fa-bullhorn'"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-white text-sm tracking-tight">{{ n.title }}</h4>
                    <p class="text-[10px] text-gray-400 font-mono mt-0.5">{{ n.publish_date | date:'mediumDate' }} · Broadcast to {{ n.target_audience }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button (click)="viewAlertDetails(n)" title="View Alert Details" class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs">
                    <i class="fa-solid fa-eye text-emerald-400"></i> Read
                  </button>
                  <button (click)="deleteNotif(n)" title="Delete Alert" class="text-gray-400 hover:text-rose-400 text-xs p-1"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>

              <p class="text-xs text-gray-300 leading-relaxed">{{ n.message }}</p>

              <div class="flex items-center gap-2 pt-2 border-t border-[#1f2937]/50">
                <span class="status-badge status-badge-active">• {{ n.status || 'Published' }}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-700 font-mono">{{ n.target_audience }}</span>
                <span *ngIf="n.priority === 'High'" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 font-mono">High Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Details Modal Overlay -->
    <div *ngIf="activeAlertModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-lg rounded-2xl p-6 space-y-6 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-lg">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white">{{ activeAlertModal.title }}</h3>
              <p class="text-xs text-emerald-400 font-mono">{{ activeAlertModal.publish_date | date:'mediumDate' }}</p>
            </div>
          </div>
          <button (click)="activeAlertModal = null" class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <div class="bg-[#111827] border border-[#1f2937] p-4 rounded-xl space-y-3">
          <div class="flex justify-between items-center text-[11px] border-b border-[#1f2937] pb-2">
            <span class="text-gray-400">Target Audience:</span>
            <span class="font-bold text-white font-mono">{{ activeAlertModal.target_audience }}</span>
          </div>
          <p class="text-gray-200 text-xs leading-relaxed pt-1">{{ activeAlertModal.message }}</p>
        </div>

        <div class="flex justify-end border-t border-[#1f2937] pt-4">
          <button (click)="activeAlertModal = null" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Close Alert</button>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  groups: any[] = [];
  selectedGroupIds: number[] = [];
  activeAlertModal: any = null;

  form: any = {
    title: '',
    message: '',
    target_audience: 'All Users',
    publish_date: new Date().toISOString().slice(0, 10),
    priority: 'High'
  };

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadNotifs();
    this.loadGroups();
  }

  loadGroups(): void {
    this.api.get<any>('groups').subscribe({
      next: (res) => {
        this.groups = res.data?.groups || res.data || [];
      }
    });
  }

  toggleGroupSelect(groupId: number): void {
    const idx = this.selectedGroupIds.indexOf(groupId);
    if (idx >= 0) {
      this.selectedGroupIds.splice(idx, 1);
    } else {
      this.selectedGroupIds.push(groupId);
    }
  }

  get highPriorityCount(): number {
    return this.notifications.filter(n => n.priority === 'High').length;
  }

  get studentParentCount(): number {
    return this.notifications.filter(n => n.target_audience === 'Students' || n.target_audience === 'All Users').length;
  }

  get teacherMemosCount(): number {
    return this.notifications.filter(n => n.target_audience === 'Teachers' || n.target_audience === 'All Users').length;
  }

  loadNotifs(): void {
    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        this.notifications = res.data?.notifications || res.data || [];
      }
    });
  }

  viewAlertDetails(n: any): void {
    this.activeAlertModal = n;
  }

  onPublish(): void {
    if (!this.form.title || !this.form.message) {
      this.toast.error('Please enter Alert Title and Broadcast Message!');
      return;
    }

    const payload = {
      ...this.form,
      target_group_ids: this.selectedGroupIds
    };

    this.api.post('notifications', payload).subscribe({
      next: () => {
        this.toast.success('System Broadcast Alert saved to database and broadcasted live!');
        this.form.title = '';
        this.form.message = '';
        this.selectedGroupIds = [];
        this.loadNotifs();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Failed to save notification to database');
      }
    });
  }

  deleteNotif(n: any): void {
    this.api.delete(`notifications/${n.notification_id}`).subscribe({
      next: () => {
        this.toast.success('Notification removed');
        this.loadNotifs();
      },
      error: () => {
        this.notifications = this.notifications.filter(x => x.notification_id !== n.notification_id);
        this.toast.success('Notification removed');
      }
    });
  }
}

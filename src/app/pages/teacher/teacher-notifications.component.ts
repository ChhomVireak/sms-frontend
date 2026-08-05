import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-teacher-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Notifications & Alerts'" 
                [subtitle]="'Teacher / Announcements & Broadcasts'"
                [actionLabel]="'Mark All as Read'"
                [actionIcon]="'fa-solid fa-check-double'"
                (actionClicked)="markAllAsRead()"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Metrics Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL NOTIFICATIONS</span>
            <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-bell"></i>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-white mt-2">{{ notifications.length }}</h3>
          <p class="text-xs text-purple-400 mt-1">All broadcasts & system alerts</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">UNREAD ALERTS</span>
            <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-envelope-open-text"></i>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-rose-400 mt-2">{{ unreadCount }}</h3>
          <p class="text-xs text-rose-300 mt-1">Requires your review</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">EXAM ALERTS</span>
            <div class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-file-pen"></i>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-cyan-400 mt-2">{{ examAlertsCount }}</h3>
          <p class="text-xs text-cyan-300 mt-1">Exam schedules from Admin</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">REALTIME STATUS</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-wifi"></i>
            </div>
          </div>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2">ACTIVE</h3>
          <p class="text-xs text-emerald-300 mt-1">Live WebSocket Connection</p>
        </div>
      </div>

      <!-- Category Filter Bar -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div class="flex items-center gap-2 overflow-x-auto">
          <button (click)="activeCategory = 'ALL'"
                  [ngClass]="activeCategory === 'ALL' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#111827] text-gray-400 hover:text-white border border-[#1f2937]'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0">
            All Notifications
          </button>
          <button (click)="activeCategory = 'ANNOUNCEMENT'"
                  [ngClass]="activeCategory === 'ANNOUNCEMENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#111827] text-gray-400 hover:text-white border border-[#1f2937]'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0">
            School Announcements
          </button>
          <button (click)="activeCategory = 'EXAM'"
                  [ngClass]="activeCategory === 'EXAM' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#111827] text-gray-400 hover:text-white border border-[#1f2937]'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0">
            Exam Schedules
          </button>
          <button (click)="activeCategory = 'ATTENDANCE'"
                  [ngClass]="activeCategory === 'ATTENDANCE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#111827] text-gray-400 hover:text-white border border-[#1f2937]'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0">
            Attendance Logs
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search notifications..."
                 class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-medium">
        </div>
      </div>

      <!-- Main Notifications Feed -->
      <div class="space-y-4">
        <div *ngFor="let item of filteredNotifications"
             class="bg-[#1e293b]/70 border border-[#1f2937] hover:border-emerald-500/30 rounded-2xl p-5 transition-all space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div [ngClass]="{
                'bg-purple-500/10 text-purple-400 border-purple-500/20': item.type === 'ANNOUNCEMENT',
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20': item.type === 'EXAM',
                'bg-amber-500/10 text-amber-400 border-amber-500/20': item.type === 'ATTENDANCE'
              }" class="w-10 h-10 rounded-xl flex items-center justify-center text-base border">
                <i [class]="getIconClass(item.type)"></i>
              </div>
              <div>
                <h4 class="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                  <span>{{ item.title }}</span>
                  <span *ngIf="!item.read" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                </h4>
                <span class="text-[10px] text-gray-400 font-mono">{{ item.created_at | date:'dd/MM/yyyy · HH:mm' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button *ngIf="!item.read" (click)="markAsRead(item)"
                      class="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all">
                Mark Read
              </button>
              <span *ngIf="item.read" class="text-xs font-bold text-gray-500 font-mono">Read</span>
            </div>
          </div>

          <p class="text-xs text-gray-300 leading-relaxed font-medium pl-13 border-l-2 border-emerald-500/20">
            {{ item.message }}
          </p>
        </div>

        <div *ngIf="filteredNotifications.length === 0" class="bg-[#1e293b]/40 border border-[#1f2937] rounded-2xl p-12 text-center text-gray-500 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-400 text-xl mx-auto">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <p class="text-xs font-semibold">No notifications found in this category.</p>
        </div>
      </div>
    </div>
  `
})
export class TeacherNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  activeCategory: string = 'ALL';
  searchQuery: string = '';
  private socketSub!: Subscription;

  constructor(
    private api: ApiService,
    private socketService: SocketService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.initSocketListener();
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  markAllAsReadSilent(): void {
    const now = Date.now().toString();
    localStorage.setItem('global_alerts_read', 'true');
    localStorage.setItem('alerts_read_all', 'true');
    localStorage.setItem('last_read_notif', now);
    localStorage.setItem('teacher_last_read_notif', now);
    localStorage.setItem('student_last_read_notif', now);
  }

  initSocketListener(): void {
    this.socketSub = this.socketService.onRealtimeEvent().subscribe(({ event, payload }) => {
      if (event.startsWith('exam_')) {
        this.addNotification({
          id: Date.now(),
          type: 'EXAM',
          title: '⚡ New Exam Schedule Published by Admin',
          message: payload?.exam_title ? `Exam "${payload.exam_title}" has been scheduled by the school.` : 'A new exam schedule has been updated by the school.',
          created_at: new Date(),
          read: false
        });
        this.toast.info('⚡ New exam schedule broadcast received!');
      } else if (event === 'scores_published') {
        this.addNotification({
          id: Date.now(),
          type: 'EXAM',
          title: '📝 Exam Results Published',
          message: 'Exam results and student grade sheets have been updated in Backend.',
          created_at: new Date(),
          read: false
        });
      }
    });
  }

  addNotification(notif: any): void {
    this.notifications.unshift(notif);
  }

  loadNotifications(): void {
    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        const list = res.data?.notifications || res.data || [];
        this.notifications = list.map((n: any) => {
          const id = n.notification_id || n.id;
          return {
            id: id,
            type: n.type || 'ANNOUNCEMENT',
            title: n.title || 'School Announcement',
            message: n.message || n.content,
            created_at: n.created_at || new Date(),
            read: Boolean(n.is_read)
          };
        });
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get examAlertsCount(): number {
    return this.notifications.filter(n => n.type === 'EXAM').length;
  }

  get filteredNotifications(): any[] {
    return this.notifications.filter(n => {
      const matchesCat = this.activeCategory === 'ALL' || n.type === this.activeCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'ANNOUNCEMENT': return 'fa-solid fa-bullhorn';
      case 'EXAM': return 'fa-solid fa-file-pen';
      case 'ATTENDANCE': return 'fa-solid fa-clipboard-user';
      default: return 'fa-solid fa-bell';
    }
  }

  markAsRead(item: any): void {
    this.api.post<any>(`notifications/${item.id}/read`, {}).subscribe({
      next: () => {
        item.read = true;
        this.toast.success('Notification marked as read');
      }
    });
  }

  markAllAsRead(): void {
    this.api.post<any>('notifications/read-all', {}).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.toast.success('All notifications marked as read!');
      }
    });
  }
}

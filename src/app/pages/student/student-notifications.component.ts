import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Notifications'" [subtitle]="'Student / Notifications'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Header Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5 shadow-lg">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-bullhorn text-amber-400"></i> School Announcements & Alerts
          </h2>
          <p class="text-xs text-gray-400 mt-1">Real-time announcements, exam notices, and system alerts from administration.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input type="text" [(ngModel)]="searchQuery" (input)="filterNotifications()" placeholder="Search notifications..." class="bg-[#111827] border border-[#1f2937] text-white text-xs rounded-xl pl-8 pr-3 py-2 w-60 focus:outline-none focus:border-amber-500">
          </div>
          <button (click)="loadNotifications()" class="px-3.5 py-2 bg-[#111827] border border-[#1f2937] hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-rotate text-amber-400"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="flex items-center gap-2 border-b border-[#1f2937] pb-3 text-xs font-bold">
        <button (click)="setFilter('ALL')" [ngClass]="selectedFilter === 'ALL' ? 'bg-amber-500 text-white shadow-md' : 'bg-[#111827] text-gray-400 border border-[#1f2937] hover:text-white'" class="px-4 py-2 rounded-xl transition-all">
          ALL ({{ notifications.length }})
        </button>
        <button (click)="setFilter('ANNOUNCEMENT')" [ngClass]="selectedFilter === 'ANNOUNCEMENT' ? 'bg-amber-500 text-white shadow-md' : 'bg-[#111827] text-gray-400 border border-[#1f2937] hover:text-white'" class="px-4 py-2 rounded-xl transition-all">
          ANNOUNCEMENTS
        </button>
        <button (click)="setFilter('EXAM')" [ngClass]="selectedFilter === 'EXAM' ? 'bg-amber-500 text-white shadow-md' : 'bg-[#111827] text-gray-400 border border-[#1f2937] hover:text-white'" class="px-4 py-2 rounded-xl transition-all">
          EXAM NOTICES
        </button>
      </div>

      <!-- Notifications List -->
      <div class="space-y-4">
        <div *ngFor="let n of filteredNotifications" class="bg-[#1e293b]/80 border border-[#1f2937] hover:border-amber-500/40 rounded-2xl p-5 shadow-lg transition-all space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div [ngClass]="{
                'bg-rose-500/10 text-rose-400 border-rose-500/20': n.priority === 'High' || n.priority === 'HIGH',
                'bg-amber-500/10 text-amber-400 border-amber-500/20': n.priority === 'Medium' || n.priority === 'MEDIUM',
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': n.priority !== 'High' && n.priority !== 'Medium'
              }" class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border">
                <i [class]="n.priority === 'High' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-bell'"></i>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-white">{{ n.title }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-mono text-gray-400">{{ (n.publish_date || n.created_at) | date:'dd/MM/yyyy' }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111827] text-amber-400 border border-[#1f2937]">
                    {{ n.target_audience || 'All Users' }}
                  </span>
                </div>
              </div>
            </div>

            <span [ngClass]="{
              'bg-rose-950 text-rose-400 border-rose-800': n.priority === 'High',
              'bg-amber-950 text-amber-400 border-amber-800': n.priority === 'Medium',
              'bg-emerald-950 text-emerald-400 border-emerald-800': n.priority !== 'High' && n.priority !== 'Medium'
            }" class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg border font-mono">
              {{ n.priority || 'Normal' }} Priority
            </span>
          </div>

          <p class="text-xs text-gray-300 leading-relaxed pl-13 border-l-2 border-amber-500/30 font-medium">
            {{ n.message || n.content }}
          </p>
        </div>

        <div *ngIf="filteredNotifications.length === 0" class="bg-[#1e293b]/40 border border-[#1f2937] rounded-2xl p-12 text-center text-gray-500 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center text-gray-400 text-xl mx-auto">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <p class="text-xs font-semibold">No notifications found.</p>
        </div>
      </div>
    </div>
  `
})
export class StudentNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'ALL';
  private socketSub!: Subscription;

  constructor(private api: ApiService, private socketService: SocketService) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.initSocketListener();
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  initSocketListener(): void {
    this.socketSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (event.startsWith('announcement_') || event.startsWith('exam_') || event.startsWith('scores_')) {
        this.loadNotifications();
      }
    });
  }

  loadNotifications(): void {
    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        const notifs = res.data?.notifications || res.data || [];
        this.notifications = notifs.map((n: any) => {
          const id = n.notification_id || n.id;
          return {
            ...n,
            id: id,
            read: Boolean(n.is_read)
          };
        });
        this.filterNotifications();
      },
      error: () => {
        this.notifications = [];
        this.filteredNotifications = [];
      }
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterNotifications();
  }

  filterNotifications(): void {
    let result = [...this.notifications];
    if (this.selectedFilter === 'ANNOUNCEMENT') {
      result = result.filter(n => (n.title || '').toLowerCase().includes('announcement') || n.target_audience === 'All Users' || n.target_audience === 'Students');
    } else if (this.selectedFilter === 'EXAM') {
      result = result.filter(n => (n.title || '').toLowerCase().includes('exam') || (n.message || '').toLowerCase().includes('exam'));
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(n => (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q));
    }

    this.filteredNotifications = result;
  }
}

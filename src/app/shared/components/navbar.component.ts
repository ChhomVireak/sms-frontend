import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';

import { ConfirmModalComponent } from './confirm-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    <app-confirm-modal></app-confirm-modal>
    <header class="h-20 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1f2937] px-8 flex items-center justify-between sticky top-0 z-20">
      <!-- Title & Dynamic Real Date Subtitle -->
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">{{ title }}</h2>
        <p class="text-xs text-gray-400 mt-0.5">{{ displaySubtitle }}</p>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-4">
        <!-- Notification Bell & Dropdown Container (Pops & Glows only for Teachers & Students) -->
        <div class="relative">
          <button (click)="toggleAlertsDropdown()" 
                  [ngClass]="realAlertCount > 0 ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 shadow-lg shadow-amber-950/50' : 'bg-[#1e293b]/60 border-[#1f2937] text-gray-300 hover:text-white'"
                  class="relative border rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer">
            <i class="fa-solid fa-bell text-sm" [ngClass]="realAlertCount > 0 ? 'text-amber-400 animate-bounce' : 'text-gray-400'"></i>
            <span>Alerts</span>
            <span *ngIf="realAlertCount > 0" class="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md shadow-rose-500/30 animate-pulse font-mono">
              {{ realAlertCount }}
            </span>
          </button>

          <!-- Interactive Alerts Dropdown Menu with Real API Data -->
          <div *ngIf="showAlertsDropdown" class="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-[#1f2937] rounded-2xl shadow-2xl z-50 p-4 space-y-3 text-xs text-white animate-fade-in">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-2.5">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-bell text-amber-400 text-sm"></i>
                <h4 class="font-bold text-white text-sm">System Alerts</h4>
              </div>
              <button (click)="markAllAsReadSilent()" class="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-1">
                <i class="fa-solid fa-check-double"></i> Mark read
              </button>
            </div>

            <!-- Real Notifications Items -->
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div *ngFor="let n of alertList" (click)="navigateToNotifications()" class="p-2.5 rounded-xl bg-[#111827] hover:bg-gray-800/80 border border-[#1f2937] cursor-pointer transition-colors space-y-1">
                <div class="flex items-center justify-between">
                  <span [ngClass]="{
                    'text-rose-400': n.priority === 'High' || n.type === 'EXAM',
                    'text-amber-400': n.priority === 'Medium' || n.type === 'ANNOUNCEMENT',
                    'text-emerald-400': n.priority !== 'High' && n.priority !== 'Medium'
                  }" class="font-bold text-[11px] truncate max-w-[170px]">{{ n.title || 'System Notification' }}</span>
                  <span class="text-[9px] font-mono text-gray-400">{{ (n.created_at || currentDateStr) | date:'shortDate' }}</span>
                </div>
                <p class="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{{ n.message || n.content }}</p>
              </div>

              <div *ngIf="alertList.length === 0" class="text-center py-4 text-gray-500 font-bold text-xs">
                No notifications found.
              </div>
            </div>

            <!-- Footer Action -->
            <button (click)="navigateToNotifications()" class="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-center transition-all">
              View All Notifications →
            </button>
          </div>
        </div>

        <!-- Primary CTA Button -->
        <button *ngIf="actionLabel"
                (click)="onActionClick()" 
                class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
          <i [class]="actionIcon || 'fa-solid fa-plus'"></i>
          <span>{{ actionLabel }}</span>
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = '';
  @Input() actionLabel: string = '';
  @Input() actionIcon: string = '';

  @Output() actionClicked = new EventEmitter<void>();

  showAlertsDropdown = false;
  alertList: any[] = [];
  realAlertCount = 0;
  currentDateStr = new Date();
  private socketSub!: Subscription;

  constructor(
    private router: Router,
    private api: ApiService,
    private socketService: SocketService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fetchRealNotifications();
    this.initSocketListener();
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ADMIN';
  }

  get currentUserId(): string {
    const u = this.authService.currentUser();
    if (u?.userId) return `u_${u.userId}`;
    if (u?.studentId) return `s_${u.studentId}`;
    if (u?.teacherId) return `t_${u.teacherId}`;
    return 'default';
  }

  initSocketListener(): void {
    this.socketSub = this.socketService.onRealtimeEvent().subscribe(({ event }) => {
      if (this.isAdmin) return;

      if (event === 'announcement_created' || event.startsWith('exam_') || event.startsWith('scores_')) {
        this.fetchRealNotifications();
      }
    });
  }

  markAllAsReadSilent(): void {
    this.api.post<any>('notifications/read-all', {}).subscribe({
      next: () => {
        this.alertList = this.alertList.map(n => ({ ...n, is_read: true }));
        this.realAlertCount = 0;
      }
    });
  }

  fetchRealNotifications(): void {
    if (this.isAdmin) {
      this.api.get<any>('notifications').subscribe({
        next: (res) => {
          this.alertList = res.data?.notifications || res.data || [];
          this.realAlertCount = 0;
        },
        error: () => {
          this.alertList = [];
          this.realAlertCount = 0;
        }
      });
      return;
    }

    this.api.get<any>('notifications').subscribe({
      next: (res) => {
        const notifs = res.data?.notifications || res.data || [];
        this.alertList = notifs;
        this.realAlertCount = notifs.filter((n: any) => !n.is_read).length;
      },
      error: () => {
        this.alertList = [];
        this.realAlertCount = 0;
      }
    });
  }

  get displaySubtitle(): string {
    if (this.subtitle) return this.subtitle;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const year = now.getFullYear();
    return `${dateFormatted} · Academic Year ${year}–${year + 1}`;
  }

  toggleAlertsDropdown(): void {
    this.showAlertsDropdown = !this.showAlertsDropdown;
    if (this.showAlertsDropdown) {
      this.markAllAsReadSilent();
      this.fetchRealNotifications();
    }
  }

  navigateToNotifications(): void {
    this.showAlertsDropdown = false;
    this.markAllAsReadSilent();
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/teacher')) {
      this.router.navigate(['/teacher/notifications']);
    } else if (currentUrl.startsWith('/student')) {
      this.router.navigate(['/student/notifications']);
    } else {
      this.router.navigate(['/admin/notifications']);
    }
  }

  onActionClick(): void {
    this.actionClicked.emit();
  }
}

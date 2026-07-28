import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
  badgeColor?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Top Mobile Navigation Header (Visible on Mobile screens < 768px) -->
    <div class="md:hidden flex items-center justify-between p-3.5 bg-[#111827] border-b border-[#1f2937] sticky top-0 z-[9995] w-full shadow-md">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm shadow">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
          <h1 class="font-extrabold text-white text-sm tracking-tight leading-none">EduTrack SMS</h1>
          <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{{ portalTitle }}</span>
        </div>
      </div>

      <button (click)="isMobileOpen = !isMobileOpen" 
              class="p-2 rounded-xl bg-[#1e293b] border border-[#1f2937] text-emerald-400 hover:text-white transition-all text-sm flex items-center gap-1.5 font-bold shadow">
        <i [class]="isMobileOpen ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-bars text-lg'"></i>
        <span class="text-xs">{{ isMobileOpen ? 'Close' : 'Menu' }}</span>
      </button>
    </div>

    <!-- Mobile Dark Backdrop Overlay with Smooth Fade Transition -->
    <div [ngClass]="isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
         (click)="isMobileOpen = false" 
         class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] md:hidden transition-opacity duration-300 ease-in-out"></div>

    <!-- Sidebar Container (Fluid 60FPS CSS Slide Animation for Mobile & Sticky on Desktop) -->
    <aside [ngClass]="isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'"
           class="fixed md:sticky top-0 left-0 inset-y-0 z-[9999] md:z-30 w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col justify-between h-screen select-none shrink-0 transition-transform duration-300 ease-in-out">
      
      <!-- Header / Brand Logo -->
      <div>
        <div class="p-5 flex items-center justify-between border-b border-[#1f2937]/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/20">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h1 class="font-bold text-white text-base tracking-tight leading-tight">EduTrack SMS</h1>
              <span class="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">{{ portalTitle }}</span>
            </div>
          </div>
          <button (click)="isMobileOpen = false" class="md:hidden text-gray-400 hover:text-white p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div *ngFor="let section of navSections">
            <div *ngIf="section.title" class="px-3 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              {{ section.title }}
            </div>
            <div class="space-y-1">
              <a *ngFor="let item of section.items"
                 [routerLink]="item.route"
                 (click)="isMobileOpen = false"
                 routerLinkActive="bg-emerald-500/10 text-emerald-400 font-semibold border-l-4 border-emerald-500"
                 [routerLinkActiveOptions]="{ exact: item.route.endsWith('/dashboard') }"
                 class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all group">
                <div class="flex items-center gap-3">
                  <i [class]="item.icon + ' text-base w-5 text-gray-400 group-hover:text-white group-[.text-emerald-400]:text-emerald-400 transition-colors'"></i>
                  <span>{{ item.label }}</span>
                </div>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <!-- User Profile Footer -->
      <div class="p-3 border-t border-[#1f2937] bg-[#0e131f]/50 flex items-center justify-between">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Profile Avatar Photo (Displays actual user photo if available) -->
          <img *ngIf="userImageUrl" [src]="userImageUrl" (error)="imageFailed = true" class="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-500/40 shadow-sm">
          <div *ngIf="!userImageUrl" class="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {{ userInitials }}
          </div>
          <div class="truncate">
            <p class="text-xs font-semibold text-white truncate">{{ authService.currentUser()?.fullName || 'User' }}</p>
            <p class="text-[11px] text-gray-400 capitalize truncate">{{ authService.currentUser()?.role?.toLowerCase() }}</p>
          </div>
        </div>
        <button (click)="logout()" title="Sign Out" class="p-2 text-gray-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-gray-800">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() portalTitle: string = 'ADMIN PORTAL';
  @Input() navSections: NavSection[] = [];
  imageFailed: boolean = false;
  isMobileOpen: boolean = false;

  constructor(public authService: AuthService) { }

  get userImageUrl(): string | null {
    const user = this.authService.currentUser();
    const img = user?.image || (user as any)?.photo || (user as any)?.avatar;
    if (!img) return null;

    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return img.startsWith('/') ? `${baseUrl}${img}` : `${baseUrl}/${img}`;
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

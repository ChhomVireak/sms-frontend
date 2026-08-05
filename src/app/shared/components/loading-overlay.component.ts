import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.isLoading()" 
         class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0f19]/70 backdrop-blur-md transition-all duration-300">
      <div class="relative flex items-center justify-center">
        <!-- Glowing outer aura -->
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 animate-ping absolute"></div>
        
        <!-- Rotating gradient spinner border -->
        <div class="w-14 h-14 rounded-full border-4 border-transparent border-t-emerald-400 border-r-emerald-500 border-b-cyan-400 animate-spin shadow-lg shadow-emerald-500/30"></div>
        
        <!-- Center brand icon -->
        <div class="absolute w-8 h-8 rounded-lg bg-[#111827] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow">
          <i class="fa-solid fa-graduation-cap text-xs animate-pulse"></i>
        </div>
      </div>
      
      <!-- Text Indicator -->
      <div class="mt-4 flex flex-col items-center gap-1">
        <span class="text-xs font-extrabold text-white tracking-wide uppercase font-mono">Loading Data...</span>
        <span class="text-[10px] text-emerald-400 font-semibold">Please wait a moment (System Processing)</span>
      </div>
    </div>
  `
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmState().isOpen" class="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-rose-500/30 w-full max-w-md rounded-2xl p-6 space-y-5 text-xs text-white shadow-2xl relative overflow-hidden animate-scale-up">
        <!-- Top Decorative Red Glow -->
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-rose-500/10">
            <i class="fa-solid fa-triangle-exclamation animate-pulse"></i>
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-extrabold text-white tracking-tight">{{ confirmState().config?.title }}</h3>
            <p class="text-xs text-gray-300 leading-relaxed font-sans">{{ confirmState().config?.message }}</p>
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#1f2937]">
          <button (click)="cancel()" class="px-4 py-2.5 rounded-xl border border-[#1f2937] bg-[#111827] text-gray-300 hover:text-white font-bold text-xs transition-all active:scale-95">
            {{ confirmState().config?.cancelText || 'Cancel' }}
          </button>
          <button (click)="confirmAction()" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2">
            <i class="fa-solid fa-trash-can"></i>
            <span>{{ confirmState().config?.confirmText || 'Yes, Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  confirmState;

  constructor(private confirmService: ConfirmModalService) {
    this.confirmState = this.confirmService.state;
  }

  cancel(): void {
    this.confirmService.close();
  }

  confirmAction(): void {
    this.confirmService.handleConfirm();
  }
}

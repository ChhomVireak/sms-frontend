import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      <div *ngFor="let toast of toastService.toasts()" 
           [ngClass]="{
             'bg-emerald-950 border-emerald-600 text-emerald-200': toast.type === 'success',
             'bg-rose-950 border-rose-600 text-rose-200': toast.type === 'error',
             'bg-amber-950 border-amber-600 text-amber-200': toast.type === 'warning',
             'bg-blue-950 border-blue-600 text-blue-200': toast.type === 'info'
           }"
           class="flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300">
        <div class="flex items-center gap-3">
          <i [ngClass]="{
            'fa-circle-check text-emerald-400': toast.type === 'success',
            'fa-triangle-exclamation text-rose-400': toast.type === 'error',
            'fa-circle-exclamation text-amber-400': toast.type === 'warning',
            'fa-circle-info text-blue-400': toast.type === 'info'
          }" class="fa-solid text-lg"></i>
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
        <button (click)="toastService.remove(toast.id)" class="text-gray-400 hover:text-white ml-3">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}

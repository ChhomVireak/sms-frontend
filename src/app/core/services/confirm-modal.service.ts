import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  state = signal<{ isOpen: boolean; config: ConfirmConfig | null }>({
    isOpen: false,
    config: null
  });

  confirm(config: ConfirmConfig): void {
    this.state.set({
      isOpen: true,
      config: {
        title: config.title || 'Are you sure you want to delete?',
        confirmText: config.confirmText || 'Yes, Delete',
        cancelText: config.cancelText || 'Cancel',
        type: config.type || 'danger',
        ...config
      }
    });
  }

  handleConfirm(): void {
    const current = this.state();
    if (current.config?.onConfirm) {
      current.config.onConfirm();
    }
    this.close();
  }

  close(): void {
    this.state.set({ isOpen: false, config: null });
  }
}

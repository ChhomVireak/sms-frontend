import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal<boolean>(false);
  private activeRequests = 0;

  show(): void {
    this.activeRequests++;
    this.isLoading.set(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading.set(false);
        }
      }, 200);
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    this.isLoading.set(false);
  }
}

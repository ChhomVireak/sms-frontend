import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  isLoading = signal<boolean>(false);

  show(): void {
    this.activeRequests++;
    if (this.activeRequests > 0) {
      this.isLoading.set(true);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading.set(false);
        }
      }, 150);
    }
  }
}

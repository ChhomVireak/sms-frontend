import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Only trigger full-screen loading if explicitly requested via 'X-Show-Loading'
  if (req.headers.has('X-Show-Loading')) {
    loadingService.show();
    const cloned = req.clone({
      headers: req.headers.delete('X-Show-Loading')
    });
    return next(cloned).pipe(
      finalize(() => {
        loadingService.hide();
      })
    );
  }

  return next(req);
};

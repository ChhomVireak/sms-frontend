import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const userRole = authService.userRole();
    if (userRole === 'TEACHER') {
      router.navigate(['/teacher/dashboard'], { replaceUrl: true });
    } else if (userRole === 'STUDENT') {
      router.navigate(['/student/dashboard'], { replaceUrl: true });
    } else {
      router.navigate(['/admin/dashboard'], { replaceUrl: true });
    }
    return false;
  }

  return true;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.userRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to appropriate dashboard based on user role
  if (userRole === 'TEACHER') router.navigate(['/teacher/dashboard'], { replaceUrl: true });
  else if (userRole === 'STUDENT') router.navigate(['/student/dashboard'], { replaceUrl: true });
  else router.navigate(['/admin/dashboard'], { replaceUrl: true });

  return false;
};

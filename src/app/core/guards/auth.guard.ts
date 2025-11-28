import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const expMs = (payload?.exp ?? 0) * 1000;
    return !expMs || Date.now() >= expMs;
  } catch {
    return true;
  }
}

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token || isExpired(token)) {
    localStorage.removeItem('access_token');
    return router.parseUrl('/login');
  }
  return true;
};

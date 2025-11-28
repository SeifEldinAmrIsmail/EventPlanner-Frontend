import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Blocks routes when the user is not authenticated.
 * If blocked, redirects to /login and keeps the intended URL in ?redirect=...
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Send to /login and remember where the user wanted to go
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};

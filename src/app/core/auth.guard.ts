// src/app/core/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

// ✅ Guard que verifica si existe "user" en sessionStorage
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = sessionStorage.getItem('user');

  // si no existe → redirige al login
  return user ? true : (router.parseUrl('/login') as UrlTree);
};

// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[AuthInterceptor] Interceptando request: ', req.url, req.method);

  const body: any = req.body || {};
  console.log('[AuthInterceptor] Body de la request:', body);

  // No agregar Authorization al login
  if (body.query && typeof body.query === 'string' && body.query.includes('login')) {
    console.log('[AuthInterceptor] Detectado login -> NO agrego Authorization');
    return next(req);
  }

  const token = sessionStorage.getItem('token');
  console.log('[AuthInterceptor] Token en sessionStorage:', token);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('[AuthInterceptor] Agregué header Authorization');
  } else {
    console.log('[AuthInterceptor] No hay token, mando request sin Authorization');
  }

  return next(req);
};

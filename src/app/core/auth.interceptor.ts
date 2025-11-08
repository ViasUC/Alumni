import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const body = req.body as any;

  // No agregar Authorization al login
  if (body?.query && body.query.includes('login')) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');

  // Solo agregar si realmente existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

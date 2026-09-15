import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Placeholder interceptor showing where you'd attach an auth token to
 * outgoing API requests once this app talks to a real backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('userapp.session');
  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: { 'X-User-Email': token },
  });
  return next(cloned);
};

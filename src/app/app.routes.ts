// src/app/app.routes.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes, UrlTree } from '@angular/router';

// ✅ Guard que protege el dashboard y todas las páginas privadas
const canActivateAuth: CanActivateFn = () => {
  const router = inject(Router);
  const user = sessionStorage.getItem('user');

  // Si NO hay user -> redirige al login
  return user ? true : (router.parseUrl('/login') as UrlTree);
};

export const routes: Routes = [
  // Redirect inicial
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Página de login
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },

  // ✅ Dashboard protegido
  {
    path: 'dashboard',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },

  // ✅ Perfil protegido
  {
    path: 'perfil',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },

  // ✅ Oportunidades protegida
  {
    path: 'oportunidades',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./oportunidades/oportunidades.component').then(
        (m) => m.OportunidadesComponent
      ),
  },

  // ✅ Descubrir protegido
  {
    path: 'descubrir',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./descubrir/descubrir.component').then(
        (m) => m.DescubrirComponent
      ),
  },

  // ✅ Humano protegido
  {
    path: 'inicio',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./humano/humano.component').then((m) => m.HumanoComponent),
  },

  {
    path: 'mi-actividad',
    loadComponent: () =>
      import('./mi-actividad/mi-actividad.component').then(
        (m) => m.MiActividadComponent
      ),
  },

  {
    path: 'red-personal',
    loadComponent: () =>
      import('./red-personal/red-personal.component').then(
        (m) => m.RedPersonalComponent
      ),
  },

  {
    path: 'registrar',
    loadComponent: () =>
      import('./registrar/registrar.component').then(
        (m) => m.RegistrarComponent
      ),
  },

  // Ruta por defecto
  { path: '**', redirectTo: 'login' },
];

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

/* Angular Material */
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private router = inject(Router);

  // ✅ el nombre ya NO es fijo
  nombre = 'Usuario';

  perfilCompletado = signal(75);

  kpis = {
    oportunidades: 10,
    postulaciones: 2,
    mensajesNuevos: 1,
  };

  constructor() {
    // ✅ Leer usuario guardado en sessionStorage
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);

      // tomamos nombre real del back
      this.nombre = user.nombre ?? 'Usuario';
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }

  irAlPerfil() {
    this.router.navigate(['/perfil']);
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }
}

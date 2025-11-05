import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Angular Material */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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

  nombre = 'Horacio';
  perfilCompletado = signal(75);

  // datos mock
  kpis = {
    oportunidades: 10,
    postulaciones: 2,
    mensajesNuevos: 1,
  };

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  // usar en el avatar o en el gráfico
  irAlPerfil() {
    this.router.navigate(['/perfil']);
  }

  // por si querés usarlo en las cards del dashboard
  irA(ruta: string) {
    this.router.navigate([ruta]);
  }
}

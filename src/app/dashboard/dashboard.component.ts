import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient);

  nombre = 'Usuario';
  perfilCompletado = signal(0);   // ← ahora se carga desde backend

  kpis = {
    oportunidades: 10,
    postulaciones: 2,
    mensajesNuevos: 1,
  };

  constructor() {
    const userString = sessionStorage.getItem('user');

    if (userString) {
      const user = JSON.parse(userString);
      this.nombre = user?.nombre ?? 'Usuario';

      // 🔥 Cargar completitud real desde el backend
      this.cargarCompletitud(user.idUsuario);
    }
  }

  // =======================================================
  // 🔍 CONSULTAR COMPLETITUD DEL USUARIO DESDE BACKEND
  // =======================================================
  cargarCompletitud(idUsuario: number) {

    const query = `
      query GetUsuario($id: Int!) {
        usuarioById(id: $id) {
          idUsuario
          nombre
          completitud
        }
      }
    `;

    this.http.post<any>("http://localhost:8080/graphql", {
      query,
      variables: { id: idUsuario }
    })
    .subscribe({
      next: (res) => {
        const u = res.data?.usuarioById;
        if (u) {
          this.perfilCompletado.set(u.completitud ?? 0);
          this.nombre = u.nombre ?? this.nombre;
        }
      },
      error: (err) => {
        console.error("❌ Error cargando completitud:", err);
      }
    });
  }

  // =======================================================
  // 🔧 ACCIONES
  // =======================================================
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

  ini(full: string = this.nombre): string {
    if (!full) return '';
    const partes = full.trim().split(/\s+/);
    const inicialNombre = partes[0]?.[0] ?? '';
    const inicialApellido = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (inicialNombre + inicialApellido).toUpperCase();
  }
}

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
  perfilCompletado = signal(0);

  kpis = {
    oportunidades: 10,
    postulaciones: 2,
    mensajesNuevos: 1,
  };

  constructor() {

    // ============================
    // 🔥 LEER USUARIO COMO PERFIL
    // ============================
    const userString = sessionStorage.getItem('user');

    if (!userString) {
      console.error("❌ No hay usuario en sessionStorage");
      return;
    }

    const userObj = JSON.parse(userString);

    // Nombre completo
    this.nombre = `${userObj.nombre ?? ''} ${userObj.apellido ?? ''}`.trim();

    // ID de usuario
    const idUsuario = Number(userObj.idUsuario);

    if (isNaN(idUsuario)) {
      console.error("❌ idUsuario inválido:", userObj);
      return;
    }

    // ============================
    // 🔥 CARGAR COMPLETITUD REAL
    // ============================
    this.cargarCompletitud(idUsuario);
  }

  // =======================================================
  // 🔍 CONSULTAR COMPLETITUD DEL USUARIO DESDE BACKEND
  // =======================================================
  cargarCompletitud(idUsuario: number) {

    const query = `
      query PerfilUsuario($id: Int!) {
        usuarioById(id: $id) {
          idUsuario
          nombre
          apellido
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
        if (!u) return;

        // 🔥 Actualizar completitud
        this.perfilCompletado.set(u.completitud ?? 0);

        // 🔥 Mantener nombre completo SIN perder apellido
        this.nombre = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim();
      },

      error: (err) => {
        console.error("❌ Error cargando completitud:", err);
      }
    });
  }

  // =======================================================
  // 🔧 ACCIONES BÁSICAS
  // =======================================================
  logout() {
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

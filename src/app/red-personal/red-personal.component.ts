import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupEndorseComponent } from '../popups/popup-endorse/popup-endorse.component';
import {
  PerfilBasico,
  PopupPerfilBasicoComponent,
} from '../popups/popup-perfil-basico/popup-perfil-basico.component';
import { PopupPerfilPostulanteComponent } from '../popups/popup-perfil-postulante/popup-perfil-postulante.component';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface UsuarioMini {
  id: number;
  nombre: string;
  rol: string;
  carrera?: string;
  ubicacion?: string;
  endorsed?: boolean;
}

interface SolicitudPendiente {
  idSolicitud: number;
  idUsuarioOrigen: number;
  nombre: string;
  rol: string;
  ubicacion?: string;
}

@Component({
  selector: 'app-red-personal',
  standalone: true,
  imports: [
    CommonModule,
    PanelListaComponent,
    PopupEndorseComponent,
    PopupEliminarComponent,
    PopupPerfilBasicoComponent,
    PopupPerfilPostulanteComponent,
  ],
  templateUrl: './red-personal.component.html',
  styleUrls: ['./red-personal.component.css'],
})
export class RedPersonalComponent implements OnInit {

  constructor(private http: HttpClient) {}

  conexiones: UsuarioMini[] = [];
  solicitudesPendientes: SolicitudPendiente[] = [];

  abrirPopup = false;
  popup: '' | 'eliminarEndorse' | 'perfilCompleto' | 'perfilBasico' = '';
  usuarioSeleccionado: UsuarioMini | null = null;

  perfilBasicoSeleccionado: PerfilBasico | null = null;
  perfilCompletoSeleccionado: any = null;

  private idLogueado: number = 0;

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ==========================================================
  // 🔄 CARGA COMPLETA (CONEXIONES + SOLICITUDES)
  // ==========================================================
  cargarDatos() {
    console.log("📡 Cargando conexiones del usuario...");

    const userString = sessionStorage.getItem("user");
    if (!userString) {
      console.error("❌ Usuario no logueado");
      return;
    }

    const user = JSON.parse(userString);
    this.idLogueado = Number(user.idUsuario);

    const qConex = `
      query($id: Int!) {
        conexionesPorUsuario(idUsuario: $id) {
          idUsuario1
          idUsuario2
        }
      }
    `;

    const qUsuarios = `
      query {
        usuarios {
          idUsuario
          nombre
          apellido
          ubicacion
          rolPrincipal
        }
      }
    `;

    const qPendientes = `
      query($id: Int!) {
        solicitudesPendientes(idUsuario: $id) {
          idSolicitud
          idUsuarioOrigen
          estado
        }
      }
    `;

    Promise.all([
      this.http.post<any>("http://localhost:8080/graphql", {
        query: qConex,
        variables: { id: this.idLogueado }
      }).toPromise(),

      this.http.post<any>("http://localhost:8080/graphql", {
        query: qUsuarios
      }).toPromise(),

      this.http.post<any>("http://localhost:8080/graphql", {
        query: qPendientes,
        variables: { id: this.idLogueado }
      }).toPromise()
    ])
    .then(([resConex, resUsers, resPend]) => {

      const conexiones = resConex.data?.conexionesPorUsuario ?? [];
      const usuarios = resUsers.data?.usuarios ?? [];
      const pendientes = resPend.data?.solicitudesPendientes ?? [];

      console.log("🔗 Conexiones:", conexiones);
      console.log("📌 Usuarios:", usuarios);
      console.log("🟠 Pendientes:", pendientes);

      // =====================================================
      // 🔵 PROCESAR CONEXIONES
      // =====================================================
      const idsAmigos = new Set<number>();

      conexiones.forEach((c: any) => {
        const u1 = Number(c.idUsuario1);
        const u2 = Number(c.idUsuario2);

        if (u1 === this.idLogueado) idsAmigos.add(u2);
        if (u2 === this.idLogueado) idsAmigos.add(u1);
      });

      this.conexiones = usuarios
        .filter((u: any) => idsAmigos.has(Number(u.idUsuario)))
        .map((u: any) => ({
          id: Number(u.idUsuario),
          nombre: `${u.nombre} ${u.apellido}`,
          rol: u.rolPrincipal,
          carrera: "",
          ubicacion: u.ubicacion ?? "-",
          endorsed: false
        }));

      // =====================================================
      // 🟠 PROCESAR SOLICITUDES PENDIENTES (CORREGIDO)
      // =====================================================
      this.solicitudesPendientes = pendientes.map((s: any) => {
        const userOrigen = usuarios.find((u: any) => u.idUsuario === s.idUsuarioOrigen);

        return {
          idSolicitud: Number(s.idSolicitud),
          idUsuarioOrigen: Number(s.idUsuarioOrigen),
          nombre: `${userOrigen.nombre} ${userOrigen.apellido}`,
          rol: userOrigen.rolPrincipal,
          ubicacion: userOrigen.ubicacion ?? "-"
        };
      });

      console.log("🟧 Solicitudes pendientes PROCESADAS:", this.solicitudesPendientes);
    });
  }

  // ==========================================================
  // ✔ ACEPTAR SOLICITUD
  // ==========================================================
  aceptarSolicitud(s: SolicitudPendiente) {

    const q = `
      mutation($id: Int!) {
        aceptarSolicitud(idSolicitud: $id) {
          idSolicitud
        }
      }
    `;

    this.http.post("http://localhost:8080/graphql", {
      query: q,
      variables: { id: s.idSolicitud }
    }).subscribe({
      next: () => this.cargarDatos(),
      error: err => console.error("❌ Error al aceptar", err)
    });
  }

  // ==========================================================
  // ✔ RECHAZAR SOLICITUD
  // ==========================================================
  rechazarSolicitud(s: SolicitudPendiente) {

    const q = `
      mutation($id: Int!) {
        rechazarSolicitud(idSolicitud: $id)
      }
    `;

    this.http.post("http://localhost:8080/graphql", {
      query: q,
      variables: { id: s.idSolicitud }
    }).subscribe({
      next: () => this.cargarDatos(),
      error: err => console.error("❌ Error al rechazar", err)
    });
  }

  // ==========================================================
  // 🔍 Ver perfiles
  // ==========================================================
  verPerfilPendiente(u: SolicitudPendiente) {
    this.perfilBasicoSeleccionado = {
      nombre: u.nombre,
      ubicacion: u.ubicacion ?? '-',
      telefono: '+595 000 000 000',
      email: 'correo@ejemplo.com',
      titulo: 'Egresado/a',
      anioEgreso: 2025,
      rol: u.rol,
    };
    this.popup = 'perfilBasico';
  }

  cerrarPopup() {
    this.popup = '';
    this.perfilBasicoSeleccionado = null;
    this.perfilCompletoSeleccionado = null;
  }

  ini(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }
}

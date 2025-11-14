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

  // ================================
  //   ESTADOS
  // ================================
  conexiones: UsuarioMini[] = [];
  solicitudesPendientes: SolicitudPendiente[] = [];

  // Endorse
  endorsementsRecibidos: any[] = [];
  endorsementsRealizados: any[] = [];

  // Popups
  abrirPopup = false;
  popup: '' | 'eliminarEndorse' | 'perfilCompleto' | 'perfilBasico' = '';
  usuarioSeleccionado: UsuarioMini | null = null;

  perfilBasicoSeleccionado: PerfilBasico | null = null;
  perfilCompletoSeleccionado: any = null;

  private idLogueado: number = 0;
  private eliminarTarget: { tipo: 'recibido' | 'realizado'; id: number } | null = null;

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
      idUsuarioDestino
      estado
      fechaSolicitud
      fechaRespuesta
    }
  }
`;



    Promise.all([
      this.http.post<any>("http://localhost:8080/graphql", {
        query: qConex,
        variables: { id: this.idLogueado }
      }).toPromise(),

      this.http.post<any>("http://localhost:8080/graphql", { query: qUsuarios }).toPromise(),

      this.http.post<any>("http://localhost:8080/graphql", {
        query: qPendientes,
        variables: { id: this.idLogueado }
      }).toPromise()
    ])
    .then(([resConex, resUsers, resPend]) => {

      const conexiones = resConex.data?.conexionesPorUsuario ?? [];
      const usuarios = resUsers.data?.usuarios ?? [];
      const pendientes = resPend.data?.solicitudesPendientes ?? [];

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
          ubicacion: u.ubicacion ?? "-",
          endorsed: false
        }));

this.solicitudesPendientes = pendientes.map((s: any) => {
  const userOrigen = usuarios.find(
    (u: any) => Number(u.idUsuario) === Number(s.idUsuarioOrigen)
  );

  return {
    idSolicitud: Number(s.idSolicitud),
    idUsuarioOrigen: Number(s.idUsuarioOrigen),
    nombre: userOrigen
      ? `${userOrigen.nombre} ${userOrigen.apellido}`
      : "Usuario desconocido",
    rol: userOrigen?.rolPrincipal ?? "—",
    ubicacion: userOrigen?.ubicacion ?? "—"
  };
});


      console.log("🟧 Solicitudes pendientes:", this.solicitudesPendientes);
    });
  }

  // ==========================================================
  // 🔵 VER PERFIL DE UNA CONEXIÓN
  // ==========================================================
  verPerfilConexion(u: UsuarioMini) {
    this.perfilCompletoSeleccionado = {
      nombre: u.nombre,
      ubicacion: u.ubicacion,
      telefono: '+595 971 000000',
      email: 'email@ejemplo.com',
      titulo: u.carrera ?? 'Egresado/a',
      anioEgreso: 2024,
      rol: u.rol,
      descripcion: 'Perfil público del usuario.',
      skills: '—',
      visibilidad: 'Pública',
      ultimaActualizacion: '—',
      evidencias: []
    };
    this.popup = 'perfilCompleto';
  }

  // ==========================================================
  // 🟠 VER PERFIL BÁSICO (SOLICITUD PENDIENTE)
  // ==========================================================
  verPerfilPendiente(u: SolicitudPendiente) {
    this.perfilBasicoSeleccionado = {
      nombre: u.nombre,
      ubicacion: u.ubicacion,
      telefono: '+595 000 000 000',
      email: 'correo@ejemplo.com',
      titulo: 'Egresado/a',
      anioEgreso: 2025,
      rol: u.rol,
    };
    this.popup = 'perfilBasico';
  }

  // ==========================================================
  // 🟢 ENDORSE — INICIAR
  // ==========================================================
  solicitarEndorse(u: UsuarioMini) {
    this.usuarioSeleccionado = u;
    this.abrirPopup = true;
  }

  cancelarEndorse() {
    this.abrirPopup = false;
    this.usuarioSeleccionado = null;
  }

  confirmarEndorse() {
    if (!this.usuarioSeleccionado) return;

    const idx = this.conexiones.findIndex(c => c.id === this.usuarioSeleccionado!.id);
    if (idx >= 0) this.conexiones[idx].endorsed = true;

    this.endorsementsRealizados.unshift({
      id: this.usuarioSeleccionado.id,
      nombre: this.usuarioSeleccionado.nombre,
      fecha: new Date().toISOString().slice(0, 10)
    });

    this.cancelarEndorse();
  }

  // ==========================================================
  // ❌ ACEPTAR / RECHAZAR SOLICITUD
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
  // 💥 ELIMINAR ENDORSE
  // ==========================================================
  pedirEliminar(tipo: 'recibido' | 'realizado', id: number) {
    this.eliminarTarget = { tipo, id };
    this.popup = 'eliminarEndorse';
  }

  eliminarEndorseConfirmado() {
    if (!this.eliminarTarget) return;

    const { tipo, id } = this.eliminarTarget;

    if (tipo === 'recibido') {
      this.endorsementsRecibidos = this.endorsementsRecibidos.filter(e => e.id !== id);
    } else {
      this.endorsementsRealizados = this.endorsementsRealizados.filter(e => e.id !== id);

      const idx = this.conexiones.findIndex(c => c.id === id);
      if (idx >= 0) this.conexiones[idx].endorsed = false;
    }

    this.cerrarPopup();
  }

  // ==========================================================
  // 🔻 CERRAR POPUPS
  // ==========================================================
  cerrarPopup() {
    this.popup = '';
    this.usuarioSeleccionado = null;
    this.eliminarTarget = null;
    this.perfilBasicoSeleccionado = null;
    this.perfilCompletoSeleccionado = null;
  }

  // ==========================================================
  // 🔤 INICIALES (AVATAR)
  // ==========================================================
  ini(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }
}

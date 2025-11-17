import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupEndorseComponent } from '../popups/popup-endorse/popup-endorse.component';
import { PopupPerfilBasicoComponent } from '../popups/popup-perfil-basico/popup-perfil-basico.component';
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

  endorsementsRecibidos: any[] = [];
  endorsementsRealizados: any[] = [];

  abrirPopup = false;
  popup: '' | 'eliminarEndorse' | 'perfilCompleto' | 'perfilBasico' = '';

  usuarioSeleccionado: UsuarioMini | null = null;
  eliminarTarget: { tipo: 'recibido' | 'realizado', id: number } | null = null;

  perfilBasicoSeleccionado: any = null;
  perfilCompletoSeleccionado: any = null;

  idLogueado = 0;

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ======================================================
  // CARGAR DATOS
  // ======================================================
  cargarDatos() {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
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
        }
      }
    `;

    Promise.all([
      this.http.post<any>("http://localhost:8080/graphql", { query: qConex, variables: { id: this.idLogueado }}).toPromise(),
      this.http.post<any>("http://localhost:8080/graphql", { query: qUsuarios }).toPromise(),
      this.http.post<any>("http://localhost:8080/graphql", { query: qPendientes, variables: { id: this.idLogueado }}).toPromise(),
    ])
    .then(([resConex, resUsers, resPend]) => {

      const conexiones = resConex.data?.conexionesPorUsuario ?? [];
      const usuarios = resUsers.data?.usuarios ?? [];
      const pendientes = resPend.data?.solicitudesPendientes ?? [];

      const ids = new Set<number>();
      conexiones.forEach((c: any) => {
        const u1 = Number(c.idUsuario1);
        const u2 = Number(c.idUsuario2);
        if (u1 === this.idLogueado) ids.add(u2);
        if (u2 === this.idLogueado) ids.add(u1);
      });

      // === FIX PRINCIPAL: AHORA USAMOS EL ID REAL ===
      this.conexiones = usuarios
        .filter((u: any) => ids.has(Number(u.idUsuario)))
        .map((u: any) => ({
          id: Number(u.idUsuario),
          nombre: `${u.nombre} ${u.apellido}`,
          rol: u.rolPrincipal,
          ubicacion: u.ubicacion ?? "-",
          endorsed: false,
        }));

      console.log("🟢 Conexiones cargadas:", this.conexiones);

      this.solicitudesPendientes = pendientes.map((s: any) => {
        const origen = usuarios.find((u: any) => Number(u.idUsuario) === Number(s.idUsuarioOrigen));
        return {
          idSolicitud: Number(s.idSolicitud),
          idUsuarioOrigen: Number(s.idUsuarioOrigen),
          nombre: origen ? `${origen.nombre} ${origen.apellido}` : "Usuario desconocido",
          rol: origen?.rolPrincipal ?? "—",
          ubicacion: origen?.ubicacion ?? "—",
        };
      });

    });
  }

  // ======================================================
  // PERFIL COMPLETO
  // ======================================================
  verPerfilConexion(u: UsuarioMini) {
    console.log("🟦 Abriendo perfil de:", u);

    this.popup = "perfilCompleto";
    this.perfilCompletoSeleccionado = null;

    const query = `
      query Perfil($id: Int!) {
        usuarioById(id: $id) {
          nombre
          apellido
          email
          telefono
          ubicacion
          rolPrincipal
          adminData { descripcion }
          egresadoData { titulo anioEgreso }
        }

        portafolioPorUsuario(idUsuario: $id) {
          descripcion
          skills
          visibilidad
          ultimaActualizacion
          evidencias {
            idEvidencia
            titulo
            descripcion
            tipo
            recurso
          }
        }
      }
    `;

    this.http.post<any>("http://localhost:8080/graphql", {
      query,
      variables: { id: u.id }
    }).subscribe({
      next: (res) => {
        const du = res.data?.usuarioById;
        const dp = res.data?.portafolioPorUsuario;

        if (!du) {
          console.error("❌ usuarioById vino null. ID enviado:", u.id);
          return;
        }

        this.perfilCompletoSeleccionado = {
          nombre: `${du.nombre} ${du.apellido}`,
          ubicacion: du.ubicacion ?? "-",
          telefono: du.telefono ?? "-",
          email: du.email ?? "-",
          titulo: du.egresadoData?.titulo ?? "-",
          anioEgreso: du.egresadoData?.anioEgreso ?? "-",
          rol: du.rolPrincipal,
          descripcion: du.adminData?.descripcion ?? "-",
          skills: dp?.skills ?? "-",
          visibilidad: dp?.visibilidad ?? "-",
          ultimaActualizacion: dp?.ultimaActualizacion ?? "-",
          evidencias: dp?.evidencias ?? []
        };

        console.log("🟢 Perfil completo cargado:", this.perfilCompletoSeleccionado);
      },
      error: (err) => console.error("❌ Error cargando perfil:", err)
    });
  }

  // ======================================================
  // PERFIL BÁSICO
  // ======================================================
  verPerfilPendiente(u: SolicitudPendiente) {
  this.popup = "perfilBasico";

  const query = `
    query PerfilBasico($id: Int!) {
      usuarioById(id: $id) {
        nombre
        apellido
        email
        telefono
        ubicacion
        rolPrincipal

        egresadoData {
          titulo
          anioEgreso
        }
      }
    }
  `;

  this.http.post<any>("http://localhost:8080/graphql", {
    query,
    variables: { id: u.idUsuarioOrigen }
  }).subscribe({
    next: (res) => {
      const du = res.data?.usuarioById;

      if (!du) {
        console.error("❌ usuarioById vino NULL en perfil básico");
        return;
      }

      this.perfilBasicoSeleccionado = {
        nombre: `${du.nombre} ${du.apellido}`,
        email: du.email ?? "—",
        telefono: du.telefono ?? "—",
        ubicacion: du.ubicacion ?? "—",
        titulo: du.egresadoData?.titulo ?? "—",
        anioEgreso: du.egresadoData?.anioEgreso ?? "—",
        rol: du.rolPrincipal ?? "—",
      };
    },

    error: (err) => console.error("❌ Error cargando perfil básico:", err),
  });
}


  // ======================================================
  // ENDORSE
  // ======================================================
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

    this.endorsementsRealizados.push({
      id: this.usuarioSeleccionado.id,
      nombre: this.usuarioSeleccionado.nombre,
      fecha: new Date().toISOString().slice(0, 10)
    });

    this.usuarioSeleccionado.endorsed = true;
    this.cancelarEndorse();
  }

  // ======================================================
  // ACEPTAR / RECHAZAR SOLICITUD
  // ======================================================
  aceptarSolicitud(s: SolicitudPendiente) {
    const q = `
      mutation($id: Int!) {
        aceptarSolicitud(idSolicitud: $id) { idSolicitud }
      }
    `;

    this.http.post("http://localhost:8080/graphql", {
      query: q,
      variables: { id: s.idSolicitud }
    }).subscribe(() => this.cargarDatos());
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
    }).subscribe(() => this.cargarDatos());
  }

  // ======================================================
  // ELIMINAR ENDORSE
  // ======================================================
  pedirEliminar(tipo: 'recibido' | 'realizado', id: number) {
    this.eliminarTarget = { tipo, id };
    this.popup = 'eliminarEndorse';
  }

  eliminarEndorseConfirmado() {
    if (!this.eliminarTarget) return;

    const { tipo, id } = this.eliminarTarget;

    if (tipo === 'recibido') {
      this.endorsementsRecibidos =
        this.endorsementsRecibidos.filter(e => e.id !== id);
    } else {
      this.endorsementsRealizados =
        this.endorsementsRealizados.filter(e => e.id !== id);

      const idx = this.conexiones.findIndex(c => c.id === id);
      if (idx >= 0) this.conexiones[idx].endorsed = false;
    }

    this.cerrarPopup();
  }

  // ======================================================
  // POPUP
  // ======================================================
  cerrarPopup() {
    this.popup = '';
    this.usuarioSeleccionado = null;
    this.eliminarTarget = null;
    this.perfilBasicoSeleccionado = null;
    this.perfilCompletoSeleccionado = null;
    this.abrirPopup = false;
  }

  ini(fullName: string) {
    const p = fullName.split(" ");
    return (p[0][0] + (p[1]?.[0] ?? "")).toUpperCase();
  }
}

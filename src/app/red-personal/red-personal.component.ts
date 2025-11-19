import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupEndorseComponent } from '../popups/popup-endorse/popup-endorse.component';
import { PopupPerfilBasicoComponent } from '../popups/popup-perfil-basico/popup-perfil-basico.component';
import { PopupPerfilPostulanteComponent } from '../popups/popup-perfil-postulante/popup-perfil-postulante.component';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface UsuarioMini {
  idUsuario(idUsuario: any): boolean;
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
todosLosUsuarios: any[] = [];   // ⭐ AGREGAR ESTO AQUÍ

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
      this.todosLosUsuarios = usuarios;   // ⭐ NECESARIO PARA MOSTRAR LOS NOMBRES

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
this.cargarEndorsements();

    });
  }
yaEndorseado(idUsuario: number): boolean {
  return this.endorsementsRealizados.some(e => e.idUsuarioReceptor === idUsuario);
}
cargarEndorsements() {
  const qr = `
    query($id: Int!) {
      endorsementsRealizados(id: $id) {
        idEndorsement
        idUsuarioReceptor
        fechaEndorsement
      }
    }
  `;

  const qrec = `
    query($id: Int!) {
      endorsementsRecibidos(id: $id) {
        idEndorsement
        idUsuarioEmisor
        fechaEndorsement
      }
    }
  `;

  Promise.all([
    this.http.post<any>("http://localhost:8080/graphql", {
      query: qr,
      variables: { id: this.idLogueado }
    }).toPromise(),

    this.http.post<any>("http://localhost:8080/graphql", {
      query: qrec,
      variables: { id: this.idLogueado }
    }).toPromise()
  ]).then(([real, rec]) => {

    // Guardamos los arrays crudos primero (NECESARIO PARA LO VERDE)
    const realizadosRaw = real.data?.endorsementsRealizados ?? [];
    const recibidosRaw  = rec.data?.endorsementsRecibidos ?? [];

    // Guardamos los crudos para marcar lo verde
    this.endorsementsRealizados = realizadosRaw;
    this.endorsementsRecibidos  = recibidosRaw;

    // ⭐ IMPORTANTE: marcar lo verde ANTES del merge
    this.marcarEndorseados();

    // Obtener nombres de todos los usuarios
    const usuarios = this.todosLosUsuarios;

    // 🎯 Ahora sí, map con nombres
    this.endorsementsRealizados = realizadosRaw.map((e: any) => {
      const u = usuarios.find((x: any) => Number(x.idUsuario) === Number(e.idUsuarioReceptor));

      return {
        id: e.idEndorsement,
        nombre: u ? `${u.nombre} ${u.apellido}` : "—",
        fecha: e.fechaEndorsement
      };
    });

    this.endorsementsRecibidos = recibidosRaw.map((e: any) => {
      const u = usuarios.find((x: any) => Number(x.idUsuario) === Number(e.idUsuarioEmisor));

      return {
        id: e.idEndorsement,
        nombre: u ? `${u.nombre} ${u.apellido}` : "—",
        fecha: e.fechaEndorsement
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
        idUsuario
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

      endorsementsRecibidos(id: $id) {
        idEndorsement
        idUsuarioEmisor
        fechaEndorsement
      }

      usuarios {
        idUsuario
        nombre
        apellido
        rolPrincipal
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
      const endo = res.data?.endorsementsRecibidos ?? [];
      const users = res.data?.usuarios ?? [];

      if (!du) {
        console.error("❌ usuarioById vino null. ID:", u.id);
        return;
      }

      // 🔵 Resolver nombres/roles de endorsers
      const endorsementsInfo = endo.map((e: any) => {
        const emisor = users.find((x: any) => Number(x.idUsuario) === Number(e.idUsuarioEmisor));
        return {
          id: e.idEndorsement,
          fecha: e.fechaEndorsement,
          nombre: emisor ? `${emisor.nombre} ${emisor.apellido}` : "Usuario desconocido",
          rol: emisor?.rolPrincipal ?? "-"
        };
      });

      this.perfilCompletoSeleccionado = {
        // Datos personales
        nombre: `${du.nombre} ${du.apellido}`,
        ubicacion: du.ubicacion ?? "-",
        telefono: du.telefono ?? "-",
        email: du.email ?? "-",
        rol: du.rolPrincipal,

        titulo: du.egresadoData?.titulo ?? "-",
        anioEgreso: du.egresadoData?.anioEgreso ?? "-",

        // Portafolio
        descripcion: dp?.descripcion ?? "-",
        skills: dp?.skills ?? "-",
        visibilidad: dp?.visibilidad ?? "-",
        ultimaActualizacion: dp?.ultimaActualizacion ?? "-",
        evidencias: dp?.evidencias ?? [],

        // ENDORSEMENTS
        endorsements: endorsementsInfo
      };

      console.log("🟢 Perfil completo FINAL:", this.perfilCompletoSeleccionado);
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
private marcarEndorseados() {
  const idsEndorseados = this.endorsementsRealizados.map(e => e.idUsuarioReceptor);

  this.conexiones = this.conexiones.map(c => ({
    ...c,
    endorsed: idsEndorseados.includes(c.id)
  }));
}

  cancelarEndorse() {
    this.abrirPopup = false;
    this.usuarioSeleccionado = null;
  }

confirmarEndorse() {
  if (!this.usuarioSeleccionado) return;

  const mutation = `
    mutation($emisorId: Int!, $receptorId: Int!) {
      crearEndorsement(emisorId: $emisorId, receptorId: $receptorId) {
        idEndorsement
      }
    }
  `;

  this.http.post<any>("http://localhost:8080/graphql", {
    query: mutation,
    variables: {
      emisorId: this.idLogueado,
      receptorId: this.usuarioSeleccionado.id   // ✔ FIX
    }
  }).subscribe({
    next: () => {

      this.usuarioSeleccionado!.endorsed = true;

      this.endorsementsRealizados.push({
        idUsuarioReceptor: this.usuarioSeleccionado!.id,  // ✔ FIX
        nombre: this.usuarioSeleccionado!.nombre,
        fecha: new Date().toISOString().slice(0,10)
      });

      this.cancelarEndorse();
      this.cargarEndorsements();
    }
  });
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

  const mutation = `
    mutation($id: Int!) {
      eliminarEndorsement(id: $id)
    }
  `;

  this.http.post("http://localhost:8080/graphql", {
    query: mutation,
    variables: { id: this.eliminarTarget.id }
  }).subscribe({
    next: () => {
      this.cerrarPopup();
      this.cargarEndorsements();
      this.cargarDatos();
    },
    error: (err) => console.error("❌ Error eliminando endorsement:", err)
  });
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

  ini(fullName: string): string {
  if (!fullName) return "";

  const parts = fullName.trim().split(" ");

  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

}

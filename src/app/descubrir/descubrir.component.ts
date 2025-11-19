import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopupPerfilPostulanteComponent } from '../popups/popup-perfil-postulante/popup-perfil-postulante.component';


import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PerfilBasico } from '../popups/popup-perfil-basico/popup-perfil-basico.component';

interface UsuarioDescubrir {
  id: number;
  nombre: string;
  apellido: string;
  carrera: string;
  rol: string;
  ubicacion: string;
  conectado: boolean;
  solicitudEnviada: boolean;
  estaConectado: false,
  idSolicitud: number | null;
}

@Component({
  selector: 'app-descubrir',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelListaComponent,
    PopupPerfilPostulanteComponent
  ],
  templateUrl: './descubrir.component.html',
  styleUrls: ['./descubrir.component.css'],
})
export class DescubrirComponent implements OnInit {

  termino = '';
  usuarios: UsuarioDescubrir[] = [];


  verPerfil = false;
  perfilSeleccionado: any = null;


  constructor(private http: HttpClient) {}

  // ==========================================================
  // INIT - CARGA DATOS
  // ==========================================================
  ngOnInit(): void {
    console.log("🚀 Descubrir ngOnInit()");

    const userString = sessionStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);
    const idLogueado = Number(user.idUsuario);

    // == GraphQL Queries ==
    const Q_USUARIOS = `
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

    const Q_CONEXIONES = `
      query($id: Int!) {
        conexionesPorUsuario(idUsuario: $id) {
          idUsuario1
          idUsuario2
        }
      }
    `;

    const Q_SOLIC_ENVIADAS = `
      query($id: Int!) {
        solicitudesEnviadas(idUsuario: $id) {
          idSolicitud
          idUsuarioDestino
          estado
        }
      }
    `;

    Promise.all([
      this.http.post<any>('http://localhost:8080/graphql', { query: Q_USUARIOS }).toPromise(),
      this.http.post<any>('http://localhost:8080/graphql', {
        query: Q_CONEXIONES,
        variables: { id: idLogueado }
      }).toPromise(),
      this.http.post<any>('http://localhost:8080/graphql', {
        query: Q_SOLIC_ENVIADAS,
        variables: { id: idLogueado }
      }).toPromise()
    ])
    .then(([resUsuarios, resConexiones, resSolicitudes]) => {

      const listaUsuarios = resUsuarios.data?.usuarios || [];
      const conexiones = resConexiones.data?.conexionesPorUsuario || [];
      const enviadas = resSolicitudes.data?.solicitudesEnviadas || [];

      console.log("📌 Usuarios:", listaUsuarios);
      console.log("📌 Conexiones:", conexiones);
      console.log("📌 Solicitudes enviadas:", enviadas);

      // Lista de amigos
      const idsAmigos = new Set<number>();
      conexiones.forEach((c: any) => {
        if (c.idUsuario1 === idLogueado) idsAmigos.add(c.idUsuario2);
        if (c.idUsuario2 === idLogueado) idsAmigos.add(c.idUsuario1);
      });

      // Solicitudes enviadas
      const mapaSolicitudes = new Map<number, number>();
      enviadas.forEach((s: any) =>
        mapaSolicitudes.set(Number(s.idUsuarioDestino), s.idSolicitud)
      );

      // Usuarios finales
      this.usuarios = listaUsuarios
        .filter((u: any) => Number(u.idUsuario) !== idLogueado)
        .filter((u: any) => !idsAmigos.has(Number(u.idUsuario)))
        .map((u: any) => ({
          id: Number(u.idUsuario),
          nombre: u.nombre,
          apellido: u.apellido,
          carrera: "",
          rol: u.rolPrincipal,
          ubicacion: u.ubicacion ?? "–",
          conectado: false,
          solicitudEnviada: mapaSolicitudes.has(Number(u.idUsuario)),
          idSolicitud: mapaSolicitudes.get(Number(u.idUsuario)) || null,
        }));

      console.log("🎯 Usuarios finales:", this.usuarios);
    })
    .catch((err) => console.error("❌ Error Descubrir:", err));
  }

  // ==========================================================
  // BUSCAR
  // ==========================================================
  get usuariosFiltrados(): UsuarioDescubrir[] {
    const t = this.termino.trim().toLowerCase();
    if (!t) return this.usuarios;

    return this.usuarios.filter((u) =>
      u.nombre.toLowerCase().includes(t) ||
      u.apellido.toLowerCase().includes(t) ||
      u.carrera.toLowerCase().includes(t) ||
      u.rol?.toLowerCase().includes(t)
    );
  }

  // ==========================================================
  // ENVIAR SOLICITUD
  // ==========================================================
  conectar(u: UsuarioDescubrir) {
    console.log("📨 Enviando solicitud a", u.id);

    const user = JSON.parse(sessionStorage.getItem("user")!);
    const idOrigen = Number(user.idUsuario);

    const mutation = `
      mutation($o: Int!, $d: Int!) {
        enviarSolicitud(origen: $o, destino: $d) {
          idSolicitud
          estado
        }
      }
    `;

    this.http.post<any>('http://localhost:8080/graphql', {
      query: mutation,
      variables: { o: idOrigen, d: u.id }
    }).subscribe(res => {
      const sol = res.data?.enviarSolicitud;
      if (sol) {
        u.solicitudEnviada = true;
        u.idSolicitud = sol.idSolicitud;
      }
    });
  }

  // ==========================================================
  // CANCELAR SOLICITUD
  // ==========================================================
  cancelarSolicitud(u: UsuarioDescubrir) {
    if (!u.idSolicitud) {
      u.solicitudEnviada = false;
      return;
    }

    const mutation = `
      mutation($id: Int!) {
        rechazarSolicitud(idSolicitud: $id)
      }
    `;

    this.http.post<any>('http://localhost:8080/graphql', {
      query: mutation,
      variables: { id: u.idSolicitud }
    }).subscribe(() => {
      u.solicitudEnviada = false;
      u.idSolicitud = null;
    });
  }

  // ==========================================================
  // ABRIR POPUP PERFIL REAL
  // ==========================================================
 abrirPerfil(u: UsuarioDescubrir) {
  console.log("🔍 Cargando perfil para:", u.id);

  const id = u.id;

  const Q_USUARIO = `
    query($id: Int!) {
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
    }
  `;

  const Q_PORTAFOLIO = `
    query($id: Int!) {
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

  const Q_ENDORSEMENTS = `
    query($id: Int!) {
      endorsementsRecibidos(id: $id) {
        idEndorsement
        idUsuarioEmisor
        fechaEndorsement
      }
    }
  `;

  const Q_USUARIOS = `
    query {
      usuarios {
        idUsuario
        nombre
        apellido
        rolPrincipal
      }
    }
  `;

  Promise.all([
    this.http.post<any>("http://localhost:8080/graphql", { query: Q_USUARIO, variables: { id }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: Q_PORTAFOLIO, variables: { id }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: Q_ENDORSEMENTS, variables: { id }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: Q_USUARIOS }).toPromise(),
  ])
  .then(([usr, port, endo, allUsers]) => {

    const usuario = usr.data?.usuarioById;
    const portafolio = port.data?.portafolioPorUsuario;
    const endorsements = endo.data?.endorsementsRecibidos ?? [];
    const usuarios = allUsers.data?.usuarios ?? [];

    const conectado = u.estaConectado;
    const oculto = "Conecta con usuario para visualizar estos datos";

    // Resolver datos de los endorsers
    const endoFinal =
      conectado
        ? endorsements.map((e: any) => {
            const emisor = usuarios.find((x: any) => x.idUsuario == e.idUsuarioEmisor);

            return {
              idEndorsement: e.idEndorsement,
              fecha: e.fechaEndorsement,
              nombre: emisor ? `${emisor.nombre} ${emisor.apellido}` : "Usuario",
              rol: emisor?.rolPrincipal ?? "—"
            };
          })
        : oculto;

// En descubrir ocultamos SIEMPRE teléfono y email
const mostrarTelefono = false;
const mostrarEmail = false;

// Endorsements SIEMPRE ocultos (pero mostramos la caja vacía)
const endorsementsFinal = []; // se muestra la caja de “aún no recibió...”

// PERFIL FINAL
this.perfilSeleccionado = {
  idUsuario: usuario.idUsuario,

  // DATOS PERSONALES
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  ubicacion: usuario.ubicacion ?? "—",
  telefono: mostrarTelefono ? (usuario.telefono ?? "—") : "CONECTA PARA VER",
  email: mostrarEmail ? (usuario.email ?? "—") : "CONECTA PARA VER",
  rolPrincipal: usuario.rolPrincipal,
  completitud: usuario.completitud ?? 0,

  tituloUniversitario: usuario.egresadoData?.titulo ?? "—",
  anioEgreso: usuario.egresadoData?.anioEgreso ?? "—",

  // PORTAFOLIO
  descripcion: portafolio?.descripcion ?? "—",
  skills: portafolio?.skills ?? "—",
  visibilidad: portafolio?.visibilidad ?? "—",
  ultimaActualizacion: portafolio?.ultimaActualizacion ?? "—",
  evidencias: portafolio?.evidencias ?? [],

  // ENDORSEMENTS SIEMPRE OCULTOS PERO MOSTRAMOS LA CAJA VACÍA
  // ENDORSEMENTS: mensaje de bloqueo
endorsements: [
  {
    nombre: "CONECTA PARA VER",
  }
]

};

this.verPerfil = true;



    this.verPerfil = true;
  });
}

  cerrarPerfil() {
    this.verPerfil = false;
    this.perfilSeleccionado = null;
  }
}

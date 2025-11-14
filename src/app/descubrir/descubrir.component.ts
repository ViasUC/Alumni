import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PerfilBasico,
  PopupPerfilBasicoComponent
} from '../popups/popup-perfil-basico/popup-perfil-basico.component';

import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface UsuarioDescubrir {
  id: number;
  nombre: string;
  apellido: string;
  carrera: string;
  rol: string;
  ubicacion: string;
  conectado: boolean;
  solicitudEnviada: boolean;
  idSolicitud: number | null;
}

@Component({
  selector: 'app-descubrir',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelListaComponent,
    PopupPerfilBasicoComponent
  ],
  templateUrl: './descubrir.component.html',
  styleUrls: ['./descubrir.component.css'],
})
export class DescubrirComponent implements OnInit {

  termino = '';
  usuarios: UsuarioDescubrir[] = [];

  verPerfil = false;
  perfilSeleccionado: PerfilBasico | null = null;

  constructor(private http: HttpClient) {}

  // ==========================================================
  // INIT - CARGA DATOS
  // ==========================================================
  ngOnInit(): void {
    console.log("🚀 ngOnInit() iniciado");

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

    // Ejecutamos TODO junto
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

      // === Lista de amigos ===
      const idsAmigos = new Set<number>();
      conexiones.forEach((c: any) => {
        if (c.idUsuario1 === idLogueado) idsAmigos.add(c.idUsuario2);
        if (c.idUsuario2 === idLogueado) idsAmigos.add(c.idUsuario1);
      });

      // === Solicitudes enviadas ===
      const mapaSolicitudes = new Map<number, number>();
      enviadas.forEach((s: any) =>
        mapaSolicitudes.set(Number(s.idUsuarioDestino), s.idSolicitud)
      );

      // === Cargar usuarios finales ===
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
  // BÚSQUEDA
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
  // POPUP PERFIL
  // ==========================================================
  abrirPerfil(u: UsuarioDescubrir) {
    this.perfilSeleccionado = {
      nombre: `${u.nombre} ${u.apellido}`,
      ubicacion: u.ubicacion,
      telefono: '',
      email: '',
      titulo: u.carrera || '',
      anioEgreso: undefined,
      rol: u.rol,
    };
    this.verPerfil = true;
  }

  cerrarPerfil() {
    this.verPerfil = false;
    this.perfilSeleccionado = null;
  }
}

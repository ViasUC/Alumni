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

  ngOnInit(): void {
    console.log("🚀 ngOnInit() iniciado");

    // ================================
    // OBTENER USUARIO LOGUEADO
    // ================================
    const userString = sessionStorage.getItem("user");
    if (!userString) {
      console.error("⚠️ No hay usuario logueado en sessionStorage");
      return;
    }

    const user = JSON.parse(userString);

    const idLogueado = Number(user.idUsuario);
    console.log("🔑 ID del usuario logueado =", idLogueado);

    // ============================
    // QUERY 1: obtener todos los usuarios
    // ============================
    const queryUsuarios = `
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

    // ============================
    // QUERY 2: obtener conexiones
    // ============================
    const queryConexiones = `
      query($id: Int!) {
        conexionesPorUsuario(idUsuario: $id) {
          idUsuario1
          idUsuario2
        }
      }
    `;

    console.log("📡 Enviando ambas queries...");

    Promise.all([
      this.http.post<any>('http://localhost:8080/graphql', { query: queryUsuarios }).toPromise(),
      this.http.post<any>('http://localhost:8080/graphql', {
        query: queryConexiones,
        variables: { id: idLogueado }
      }).toPromise()
    ])
      .then(([resUsuarios, resConexiones]) => {

        const listaUsuarios = resUsuarios.data?.usuarios || [];
        const conexiones = resConexiones.data?.conexionesPorUsuario || [];

        console.log("📌 Lista total de usuarios:", listaUsuarios);
        console.log("📌 Conexiones encontradas:", conexiones);

        // === 1) Lista de amigos ===
        const idsAmigos = new Set<number>();

        conexiones.forEach((c: any) => {
          const u1 = Number(c.idUsuario1);
          const u2 = Number(c.idUsuario2);

          if (u1 === idLogueado) idsAmigos.add(u2);
          if (u2 === idLogueado) idsAmigos.add(u1);
        });

        console.log("👥 IDs de amigos:", [...idsAmigos]);

        // === 2) Filtrar usuarios ===
        this.usuarios = listaUsuarios
          .filter((u: any) => Number(u.idUsuario) !== idLogueado) // quitar logueado
          .filter((u: any) => !idsAmigos.has(Number(u.idUsuario))) // quitar amigos
          .map((u: any) => ({
            id: Number(u.idUsuario),
            nombre: u.nombre,
            apellido: u.apellido,
            carrera: "",
            rol: u.rolPrincipal,
            ubicacion: u.ubicacion ?? "–",
            conectado: false,
            solicitudEnviada: false
          }));

        console.log("🎉 Usuarios finales a mostrar:", this.usuarios);
      })
      .catch((err) => console.error("❌ Error cargando Descubrir:", err));
  }

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

  conectar(u: UsuarioDescubrir) {
    u.solicitudEnviada = true;
  }

  cancelarSolicitud(u: UsuarioDescubrir) {
    u.solicitudEnviada = false;
  }

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

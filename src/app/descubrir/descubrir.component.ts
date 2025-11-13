import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import {
  PopupPerfilBasicoComponent,
  PerfilBasico
} from '../popups/popup-perfil-basico/popup-perfil-basico.component';

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

  // ---- popup de perfil básico ----
  verPerfil = false;
  perfilSeleccionado: PerfilBasico | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const query = `
      query DescubrirUsuarios {
        usuarios {
          idUsuario
          nombre
          apellido
          ubicacion
          rolPrincipal
        }
      }
    `;

    this.http
      .post<any>('http://localhost:8080/graphql', { query })
      .subscribe({
        next: (res) => {
          const lista = res.data?.usuarios || [];

          this.usuarios = lista.map((u: any) => ({
            id: u.idUsuario,
            nombre: u.nombre,
            apellido: u.apellido,
            carrera: "",            // lo podés llenar más adelante
            rol: u.rolPrincipal,
            ubicacion: u.ubicacion ?? "–",
            conectado: false,
            solicitudEnviada: false
          }));
        },
        error: (err) => console.error('❌ Error cargando usuarios:', err),
      });
  }

  // Filtro en memoria
  get usuariosFiltrados(): UsuarioDescubrir[] {
    const t = this.termino.trim().toLowerCase();
    if (!t) return this.usuarios;

    return this.usuarios.filter((u) => {
      return (
        u.nombre.toLowerCase().includes(t) ||
        u.apellido.toLowerCase().includes(t) ||
        u.carrera.toLowerCase().includes(t) ||
        u.rol?.toLowerCase().includes(t)
      );
    });
  }

  conectar(u: UsuarioDescubrir) {
    if (u.conectado) return;
    u.solicitudEnviada = true;
    // luego POST /solicitudes
  }

  cancelarSolicitud(u: UsuarioDescubrir) {
    u.solicitudEnviada = false;
    // luego DELETE /solicitudes/:id
  }

  // ===== Popup perfil básico =====
  abrirPerfil(u: UsuarioDescubrir) {
    this.perfilSeleccionado = {
      nombre: `${u.nombre} ${u.apellido}`,
      ubicacion: u.ubicacion,
      telefono: '',            // cuando tengas estos campos en el back, los mapeás acá
      email: '',
      titulo: u.carrera || '',
      anioEgreso: undefined,   // idem
      rol: u.rol,
    };
    this.verPerfil = true;
  }

  cerrarPerfil() {
    this.verPerfil = false;
    this.perfilSeleccionado = null;
  }
}


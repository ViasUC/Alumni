import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PopupEndorseComponent } from '../popups/popup-endorse/popup-endorse.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import {
  PopupPerfilBasicoComponent,
  PerfilBasico,
} from '../popups/popup-perfil-basico/popup-perfil-basico.component';
import { PopupPerfilPostulanteComponent } from '../popups/popup-perfil-postulante/popup-perfil-postulante.component';

interface UsuarioMini {
  id: number;
  nombre: string;
  rol: string;
  carrera?: string;
  ubicacion?: string;
  endorsed?: boolean;
}

interface EndorseItem {
  id: number;
  nombre: string;
  fecha: string;
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
export class RedPersonalComponent {
  // --- POPUP ENDORSE ---
  abrirPopup = false;
  usuarioSeleccionado: UsuarioMini | null = null;

  // --- POPUPS GENÉRICOS ---
  popup: '' | 'eliminarEndorse' | 'perfilCompleto' | 'perfilBasico' = '';
  private eliminarTarget: { tipo: 'recibido' | 'realizado'; id: number } | null =
    null;

  // --- POPUPS PERFIL ---
  perfilBasicoSeleccionado: PerfilBasico | null = null;
  perfilCompletoSeleccionado: any = null;

  // --- MOCKS ---
  conexiones: UsuarioMini[] = [
    {
      id: 1,
      nombre: 'María Fernández',
      rol: 'Egresada',
      carrera: 'Ing. Informática',
      ubicacion: 'Asunción',
      endorsed: true, // ya la endorsamos
    },
    {
      id: 2,
      nombre: 'Carlos López',
      rol: 'Egresado',
      carrera: 'Ing. Informática',
      ubicacion: 'San Lorenzo',
      endorsed: false,
    },
    {
      id: 3,
      nombre: 'Ana Duarte',
      rol: 'Egresada',
      carrera: 'Ing. Industrial',
      ubicacion: 'Luque',
      endorsed: false,
    },
  ];

  solicitudesPendientes: UsuarioMini[] = [
    {
      id: 21,
      nombre: 'Pedro Rivas',
      rol: 'Egresado',
      carrera: 'Ing. Informática',
      ubicacion: 'Asunción',
    },
    {
      id: 22,
      nombre: 'Lucía Gómez',
      rol: 'Egresada',
      carrera: 'Ing. Ambiental',
      ubicacion: 'Capiatá',
    },
  ];

  // Recibidos: me endorsan a mí
  endorsementsRecibidos: EndorseItem[] = [
    { id: 2, nombre: 'Carlos López', fecha: '2025-10-22' },
  ];

  // Realizados: yo endorsé a…
  endorsementsRealizados: EndorseItem[] = [
    { id: 1, nombre: 'María Fernández', fecha: '2025-10-10' },
  ];

  // === Helpers ===
  ini(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  private mapUsuarioToPerfilBasico(u: UsuarioMini): PerfilBasico {
    return {
      nombre: u.nombre,
      ubicacion: u.ubicacion ?? '–',
      telefono: '+595 000 000 000',
      email: 'correo@ejemplo.com',
      titulo: u.carrera || 'Egresado/a',
      anioEgreso: 2025,
      rol: u.rol, // <- ajustado al tipo PerfilBasico
    };
  }

  private mapUsuarioToPerfilCompleto(u: UsuarioMini): any {
    return {
      nombre: u.nombre,
      ubicacion: u.ubicacion ?? 'Asunción, Paraguay',
      telefono: '+595 971 000 000',
      email: 'postulante@uca.edu.py',
      titulo: u.carrera || 'Ing. Informática',
      anioEgreso: 2024,
      rol: u.rol,
      descripcion:
        'Experiencia en desarrollo web y participación en proyectos universitarios.',
      skills: 'Angular, Spring Boot, PostgreSQL',
      visibilidad: 'Pública',
      ultimaActualizacion: '2025-11-01',
      evidencias: [
        {
          tipo: 'Documento',
          titulo: 'Proyecto de investigación',
          descripcion: 'Sistema de gestión académica.',
          fecha: '2025-10-10',
        },
        {
          tipo: 'Certificado',
          titulo: 'Certificado de curso',
          descripcion: 'Curso de React',
          fecha: '2025-09-05',
        },
      ],
    };
  }

  // === Mis conexiones → Endorsear ===
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

    const idx = this.conexiones.findIndex(
      (c) => c.id === this.usuarioSeleccionado!.id
    );
    if (idx >= 0) this.conexiones[idx].endorsed = true;

    const hoy = new Date().toISOString().slice(0, 10);

    const yaExiste = this.endorsementsRealizados.some(
      (e) => e.id === this.usuarioSeleccionado!.id
    );
    if (!yaExiste) {
      this.endorsementsRealizados.unshift({
        id: this.usuarioSeleccionado.id,
        nombre: this.usuarioSeleccionado.nombre,
        fecha: hoy,
      });
    }

    this.cancelarEndorse();
  }

  // === Solicitudes pendientes ===
  aceptarSolicitud(u: UsuarioMini) {
    this.conexiones.unshift({ ...u, endorsed: false });
    this.solicitudesPendientes = this.solicitudesPendientes.filter(
      (x) => x.id !== u.id
    );
  }

  rechazarSolicitud(u: UsuarioMini) {
    this.solicitudesPendientes = this.solicitudesPendientes.filter(
      (x) => x.id !== u.id
    );
  }

  // === Ver perfiles ===
  verPerfilConexion(u: UsuarioMini) {
    this.perfilCompletoSeleccionado = this.mapUsuarioToPerfilCompleto(u);
    this.popup = 'perfilCompleto';
  }

  verPerfilPendiente(u: UsuarioMini) {
    this.perfilBasicoSeleccionado = this.mapUsuarioToPerfilBasico(u);
    this.popup = 'perfilBasico';
  }

  // === Eliminar endorsements ===
  pedirEliminar(tipo: 'recibido' | 'realizado', id: number) {
    this.eliminarTarget = { tipo, id };
    this.popup = 'eliminarEndorse';
  }

  eliminarEndorseConfirmado() {
    if (!this.eliminarTarget) return;
    const { tipo, id } = this.eliminarTarget;

    if (tipo === 'recibido') {
      this.endorsementsRecibidos = this.endorsementsRecibidos.filter(
        (x) => x.id !== id
      );
    } else {
      // Elimino de realizados
      this.endorsementsRealizados = this.endorsementsRealizados.filter(
        (x) => x.id !== id
      );
      // ✅ y vuelvo a habilitar "Endorsear" en Mis conexiones
      const idx = this.conexiones.findIndex((c) => c.id === id);
      if (idx >= 0) {
        this.conexiones[idx].endorsed = false;
      }
    }

    this.cerrarPopup();
  }

  // === Cerrar popups ===
  cerrarPopup() {
    this.popup = '';
    this.eliminarTarget = null;
    this.perfilBasicoSeleccionado = null;
    this.perfilCompletoSeleccionado = null;
  }
}

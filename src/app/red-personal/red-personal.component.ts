import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PopupEndorseComponent } from '../popups/popup-endorse/popup-endorse.component';

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
  nombre: string;   // guardamos el nombre para calcular iniciales y mostrar
  fecha: string;
}

@Component({
  selector: 'app-red-personal',
  standalone: true,
  imports: [CommonModule, PanelListaComponent, PopupEndorseComponent],
  templateUrl: './red-personal.component.html',
  styleUrls: ['./red-personal.component.css'],
})
export class RedPersonalComponent {
  // POPUP
  abrirPopup = false;
  usuarioSeleccionado: UsuarioMini | null = null;

  // --- MOCKS ---
  conexiones: UsuarioMini[] = [
    { id: 1, nombre: 'María Fernández', rol: 'Egresada', carrera: 'Ing. Informática', ubicacion: 'Asunción',    endorsed: false },
    { id: 2, nombre: 'Carlos López',    rol: 'Egresado', carrera: 'Ing. Informática', ubicacion: 'San Lorenzo', endorsed: true  },
    { id: 3, nombre: 'Ana Duarte',      rol: 'Egresada', carrera: 'Ing. Industrial',  ubicacion: 'Luque',       endorsed: false },
  ];

  solicitudesPendientes: UsuarioMini[] = [
    { id: 21, nombre: 'Pedro Rivas', rol: 'Egresado', carrera: 'Ing. Informática', ubicacion: 'Asunción' },
    { id: 22, nombre: 'Lucía Gómez', rol: 'Egresada', carrera: 'Ing. Ambiental',   ubicacion: 'Capiatá'  },
  ];

  endorsementsRecibidos: EndorseItem[] = [
    { id: 2,  nombre: 'Carlos López',  fecha: '2025-10-22' },
  ];

  endorsementsRealizados: EndorseItem[] = [
    { id: 5,  nombre: 'Sofía Villalba', fecha: '2025-10-10' },
  ];

  // === Helpers ===
  ini(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  // === Acciones ===

  // Mis conexiones → Endorsear
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

    // marcar botón como endoseado
    const idx = this.conexiones.findIndex(c => c.id === this.usuarioSeleccionado!.id);
    if (idx >= 0) this.conexiones[idx].endorsed = true;

    // registrar en "Realizados"
    const hoy = new Date().toISOString().slice(0, 10);
    this.endorsementsRealizados.unshift({
      id: this.usuarioSeleccionado.id,
      nombre: this.usuarioSeleccionado.nombre,
      fecha: hoy,
    });

    // cerrar popup
    this.cancelarEndorse();
  }

  // Solicitudes pendientes
  aceptarSolicitud(u: UsuarioMini) {
    this.conexiones.unshift({ ...u, endorsed: false });
    this.solicitudesPendientes = this.solicitudesPendientes.filter(x => x.id !== u.id);
  }
  rechazarSolicitud(u: UsuarioMini) {
    this.solicitudesPendientes = this.solicitudesPendientes.filter(x => x.id !== u.id);
  }

  // Endorsements → eliminar
  eliminarEndorseRecibido(e: EndorseItem) {
    this.endorsementsRecibidos = this.endorsementsRecibidos.filter(x => x.id !== e.id);
    // TODO: DELETE al backend cuando lo tengas
  }
  eliminarEndorseRealizado(e: EndorseItem) {
    this.endorsementsRealizados = this.endorsementsRealizados.filter(x => x.id !== e.id);
    // TODO: DELETE al backend cuando lo tengas
  }
}

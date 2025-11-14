import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

// popups que ya tenés
import { PopupDetalleComponent } from '../popups/popup-detalle/popup-detalle.component';
import { PopupPostulacionComponent } from '../popups/popup-postulacion/popup-postulacion.component';
import { PopupEditarComponent } from '../popups/popup-editar/popup-editar.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupPostulanteComponent } from '../popups/popup-postulante/popup-postulante.component';
import { PopupConfirmarComponent } from '../popups/popup-confirmar/popup-confirmar.component';

interface Oportunidad {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  modalidad?: string;
  fechaPublicacion: string;
  estado: 'activa' | 'cerrada' | 'borrador';
  creadaPorUsuario: boolean;
  postulantes?: any[];
}

interface Postulacion {
  id: number;
  oportunidadTitulo: string;
  descripcion?: string;
  ubicacion?: string;
  modalidad?: string;
  fechaPostulacion: string;
  // 👇 ahora solo estos dos estados
  estado: 'activa' | 'cerrada';
}

@Component({
  selector: 'app-mi-actividad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelListaComponent,
    PopupDetalleComponent,
    PopupEditarComponent,
    PopupEliminarComponent,
    PopupPostulanteComponent,
    PopupConfirmarComponent
],
  templateUrl: './mi-actividad.component.html',
  styleUrls: ['./mi-actividad.component.css'],
})
export class MiActividadComponent {
  popup: '' | 'detalle' | 'editar' | 'eliminar' | 'postulante' | 'confirmar' = '';
  seleccionada: any = null;
  // 👇 para saber si estoy eliminando una oportunidad mía o despostulando
  motivoPopup: 'eliminarOportunidad' | 'despostular' | null = null;

  // filtros
  filtroFechaOpo = '';
  filtroEstadoOpo = 'todas';
  filtroFechaPost = '';
  filtroEstadoPost = 'todas'; // 👈 ahora matchea con activa/cerrada

  // SOLO las oportunidades que yo creé
  misOportunidades: Oportunidad[] = [
    {
      id: 1,
      titulo: 'Asistente de Laboratorio UCA',
      descripcion: 'Soporte técnico en laboratorios de la FACYT.',
      ubicacion: 'Campus UCA',
      modalidad: 'Presencial',
      fechaPublicacion: '2025-11-03',
      estado: 'activa',
      creadaPorUsuario: true,
      postulantes: [
        { id: 101, nombre: 'María Fernández', fechaPostulacion: '05 nov. 2025' },
        { id: 102, nombre: 'Carlos López', fechaPostulacion: '04 nov. 2025' },
      ],
    },
    {
      id: 2,
      titulo: 'Programa Alumni - Mentorías',
      descripcion: 'Mentorías para alumnos de informática.',
      ubicacion: 'Asunción',
      modalidad: 'Híbrido',
      fechaPublicacion: '2025-10-20',
      estado: 'cerrada',
      creadaPorUsuario: true,
      postulantes: [],
    },
  ];

  // SOLO las oportunidades externas a las que me postulé
  misPostulaciones: Postulacion[] = [
    {
      id: 10,
      oportunidadTitulo: 'Pasantía en Geocom',
      descripcion: 'Programa de pasantías para estudiantes de informática.',
      ubicacion: 'Asunción',
      modalidad: 'Presencial',
      fechaPostulacion: '2025-11-04',
      estado: 'activa',
    },
    {
      id: 11,
      oportunidadTitulo: 'Proyecto de Innovación FACYT',
      descripcion: 'Proyecto temporal en el área de innovación.',
      ubicacion: 'Remoto',
      modalidad: 'Remoto',
      fechaPostulacion: '2025-10-15',
      estado: 'cerrada',
    },
  ];

  // ====== getters con filtros ======
  get oportunidadesFiltradas(): Oportunidad[] {
    return this.misOportunidades.filter((op) => {
      const okFecha =
        !this.filtroFechaOpo || op.fechaPublicacion === this.filtroFechaOpo;
      const okEstado =
        this.filtroEstadoOpo === 'todas' || op.estado === this.filtroEstadoOpo;
      return okFecha && okEstado;
    });
  }

  get postulacionesFiltradas(): Postulacion[] {
    return this.misPostulaciones.filter((p) => {
      const okFecha =
        !this.filtroFechaPost || p.fechaPostulacion === this.filtroFechaPost;
      const okEstado =
        this.filtroEstadoPost === 'todas' || p.estado === this.filtroEstadoPost;
      return okFecha && okEstado;
    });
  }

  // ====== acciones oportunidades ======
  editarOportunidad(op: Oportunidad) {
    this.seleccionada = { ...op };
    this.popup = 'editar';
  }

  eliminarOportunidad(op: Oportunidad) {
    this.seleccionada = op;
    this.motivoPopup = 'eliminarOportunidad';
    this.popup = 'eliminar';
  }

  abrirPostulantes(op: Oportunidad) {
    this.seleccionada = op;
    this.popup = 'postulante';
  }

  // ====== acciones postulaciones ======
  despostularPostulacion(p: Postulacion) {
    // en vez de borrar al toque, mostramos confirmación
    this.seleccionada = p;
    this.motivoPopup = 'despostular';
    this.popup = 'eliminar';
  }

  verDetallePostulacion(p: Postulacion) {
    this.seleccionada = {
      titulo: p.oportunidadTitulo,
      descripcion: p.descripcion,
      ubicacion: p.ubicacion,
      modalidad: p.modalidad,
      fecha: p.fechaPostulacion,
      estado: p.estado,
      soloLectura: true, // 👈 así el popup no muestra "Postular"
    };
    this.popup = 'detalle';
  }

  // ====== popups comunes ======
  cerrarPopup() {
    this.popup = '';
    this.seleccionada = null;
    this.motivoPopup = null;
  }

  guardarOportunidad(data: any) {
    if (!data) {
      this.cerrarPopup();
      return;
    }

    if (data.estado) {
    data.estado = data.estado.toLowerCase();
    }

    const idx = this.misOportunidades.findIndex((o) => o.id === data.id);
    if (idx !== -1) {
      this.misOportunidades[idx] = {
        ...this.misOportunidades[idx],
        ...data,
      };
    }

    this.cerrarPopup();
  }

  confirmarEliminar() {
    // eliminar una oportunidad mía
    if (this.motivoPopup === 'eliminarOportunidad' && this.seleccionada) {
      this.misOportunidades = this.misOportunidades.filter(
        (o) => o.id !== this.seleccionada.id
      );
    }

    // despostularme de una externa
    if (this.motivoPopup === 'despostular' && this.seleccionada) {
      this.misPostulaciones = this.misPostulaciones.filter(
        (p) => p.id !== this.seleccionada.id
      );
    }

    this.cerrarPopup();
  }
}

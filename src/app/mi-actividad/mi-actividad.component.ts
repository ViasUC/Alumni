import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface Oportunidad {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  modalidad?: string;
  fechaPublicacion: string;  // ISO o "2025-11-05"
  estado: 'activa' | 'cerrada' | 'borrador' | 'postulado';
  creadaPorUsuario: boolean;
}

interface Postulacion {
  id: number;
  oportunidadTitulo: string;
  fechaPostulacion: string;
  estado: 'enviada' | 'aceptada' | 'rechazada' | 'en revisión';
}

@Component({
  selector: 'app-mi-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelListaComponent],
  templateUrl: './mi-actividad.component.html',
  styleUrls: ['./mi-actividad.component.css']
})
export class MiActividadComponent {

  // filtros sección "Mis oportunidades"
  filtroFechaOpo = '';
  filtroEstadoOpo = 'todas';

  // filtros sección "Mis postulaciones"
  filtroFechaPost = '';
  filtroEstadoPost = 'todas';

  // mock de oportunidades creadas por mí
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
    },
  ];

  // mock de mis postulaciones
  misPostulaciones: Postulacion[] = [
    {
      id: 10,
      oportunidadTitulo: 'Pasantía en Geocom',
      fechaPostulacion: '2025-11-04',
      estado: 'enviada',
    },
    {
      id: 11,
      oportunidadTitulo: 'Asistente de Laboratorio UCA',
      fechaPostulacion: '2025-11-01',
      estado: 'en revisión',
    },
    {
      id: 12,
      oportunidadTitulo: 'Proyecto de Innovación FACYT',
      fechaPostulacion: '2025-10-15',
      estado: 'rechazada',
    },
  ];

  // getters para aplicar filtros en la vista
  get oportunidadesFiltradas(): Oportunidad[] {
    return this.misOportunidades.filter(op => {
      const pasaFecha =
        !this.filtroFechaOpo ||
        op.fechaPublicacion === this.filtroFechaOpo;

      const pasaEstado =
        this.filtroEstadoOpo === 'todas' ||
        op.estado === this.filtroEstadoOpo;

      return pasaFecha && pasaEstado;
    });
  }

  get postulacionesFiltradas(): Postulacion[] {
    return this.misPostulaciones.filter(p => {
      const pasaFecha =
        !this.filtroFechaPost ||
        p.fechaPostulacion === this.filtroFechaPost;

      const pasaEstado =
        this.filtroEstadoPost === 'todas' ||
        p.estado === this.filtroEstadoPost;

      return pasaFecha && pasaEstado;
    });
  }

  // acciones iguales a las de oportunidades
  editarOportunidad(op: Oportunidad) {
    // acá abrís tu popup de editar
    console.log('editar', op);
  }

  eliminarOportunidad(op: Oportunidad) {
    console.log('eliminar', op);
  }

  verDetallePostulacion(p: Postulacion) {
    console.log('ver detalle postulacion', p);
  }
}

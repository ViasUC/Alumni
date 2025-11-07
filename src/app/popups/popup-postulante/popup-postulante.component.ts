import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Evidencia {
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
}

interface Postulante {
  id: number;
  nombre: string;
  fechaPostulacion: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  titulo?: string;
  anioEgreso?: string | number;
  rol?: string;
  completitud?: number;
  portafolio?: {
    descripcion: string;
    skills: string;
    visibilidad: string;
    ultimaActualizacion: string;
    evidencias: Evidencia[];
  };
}

@Component({
  selector: 'app-popup-postulante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-postulante.component.html',
  styleUrls: ['./popup-postulante.component.css'],
})
export class PopupPostulanteComponent {
  @Input() data: any;
  @Output() cerrar = new EventEmitter<void>();

  // estado interno
  vistaDetalle = false;
  postulanteSeleccionado: Postulante | null = null;

  // mock de evidencias por si el postulante no trae
  private evidenciasMock: Evidencia[] = [
    {
      titulo: 'Proyecto final de carrera',
      descripcion: 'Sistema de gestión académica.',
      tipo: 'Documento',
      fecha: '10 oct. 2025',
    },
    {
      titulo: 'Certificado de curso',
      descripcion: 'Curso de React',
      tipo: 'Certificado',
      fecha: '05 sep. 2025',
    },
  ];

  // lista que se muestra en la vista 1
  get postulantes(): Postulante[] {
    if (this.data && this.data.postulantes && this.data.postulantes.length) {
      return this.data.postulantes;
    }
    // mock
    return [
      { id: 101, nombre: 'María Fernández', fechaPostulacion: '05 nov. 2025' },
      { id: 102, nombre: 'Carlos López', fechaPostulacion: '04 nov. 2025' },
      { id: 103, nombre: 'Ana Duarte', fechaPostulacion: '03 nov. 2025' },
    ];
  }

  // cuando hago click en un nombre
  verPerfilPostulante(p: Postulante) {
    // acá armamos datos de muestra para que el perfil se vea completo
    this.postulanteSeleccionado = {
      ...p,
      ubicacion: p.ubicacion || 'Asunción, Paraguay',
      telefono: p.telefono || '+595 971 000 000',
      email: p.email || 'postulante@uca.edu.py',
      titulo: p.titulo || 'Ing. Informática',
      anioEgreso: p.anioEgreso || '2024',
      rol: p.rol || 'Egresado',
      completitud: p.completitud || 75,
      portafolio: p.portafolio || {
        descripcion: 'Experiencia en desarrollo web y participación en proyectos universitarios.',
        skills: 'Angular, Spring Boot, PostgreSQL',
        visibilidad: 'Pública',
        ultimaActualizacion: '2025-11-01',
        evidencias: this.evidenciasMock,
      },
    };
    this.vistaDetalle = true;
  }

  volverALista() {
    this.vistaDetalle = false;
    this.postulanteSeleccionado = null;
  }

  cerrarPopup() {
    this.cerrar.emit();
  }
}

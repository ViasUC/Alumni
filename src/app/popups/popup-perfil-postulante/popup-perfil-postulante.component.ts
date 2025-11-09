import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-perfil-postulante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-perfil-postulante.component.html',
  styleUrls: ['./popup-perfil-postulante.component.css'],
})
export class PopupPerfilPostulanteComponent {
  @Input() postulante: any;
  @Output() cerrar = new EventEmitter<void>();

  // mientras no hay back, armamos datos de ejemplo
  get perfil() {
    // si te vino info mínima del popup anterior, la podés usar acá
    const base = this.postulante || {};
    return {
      nombre: base.nombre || 'Nombre Apellido',
      ubicacion: 'Asunción, Paraguay',
      telefono: '+595 971 000 000',
      email: 'postulante@uca.edu.py',
      titulo: 'Ing. Informática',
      anioEgreso: 2024,
      rol: 'Egresado',
      completitud: 75,
      descripcion: 'Experiencia en desarrollo web y participación en proyectos universitarios.',
      skills: 'Angular, Spring Boot, PostgreSQL',
      visibilidad: 'Pública',
      ultimaActualizacion: '2025-11-01',
      evidencias: [
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
      ],
    };
  }
}

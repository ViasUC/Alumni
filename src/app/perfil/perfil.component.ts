import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface Evidencia {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  propia: boolean;
}

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, PanelListaComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  // modo edición ON/OFF
  editando = false;
  mostrarPopup = false;

  // datos de ejemplo (después los traés del back)
  perfil = {
    nombre: 'Horacio',
    apellido: 'Gómez',
    ubicacion: 'Asunción, Paraguay',
    telefono: '+595 981 000 000',
    email: 'horacio@uca.edu.py',
    titulo: 'Ing. Informática',
    anioEgreso: 2025,
    rol: 'Egresado',
    completitud: 75,
  };

  portafolio = {
    descripcion: 'Experiencia en desarrollo web y proyectos académicos.',
    skills: 'Angular, Spring Boot, PostgreSQL',
    visibilidad: 'Pública',
    ultimaActualizacion: '2025-11-01',
  };

  evidencias: Evidencia[] = [
    {
      id: 1,
      titulo: 'Proyecto de Investigación',
      descripcion: 'Proyecto realizado en la UCA',
      tipo: 'Documento',
      fecha: '15 abr. 2025',
      propia: true,
    },
    {
      id: 2,
      titulo: 'Certificado de Curso Online',
      descripcion: 'Curso completado en Udemy',
      tipo: 'Certificado',
      fecha: '20 mar. 2025',
      propia: true,
    },
  ];

  habilitarEdicion() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarEdicion() {
    // en vez de guardar directo mostramos el popup de confirmación
    this.mostrarPopup = true;
  }

  confirmarGuardado() {
    // acá sí harías el PATCH/PUT al back
    this.mostrarPopup = false;
    this.editando = false;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
  }
}

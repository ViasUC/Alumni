// src/app/portafolio/portafolio.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PopupPortafolioEditarComponent } from '../popups/popup-portafolio-editar/popup-portafolio-editar.component';
import { PopupPortafolioEliminarComponent } from '../popups/popup-portafolio-eliminar/popup-portafolio-eliminar.component';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PopupPortafolioEditarComponent,
    PopupPortafolioEliminarComponent
  ],
  templateUrl: './portafolio.component.html',
  styleUrls: ['./portafolio.component.css']
})
export class PortafolioComponent {

  evidencias = [
    {
      id: 1,
      titulo: 'Proyecto de Investigación',
      descripcion: 'Proyecto de investigación realizado en la Universidad Católica',
      fecha: '2025-04-15'
    },
    {
      id: 2,
      titulo: 'Certificado de Curso Online',
      descripcion: 'Certificado de curso en línea completado de Udemy',
      fecha: '2025-03-20'
    },
    {
      id: 3,
      titulo: 'Publicación Académica',
      descripcion: 'Artículo publicado en una revista académica',
      fecha: '2024-11-05'
    },
    {
      id: 4,
      titulo: 'Curso de Machine Learning',
      descripcion: 'Curso de Machine Learning completado en línea',
      fecha: '2024-10-13'
    }
  ];

  popup: 'editar' | 'eliminar' | null = null;
  seleccionada: any = null;

  // abre popup vacío
  abrirAgregar() {
    this.seleccionada = null;
    this.popup = 'editar';
  }

  abrirEditar(ev: any) {
    this.seleccionada = ev;
    this.popup = 'editar';
  }

  abrirEliminar(ev: any) {
    this.seleccionada = ev;
    this.popup = 'eliminar';
  }

  guardarEvidencia(data: any) {
    if (this.seleccionada) {
      // editar
      const idx = this.evidencias.findIndex(e => e.id === this.seleccionada.id);
      if (idx > -1) {
        this.evidencias[idx] = { ...this.evidencias[idx], ...data };
      }
    } else {
      // agregar
      this.evidencias.push({
        ...data,
        id: Math.floor(Math.random() * 100000)
      });
    }
    this.cerrarPopup();
  }

  confirmarEliminar() {
    if (this.seleccionada) {
      this.evidencias = this.evidencias.filter(e => e.id !== this.seleccionada.id);
    }
    this.cerrarPopup();
  }

  cerrarPopup() {
    this.popup = null;
    this.seleccionada = null;
  }
}

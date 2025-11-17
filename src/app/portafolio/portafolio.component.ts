// src/app/portafolio/portafolio.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PopupEditarComponent } from '../popups/popup-editar/popup-editar.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
],
  templateUrl: './portafolio.component.html',
  styleUrls: ['./portafolio.component.css']
})
export class PortafolioComponent {

  // 🚀 Ahora el portafolio viene del backend
  @Input() data: any = null;

  get evidencias() {
    const evidencias = this.data?.evidencias ?? [];
    console.log("📌 Evidencias recibidas en PortafolioComponent:", evidencias);
    return evidencias;
  }

  popup: 'editar' | 'eliminar' | null = null;
  seleccionada: any = null;

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
    if (!this.data) return;

    if (this.seleccionada) {
      // editar evidencia existente
      const idx = this.data.evidencias.findIndex((e: any) => e.id === this.seleccionada.id);
      if (idx > -1) this.data.evidencias[idx] = { ...this.data.evidencias[idx], ...data };
    } else {
      // agregar nueva evidencia
      this.data.evidencias.push({
        ...data,
        id: Math.floor(Math.random() * 999999)
      });
    }

    this.cerrarPopup();
  }

  confirmarEliminar() {
    if (!this.data) return;

    if (this.seleccionada) {
      this.data.evidencias = this.data.evidencias.filter((e: any) => e.id !== this.seleccionada.id);
    }
    this.cerrarPopup();
  }

  cerrarPopup() {
    this.popup = null;
    this.seleccionada = null;
  }
}

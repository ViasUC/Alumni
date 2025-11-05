import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PopupDetalleComponent } from '../popups/popup-detalle/popup-detalle.component';
import { PopupPostulacionComponent } from '../popups/popup-postulacion/popup-postulacion.component';
import { PopupEditarComponent } from '../popups/popup-editar/popup-editar.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupConfirmarComponent } from '../popups/popup-confirmar/popup-confirmar.component';
import { PopupPostulanteComponent } from '../popups/popup-postulante/popup-postulante.component';

@Component({
  selector: 'app-oportunidades',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PanelListaComponent,
    PopupDetalleComponent,
    PopupPostulacionComponent,
    PopupEditarComponent,
    PopupEliminarComponent,
    PopupConfirmarComponent,
    PopupPostulanteComponent
  ],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.css']
})
export class OportunidadesComponent {

  oportunidades = [
    {
      id: 1,
      titulo: 'Pasantía en CBA',
      descripcion: 'Programa de pasantías para estudiantes de informática.',
      requisitos: 'Ser alumno avanzado',
      ubicacion: 'Asunción',
      modalidad: 'Presencial',
      fechaPublicacion: '2025-11-01',
      fechaCierre: '2025-11-30',
      estado: 'Activa',
      creadaPorUsuario: false,
      postulado: false,
      postulante: [] // en las ajenas no se usa
    },
    {
      id: 2,
      titulo: 'Asistente de Laboratorio UCA',
      descripcion: 'Soporte técnico en laboratorios de la FACYT.',
      requisitos: 'Conocimientos básicos de redes',
      ubicacion: 'Campus UCA',
      modalidad: 'Presencial',
      fechaPublicacion: '2025-11-02',
      fechaCierre: '2025-11-15',
      estado: 'Activa',
      creadaPorUsuario: true,
      postulado: false,
      postulante: [
        { nombre: 'María González', fecha: '2025-11-03', portafolio: '/portafolio' },
        { nombre: 'Juan Pérez', fecha: '2025-11-04', portafolio: '/portafolio' }
      ]
    }
  ];

  popup: 'detalle' | 'postulacion' | 'editar' | 'eliminar' | 'confirmar' | 'postulante' | null = null;
  seleccionada: any = null;

  abrirDetalle(op: any) {
    this.seleccionada = op;
    this.popup = 'detalle';
  }

  abrirAgregar() {
    this.seleccionada = null;
    this.popup = 'editar';
  }

  abrirEditar(op: any) {
    this.seleccionada = op;
    this.popup = 'editar';
  }

  abrirEliminar(op: any) {
    this.seleccionada = op;
    this.popup = 'eliminar';
  }

  abrirPostulantes(op: any) {
    this.seleccionada = op;
    this.popup = 'postulante';
  }

  marcarPostulado(op: any) {
    const found = this.oportunidades.find(o => o.id === op.id);
    if (found) {
      found.postulado = true;
      this.seleccionada = found;
      this.popup = 'postulacion';
    }
  }

  togglePostulacion(op: any) {
  op.postulado = !op.postulado;
  if (op.postulado) {
    this.seleccionada = op;
    this.popup = 'postulacion';
  }
}
  guardarOportunidad(form: any) {
    if (this.seleccionada) {
      const idx = this.oportunidades.findIndex(o => o.id === this.seleccionada.id);
      if (idx > -1) {
        this.oportunidades[idx] = {
          ...this.oportunidades[idx],
          ...form
        };
      }
    } else {
      this.oportunidades.push({
        ...form,
        id: Math.floor(Math.random() * 100000),
        creadaPorUsuario: true,
        postulado: false,
        postulantes: []
      });
    }
    this.cerrarPopup();
  }

  confirmarEliminar() {
    if (this.seleccionada) {
      this.oportunidades = this.oportunidades.filter(o => o.id !== this.seleccionada.id);
    }
    this.cerrarPopup();
  }

  cerrarPopup() {
    this.popup = null;
    this.seleccionada = null;
  }
}

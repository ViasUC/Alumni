// src/app/descubrir/descubrir.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface UsuarioDescubrir {
  id: number;
  nombre: string;
  apellido: string;
  carrera: string;
  rol: string;
  ubicacion: string;
  conectado: boolean;      // ya somos contactos?
  solicitudEnviada: boolean; // ya le mandé solicitud
}

@Component({
  selector: 'app-descubrir',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelListaComponent],
  templateUrl: './descubrir.component.html',
  styleUrls: ['./descubrir.component.css'],
})
export class DescubrirComponent {
  // lo que escribe el usuario en la barra
  termino = '';

  // mock hasta que conectemos al back
  usuarios: UsuarioDescubrir[] = [
    {
      id: 1,
      nombre: 'María',
      apellido: 'Fernández',
      carrera: 'Ing. Informática',
      rol: 'Egresada',
      ubicacion: 'Asunción',
      conectado: false,
      solicitudEnviada: false,
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Gómez',
      carrera: 'Adm. de Empresas',
      rol: 'Egresado',
      ubicacion: 'San Lorenzo',
      conectado: false,
      solicitudEnviada: true,
    },
    {
      id: 3,
      nombre: 'Laura',
      apellido: 'Benítez',
      carrera: 'Arquitectura',
      rol: 'Docente',
      ubicacion: 'Lambaré',
      conectado: true,
      solicitudEnviada: false,
    },
    {
      id: 4,
      nombre: 'Jorge',
      apellido: 'Acosta',
      carrera: 'Ing. Industrial',
      rol: 'Egresado',
      ubicacion: 'Asunción',
      conectado: false,
      solicitudEnviada: false,
    },
  ];

  // filtro en memoria
  get usuariosFiltrados(): UsuarioDescubrir[] {
    const t = this.termino.trim().toLowerCase();
    if (!t) return this.usuarios;
    return this.usuarios.filter((u) => {
      return (
        u.nombre.toLowerCase().includes(t) ||
        u.apellido.toLowerCase().includes(t) ||
        u.carrera.toLowerCase().includes(t) ||
        u.rol.toLowerCase().includes(t)
      );
    });
  }

  conectar(u: UsuarioDescubrir) {
    // si ya está conectado no hacemos nada
    if (u.conectado) return;
    u.solicitudEnviada = true;
    // acá después pegás al back: POST /solicitudes
  }

  cancelarSolicitud(u: UsuarioDescubrir) {
    u.solicitudEnviada = false;
    // acá después DELETE /solicitudes/:id
  }
}

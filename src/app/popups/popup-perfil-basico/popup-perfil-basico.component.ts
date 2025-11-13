import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PerfilBasico {
  nombre: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  titulo?: string;        // Título universitario
  anioEgreso?: number;
  rol?: string;           // Egresado, Alumno, etc.
}

@Component({
  selector: 'app-popup-perfil-basico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-perfil-basico.component.html',
  styleUrls: ['./popup-perfil-basico.component.css'],
})
export class PopupPerfilBasicoComponent {
  @Input() perfil!: PerfilBasico;
  @Output() cerrar = new EventEmitter<void>();
}

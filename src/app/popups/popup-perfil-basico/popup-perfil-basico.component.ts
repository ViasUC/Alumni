import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PerfilBasico {
  nombre: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  titulo?: string;
  anioEgreso?: number;
  rol?: string;
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

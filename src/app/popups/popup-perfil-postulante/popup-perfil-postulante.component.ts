import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-popup-perfil-postulante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-perfil-postulante.component.html',
  styleUrls: ['./popup-perfil-postulante.component.css']
})
export class PopupPerfilPostulanteComponent {

  // 👇 Ambos inputs, para soportar pantallas nuevas y viejas
  @Input() postulante: any = null;
  @Input() data: any = null;

  @Output() cerrar = new EventEmitter<void>();

  // 👇 Getter único para evitar romper compatibilidad
  get perfil() {
    return this.postulante ?? this.data;
  }

  cerrarPopup() {
    this.cerrar.emit();
  }
}

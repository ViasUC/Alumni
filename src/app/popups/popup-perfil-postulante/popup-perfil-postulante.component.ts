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

  @Input() data: any;   // <--- AHORA CONSISTENTE
  @Output() cerrar = new EventEmitter<void>();

  get perfil() {
    return this.data;
  }
}

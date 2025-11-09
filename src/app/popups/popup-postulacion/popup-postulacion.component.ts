import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-postulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-postulacion.component.html',
  styleUrls: ['./popup-postulacion.component.css']
})
export class PopupPostulacionComponent {
  @Output() cerrar = new EventEmitter<void>();
}

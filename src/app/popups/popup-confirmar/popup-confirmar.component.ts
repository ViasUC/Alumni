import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-confirmar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-confirmar.component.html',
  styleUrls: ['./popup-confirmar.component.css']
})
export class PopupConfirmarComponent {
  @Output() cancelar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-registrar',
  imports: [],
  templateUrl: './popup-registrar.component.html',
  styleUrl: './popup-registrar.component.css'
})
export class PopupRegistrarComponent {
    @Output() aceptar = new EventEmitter<void>();
}

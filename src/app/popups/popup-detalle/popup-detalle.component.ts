import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-detalle.component.html',
  styleUrls: ['./popup-detalle.component.css']
})
export class PopupDetalleComponent {
  @Input() data: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() postular = new EventEmitter<void>();
}

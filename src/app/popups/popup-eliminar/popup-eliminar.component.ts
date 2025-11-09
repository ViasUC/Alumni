import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-eliminar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-eliminar.component.html',
  styleUrls: ['./popup-eliminar.component.css']
})
export class PopupEliminarComponent {
  @Input() data: any;
  @Output() cancelar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
}

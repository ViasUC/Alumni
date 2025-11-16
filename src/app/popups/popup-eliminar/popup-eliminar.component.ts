import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-eliminar',
  standalone: true,
  templateUrl: './popup-eliminar.component.html',
  styleUrls: ['./popup-eliminar.component.css']
})
export class PopupEliminarComponent {

  @Input() data: any;
  @Input() mensaje: string = "¿Deseás eliminar este elemento?";

  @Output() cancelar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

  onEliminar() {
    this.eliminar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }
}

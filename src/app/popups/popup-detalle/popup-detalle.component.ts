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
  @Input() set data(value: any) {
  this._data = value;
  this.postulado = !!value?.postulado;
}
  get data() {
  return this._data;
}
  private _data: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() postular = new EventEmitter<any>();

  postulado = false;

  onPostular() {
    this.postulado = true;
    this.postular.emit(this.data);
  }
}

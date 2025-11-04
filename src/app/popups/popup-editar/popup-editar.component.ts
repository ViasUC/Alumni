import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup-editar.component.html',
  styleUrls: ['./popup-editar.component.css']
})
export class PopupEditarComponent implements OnInit {
  @Input() data: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  form: any = {
    titulo: '',
    descripcion: '',
    requisitos: '',
    ubicacion: '',
    modalidad: '',
    fechaPublicacion: '',
    fechaCierre: '',
    estado: 'Activa'
  };

  ngOnInit(): void {
    if (this.data) this.form = { ...this.data };
  }

  onSubmit() {
    this.guardar.emit(this.form);
  }
}

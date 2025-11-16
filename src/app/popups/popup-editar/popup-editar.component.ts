import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup-editar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './popup-editar.component.html',
  styleUrls: ['./popup-editar.component.css']
})
export class PopupEditarComponent {

  @Input() data: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  form: any = {};

  ngOnInit() {

    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const idUsuario = Number(usuario?.idUsuario) || 0;

    // 🔵 MODO EDICIÓN
    if (this.data) {
      this.form = {
        idOportunidad: this.data.idOportunidad,
        idCreador: this.data.idCreador,
        titulo: this.data.titulo,
        descripcion: this.data.descripcion,
        requisitos: this.data.requisitos,
        ubicacion: this.data.ubicacion,
        modalidad: this.data.modalidad,
        tipo: this.data.tipo,
        fechaPublicacion: this.data.fechaPublicacion?.split("T")[0] || "",
        fechaCierre: this.data.fechaCierre?.split("T")[0] || "",
        estado: this.data.estado
      };
      return;
    }

    // 🔵 MODO CREACIÓN
    this.form = {
      idCreador: idUsuario,
      idEmpresa: 1,
      titulo: "",
      descripcion: "",
      requisitos: "",
      ubicacion: "",
      modalidad: "",
      tipo: "General",
      fechaPublicacion: "",
      fechaCierre: "",
      estado: "activo"
    };
  }

  onSubmit() {
    this.guardar.emit(this.form);
  }
}

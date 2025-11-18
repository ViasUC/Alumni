import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopupRegistrarComponent as PopupRegistrarComponent } from "../popups/popup-registrar/popup-registrar.component";

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PopupRegistrarComponent],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
})
export class RegistrarComponent {

  nombre = '';
  apellido = '';
  email = '';
  password = '';
  rol = '';
  errorMsg = '';

  mostrarPopup = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.nombre || !this.apellido || !this.email || !this.password || !this.rol) {
      this.errorMsg = "Todos los campos son obligatorios.";
      return;
    }

    this.errorMsg = "";

    console.log("Registrando usuario...", {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      rol: this.rol
    });

    // 👉 Mostrar popup de éxito
    this.mostrarPopup = true;
  }

  cerrarPopupYAbrirLogin() {
    this.mostrarPopup = false;
    this.router.navigate(['/login']);
  }
}

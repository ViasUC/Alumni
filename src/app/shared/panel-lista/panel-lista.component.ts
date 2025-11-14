import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-lista.component.html',
  styleUrls: ['./panel-lista.component.css']
})
export class PanelListaComponent implements OnInit {

  nombreUsuario: string = '';
  iniciales: string = '';
  activo: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  private cargarUsuario(): void {
    const user = this.authService.getUsuarioActual();
    console.log("USER FROM AUTH:", user);

    if (user) {
      const nombre = user.nombre || '';
      const apellido = user.apellido || '';

      this.nombreUsuario = `${nombre} ${apellido}`.trim();
      this.iniciales = this.getIniciales(nombre, apellido);

      console.log("[PanelLista] Usuario cargado:", this.nombreUsuario, "→", this.iniciales);
    } else {
      console.warn("[PanelLista] No se encontró usuario en AuthService.");
      this.nombreUsuario = '';
      this.iniciales = '';
    }
  }

  private getIniciales(nombre: string, apellido: string): string {
    let ini = '';

    if (nombre && nombre.length > 0) {
      ini += nombre.charAt(0).toUpperCase();
    }

    if (apellido && apellido.length > 0) {
      ini += apellido.charAt(0).toUpperCase();
    }

    return ini;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.detectarActivo();
    this.cargarUsuario();
  }

  irAlPerfil(): void {
  this.router.navigate(['/perfil']);
}


  /** Detecta URL y marca automáticamente la pestaña activa */
  private detectarActivo(): void {
    const url = this.router.url;

    if (url.startsWith('/oportunidades')) this.activo = 'oportunidades';
    else if (url.startsWith('/mi-actividad')) this.activo = 'actividad';
    else if (url.startsWith('/descubrir')) this.activo = 'descubrir';
    else if (url.startsWith('/red-personal')) this.activo = 'red';
    else if (url.startsWith('/perfil')) this.activo = 'perfil';
    else this.activo = '';
  }

  private cargarUsuario(): void {
    const user = this.authService.getUsuarioActual();
    console.log("USER FROM AUTH:", user);

    if (user) {
      const nombre = user.nombre || '';
      const apellido = user.apellido || '';

      this.nombreUsuario = `${nombre} ${apellido}`.trim();
      this.iniciales = this.getIniciales(nombre, apellido);
    } else {
      console.warn("[PanelLista] No se encontró usuario en AuthService.");
      this.nombreUsuario = '';
      this.iniciales = '';
    }
  }

  private getIniciales(nombre: string, apellido: string): string {
    let ini = '';
    if (nombre) ini += nombre[0].toUpperCase();
    if (apellido) ini += apellido[0].toUpperCase();
    return ini;
  }
}

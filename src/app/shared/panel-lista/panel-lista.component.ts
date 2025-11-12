import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-lista.component.html',
  styleUrls: ['./panel-lista.component.css']
})
export class PanelListaComponent implements OnInit {
  @Input() activo: 'oportunidades' | 'actividad' | 'descubrir' | 'red' | 'portafolio' | 'posgrados' | 'perfil' = 'oportunidades';
  @Input() nombreUsuario: string | null = null; // opcional

  iniciales = 'U?';

  ngOnInit() {
    // Si no te pasan el nombre, intentá leerlo de sessionStorage
    const base = this.nombreUsuario ?? sessionStorage.getItem('userName') ?? 'Horacio Aranda';
    this.iniciales = this.getInitials(base);
  }

  private getInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}

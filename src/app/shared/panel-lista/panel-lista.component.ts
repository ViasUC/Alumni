import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-lista.component.html',
  styleUrls: ['./panel-lista.component.css']
})
export class PanelListaComponent {
  // para marcar la pestaña activa desde cada pantalla
  @Input() activo: string = 'oportunidades';
}

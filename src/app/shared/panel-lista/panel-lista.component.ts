import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-lista.component.html',
  styleUrls: ['./panel-lista.component.css']
})
export class PanelListaComponent {
  @Input() titulo = '';
  @Input() accionLabel = '';         // ej: "+ Agregar Oportunidad"
}

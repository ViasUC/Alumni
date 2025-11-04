import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() accionLabel = '';
  @Output() accionClick = new EventEmitter<void>();   // 👈 nuevo

  onAccion() {
    this.accionClick.emit();
  }
}

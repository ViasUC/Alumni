import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-endorse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-endorse.component.html',
  styleUrls: ['./popup-endorse.component.css'],
})
export class PopupEndorseComponent {
  @Input() usuario: { nombre: string } | null = null;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}

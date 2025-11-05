import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-popup-postulante',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './popup-postulante.component.html',
  styleUrls: ['./popup-postulante.component.css']
})
export class PopupPostulanteComponent {
  @Input() data: any;
  @Output() cerrar = new EventEmitter<void>();
}

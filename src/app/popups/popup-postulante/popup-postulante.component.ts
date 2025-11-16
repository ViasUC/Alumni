import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-postulante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-postulante.component.html',
  styleUrls: ['./popup-postulante.component.css']
})
export class PopupPostulanteComponent {

  @Input() data: any; 
  @Output() cerrar = new EventEmitter<void>();
  @Output() verPerfil = new EventEmitter<any>();

  postulantes: any[] = [];

  vistaDetalle = false;
  postulanteSeleccionado: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log("📌 INIT POPUP — OPORTUNIDAD:", this.data);
    this.cargarPostulantes();
  }

  cargarPostulantes() {

    console.log("📌 CARGANDO POSTULANTES → idOportunidad:", this.data.idOportunidad);

    const query = `
      query ($idOportunidad: Int!) {
        postulantesPorOportunidad(idOportunidad: $idOportunidad) {
          idUsuario
          nombre
          apellido
          email
          telefono
          ubicacion
          rolPrincipal
          completitud
          fechaPostulacion
        }
      }
    `;

    this.http.post<any>("http://localhost:8080/graphql", {
      query,
      variables: { idOportunidad: Number(this.data.idOportunidad) }
    })
    .subscribe({
      next: (res) => {
        console.log("🔎 RAW GRAPHQL RESPONSE:", res);
  if (res.errors) {
    console.error("🛑 GRAPHQL ERROR:", res.errors);
    console.error("🛑 GRAPHQL ERROR MESSAGE:", res.errors[0].message);
    console.error("🛑 GRAPHQL ERROR PATH:", res.errors[0].path);
    console.error("🛑 GRAPHQL ERROR EXT:", res.errors[0].extensions);
  }

  console.log("🟦 DATA:", res.data);
        this.postulantes = res.data?.postulantesPorOportunidad ?? [];
        console.log("📌 POSTULANTES RECIBIDOS:", this.postulantes);
      },
      error: err => console.error("❌ ERROR CARGANDO POSTULANTES:", err)
    });
  }

  verPerfilPostulante(p: any) {
    this.postulanteSeleccionado = p;
    this.vistaDetalle = true;

    console.log("👤 VER PERFIL →", p);

    // 👉 NECESARIO para que el padre abra su popup
    this.verPerfil.emit(p);
  }

  volverALista() {
    this.vistaDetalle = false;
    this.postulanteSeleccionado = null;
  }

  cerrarPopup() {
    this.cerrar.emit();
  }
}

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
verPerfilCompleto(idUsuario: number) {
  console.log("🔵 CARGANDO PERFIL COMPLETO →", idUsuario);

const query = `
  query ($id: Int!) {
    usuarioById(id: $id) {
      idUsuario
      nombre
      apellido
      email
      telefono
      ubicacion
      rolPrincipal
      completitud

      egresadoData {
        titulo
        anioEgreso
      }
    }

    portafolioPorUsuario(idUsuario: $id) {
      descripcion
      skills
      visibilidad
      ultimaActualizacion

      evidencias {
        idEvidencia
        titulo
        descripcion
        tipo
        recurso
      }
    }
  }
`;



  this.http.post<any>("http://localhost:8080/graphql", {
    query,
    variables: { id: idUsuario }
  })
  .subscribe({
next: (res) => {
  console.log("📌 PERFIL COMPLETO RECIBIDO:", res);

  if (res.errors) {
    console.error("❌ GRAPHQL ERROR:", res.errors);
    return;
  }

  const u = res.data.usuarioById;
  const p = res.data.portafolioPorUsuario;

  this.postulanteSeleccionado = {
    // === Datos personales ===
    idUsuario: u.idUsuario,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    ubicacion: u.ubicacion,
    rolPrincipal: u.rolPrincipal,
    completitud: u.completitud,

    // === Datos de egresado ===
    tituloUniversitario: u.egresadoData?.titulo ?? "",
    anioEgreso: u.egresadoData?.anioEgreso ?? "",

    // === Portafolio ===
    descripcion: p?.descripcion ?? "",
    skills: p?.skills ?? "",
    visibilidad: p?.visibilidad ?? "",
    ultimaActualizacion: p?.ultimaActualizacion ?? "",

    // === Evidencias ===
    evidencias: p?.evidencias ?? []
  };

  console.log("📌 POSTULANTE SELECCIONADO ARMADO:", this.postulanteSeleccionado);

  this.vistaDetalle = true;
}


    ,error: (err) => console.error("❌ ERROR HTTP:", err)
  });
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

  console.log("🟦 VER PERFIL → postulante:", p);

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
      fechaPostulacion
      
      portafolio {
        descripcion
        skills
        visibilidad
        ultimaActualizacion
        evidencias {
          titulo
          descripcion
          tipo
          fecha
        }
      }
    }
  }
`;


  this.http.post<any>("http://localhost:8080/graphql", {
    query,
    variables: { idUsuario: Number(p.idUsuario) }
  })
  .subscribe({
    next: (res) => {

      console.log("📌 RAW GRAPHQL RESPONSE:", JSON.stringify(res, null, 2));

      if (res.errors) {
        console.error("🛑 GRAPHQL ERROR DETECTADO:");
        res.errors.forEach((e: any) => console.error("🔻", e.message));
        return;
      }

      console.log("📌 PERFIL COMPLETO RECIBIDO (OK):", res.data?.usuarioById);

      this.verPerfil.emit(res.data?.usuarioById);
    },
    error: (err) => {
      console.error("❌ ERROR HTTP:", err);
    }
  });
}

  volverALista() {
    this.vistaDetalle = false;
    this.postulanteSeleccionado = null;
  }

  cerrarPopup() {
    this.cerrar.emit();
  }
}

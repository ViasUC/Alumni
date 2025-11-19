import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  const qUsuario = `
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
    }
  `;

  const qPortafolio = `
    query ($id: Int!) {
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
        }
      }
    }
  `;

  const qEndorsements = `
    query ($id: Int!) {
      endorsementsRecibidos(id: $id) {
        idEndorsement
        idUsuarioEmisor
        fechaEndorsement
      }
    }
  `;

  const qUsuarios = `
    query {
      usuarios {
        idUsuario
        nombre
        apellido
        rolPrincipal
      }
    }
  `;

  // Ejecutar todo junto
  Promise.all([
    this.http.post<any>("http://localhost:8080/graphql", { query: qUsuario, variables: { id: idUsuario }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: qPortafolio, variables: { id: idUsuario }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: qEndorsements, variables: { id: idUsuario }}).toPromise(),
    this.http.post<any>("http://localhost:8080/graphql", { query: qUsuarios }).toPromise()
  ])
  .then(([usr, port, endo, allUsers]) => {

    console.log("📌 PERFIL COMPLETO RECIBIDO:", usr);

    const usuario = usr.data?.usuarioById ?? {};
    const portafolio = port.data?.portafolioPorUsuario ?? {};
    const endorsements = endo.data?.endorsementsRecibidos ?? [];
    const usuarios = allUsers.data?.usuarios ?? [];

    // Resolver nombres de emisores
    const endorsementsInfo = endorsements.map((e: any) => {
      const emisor = usuarios.find(
        (u:any) => Number(u.idUsuario) === Number(e.idUsuarioEmisor)
      );
      return {
        id: e.idEndorsement,
        fecha: e.fechaEndorsement,
        nombre: emisor ? `${emisor.nombre} ${emisor.apellido}` : "—",
        rol: emisor?.rolPrincipal ?? "—"
      };
    });

    // Armar objeto final
    this.postulanteSeleccionado = {
      ...usuario,
      tituloUniversitario: usuario.egresadoData?.titulo ?? "",
      anioEgreso: usuario.egresadoData?.anioEgreso ?? "",

      ...portafolio,

      endorsements: endorsementsInfo
    };

    console.log("🟢 POSTULANTE SELECCIONADO ARMADO:", this.postulanteSeleccionado);

    this.vistaDetalle = true;
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

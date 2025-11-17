import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PopupDetalleComponent } from '../popups/popup-detalle/popup-detalle.component';
import { PopupPostulacionComponent } from '../popups/popup-postulacion/popup-postulacion.component';
import { PopupEditarComponent } from '../popups/popup-editar/popup-editar.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupConfirmarComponent } from '../popups/popup-confirmar/popup-confirmar.component';
import { PopupPostulanteComponent } from '../popups/popup-postulante/popup-postulante.component';
import { PopupPerfilPostulanteComponent } from "../popups/popup-perfil-postulante/popup-perfil-postulante.component";

@Component({
  selector: 'app-oportunidades',
  standalone: true,
  imports: [
    CommonModule,
    PanelListaComponent,
    PopupDetalleComponent,
    PopupPostulacionComponent,
    PopupEditarComponent,
    PopupEliminarComponent,
    PopupConfirmarComponent,
    PopupPostulanteComponent,
    PopupPerfilPostulanteComponent
  ],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.css']
})
export class OportunidadesComponent {

  oportunidades: any[] = [];
  popup: any = null;
  seleccionada: any = null;
  modoEdicion = false;

  postulanteSeleccionado: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarOportunidades();
  }

  // ====================================================
// DESPOSTULAR
// ====================================================
despostular(op: any) {

  console.log("🔴 DESPOSTULAR → oportunidad", op.idOportunidad);

  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  const mutation = `
    mutation ($idPostulante: Int!, $idOportunidad: Int!) {
      eliminarPostulacion(
        idPostulante: $idPostulante,
        idOportunidad: $idOportunidad
      )
    }
  `;

  const variables = {
    idPostulante: Number(usuario.idUsuario),
    idOportunidad: Number(op.idOportunidad),
  };

  fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables })
  })
    .then(r => r.json())
    .then(res => {
      console.log("🟡 RESPUESTA DESPOSTULAR:", res);

      if (res.data?.eliminarPostulacion) {
        console.log("✔ DESPOSTULADO!");
        op.postulado = false;   // 🔥 Esto actualiza la UI
      }
    })
    .catch(err => console.error("❌ Error despostulando:", err));
}

  cargarPostulacionesUsuario() {
  const usuarioStr = localStorage.getItem("usuario");
  const user = usuarioStr ? JSON.parse(usuarioStr) : null;
  const idUsuario = Number(user?.idUsuario);

  const query = `
    query ($idUsuario: Int!) {
      postulacionesPorUsuario(idUsuario: $idUsuario) {
        idOportunidad
      }
    }
  `;

  return this.http.post<any>("http://localhost:8080/graphql", {
    query,
    variables: { idUsuario }
  });
}

  // ====================================================
  // CARGAR OPORTUNIDADES
  // ====================================================
cargarOportunidades() {
  const query = `
    query {
      oportunidades {
        idOportunidad
        idCreador
        titulo
        descripcion
        requisitos
        ubicacion
        modalidad
        tipo
        fechaPublicacion
        fechaCierre
        estado
      }
    }
  `;

  this.http.post<any>("http://localhost:8080/graphql", { query })
    .subscribe({
      next: (res) => {

        const usuarioStr = localStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

        const idUsuarioActual = Number(
          usuario?.idUsuario ?? usuario?.idusuario ?? usuario?.id
        );

        this.oportunidades = (res.data?.oportunidades ?? []).map((op: any) => ({
          ...op,
          id: op.idOportunidad,
          creadaPorUsuario: op.idCreador === idUsuarioActual,
          postulante: [],
          postulado: false
        }));

// Luego cargar postulaciones del usuario
this.cargarPostulacionesUsuario().subscribe((resp: any) => {

  console.log("📌 RESPUESTA POSTULACIONES:", resp);

  const userPosts = resp.data?.postulacionesPorUsuario ?? [];
  console.log("📌 LISTA DE POSTULACIONES:", userPosts);

  console.log("📌 LISTA DE OPORTUNIDADES ANTES DE MARCAR:", this.oportunidades);

  this.oportunidades = this.oportunidades.map(op => {
    const fuePostulado = userPosts.some((p: any) => {

      const match =
        Number(p.idOportunidad) === Number(op.idOportunidad);

      console.log(
        `🔍 comparando op.idOportunidad=${op.idOportunidad} ` +
        `con p.idOportunidad=${p.idOportunidad} => MATCH=${match}`
      );

      return match;
    });

    if (fuePostulado) {
      console.log(`✅ MARCADO COMO POSTULADO → oportunidad ${op.idOportunidad}`);
    }

    return {
      ...op,
      postulado: fuePostulado
    };
  });

  console.log("📌 LISTA DE OPORTUNIDADES FINAL:", this.oportunidades);
});

      },
      error: err => console.error("❌ Error cargando oportunidades:", err)
    });
}


  // POPUPS
  abrirDetalle(op: any) { this.seleccionada = op; this.popup = 'detalle'; }
  abrirAgregar() { this.modoEdicion = false; this.seleccionada = null; this.popup = 'editar'; }

  abrirEditar(op: any) {
    console.log("🟦 EDITAR → OPORTUNIDAD SELECCIONADA:", op);
    this.modoEdicion = true;
    this.seleccionada = op;
    this.popup = 'editar';
  }

  abrirEliminar(op: any) { this.seleccionada = op; this.popup = 'eliminar'; }
  abrirPostulantes(op: any) { this.seleccionada = op; this.popup = 'postulante'; }

  verPerfilPostulante(p: any) {
  console.log("📌 VER PERFIL → postulante:", p);

  const query = `
    query ($idUsuario: Int!) {
      usuarioById(id: $idUsuario) {
        idUsuario
        nombre
        apellido
        email
        telefono
        ubicacion
        titulo
        anioEgreso
        rolPrincipal
        completitud

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
  }).subscribe(res => {
    console.log("📌 PERFIL COMPLETO RECIBIDO:", res);

    this.postulanteSeleccionado = res.data?.usuarioById ?? null;
    this.popup = 'perfilPostulante';
  });
}


togglePostulacion(op: any) {

  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  const idPostulante = Number(usuario.idUsuario);
  const idOfertante = Number(op.idCreador);

  const mutation = `
    mutation Postular(
      $idOportunidad: Int!,
      $idPostulante: Int!,
      $idOfertante: Int!
    ) {
      crearPostulacion(
        idOportunidad: $idOportunidad,
        idPostulante: $idPostulante,
        idOfertante: $idOfertante
      ) {
        idPostulacion
      }
    }
  `;

  const variables = {
    idOportunidad: Number(op.idOportunidad),
    idPostulante,
    idOfertante
  };

  fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables })
  })
    .then(r => r.json())
    .then(res => {
      console.log("🟢 POSTULACIÓN CREADA:", res);

      op.postulado = true; // marcas en UI
    })
    .catch(err => console.error("❌ Error postulando:", err));
}


  marcarPostulado(op: any) {
    const found = this.oportunidades.find(o => o.id === op.id);
    if (found) {
      found.postulado = true;
      this.seleccionada = found;
      this.popup = 'postulacion';
    }
  }

  // ====================================================
  // CREAR / EDITAR OPORTUNIDAD
  // ====================================================
  guardarOportunidad(form: any) {

    console.log("============== GUARDAR OPORTUNIDAD ==============");
    console.log("🟦 modoEdicion:", this.modoEdicion);
    console.log("🟦 Form enviado:", form);
    console.log("🟦 Seleccionada:", this.seleccionada);

    // MUTATION DE CREAR
    const crearMutation = `
      mutation Crear(
        $idEmpresa: Int,
        $idCreador: Int!,
        $titulo: String!,
        $descripcion: String!,
        $requisitos: String!,
        $ubicacion: String!,
        $modalidad: String!,
        $tipo: String!,
        $fechaPublicacion: String,
        $fechaCierre: String,
        $estado: String!
      ) {
        crearOportunidad(
          idEmpresa: $idEmpresa,
          idCreador: $idCreador,
          titulo: $titulo,
          descripcion: $descripcion,
          requisitos: $requisitos,
          ubicacion: $ubicacion,
          modalidad: $modalidad,
          tipo: $tipo,
          fechaPublicacion: $fechaPublicacion,
          fechaCierre: $fechaCierre,
          estado: $estado
        ) {
          idOportunidad
        }
      }
    `;

    // MUTATION DE EDITAR
const editarMutation = `
  mutation Editar(
    $idOportunidad: Int!,
    $idCreador: Int!,
    $titulo: String!,
    $descripcion: String!,
    $requisitos: String!,
    $ubicacion: String!,
    $modalidad: String!,
    $tipo: String!,
    $fechaCierre: String,
    $estado: String!
  ) {
    actualizarOportunidad(
      idOportunidad: $idOportunidad,
      idCreador: $idCreador,
      titulo: $titulo,
      descripcion: $descripcion,
      requisitos: $requisitos,
      ubicacion: $ubicacion,
      modalidad: $modalidad,
      tipo: $tipo,
      fechaCierre: $fechaCierre,
      estado: $estado
    ) {
      idOportunidad
    }
  }
`;


    // ID del usuario actual (auditoría backend)
    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const idUsuarioActual = Number(usuario?.idUsuario);

    const mutation = this.modoEdicion ? editarMutation : crearMutation;

    const variables = this.modoEdicion
      ? {
          idOportunidad: Number(this.seleccionada.idOportunidad),
          idCreador: idUsuarioActual, // este SIEMPRE es el usuario que edita
          titulo: form.titulo,
          descripcion: form.descripcion,
          requisitos: form.requisitos,
          ubicacion: form.ubicacion,
          modalidad: form.modalidad,
          tipo: form.tipo,
          fechaCierre: form.fechaCierre ? form.fechaCierre + "T00:00:00" : null,
          estado: form.estado
        }
      : {
          ...form,
          idEmpresa: null,
          idCreador: idUsuarioActual,
          fechaPublicacion: form.fechaPublicacion ? form.fechaPublicacion + "T00:00:00" : null,
          fechaCierre: form.fechaCierre ? form.fechaCierre + "T00:00:00" : null
        };

    console.log("🟧 MUTATION ENVIADA:", mutation);
    console.log("🟧 VARIABLES ENVIADAS:", variables);

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables })
    })
      .then(async r => {
        const json = await r.json();
        console.log("🟥 GRAPHQL RESPONSE:", json);
        return json;
      })
      .then(res => {

        if (res.errors) {
          console.error("❌ Error GraphQL:", res.errors);
          return;
        }

        this.cargarOportunidades();
        this.cerrarPopup();
      })
      .catch(err => console.error("❌ Error creando/editando:", err));
  }

confirmarEliminar() {

  const id = Number(this.seleccionada?.idOportunidad);

  console.log("🗑️ ID capturado para eliminar:", id);

  if (!id) {
    console.error("❌ ERROR: idOportunidad inválido o undefined");
    return;
  }

  const mutation = `
    mutation Eliminar($idOportunidad: Int!) {
      eliminarOportunidad(idOportunidad: $idOportunidad)
    }
  `;

  const variables = { idOportunidad: id };

  console.log("📤 Enviando DELETE:", variables);

  fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables })
  })
    .then(r => r.json())
    .then(res => {

      console.log("📥 RESPUESTA DELETE:", res);

      if (res.errors) {
        console.error("❌ Error GraphQL:", res.errors);
        return;
      }

      // Si vuelve true → recargar lista
      if (res.data.eliminarOportunidad === true) {
        console.log("✔ Eliminado correctamente");
        this.cargarOportunidades();
      } else {
        console.warn("❗ DELETE devolvió false");
      }

      this.cerrarPopup();
    })
    .catch(err => console.error("❌ Error eliminando:", err));
}


  cerrarPopup() {
    this.popup = null;
    this.seleccionada = null;
  }
}

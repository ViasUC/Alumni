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
    this.postulanteSeleccionado = p;
    this.popup = 'perfilPostulante';
  }

  togglePostulacion(op: any) {
    op.postulado = !op.postulado;
    if (op.postulado) {
      this.seleccionada = op;
      this.popup = 'postulacion';
    }
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

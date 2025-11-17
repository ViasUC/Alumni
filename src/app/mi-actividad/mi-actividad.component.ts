import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// panel y popups
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';
import { PopupDetalleComponent } from '../popups/popup-detalle/popup-detalle.component';
import { PopupEditarComponent } from '../popups/popup-editar/popup-editar.component';
import { PopupEliminarComponent } from '../popups/popup-eliminar/popup-eliminar.component';
import { PopupPostulanteComponent } from '../popups/popup-postulante/popup-postulante.component';
import { PopupConfirmarComponent } from '../popups/popup-confirmar/popup-confirmar.component';

@Component({
  selector: 'app-mi-actividad',
  standalone: true,
  templateUrl: './mi-actividad.component.html',
  styleUrls: ['./mi-actividad.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    PanelListaComponent,
    PopupDetalleComponent,
    PopupEditarComponent,
    PopupEliminarComponent,
    PopupPostulanteComponent,
    PopupConfirmarComponent
  ]
})
export class MiActividadComponent {

  popup: any = '';
  motivoPopup: any = null;
  seleccionada: any = null;

  filtroFechaOpo = '';
  filtroEstadoOpo = 'todas';

  filtroFechaPost = '';
  filtroEstadoPost = 'todas';

  oportunidades: any[] = [];
  misOportunidades: any[] = [];
  misPostulaciones: any[] = [];

  constructor(private http: HttpClient) {}

  // =====================================================
  // INIT
  // =====================================================
  ngOnInit() {
    console.log("🔥 MI ACTIVIDAD INIT");
    this.cargarTodo();
  }

  cargarTodo() {
    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    const idUsuario = Number(
      usuario?.idUsuario ?? usuario?.idusuario ?? usuario?.id
    );

    this.cargarOportunidades(idUsuario);
  }

  // =====================================================
  // CARGAR OPORTUNIDADES (MISMAS QUE OPORTUNIDADES.TS)
  // =====================================================
  cargarOportunidades(idUsuario: number) {

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

          const lista = res.data?.oportunidades ?? [];

          this.oportunidades = lista.map((op: any) => ({
            ...op,
            id: op.idOportunidad,
            creadaPorUsuario: Number(op.idCreador) === Number(idUsuario),
            postulado: false
          }));

          this.marcarPostulaciones(idUsuario);
        },
        error: err => console.error("❌ Error cargando oportunidades:", err)
      });
  }

  // =====================================================
  // MARCAR POSTULACIONES → MISMO CÓDIGO QUE OPORTUNIDADES.TS
  // =====================================================
  marcarPostulaciones(idUsuario: number) {

    const query = `
      query ($idUsuario: Int!) {
        postulacionesPorUsuario(idUsuario: $idUsuario) {
          idOportunidad
          fechaPostulacion
        }
      }
    `;

    this.http.post<any>("http://localhost:8080/graphql", {
      query,
      variables: { idUsuario }
    })
    .subscribe(resp => {

      const userPosts = resp.data?.postulacionesPorUsuario ?? [];

      // marcar postulado dentro de la lista
      this.oportunidades = this.oportunidades.map(op => ({
        ...op,
        postulado: userPosts.some((p: any) =>
          Number(p.idOportunidad) === Number(op.idOportunidad)
        )
      }));

      // separar las que yo creé
      this.misOportunidades = this.oportunidades.filter(
        op => op.creadaPorUsuario
      );

      // separar las que yo postulé
      this.misPostulaciones = this.oportunidades
        .filter(op => op.postulado && !op.creadaPorUsuario)
        .map(op => ({
          id: op.idOportunidad,
          idOportunidad: op.idOportunidad,
          oportunidadTitulo: op.titulo,
          descripcion: op.descripcion,
          ubicacion: op.ubicacion,
          modalidad: op.modalidad,
          fechaPostulacion:
            userPosts.find((p: any) =>
              Number(p.idOportunidad) === Number(op.idOportunidad)
            )?.fechaPostulacion ?? "",
          estado: op.estado?.toLowerCase() ?? "activo"
        }));
    });
  }

  // =====================================================
  // FILTROS
  // =====================================================
get oportunidadesFiltradas() {
  return this.misOportunidades.filter(op => {
    const f1 =
      !this.filtroFechaOpo ||
      op.fechaPublicacion?.substring(0, 10) === this.filtroFechaOpo;

    const f2 =
      this.filtroEstadoOpo === 'todas' ||
      op.estado === this.filtroEstadoOpo;

    return f1 && f2;
  });
}


get postulacionesFiltradas() {
  return this.misPostulaciones.filter(p => {
    const f1 = !this.filtroFechaPost ||
               p.fechaPostulacion?.startsWith(this.filtroFechaPost);
    const f2 = this.filtroEstadoPost === 'todas' ||
               p.estado === this.filtroEstadoPost;
    return f1 && f2;
  });
}


  // =====================================================
  // ACCIONES POPUP
  // =====================================================
  editarOportunidad(op: any) {
    this.seleccionada = op;
    this.popup = 'editar';
  }

  eliminarOportunidad(op: any) {
    this.seleccionada = op;
    this.motivoPopup = 'eliminarOportunidad';
    this.popup = 'eliminar';
  }

  abrirPostulantes(op: any) {
    this.seleccionada = op;
    this.popup = 'postulante';
  }

despostularPostulacion(p: any) {

  console.log("🔴 DESPOSTULAR → postulacion", p);

  const usuarioStr = localStorage.getItem("usuario");
  const user = usuarioStr ? JSON.parse(usuarioStr) : null;
  const idUsuario = Number(user?.idUsuario);

  const mutation = `
    mutation ($idPostulante: Int!, $idOportunidad: Int!) {
      eliminarPostulacion(
        idPostulante: $idPostulante,
        idOportunidad: $idOportunidad
      )
    }
  `;

  const variables = {
    idPostulante: idUsuario,
    idOportunidad: Number(p.id)
  };

  fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables })
  })
    .then(r => r.json())
    .then(res => {

      console.log("🟢 RESPUESTA DESPOSTULAR:", res);

      if (res.data?.eliminarPostulacion) {

        console.log("✔ DESPOSTULADO!");

        // 🔥 Solo eliminamos esa una
        this.misPostulaciones = this.misPostulaciones.filter(
          x => x.id !== p.id
        );

        // 🔥 Recargar solo postulaciones SIN romper nada
        this.marcarPostulaciones(idUsuario);
      }
    })
    .catch(err => console.error("❌ Error despostulando:", err));
}



  verDetallePostulacion(p: any) {
    this.seleccionada = {
      titulo: p.oportunidadTitulo,
      descripcion: p.descripcion,
      ubicacion: p.ubicacion,
      modalidad: p.modalidad,
      fecha: p.fechaPostulacion,
      estado: p.estado,
      soloLectura: true
    };
    this.popup = 'detalle';
  }

  cerrarPopup() {
    this.popup = '';
    this.motivoPopup = null;
    this.seleccionada = null;
  }

guardarOportunidad(form: any) {

  console.log("============== GUARDAR OPORTUNIDAD (MI ACTIVIDAD) ==============");
  console.log("🟦 Form enviado:", form);
  console.log("🟦 Seleccionada:", this.seleccionada);

  // Mutation EDITAR
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

  // ID del usuario actual
  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const idUsuarioActual = Number(usuario?.idUsuario);

  // Variables
  const variables = {
    idOportunidad: Number(this.seleccionada.idOportunidad),
    idCreador: idUsuarioActual,
    titulo: form.titulo,
    descripcion: form.descripcion,
    requisitos: form.requisitos,
    ubicacion: form.ubicacion,
    modalidad: form.modalidad,
    tipo: form.tipo,
    fechaCierre: form.fechaCierre ? form.fechaCierre + "T00:00:00" : null,
    estado: form.estado
  };

  console.log("🟧 MUTATION ENVIADA:", editarMutation);
  console.log("🟧 VARIABLES:", variables);

  // Enviar al servidor
  fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: editarMutation, variables })
  })
    .then(r => r.json())
    .then(res => {

      console.log("🟥 RESPUESTA EDITAR:", res);

      if (res.errors) {
        console.error("❌ Error GraphQL:", res.errors);
        return;
      }

      // Recargar todo para que refleje en UI
      this.cargarTodo();

      this.cerrarPopup();
    })
    .catch(err => console.error("❌ Error editando:", err));
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

      if (res.data.eliminarOportunidad === true) {
        console.log("✔ Eliminado correctamente");
        this.cargarTodo();   // 🔥 recargar lista de oportunidades y postulaciones
      } else {
        console.warn("❗ DELETE devolvió false");
      }

      this.cerrarPopup();
    })
    .catch(err => console.error("❌ Error eliminando:", err));
}
}

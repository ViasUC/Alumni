// ✅ Cambios mínimos hechos, lo demás queda igual

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelListaComponent } from '../shared/panel-lista/panel-lista.component';

interface Evidencia {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha: string;
  propia: boolean;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelListaComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {

  constructor(private http: HttpClient) {}

  editando = false;
  mostrarPopup = false;

  perfil: any = {
    nombre: '',
    apellido: '',
    ubicacion: '',
    telefono: '',
    email: '',
    titulo: '',
    anioEgreso: '',
    rol: '',
    completitud: 0
  };

  portafolio = {
    descripcion: '',
    skills: '',
    visibilidad: '',
    ultimaActualizacion: '',
  };

  evidencias: Evidencia[] = [];

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const user = sessionStorage.getItem('user');
    if (!user) return;

    const userObj = JSON.parse(user);
    const userId = Number(userObj.idUsuario);

    const query = `
      query PerfilUsuario($id: Int!) {
        usuarioById(id: $id) {
          idUsuario
          nombre
          apellido
          email
          telefono
          ubicacion
          rolPrincipal
          completitud

          adminData {
            titulo
            descripcion
          }

          egresadoData {
            anioEgreso
            titulo
          }
        }

        portafolioPorUsuario(idUsuario: $id) {
          idPortafolio
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

    this.http.post<any>('http://localhost:8080/graphql', {
      query,
      variables: { id: userId }
    })
    .subscribe({
      next: (res) => {
        // === PERFIL ===
        const u = res.data?.usuarioById;
        if (u) {
          this.perfil = {
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
            telefono: u.telefono,
            ubicacion: u.ubicacion,
            rol: u.rolPrincipal,
            completitud: u.completitud,
            titulo: u.egresadoData?.titulo ?? null,
            descripcion: u.adminData?.descripcion ?? null,
            anioEgreso: u.egresadoData?.anioEgreso ?? null
          };
        }

        // === PORTAFOLIO ===
        const p = res.data?.portafolioPorUsuario;

        if (p) {
          this.portafolio = {
            descripcion: p.descripcion,
            skills: p.skills,
            visibilidad: p.visibilidad,
            ultimaActualizacion: p.ultimaActualizacion
          };

          // === EVIDENCIAS ===
          this.evidencias = (p.evidencias || []).map((e: any) => ({
            id: e.idEvidencia,
            titulo: e.titulo,
            descripcion: e.descripcion,
            tipo: e.tipo,
            fecha: p.ultimaActualizacion,
            propia: true
          }));
        } else {
          this.evidencias = [];
        }
      },

      error: (err) => console.error("❌ Error cargando perfil:", err)
    });
  }

  habilitarEdicion() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarEdicion() {
    this.mostrarPopup = true;
  }

confirmarGuardado() {

  const user = sessionStorage.getItem('user');
  if (!user) return;

  const userObj = JSON.parse(user);
  const userId = Number(userObj.idUsuario);

  // === Mutation Usuario ===
  const mutationUsuario = `
    mutation ActualizarUsuario($id: Int!, $input: UsuarioInput) {
      actualizarUsuario(idUsuario: $id, input: $input) {
        idUsuario
        nombre
        apellido
        telefono
        ubicacion
        email
      }
    }
  `;

  const inputUsuario = {
    nombre: this.perfil.nombre,
    apellido: this.perfil.apellido,
    telefono: this.perfil.telefono,
    ubicacion: this.perfil.ubicacion,
    email: this.perfil.email
  };

  // === Ejecutar actualizarUsuario ===
  this.http.post<any>("http://localhost:8080/graphql", {
    query: mutationUsuario,
    variables: { id: userId, input: inputUsuario }
  })
  .subscribe({
    next: (res) => {
      console.log("Usuario actualizado:", res);

      // === SEGUNDA MUTATION (Egresado) ===
      const mutationEgresado = `
        mutation ActualizarEgresado($id: Int!, $input: EgresadoInput!) {
          actualizarEgresado(id: $id, input: $input) {
            idUsuario
            anioEgreso
            titulo
          }
        }
      `;

      const inputEgresado = {
        anioEgreso: Number(this.perfil.anioEgreso),
        titulo: this.perfil.titulo
      };

      this.http.post<any>("http://localhost:8080/graphql", {
        query: mutationEgresado,
        variables: { id: userId, input: inputEgresado }
      })
      .subscribe({
        next: (res2) => {
          console.log("Egresado actualizado:", res2);
          this.mostrarPopup = false;
          this.editando = false;
          this.cargarDatosUsuario();
        },
        error: (err2) => console.error("Error actualizando egresado:", err2)
      });

    },
    error: (err) => console.error("Error actualizando usuario:", err)
  });
}


  cerrarPopup() {
    this.mostrarPopup = false;
  }
}

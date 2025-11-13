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
            id: e.idEvidencia,     // ✅ Mapeo correcto
            titulo: e.titulo,
            descripcion: e.descripcion,
            tipo: e.tipo,
            fecha: p.ultimaActualizacion, // ✅ Por ahora esto
            propia: true
          }));
        } else {
          // ✅ Evita romper si no hay portafolio
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

  // ✅ MUTATION GRAPHQL
  const mutation = `
    mutation ActualizarAlumno($id: ID!, $input: AlumnoInput) {
      actualizarAlumno(id: $id, input: $input) {
        idUsuario
        carrera
        semestre
        usuario {
          nombre
          apellido
          telefono
          ubicacion
          email
        }
      }
    }
  `;

  // ✅ SOLO ENVIAMOS LO QUE EXISTE EN UsuarioInput
  const inputPayload = {
    usuario: {
      nombre: this.perfil.nombre,
      apellido: this.perfil.apellido,
      telefono: this.perfil.telefono,
      ubicacion: this.perfil.ubicacion
    }
  };

  this.http.post<any>("http://localhost:8080/graphql", {
    query: mutation,
    variables: {
      id: userId,
      input: inputPayload
    }
  })
  .subscribe({
    next: (res) => {
      console.log("✅ Perfil guardado:", res);

      // Cerrar popup y modo edición
      this.mostrarPopup = false;
      this.editando = false;

      // ✅ Recargar datos reales desde backend
      this.cargarDatosUsuario();
    },
    error: (err) => {
      console.error("❌ Error guardando perfil:", err);
      alert("Ocurrió un error al guardar.");
    }
  });

}

  cerrarPopup() {
    this.mostrarPopup = false;
  }
}

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

  // PERFIL REAL DEL BACKEND
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

  // DATOS QUE SIGUEN SIENDO MOCK
  portafolio = {
    descripcion: 'Experiencia en desarrollo web y proyectos académicos.',
    skills: 'Angular, Spring Boot, PostgreSQL',
    visibilidad: 'Pública',
    ultimaActualizacion: '2025-11-01',
  };

  evidencias: Evidencia[] = [
    {
      id: 1,
      titulo: 'Proyecto de Investigación',
      descripcion: 'Proyecto realizado en la UCA',
      tipo: 'Documento',
      fecha: '15 abr. 2025',
      propia: true,
    },
    {
      id: 2,
      titulo: 'Certificado de Curso Online',
      descripcion: 'Curso completado en Udemy',
      tipo: 'Certificado',
      fecha: '20 mar. 2025',
      propia: true,
    },
  ];

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  // ✅ Obtiene usuario logueado desde SessionStorage y consulta al backend
  cargarDatosUsuario() {
    const user = sessionStorage.getItem('user');
    if (!user) return;

    const userObj = JSON.parse(user);
    const userId = userObj.idUsuario;

    const query = `
      query {
        usuarioById(id: ${userId}) {
          nombre
          apellido
          email
          telefono
          ubicacion
          rolPrincipal
          completitud
        }
      }
    `;

    this.http.post<any>('http://localhost:8080/graphql', { query })
      .subscribe({
        next: (res) => {
          const u = res.data?.usuarioById;
          if (!u) return;

          this.perfil = {
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
            telefono: u.telefono,
            ubicacion: u.ubicacion,
            rol: u.rolPrincipal,
            completitud: u.completitud
          };
        },
        error: (err) => {
          console.error("❌ Error cargando perfil:", err);
        }
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
    this.mostrarPopup = false;
    this.editando = false;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
  }
}

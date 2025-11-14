import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/graphql';
  private usuarioActual: any = null;

  constructor(private http: HttpClient) {
    console.log('[AuthService] Instanciado');

    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuarioActual = JSON.parse(data);
      console.log('[AuthService] Usuario restaurado de localStorage:', this.usuarioActual);
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log('[AuthService] login() llamado con:', { email, password });

    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          idUsuario
          nombre
          apellido
          rolPrincipal
        }
      }
    `;

    const variables = { input: { email, password } };

    return this.http
      .post<any>(this.apiUrl, { query, variables })
      .pipe(
        tap(res => console.log('[AuthService] Respuesta cruda del backend:', res)),
        map((res) => {
          const user = res?.data?.login ?? null;
          console.log('[AuthService] Usuario obtenido:', user);

          if (user) {
            this.usuarioActual = user;
            localStorage.setItem('usuario', JSON.stringify(user));
          }

          return user;
        })
      );
  }

  getUsuarioActual() {
    if (this.usuarioActual) return this.usuarioActual;

    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  logout() {
    this.usuarioActual = null;
    localStorage.removeItem('usuario');
  }
}

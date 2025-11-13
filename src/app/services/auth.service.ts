// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/graphql';

  constructor(private http: HttpClient) {
    console.log('[AuthService] Instanciado');
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

    console.log('[AuthService] Enviando POST a', this.apiUrl);
    console.log('[AuthService] Payload GraphQL:', { query, variables });

    return this.http
      .post<any>(this.apiUrl, { query, variables })
      .pipe(
        tap(res => {
          console.log('[AuthService] Respuesta cruda del backend:', res);
        }),
        map((res) => {
          const user = res?.data?.login ?? null;
          console.log('[AuthService] Resultado mapeado (user):', user);
          return user;
        })
      );
  }
}

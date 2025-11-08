import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/graphql';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          idUsuario
          nombre
          email
        }
      }
    `;

    const variables = { input: { email, password } };

    return this.http.post<any>(this.apiUrl, { query, variables })
  .pipe(
    map(res => {
      console.log(">>> RESPUESTA DEL BACKEND:", res);
      return res.data?.login ?? null;
    })
  );

  }
}

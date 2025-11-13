// src/app/login/login.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    console.log('[LoginComponent] Construido');
  }

  onSubmit() {
    console.log('[LoginComponent] onSubmit() disparado');
    console.log('[LoginComponent] Email:', this.email, 'Password:', this.password);

    this.errorMsg = null;

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        console.log('[LoginComponent] next() recibido:', user);

        if (!user) {
          console.log('[LoginComponent] User null -> credenciales inválidas');
          this.errorMsg = 'Credenciales inválidas';
          return;
        }

        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('[LoginComponent] Usuario guardado en sessionStorage:', user);

        this.router.navigateByUrl('/dashboard');
        console.log('[LoginComponent] Navegando a /dashboard');
      },
      error: (err) => {
        console.error('[LoginComponent] ERROR en login:', err);
        this.errorMsg = 'Credenciales inválidas';
      },
      complete: () => {
        console.log('[LoginComponent] Observable login COMPLETADO');
      },
    });
  }
}

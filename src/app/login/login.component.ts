import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMsg: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res: { accessToken: string; user: any }) => {
        // Guarda el token en sessionStorage
        sessionStorage.setItem('token', res.accessToken);
        console.log('Usuario:', res.user);

        // Redirige al dashboard
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: any) => {
        this.errorMsg = 'Credenciales inválidas';
        console.error(err);
      }
    });
  }

  // 👇 Nueva función: Cerrar sesión
  logout() {
    // Elimina el token y limpia cualquier dato de sesión
    sessionStorage.removeItem('token');
    this.email = '';
    this.password = '';
    this.errorMsg = null;

    console.log('Sesión cerrada correctamente.');
    // Redirige nuevamente al login
    this.router.navigateByUrl('/login');
  }
}

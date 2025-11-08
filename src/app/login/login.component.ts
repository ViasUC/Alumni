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
    this.errorMsg = null;

    this.authService.login(this.email, this.password).subscribe({
      next: user => {
        if (!user) {
          this.errorMsg = 'Credenciales inválidas';
          return;
        }

        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('Usuario logueado:', user);

        this.router.navigateByUrl('/dashboard');
      },
      error: err => {
        console.error(err);
        this.errorMsg = 'Credenciales inválidas';
      }
    });
  }

  logout() {
    sessionStorage.removeItem('user');
    this.email = '';
    this.password = '';
    this.errorMsg = null;
    this.router.navigateByUrl('/login');
  }
}

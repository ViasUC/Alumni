import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Variables simples para usar con [(ngModel)]
  email: string = '';
  password: string = '';
  errorMsg: string | null = null;

  constructor(private router: Router) {}

  onSubmit() {
    // MOCK: cualquier email con '@' + pass '1234'
    if (this.password === '1234' && this.email.includes('@')) {
      localStorage.setItem('auth', '1');
      this.errorMsg = null;
      this.router.navigateByUrl('/inicio'); // cambia a /dashboard cuando lo tengas
    } else {
      this.errorMsg = 'Credenciales inválidas.';
      localStorage.removeItem('auth');
    }
  }
}

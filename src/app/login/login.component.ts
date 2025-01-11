import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe(
        (response: any) => {
          console.log('Giriş başarılı:', response);
          localStorage.setItem('token', response.token); // Token'ı sakla
          this.router.navigate(['/ana-menu']); // Ana menüye yönlendir
        },
        (error) => {
          console.error('Giriş başarısız:', error);
          alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
      );
    } else {
      alert('Lütfen formu doğru bir şekilde doldurun.');
    }
  }
}

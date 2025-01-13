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
  alertMessage: string | null = null;
  alertClass: string = 'alert-light';
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
          localStorage.setItem('token', response.token); 
          this.router.navigate(['/ana-menu']);
          // Başarılı girişte mesaj göster (isteğe bağlı)
          this.showAlert('Giriş başarılı!', 'alert-success');
        },
        (error) => {
          console.error('Giriş başarısız:', error);
          this.showAlert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', 'alert-danger');
        }
      );
    } else {
      this.showAlert('Lütfen formu doğru bir şekilde doldurun.', 'alert-danger');
    }
  }
  
  // Alert gösterme fonksiyonu
  showAlert(message: string, cssClass: string) {
    this.alertMessage = message;
    this.alertClass = cssClass;
  
    // 5 saniye sonra mesajı kaldır
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }
}

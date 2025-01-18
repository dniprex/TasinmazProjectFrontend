import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';
import jwt_decode from 'jwt-decode';

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
    private router: Router,
    private logService: LogService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      this.authService.login({ email, password }).subscribe({
        next: (response: any) => {
          const token = response.token;
  
          if (!token) {
            console.error('Token alınamadı.');
            this.showAlert('Token alınamadı!', 'alert-danger');
            return;
          }
  
          try {
            const decodedToken = jwt_decode<{ nameid: string; role: string; email: string }>(token);
            const userId = decodedToken.nameid; // nameid üzerinden kullanıcı ID'si alınır
            const userRole = decodedToken.role;
            const userEmail = decodedToken.email;
          
            console.log('Kullanıcı Rolü:', userRole);
            console.log('Kullanıcı ID:', userId);
            console.log('Kullanıcı Mail:', userEmail);
          } catch (error) {
            console.error('Token çözümleme hatası:', error);
          }
          
  
          localStorage.setItem('token', token);
          this.router.navigate(['/ana-menu']);
          this.showAlert('Giriş başarılı!', 'alert-success');
        },
        error: (err) => {
          console.error('Giriş başarısız:', err);
  
          const log = {
            userId: 1,
            userMail: email || 'unknown',
            durum: 'Başarısız',
            islemTip: 'Giriş Yapma',
            aciklama: 'Giriş başarısız oldu.'
          };
  
          this.logService.addLog(log).subscribe({
            next: () => console.log('Başarısız giriş log kaydedildi.'),
            error: (logErr) => console.error('Log kaydı sırasında hata oluştu:', logErr),
          });
  
          this.showAlert(
            'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
            'alert-danger'
          );
        }
      });
    } else {
      this.showAlert('Lütfen formu doğru bir şekilde doldurun.', 'alert-danger');
    }
    
  }
  


  showAlert(message: string, cssClass: string) {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }
}

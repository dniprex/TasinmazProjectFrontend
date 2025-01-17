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

          if (!token || token.split('.').length !== 3) {
            console.error('Sunucudan geçersiz token alındı.');
            this.showAlert('Geçersiz token alındı!', 'alert-danger');
            return;
          }

          localStorage.setItem('token', token);

          try {
            const decodedToken = jwt_decode<{ role: string; id: number }>(token);
            console.log('Rol:', decodedToken.role);
            console.log('ID:', decodedToken.id);

            // Başarılı giriş logu
            const log = {
              userId: decodedToken.id ? Number(decodedToken.id) : 0,
              userMail: email || 'unknown',
              durum: 'Başarılı',
              islemTip: 'Giriş Yapma',
              aciklama: 'Kullanıcı giriş yaptı.'
            };

            this.logService.addLog(log).subscribe(
              (response) => {
                console.log('Gönderilen veri:', JSON.stringify(log));
                console.log('Log başarıyla kaydedildi:', response);
              },
              (error) => {
                console.error('Log kaydında hata:', error);
              }
            );

          } catch (error) {
            console.error('Token çözümleme hatası:', error);
          }

          this.router.navigate(['/ana-menu']);
          this.showAlert('Giriş başarılı!', 'alert-success');
        },
        error: (err) => {
          console.error('Giriş başarısız:', err);

          const log = {
            userId: 1, 
            userMail: (this.loginForm.get('email') && this.loginForm.get('email').value) || 'unknown',
            durum: 'Başarısız',
            islemTip: 'Giriş Yapma',
            aciklama: `Giriş başarısız oldu.`
          };

          this.logService.addLog(log).subscribe(
            () => {
              console.log('Log kaydedildi: Başarısız giriş.');
            },
            (error) => {
              console.error('Log kaydı sırasında hata oluştu:', error);
            }
          );

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

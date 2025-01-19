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
            const userId = decodedToken.nameid;
            const userRole = decodedToken.role;
            const userEmail = decodedToken.email;
  
            console.log('Kullanıcı bilgileri:', { userId, userRole, userEmail });
  
            const log = {
              userId: Number(userId),
              userMail: userEmail || 'unknown',
              durum: 'Başarılı',
              islemTip: 'Giriş Yapma',
              aciklama: 'Giriş yapıldı.'
            };
            console.log('Gönderilen başarılı giriş logu:', log);
  
            this.logService.addLog(log).subscribe({
              next: () => console.log('Başarılı giriş log kaydedildi.'),
              error: (logErr) => console.error('Başarılı giriş logu sırasında hata:', logErr),
            });
  
          } catch (error) {
            console.error('Token çözümleme hatası:', error);
          }
  
          localStorage.setItem('token', token);
          this.router.navigate(['/ana-menu']);
          this.showAlert('Giriş başarılı!', 'alert-success');
        },
        error: (err) => {
          console.error('Giriş başarısız, hata:', err);
  
          console.log('Kullanıcı ID bulunması için API çağrısı yapılıyor...');
          this.authService.getUserIdByEmail(email).subscribe({
            next: (userId: number) => {
              console.log('API çağrısı başarılı, userId:', userId);
  
              const log = {
                userId: userId, 
                userMail: email, 
                durum: 'Başarısız',
                islemTip: 'Giriş Yapma',
                aciklama: 'Giriş başarısız oldu.'
              };
              console.log('Gönderilen başarısız giriş logu:', log);
  
              this.logService.addLog(log).subscribe({
                next: () => console.log('Başarısız giriş log kaydedildi.'),
                error: (logErr) => console.error('Başarısız giriş logu sırasında hata:', logErr),
              });
            },
            error: (userIdError) => {
              console.error('API çağrısı başarısız, varsayılan userId kullanılacak:', userIdError);
  
              const log = {
                userId: Number(1), // Kullanıcı bulunamadığında varsayılan ID
                userMail: email, 
                durum: 'Başarısız',
                islemTip: 'Giriş Yapma',
                aciklama: 'Giriş başarısız oldu.'
              };
              console.log('Gönderilen varsayılan log:', log);
  
              this.logService.addLog(log).subscribe({
                next: () => console.log('Başarısız giriş log kaydedildi.'),
                error: (logErr) => console.error('Varsayılan giriş logu sırasında hata:', logErr),
              });
            }
          });
  
          this.showAlert(
            'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
            'alert-danger'
          );
        }
      });
    } else {
      console.warn('Form geçersiz.');
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

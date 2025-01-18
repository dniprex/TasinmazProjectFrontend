import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup; // Form tanımı
  alertMessage: string | null = null; // Uyarı mesajı için
  alertClass: string = 'alert-light'; // Uyarı sınıfı için

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Form grubu oluşturma
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // E-posta
      password: ['', [Validators.required, Validators.minLength(8)]], // Şifre
      userRole: ['User', Validators.required], // Kullanıcı rolü, varsayılan olarak 'User'
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      // Formdan alınan veriyi API'ye gönder
      this.userService.createUser(this.userForm.value).subscribe(
        (response) => {
          console.log('Kullanıcı başarıyla eklendi!', response);
          this.showAlert('Kullanıcı başarıyla eklendi!', 'alert-success');
          this.router.navigate(['/users']); // Kullanıcılar ekranına yönlendirme
        },
        (error) => {
          console.error('Kullanıcı eklenirken hata oluştu:', error);
          const errorMessage = error.error.message || 'Kullanıcı eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
          this.showAlert(errorMessage, 'alert-danger');
        }
      );
    } else {
      this.showAlert('Formdaki hataları düzeltin ve tekrar deneyin.', 'alert-danger');
    }
  }

  cancel(): void {
    // Kullanıcılar ekranına yönlendirme
    this.router.navigate(['/users']);
  }

  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    // 5 saniye sonra uyarıyı gizle
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }
}

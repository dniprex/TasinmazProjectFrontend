import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { passwordValidator } from '../users/password.validator'; // Custom validator

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit {
  userForm!: FormGroup;
  id!: number;
  alertMessage: string | null = null; // Uyarı mesajı
  alertClass: string = 'alert-light'; // Uyarı türü

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      UserEmail: ['', [Validators.required, Validators.email]], 
      Password: ['', [passwordValidator]], 
      UserRole: ['', Validators.required], 
    });

    this.id = this.route.snapshot.params['id'];

    this.userService.getUserById(this.id).subscribe(
      (response) => {
        if (response) {
          console.log('Kullanıcı bilgileri başarıyla yüklendi:', response);
          this.userForm.patchValue({
            UserEmail: response.email,
            Password: '', 
            UserRole: response.role,
          });
        } else {
          this.showAlert('Kullanıcı bilgileri yüklenemedi.', 'alert-danger');
          this.router.navigate(['/users']); 
        }
      },
      (error) => {
        console.error('Kullanıcı bilgisi alınırken hata oluştu:', error);
        this.showAlert('Kullanıcı bilgisi yüklenemedi. Lütfen tekrar deneyin.', 'alert-danger');
        this.router.navigate(['/users']);
      }
    );

    this.userForm.statusChanges.subscribe((status) => {
      console.log('Form durumu:', status);
      console.log('Form hataları:', this.userForm.errors);
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.showAlert('Formda hata var. Lütfen kontrol edin.', 'alert-danger');
      return;
    }

    const formData = { ...this.userForm.value };

    if (!formData.Password) {
      delete formData.Password;
    }

    this.userService.updateUser(this.id, formData).subscribe(
      (response) => {
        console.log('Kullanıcı başarıyla güncellendi:', response);
        this.showAlert('Kullanıcı başarıyla güncellendi.', 'alert-success');
        this.router.navigate(['/users']);
      },
      (error) => {
        console.error('Kullanıcı güncellenirken hata oluştu:', error);
        const errorMessage = error.error.message || 'Kullanıcı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
        this.showAlert(errorMessage, 'alert-danger');
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }
}

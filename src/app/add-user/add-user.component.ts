import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { passwordValidator } from '../users/password.validator';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup; 
  alertMessage: string | null = null; 
  alertClass: string = 'alert-light'; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      UserEmail: ['', [Validators.required, Validators.email]], 
      Password: ['', [Validators.required, passwordValidator]], 
      UserRole: ['User', Validators.required], 
    });

  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
  
      console.log('Gönderilen veri:', formValue);
  
      this.userService.createUser(formValue).subscribe(
        (response) => {
          console.log('Kullanıcı başarıyla eklendi!', response);
          this.showAlert('Kullanıcı başarıyla eklendi!', 'alert-success');
          this.router.navigate(['/users']);
        },
        (error) => {
          console.error('Kullanıcı eklenirken hata oluştu:', error);
          console.error('Hata mesajı:', error.error.message); 
          const errorMessage = error.error.message || 'Kullanıcı eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
          this.showAlert(errorMessage, 'alert-danger');
        }
      );
      
    } else {
      this.showAlert('Formdaki hataları düzeltin ve tekrar deneyin.', 'alert-danger');
    }
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

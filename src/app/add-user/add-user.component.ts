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
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      userRole: [''],
      adres: ['']
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value).subscribe(
        (response) => {
          console.log('Kullanıcı başarıyla eklendi!', response);
          alert(response.message);
          this.router.navigate(['/users']);
        },
        (error) => {
          console.error('Kullanıcı eklenirken hata oluştu:', error);
          alert('Kullanıcı eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      );
    } else {
      alert('Formdaki hataları düzeltin ve tekrar deneyin.');
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

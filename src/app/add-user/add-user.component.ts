import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  user: User = {
    name: '',
    surname: '',
    email: '',
    password: '',
    userRole: '',
    adres: '',
  };

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.userService.createUser(this.user).subscribe(
      (response) => {
        console.log('Kullanıcı başarıyla eklendi!', response);
        alert(response.message); // Backend'den gelen mesaj
        this.router.navigate(['/users']);
      },
      (error) => {
        console.error('Kullanıcı eklenirken hata oluştu:', error);
        alert('Kullanıcı eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

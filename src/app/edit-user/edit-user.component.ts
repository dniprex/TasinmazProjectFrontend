import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Console, error } from 'console';
@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  id!: number;
  user: Partial<User> = {};
  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private router: Router) { }

    ngOnInit(): void {
      this.id = this.route.snapshot.params['id'];
      this.userService.getUserById(this.id).subscribe(
        (response) => {
          if (response) {
            console.log("hata",response);
            this.user = response;
          } else {
            alert('Kullanıcı bilgileri yüklenemedi.');
            this.router.navigate(['/users']);
          }
        },
        (error) => {
          console.error('Kullanıcı bilgisi alınırken hata oluştu:', error);
          alert('Bir hata oluştu. Lütfen tekrar deneyin.');
          this.router.navigate(['/users']);
        }
      );
    }
    

    onSubmit(): void {
      if (!this.user || !this.id) {
        alert('Gerekli bilgiler eksik. Lütfen tüm alanları doldurun.');
        return;
      }
    
      this.userService.updateUser(this.id, this.user).subscribe(
        (response) => {
          console.log('Kullanıcı başarıyla güncellendi!', response);
          alert('Kullanıcı başarıyla güncellendi!');
          this.router.navigate(['/users']);
        },
        (error) => {
         // console.error('Kullanıcı güncellenirken hata oluştu:', error);
         // alert('Kullanıcı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
          this.router.navigate(['/users']);
        }
      );
    }
    
  

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  selectedUsers = [];
  selectedUser: any;
  constructor(private userService: UserService, private router: Router) { }
  alertMessage: string | null = null;
  alertClass: string = 'alert-light'; 
  
  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;
  
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000); 
  }
  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      console.log('API Verisi:', data);
      this.users = data;
    }, error => {
      console.error('Error fetching users:', error);
    });
  }

  navigateToAddUser() {
    this.router.navigate(['/add-user']);
  }

  editSelectedUser() {
    console.log('Edit Selected User çalıştırıldı.');
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.showAlert('Lütfen düzenlemek için bir kullanıcı seçin.','alert-danger');
      return;
    }

    if (selectedUsers.length > 1) {
      this.showAlert('Yalnızca bir kullanıcı düzenlenebilir. Lütfen tek bir kullanıcı seçin.','alert-danger');
      return;
    }

    const userToEdit = selectedUsers[0];
    this.router.navigate(['/edit-user', userToEdit.id]);
  }


  deleteSelectedUsers() {
    const selectedUsers = this.users.filter(user => user.selected);
    if (selectedUsers.length === 0) {
      this.showAlert('Lütfen silmek için bir kullanıcı seçin.','alert-danger');
      return;
    }
    const confirmed =  confirm('Seçili kullanıcıları silmek istediğinizden emin misiniz?'); ///BURAYA ALERT UI KONULACAK
    if (confirmed) {
      const deleteRequests = selectedUsers.map(user =>
        this.userService.deleteUser(user.id).toPromise()
      );
      Promise.all(deleteRequests)
        .then(() => {
          this.users = this.users.filter(user => !user.selected);
          this.showAlert('Seçili kullanıcılar başarıyla silindi!','alert-success');
        })
        .catch(error => {
          console.error('Silme işlemi başarısız:', error);
          this.showAlert('Kullanıcılar silinirken bir hata oluştu.','alert-danger');

        });
    }
  }

}

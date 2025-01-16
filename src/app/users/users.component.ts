import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private deleteModal: bootstrap.Modal | null = null;
  users: any[] = []; // Tüm kullanıcılar
  filteredUsers: any[] = []; // Filtrelenmiş kullanıcılar
  pagedUsers: any[] = []; // Sayfa başına kullanıcılar
  searchQuery: string = ''; // Arama sorgusu
  currentPage: number = 1; // Mevcut sayfa
  itemsPerPage: number = 10; // Sayfa başına gösterilecek kullanıcı sayısı
  alertMessage: string | null = null; // Uyarı mesajı
  alertClass: string = 'alert-light'; // Uyarı mesajının CSS sınıfı

  constructor(private userService: UserService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        console.log('API Verisi:', data);
        this.users = data;
        this.filteredUsers = this.users.slice();
        this.updatePagedUsers(); // Başlangıçta sayfa verilerini güncelle
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
    this.deleteModal = new bootstrap.Modal(
      document.getElementById('deleteConfirmationModal') as HTMLElement
    );
  }
  openDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
  }
  searchUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = this.users.slice();
    } else {
      this.filteredUsers = this.users.filter(user => {
        const fullName = (user.name + " " + user.surname).toLowerCase();
        return fullName.includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.userRole.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.adres.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
    this.currentPage = 1; // Yeni bir arama yapıldığında ilk sayfaya dön
    this.updatePagedUsers();
  }
  confirmDelete(): void {
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.showAlert('Lütfen silmek için bir kullanıcı seçin.', 'alert-danger');
      this.closeDeleteModal();
      return;
    }

    const deleteRequests = selectedUsers.map(user =>
      this.userService.deleteUser(user.id).toPromise()
    );

    Promise.all(deleteRequests)
      .then(() => {
        this.users = this.users.filter(user => !user.selected);
        this.filteredUsers = this.users.slice();
        this.updatePagedUsers();
        this.showAlert('Seçili kullanıcılar başarıyla silindi!', 'alert-success');
      })
      .catch(error => {
        console.error('Silme işlemi başarısız:', error);
        this.showAlert('Kullanıcılar silinirken bir hata oluştu.', 'alert-danger');
      })
      .finally(() => {
        this.closeDeleteModal();
      });
  }
  updatePagedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.getTotalPages()) {
      return;
    }
    this.currentPage = page;
    this.updatePagedUsers();
  }

  navigateToAddUser(): void {
    this.router.navigate(['/add-user']);
  }

  editSelectedUser(): void {
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.showAlert('Lütfen düzenlemek için bir kullanıcı seçin.', 'alert-danger');
      return;
    }

    if (selectedUsers.length > 1) {
      this.showAlert('Yalnızca bir kullanıcı düzenlenebilir. Lütfen tek bir kullanıcı seçin.', 'alert-danger');
      return;
    }

    const userToEdit = selectedUsers[0];
    this.router.navigate(['/edit-user', userToEdit.id]);
  }

  deleteSelectedUsers(): void {
    const selectedUsers = this.users.filter(user => user.selected);

    if (selectedUsers.length === 0) {
      this.showAlert('Lütfen silmek için bir kullanıcı seçin.', 'alert-danger');
      return;
    }

    this.openDeleteModal();
  }
  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  logout(): void {
    this.authService.logout();
  }
}

import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ana-menu',
  templateUrl: './ana-menu.component.html',
  styleUrls: ['./ana-menu.component.css']
})
export class AnaMenuComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  searchQuery: string = ''; // Arama sorgusu

  constructor(
    private propertyService: PropertyService, 
    private router: Router, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(
      (data) => {
        this.properties = data;
        this.filteredProperties = this.properties.slice(); // Başlangıçta tüm taşınmazlar
      },
      (error) => {
        console.error('API Error:', error); 
      }
    );
  }

  searchProperties(): void {
    if (!this.searchQuery) {
      this.filteredProperties = this.properties.slice(); 
    } else {
      this.filteredProperties = this.properties.filter(property =>
        property.mahalle.ilce.il.ilAdi.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.mahalle.ilce.ilceAdi.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.mahalle.mahalleAdi.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.tasinmazParsel.toString().includes(this.searchQuery) || 
        property.ada.toString().includes(this.searchQuery) || 
        property.tasinmazNitelik.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        property.tasinmazAdres.toLowerCase().includes(this.searchQuery.toLowerCase()) 
      );
    }
  }

  alertMessage: string | null = null;
  alertClass: string = 'alert-light'; 
  
  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;
  
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000); 
  }

  navigateToAddTasinmaz() {
    this.router.navigate(['/add-tasinmaz']);
  }

  editSelectedProperty() {
    const selectedProperties = this.properties.filter(property => property.selected);
  
    if (selectedProperties.length === 0) {
      this.showAlert('Lütfen düzenlemek için bir taşınmaz seçin.', 'alert-warning');
      return;
    }
  
    if (selectedProperties.length > 1) {
      this.showAlert('Yalnızca bir taşınmaz düzenlenebilir. Lütfen bir taşınmaz seçin.', 'alert-danger');
      return;
    }
  
    const propertyToEdit = selectedProperties[0];
    this.router.navigate(['/edit-tasinmaz', propertyToEdit.id]);
  }

  deleteSelectedProperties() {
    const selectedProperties = this.properties.filter(property => property.selected);
  
    if (selectedProperties.length === 0) {
      this.showAlert('Lütfen silmek için en az bir taşınmaz seçin.', 'alert-danger');
      return;
    }
  
    const confirmed = confirm('Seçili verileri silmek istediğinizden emin misiniz?');
    if (confirmed) {
      const deleteRequests = selectedProperties.map(property =>
        this.propertyService.deleteProperty(property.id).toPromise()
      );
  
      Promise.all(deleteRequests)
        .then(() => {
          this.properties = this.properties.filter(property => !property.selected);
          this.filteredProperties = this.properties.slice();
          this.showAlert('Seçili veriler başarıyla silindi!', 'alert-success');
        })
        .catch(error => {
          console.error('Silme işlemi başarısız:', error);
          this.showAlert('Veriler silinirken bir hata oluştu.', 'alert-danger');
        });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

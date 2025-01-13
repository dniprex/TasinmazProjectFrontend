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
  searchQuery: string = '';

  constructor(
    private propertyService: PropertyService, 
    private router: Router, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(
      (data) => {
        this.properties = data;
        this.filteredProperties = this.properties.slice(); 
      },
      (error) => {
        console.error('API Error:', error); 
      }
    );
  }
  alertMessage: string | null = null;
  alertClass: string = 'alert-light'; // Varsayılan sınıf
  
  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;
  
    // Mesajı belirli bir süre sonra otomatik olarak kaldır
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000); // 5 saniye sonra kaldır
  }
  
 /* searchProperties(): void {
    const query = this.searchQuery.toLowerCase(); // Arama sorgusunu küçük harfe çevir
    
    this.filteredProperties = this.properties.filter(property => {
      // Null kontrolleri ile tüm alanları kontrol et
      const ilAdi = property?.mahalle?.ilce?.il?.ilAdi || '';
      const ilceAdi = property?.mahalle?.ilce?.ilceAdi || '';
      const mahalleAdi = property?.mahalle?.mahalleAdi || '';
      const tasinmazAdres = property?.tasinmazAdres || '';
      const tasinmazNitelik = property?.tasinmazNitelik || '';
      const koordinatBilgisi = property?.koordinatBilgisi || '';
      
      // Alanlardan herhangi biri sorguyu içeriyorsa eşleşir
      return (
        ilAdi.toLowerCase().includes(query) ||
        ilceAdi.toLowerCase().includes(query) ||
        mahalleAdi.toLowerCase().includes(query) ||
        tasinmazAdres.toLowerCase().includes(query) ||
        tasinmazNitelik.toLowerCase().includes(query) ||
        koordinatBilgisi.toLowerCase().includes(query)
      );
    });
  }*/
  

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

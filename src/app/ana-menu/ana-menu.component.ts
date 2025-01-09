import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ana-menu',
  templateUrl: './ana-menu.component.html',
  styleUrls: ['./ana-menu.component.css']
})
export class AnaMenuComponent implements OnInit {
  properties: any[] = [];
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = []; 

  selectedIl: string = '';
  selectedIlce: string = '';
  selectedMahalle: string = '';

  constructor(private propertyService: PropertyService, private router: Router) { }
  navigateToAddTasinmaz() {
    this.router.navigate(['/add-tasinmaz']);
  }

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(
      (data) => {
        this.properties = data;
      },
      (error) => {
        console.error('API Error:', error); 
      }
    );
  }
  editProperty(property: any) {
    this.router.navigate(['/edit-tasinmaz', property.id]);
  }
  deleteProperty(property: any) {
    const confirmed = confirm('Bu veriyi silmek istediğinizden emin misiniz?');
    if (confirmed) {
      this.propertyService.deleteProperty(property.id).subscribe(
        (response) => {
          this.properties = this.properties.filter(p => p.id !== property.id);
          alert('Veri başarıyla silindi!');
        },
        (error) => {
          console.error('Silme işlemi başarısız:', error);
          alert('Veri silinirken bir hata oluştu.');
        }
      );
    }
  }
  

}


import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-tasinmaz',
  templateUrl: './add-tasinmaz.component.html',
  styleUrls: ['./add-tasinmaz.component.css']
})
export class AddTasinmazComponent implements OnInit {

  iller: any[] = []; // İl listesi
  ilceler: any[] = []; // İlçe listesi
  mahalleler: any[] = []; // Mahalle listesi
  
  selectedIl: string = '';
  selectedIlce: string = '';
  selectedMahalle: string = '';
  tasinmazIsim: string = '';
  ada: string = '';
  parsel: string = '';
  nitelik: string = '';
  adres: string = '';
  resetForm: any;
  constructor(private propertyService: PropertyService,
     private router: Router
  ) { }

  ngOnInit(): void {
    this.propertyService.getIller().subscribe(
      (data) => {
        this.iller = data;
        console.log(this.iller);
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
   
    this.propertyService.getIlceler(this.selectedIl).subscribe(
      (data) => {
        this.ilceler = data; 
        console.log(this.ilceler); 
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
    
    this.propertyService.getMahalleler(this.selectedIlce).subscribe(
      (data) => {
        this.mahalleler = data; 
        console.log(this.mahalleler); 
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }
  onIlChange(): void {
    const selectedIlId = this.selectedIl;
    this.ilceler = this.ilceler.filter(ilce => ilce.ilId.toString() === selectedIlId);
    this.selectedIlce = '';
    this.selectedMahalle = ''; 
  }

  
  onIlceChange(): void {
    const selectedIlceId = this.selectedIlce;
    this.mahalleler = this.mahalleler.filter(mahalle => mahalle.ilceId.toString() === selectedIlceId);
    this.selectedMahalle = ''; 
  }
  onSubmit(): void {
    const newProperty = {
      TasinmazIsim: this.tasinmazIsim || 'Taşınmaz', 
      TasinmazParsel: this.parsel ? parseInt(this.parsel, 10) : 0,
      TasinmazNitelik: this.nitelik || '',
      TasinmazAdres: this.adres || '',
      MahalleId: parseInt(this.selectedMahalle, 10),
      Ada: this.ada || '',
      KoordinatBilgisi: '' 
    };
  
    console.log('Gönderilen veri:', newProperty); 
    this.propertyService.addProperty(newProperty).subscribe(
      (response) => {
        console.log('Taşınmaz başarıyla eklendi:', response);
        alert('Taşınmaz başarıyla eklendi!');
        this.resetForm();
      },
      (error) => {
        console.error('Taşınmaz eklenirken hata oluştu:', error);
        alert('Taşınmaz eklenirken bir hata oluştu!');
      }
    );
  }
  cancel() {
    this.router.navigate(['/']);
  }
  
}

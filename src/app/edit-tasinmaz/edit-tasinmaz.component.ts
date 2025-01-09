import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-edit-tasinmaz',
  templateUrl: './edit-tasinmaz.component.html',
  styleUrls: ['./edit-tasinmaz.component.css'],
})
export class EditTasinmazComponent implements OnInit {
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];

  selectedIl: string = '';
  selectedIlce: string = '';
  selectedMahalle: string = '';
  tasinmazIsim: string = '';
  ada: string = '';
  parsel: string = '';
  nitelik: string = '';
  adres: string = '';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
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



  loadIlceler(ilId: string, resetDropdown: boolean = true): void {
    this.propertyService.getIlceler(ilId).subscribe(
      (data) => {
        this.ilceler = data;
        if (resetDropdown) {
          this.selectedIlce = '';
          this.selectedMahalle = '';
          this.mahalleler = [];
        }
      },
      (error) => {
        console.error('İlçeler yüklenirken hata oluştu:', error);
        alert('Seçilen il için ilçe bulunamadı. Lütfen farklı bir il seçin.');
        this.ilceler = [];
        this.selectedIlce = '';
        this.selectedMahalle = '';
        this.mahalleler = [];
      }
    );
  }


  loadMahalleler(ilceId: string, resetDropdown: boolean = true): void {
    this.propertyService.getMahalleler(ilceId).subscribe(
      (data) => {
        this.mahalleler = data;
        if (resetDropdown) {
          this.selectedMahalle = '';
        }
      },
      (error) => {
        console.error('Mahalleler yüklenirken hata oluştu:', error);
      }
    );
  }

  saveChanges(): void {
    const updatedProperty = {
      tasinmazIsim: this.tasinmazIsim,
      ada: this.ada,
      parsel: this.parsel,
      nitelik: this.nitelik,
      adres: this.adres,
      mahalle: {
        id: this.selectedMahalle,
        ilce: {
          id: this.selectedIlce,
          il: {
            id: this.selectedIl,
          },
        },
      },
    };

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert('Taşınmaz ID bulunamadı!');
      return;
    }

    this.propertyService.updateProperty(+id, updatedProperty).subscribe(
      () => {
        alert('Değişiklikler başarıyla kaydedildi!');
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Güncelleme sırasında hata oluştu:', error);
        alert(`Hata: ${error.message || 'Bilinmeyen bir hata oluştu.'}`);
      }
    );
    
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}

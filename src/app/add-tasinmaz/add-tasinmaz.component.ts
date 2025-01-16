import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { LogService } from '../services/log.service';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-add-tasinmaz',
  templateUrl: './add-tasinmaz.component.html',
  styleUrls: ['./add-tasinmaz.component.css']
})
export class AddTasinmazComponent implements OnInit {

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
  koordinat: string = '';
  userId: number = 0;
  userMail: string = '';

  alertMessage: string | null = null;
  alertClass: string = 'alert-light';

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private logService: LogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadIller();
  }

  loadIller(): void {
    this.propertyService.getIller().subscribe(
      (data) => {
        this.iller = data;
        console.log('İller başarıyla yüklendi:', this.iller);
      },
      (error) => {
        console.error('İl verileri yüklenirken hata oluştu:', error);
        this.showAlert('İl verileri yüklenemedi. Lütfen tekrar deneyin.', 'alert-danger');
      }
    );
  }

  onIlChange(): void {
    if (!this.selectedIl) {
      this.ilceler = [];
      this.mahalleler = [];
      this.selectedIlce = '';
      this.selectedMahalle = '';
      return;
    }

    this.propertyService.getIlceler(this.selectedIl).subscribe(
      (data) => {
        this.ilceler = data;
        console.log('İlçeler başarıyla yüklendi:', this.ilceler);
        this.mahalleler = [];
        this.selectedIlce = '';
        this.selectedMahalle = '';
      },
      (error) => {
        console.error('İlçe verileri yüklenirken hata oluştu:', error);
        this.showAlert('İlçe verileri yüklenemedi. Lütfen tekrar deneyin.', 'alert-danger');
      }
    );
  }

  onIlceChange(): void {
    if (!this.selectedIlce) {
      this.mahalleler = [];
      this.selectedMahalle = '';
      return;
    }

    this.propertyService.getMahalleler(this.selectedIlce).subscribe(
      (data) => {
        this.mahalleler = data;
        console.log('Mahalleler başarıyla yüklendi:', this.mahalleler);
      },
      (error) => {
        console.error('Mahalle verileri yüklenirken hata oluştu:', error);
        this.showAlert('Mahalle verileri yüklenemedi. Lütfen tekrar deneyin.', 'alert-danger');
      }
    );
  }

  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  onSubmit(): void {
    this.userId = this.authService.getDecodedTokenUserId();
    this.userMail = this.authService.getDecodedTokenEmail();
    
    if (!this.tasinmazIsim || !this.selectedMahalle || !this.parsel) {
      this.showAlert('Lütfen tüm zorunlu alanları doldurun.', 'alert-warning');
      console.warn('Eksik bilgiler nedeniyle işlem yapılmadı.');
      return;
    }

    const newProperty = {
      UserId: Number(this.userId),
      TasinmazIsim: this.tasinmazIsim || 'Taşınmaz',
      TasinmazParsel: this.parsel ? parseInt(this.parsel, 10) : 0,
      TasinmazNitelik: this.nitelik || '',
      TasinmazAdres: this.adres || '',
      MahalleId: parseInt(this.selectedMahalle, 10),
      Ada: this.ada || '',
      KoordinatBilgisi: this.koordinat || '',
    };

    console.log('Gönderilecek taşınmaz verisi:', newProperty);
    console.log("USER ID:" + this.userId)
    this.propertyService.addProperty(newProperty).subscribe(
      (response) => {
        console.log('Taşınmaz başarıyla eklendi:', response);

        const log = {
          UserId: this.userId ? Number(this.userId) : 0,
          UserMail: this.userMail || 'unknown',
          Durum: 'Başarılı',
          IslemTip: 'Taşınmaz Ekleme',
          Aciklama: `Taşınmaz eklendi: ${newProperty.TasinmazIsim}`
        };

        this.logService.addLog(log).subscribe();
        this.showAlert('Taşınmaz başarıyla eklendi!', 'alert-success');
        this.router.navigate(['/ana-menu']);
      },
      (error) => {
        console.error('Taşınmaz eklenirken hata oluştu:', error);

        const log = {
          UserId: this.userId ? Number(this.userId) : 0,
          UserMail: this.userMail || 'unknown',
          Durum: 'Başarısız',
          IslemTip: 'Taşınmaz Ekleme',
          Aciklama: `Taşınmaz eklenemedi: ${newProperty.TasinmazIsim}`
        };

        this.logService.addLog(log).subscribe();
        const errorMessage = error.error.message || 'Bilinmeyen bir hata oluştu.';
        this.showAlert(errorMessage, 'alert-danger');
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/ana-menu']);
  }
}

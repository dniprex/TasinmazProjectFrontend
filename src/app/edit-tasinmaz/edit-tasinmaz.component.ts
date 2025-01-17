import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../services/property.service';
import { Property } from '../models/property.model';
import { LogService } from '../services/log.service';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-edit-tasinmaz',
  templateUrl: './edit-tasinmaz.component.html',
  styleUrls: ['./edit-tasinmaz.component.css'],
})
export class EditTasinmazComponent implements OnInit {
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];

  userId: number;
  userMail: string = '';
  selectedIl: string = '';
  selectedIlce: string = '';
  selectedMahalle: string = '';
  tasinmazIsim: string = '';
  ada: string = '';
  parsel: string = '';
  nitelik: string = '';
  adres: string = '';
  koordinat: string = '';
  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router,
    private logService: LogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.getPropertyById(+id).subscribe(
        (data) => {
          if (data) {
            console.log(data);

            this.selectedIl = data.mahalle.ilce.ilId ? data.mahalle.ilce.ilId.toString() : '';
            this.selectedIlce = data.mahalle.ilceId ? data.mahalle.ilceId.toString() : '';
            this.selectedMahalle = data.mahalleId ? data.mahalleId.toString() : '';

            this.tasinmazIsim = data.tasinmazIsim || '';
            this.ada = data.ada || '';
            this.parsel = data.tasinmazParsel || '';
            this.nitelik = data.tasinmazNitelik || '';
            this.adres = data.tasinmazAdres || '';
            this.koordinat = data.koordinatBilgisi || '';

            this.loadIlceler(this.selectedIl, false);
            this.loadMahalleler(this.selectedIlce, false);
          } else {
            this.showAlert('Taşınmaz verileri bulunamadı.', 'alert-warning');
          }
        },
        (error) => {
          console.error('Taşınmaz verileri yüklenirken hata oluştu:', error);
          this.showAlert('Taşınmaz verileri yüklenemedi. Lütfen tekrar deneyin.', 'alert-danger');
        }
      );
    } else {
      this.showAlert('Taşınmaz ID bulunamadı.', 'alert-danger');
    }

    this.propertyService.getIller().subscribe(
      (data) => {
        this.iller = data;
      },
      (error) => {
        console.error('API Error:', error);
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


  alertMessage: string | null = null;
  alertClass: string = 'alert-light';

  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  loadIlceler(ilId: string, resetDropdown: boolean = true): void {
    if (!ilId) {
      console.error('İl ID eksik, ilçeler yüklenemedi.');
      return;
    }

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
        this.showAlert('Seçilen il için ilçe bulunamadı. Lütfen farklı bir il seçin.', 'alert-danger');
      }
    );
  }



  loadMahalleler(ilceId: string, resetDropdown: boolean = true): void {
    if (!ilceId) {
      console.error('İlçe ID eksik, mahalleler yüklenemedi.');
      return;
    }

    this.propertyService.getMahalleler(ilceId).subscribe(
      (data) => {
        this.mahalleler = data;
        if (resetDropdown) {
          this.selectedMahalle = '';
        }
      },
      (error) => {
        console.error('Mahalleler yüklenirken hata oluştu:', error);
        this.showAlert('Seçilen ilçe için mahalle bulunamadı. Lütfen farklı bir ilçe seçin.', 'alert-danger');
      }
    );
  }


  saveChanges(): void {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.showAlert('Taşınmaz ID bulunamadı!', 'alert-danger');
      return;
    }

    if (
      !this.selectedIl ||
      !this.selectedIlce ||
      !this.selectedMahalle ||
      !this.tasinmazIsim ||
      !this.ada ||
      !this.parsel ||
      !this.nitelik ||
      !this.adres
    ) {
      this.showAlert('Lütfen tüm alanları doldurun.', 'alert-danger');
      return;
    }

    if (isNaN(Number(this.ada)) || isNaN(Number(this.parsel))) {
      this.showAlert('Ada ve Parsel alanları yalnızca sayısal değer olmalıdır.', 'alert-danger');
      return;
    }

    const updatedProperty: Property = {
      id: parseInt(id, 10),
      tasinmazIsim: this.tasinmazIsim || '',
      tasinmazParsel: parseInt(this.parsel, 10) || 0,
      tasinmazNitelik: this.nitelik || '',
      tasinmazAdres: this.adres || '',
      ada: this.ada || '',
      koordinatBilgisi: this.koordinat || '',
      ilId: parseInt(this.selectedIl, 10),
      ilceId: parseInt(this.selectedIlce, 10),
      mahalleId: parseInt(this.selectedMahalle, 10),
    };

    this.propertyService.updateProperty(parseInt(id, 10), updatedProperty).subscribe(
      () => {
        this.userId = this.authService.getDecodedTokenUserId();
        this.userMail = this.authService.getDecodedTokenEmail();

        const log = {
          UserId: this.userId ? Number(this.userId) : 0,
          UserMail: this.userMail || 'unknown',
          Durum: 'Başarılı',
          IslemTip: 'Taşınmaz Düzenleme',
          Aciklama: `Taşınmaz düzenlendi: ${updatedProperty.tasinmazIsim}`,
        };
        this.logService.addLog(log).subscribe();
        this.showAlert('Değişiklikler başarıyla kaydedildi!', 'alert-success');
        this.router.navigate(['/ana-menu']);
      },
      (error) => {
        const log = {
          UserId: this.userId ? Number(this.userId) : 0,
          UserMail: this.userMail || 'unknown',
          Durum: 'Başarısız',
          IslemTip: 'Taşınmaz Düzenleme',
          Aciklama: `Taşınmaz düzenlenemedi: ${updatedProperty.tasinmazIsim}`,
        };
        this.logService.addLog(log).subscribe();
        this.showAlert('Hata oluştu. Lütfen değerleri doğru girin.', 'alert-danger');
      }
    );
  }
  cancel(): void {
    this.router.navigate(['/ana-menu']);

  }
}

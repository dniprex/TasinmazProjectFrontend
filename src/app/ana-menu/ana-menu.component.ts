import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-ana-menu',
  templateUrl: './ana-menu.component.html',
  styleUrls: ['./ana-menu.component.css']
})
export class AnaMenuComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  pagedProperties: any[] = [];
  searchQuery: string = '';
  userRole: string | null = null;
  userId: number | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  alertMessage: string | null = null;
  alertClass: string = 'alert-light';
  userMail: string = '';
  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private authService: AuthService,
    private logService: LogService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getDecodedTokenRole();
    this.userId = this.authService.getDecodedTokenUserId();
    this.userMail = this.authService.getDecodedTokenEmail();

    console.log("Kullanıcı Rolü:", this.userRole);
    console.log("Kullanıcı ID:", this.userId);
    console.log("Kullanıcı Mail:", this.userMail);

    this.propertyService.getProperties().subscribe(
      (data) => {
        console.log("API Verisi:", data);
        if (Array.isArray(data) && data.length > 0) {
          if (this.userRole === 'Admin') {
            this.properties = data;
            this.filteredProperties = this.properties.slice();
          } else if (this.userRole === 'User') {

            if (this.userId !== null) {

              this.properties = data.filter((property) => String(property.userId) === String(this.userId));
              console.log("Kullanıcıya ait Taşınmazlar:", this.properties);
            } else {
              console.log("Kullanıcı ID'si tanımlanmamış");
              this.properties = [];
            }

            this.filteredProperties = this.properties.slice();
            console.log("Kullanıcıya ait Filtrelenmiş Taşınmazlar:", this.filteredProperties);
          }
          this.updatePagedProperties();
        } else {
          console.error("API'den geçerli veri alınamadı.");
          this.properties = [];
          this.filteredProperties = [];
        }
      },
      (error) => {
        console.error('API Hatası:', error);
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
    this.currentPage = 1;
    this.updatePagedProperties();
  }

  updatePagedProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.itemsPerPage);
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
    this.updatePagedProperties();
  }

  showAlert(message: string, cssClass: string): void {
    this.alertMessage = message;
    this.alertClass = cssClass;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  navigateToAddTasinmaz(): void {
    this.router.navigate(['/add-tasinmaz']);
  }

  editSelectedProperty(): void {
    const selectedProperties = this.properties.filter(property => property.selected);

    if (selectedProperties.length === 0) {
      this.showAlert('Lütfen düzenlemek için bir taşınmaz seçin.', 'alert-danger');
      return;
    }

    if (selectedProperties.length > 1) {
      this.showAlert('Yalnızca bir taşınmaz düzenlenebilir. Lütfen bir taşınmaz seçin.', 'alert-danger');
      return;
    }

    const propertyToEdit = selectedProperties[0];
    this.router.navigate(['/edit-tasinmaz', propertyToEdit.id]);
  }

  deleteSelectedProperties(): void {
    const selectedProperties = this.properties.filter(property => property.selected);
  
    if (selectedProperties.length === 0) {
      this.showAlert('Lütfen silmek için en az bir taşınmaz seçin.', 'alert-danger');
      return;
    }
  
    const confirmed = confirm('Seçili verileri silmek istediğinizden emin misiniz?');
    if (confirmed) {
      console.log('Silinecek taşınmazlar:', selectedProperties);
  
      const deleteRequests = selectedProperties.map(property =>
        this.propertyService.deleteProperty(property.id).toPromise()
      );
  
      Promise.all(deleteRequests)
        .then(() => {
          console.log('Silme işlemi başarıyla tamamlandı.');
  
          this.properties = this.properties.filter(property => !property.selected);
          this.filteredProperties = this.properties.slice(); 
          this.updatePagedProperties(); 
  
          this.showAlert('Seçili veriler başarıyla silindi!', 'alert-success');
  
          const log = {
            UserId: this.userId ? Number(this.userId) : 0,
            UserMail: this.userMail|| 'unknown',
            Durum: 'Başarılı',
            IslemTip: 'Taşınmaz Silme',
            Aciklama: `${selectedProperties.length} taşınmaz silindi.`
          };
  
          this.logService.addLog(log).subscribe(
            () => {
              console.log('Log başarıyla kaydedildi.');
            },
            (error) => {
              console.error('Log kaydı sırasında hata oluştu:', error);
            }
          );
        })
        .catch(error => {
          console.error('Silme işlemi başarısız:', error);
          this.showAlert('Veriler silinirken bir hata oluştu.', 'alert-danger');
        });
    }
  }
  

  exportToExcel(): void {
    const dataToExport = (this.searchQuery ? this.filteredProperties : this.properties).map(property => ({
      Taşınmaz_ID: property.id,
      İl: property.mahalle.ilce.il.ilAdi,
      İlçe: property.mahalle.ilce.ilceAdi,
      Mahalle: property.mahalle.mahalleAdi,
      Taşınmaz_Adı: property.tasinmazIsim,
      Ada: property.ada,
      Parsel: property.tasinmazParsel,
      Nitelik: property.tasinmazNitelik,
      Adres: property.tasinmazAdres,
      Koordinat: property.koordinatBilgisi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Taşınmazlar');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    FileSaver.saveAs(blob, 'Tasinmazlar.xlsx');

    const log = {
      UserId: Number(this.userId) || 0,
      UserMail: this.userMail,
      Durum: 'Başarılı',
      IslemTip: 'Excel Aktarma',
      Aciklama: `${dataToExport.length} taşınmaz Excel'e aktarıldı.`
    };

    console.log('Gönderilen log:', log);

    this.logService.addLog(log).subscribe(
      () => {
        console.log('Log başarıyla kaydedildi.');
      },
      (error) => {
        console.error('Log kaydı sırasında hata oluştu:', error);
      }
    );
  }



  logout(): void {
    this.authService.logout();
    const log = {
      UserId: Number(this.userId) || 0,
      UserMail: this.userMail,
      Durum: 'Başarılı',
      IslemTip: 'Çıkış Yapma',
      Aciklama: `Başarıyla çıkış yapıldı`
    }; this.logService.addLog(log).subscribe(
      () => {
        console.log('Log başarıyla kaydedildi.');
      },
      (error) => {
        console.error('Log kaydı sırasında hata oluştu:', error);
      }
    );

  }
  LogScene(): void {
    this.router.navigate(['/log']);
  }
}

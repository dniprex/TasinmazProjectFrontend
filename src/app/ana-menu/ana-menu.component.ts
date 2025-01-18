import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LogService } from '../services/log.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as bootstrap from 'bootstrap';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import XYZ from "ol/source/XYZ";
import jwt_decode from 'jwt-decode';
@Component({
  selector: 'app-ana-menu',
  templateUrl: './ana-menu.component.html',
  styleUrls: ['./ana-menu.component.css']
})
export class AnaMenuComponent implements OnInit {
  private deleteModal: bootstrap.Modal | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('popup') popupElement!: ElementRef
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
  map!: Map;
  overlay!: Overlay;
  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private authService: AuthService,
    private logService: LogService
  ) { }

  ngOnInit(): void {
    this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal') as HTMLElement);
  
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwt_decode(token); 
        this.userRole = decodedToken.role || null; 
        this.userId = decodedToken.nameid || null;
        this.userMail = decodedToken.email || null;
  
        console.log("Kullanıcı Rolü:", this.userRole);
        console.log("Kullanıcı ID:", this.userId);
        console.log("Kullanıcı Mail:", this.userMail);
      } catch (error) {
        console.error("Token çözümleme hatası:", error);
        this.userRole = null;
        this.userId = null;
        this.userMail = null;
      }
    } else {
      console.warn("Token bulunamadı.");
      this.userRole = null;
      this.userId = null;
      this.userMail = null;
    }
  
    this.propertyService.getProperties().subscribe(
      (data) => {
        console.log("API Verisi:", data);
        if (Array.isArray(data) && data.length > 0) {
          if (this.userRole === 'Admin') {
            this.properties = data; 
          } else if (this.userRole === 'User') {
            if (this.userId !== null) {
              this.properties = data.filter((property) => String(property.userId) === String(this.userId));
              console.log("Kullanıcıya ait Taşınmazlar:", this.properties);
            } else {
              console.log("Kullanıcı ID'si tanımlanmamış");
              this.properties = [];
            }
          } else {
            console.warn("Bilinmeyen rol.");
            this.properties = [];
          }
  
          this.filteredProperties = this.properties.slice();
          console.log("Filtrelenmiş Taşınmazlar:", this.filteredProperties);
          this.updatePagedProperties();
          this.initializeMap();
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
  initializeMap(): void {
    // Eğer map zaten oluşturulmuşsa, hedefi temizle
    if (this.map) {
      this.map.setTarget(null); // Mevcut haritayı DOM'dan ayırır
    }

    // OpenStreetMap Katmanı
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true, // Başlangıçta görünür
    });

    // Google Maps Katmanı
    const googleLayer = new TileLayer({
      source: new XYZ({
        url: 'http://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
      }),
      visible: false,
    });

    const vectorSource = new VectorSource();

    this.filteredProperties.forEach((property) => {
      if (property.koordinatBilgisi) {
        const coordinates = property.koordinatBilgisi.split(',').map((coord: string) => parseFloat(coord.trim()));
        const feature = new Feature({
          geometry: new Point(fromLonLat(coordinates)),
          data: property,
        });
        feature.setStyle(
          new Style({
            image: new Icon({
              src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
              scale: 0.05,
            }),
          })
        );
        vectorSource.addFeature(feature);
      }
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [osmLayer, googleLayer, vectorLayer],
      view: new View({
        center: fromLonLat([28.9784, 41.0082]),
        zoom: 6,
      }),
    });

    this.overlay = new Overlay({
      element: this.popupElement.nativeElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -15],
    });
    this.map.addOverlay(this.overlay);

    const switchContainer = document.createElement('div');
    switchContainer.style.position = 'absolute';
    switchContainer.style.bottom = '10px';
    switchContainer.style.right = '10px';
    switchContainer.style.background = 'rgba(255, 255, 255, 0.8)';
    switchContainer.style.padding = '10px';
    switchContainer.style.borderRadius = '5px';
    switchContainer.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.3)';

    const osmButton = document.createElement('button');
    osmButton.textContent = 'OpenStreetMap';
    osmButton.style.marginRight = '5px';
    osmButton.style.padding = '5px 10px';
    osmButton.style.border = 'none';
    osmButton.style.borderRadius = '3px';
    osmButton.style.background = '#198754';
    osmButton.style.color = 'white';

    const googleButton = document.createElement('button');
    googleButton.textContent = 'Google Maps';
    googleButton.style.padding = '5px 10px';
    googleButton.style.border = 'none';
    googleButton.style.borderRadius = '3px';
    googleButton.style.background = '#6c757d';
    googleButton.style.color = 'white';

    osmButton.addEventListener('click', () => {
      osmLayer.setVisible(true);
      googleLayer.setVisible(false);
      osmButton.style.background = '#198754';
      osmButton.style.color = 'white';
      googleButton.style.background = '#6c757d';
      googleButton.style.color = 'white';
    });

    googleButton.addEventListener('click', () => {
      googleLayer.setVisible(true);
      osmLayer.setVisible(false);
      googleButton.style.background = '#198754';
      googleButton.style.color = 'white';
      osmButton.style.background = '#6c757d';
      osmButton.style.color = 'white';
    });

    switchContainer.appendChild(osmButton);
    switchContainer.appendChild(googleButton);
    this.map.getTargetElement().appendChild(switchContainer);

    // Sol alt köşeye opaklık ayarları ekleme
    const opacityContainer = document.createElement('div');
    opacityContainer.style.position = 'absolute';
    opacityContainer.style.bottom = '10px';
    opacityContainer.style.left = '10px';
    opacityContainer.style.background = 'rgba(255, 255, 255, 0.8)';
    opacityContainer.style.padding = '10px';
    opacityContainer.style.borderRadius = '5px';
    opacityContainer.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.3)';
    opacityContainer.style.zIndex = '1000';
    opacityContainer.style.width = '200px';
    opacityContainer.style.fontSize = '14px';
    opacityContainer.style.display = 'flex';
    opacityContainer.style.flexDirection = 'column';

    // OpenStreetMap opaklık ayarı
    const osmOpacityLabel = document.createElement('label');
    osmOpacityLabel.textContent = 'OSM Opaklık:';
    osmOpacityLabel.style.display = 'block';
    osmOpacityLabel.style.marginBottom = '5px';
    osmOpacityLabel.style.fontWeight = 'bold';

    const osmOpacityInput = document.createElement('input');
    osmOpacityInput.type = 'range';
    osmOpacityInput.min = '0.5';
    osmOpacityInput.max = '1';
    osmOpacityInput.step = '0.1';
    osmOpacityInput.value = '1';
    osmOpacityInput.style.marginBottom = '10px';
    osmOpacityInput.addEventListener('input', () => {
      osmLayer.setOpacity(parseFloat(osmOpacityInput.value));
    });

    // Google Maps opaklık ayarı
    const googleOpacityLabel = document.createElement('label');
    googleOpacityLabel.textContent = 'Google Maps Opaklık:';
    googleOpacityLabel.style.display = 'block';
    googleOpacityLabel.style.marginBottom = '5px';
    googleOpacityLabel.style.fontWeight = 'bold';

    const googleOpacityInput = document.createElement('input');
    googleOpacityInput.type = 'range';
    googleOpacityInput.min = '0.5';
    googleOpacityInput.max = '1';
    googleOpacityInput.step = '0.1';
    googleOpacityInput.value = '1';
    googleOpacityInput.addEventListener('input', () => {
      googleLayer.setOpacity(parseFloat(googleOpacityInput.value));
    });

    opacityContainer.appendChild(osmOpacityLabel);
    opacityContainer.appendChild(osmOpacityInput);
    opacityContainer.appendChild(googleOpacityLabel);
    opacityContainer.appendChild(googleOpacityInput);

    this.map.getTargetElement().appendChild(opacityContainer);

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
      if (feature) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        const propertyData = feature.get('data');
        this.overlay.setPosition(coordinates);

        // Popup içeriği
        this.popupElement.nativeElement.innerHTML = `
          <strong>${propertyData.tasinmazNitelik}</strong><br>
          ${propertyData.mahalle.ilce.il.ilAdi}, ${propertyData.mahalle.ilce.ilceAdi}<br>
          Ada: ${propertyData.ada}, Parsel: ${propertyData.tasinmazParsel}
        `;
        this.popupElement.nativeElement.style.display = 'block';
      } else {
        this.popupElement.nativeElement.style.display = 'none';
      }
    });
  }

  searchProperties(): void {
    if (!this.searchQuery) {
      this.filteredProperties = this.properties.slice();
    } else {
      const searchQuery = this.searchQuery.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();


      this.filteredProperties = this.properties.filter(property => {
        const ilAdi = (property.mahalle && property.mahalle.ilce && property.mahalle.ilce.il && property.mahalle.ilce.il.ilAdi)
          ? property.mahalle.ilce.il.ilAdi.toLocaleLowerCase('tr-TR') // Türkçe küçük harfe dönüştürüldü
          : '';

        const ilceAdi = (property.mahalle && property.mahalle.ilce && property.mahalle.ilce.ilceAdi)
          ? property.mahalle.ilce.ilceAdi.toLocaleLowerCase('tr-TR')
          : '';

        const mahalleAdi = (property.mahalle && property.mahalle.mahalleAdi)
          ? property.mahalle.mahalleAdi.toLocaleLowerCase('tr-TR')
          : '';

        const tasinmazParsel = property.tasinmazParsel
          ? property.tasinmazParsel.toString()
          : '';

        const ada = property.ada
          ? property.ada.toString()
          : '';

        const tasinmazNitelik = property.tasinmazNitelik
          ? property.tasinmazNitelik.toLocaleLowerCase('tr-TR')
          : '';

        const tasinmazAdres = property.tasinmazAdres
          ? property.tasinmazAdres.toLocaleLowerCase('tr-TR')
          : '';

        return (
          ilAdi.includes(searchQuery) ||
          ilceAdi.includes(searchQuery) ||
          mahalleAdi.includes(searchQuery) ||
          tasinmazParsel.includes(searchQuery) ||
          ada.includes(searchQuery) ||
          tasinmazNitelik.includes(searchQuery) ||
          tasinmazAdres.includes(searchQuery)
        );
      });
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

    this.openDeleteModal();
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

  confirmDelete(): void {
    const selectedProperties = this.properties.filter(property => property.selected);

    if (selectedProperties.length === 0) {
      this.showAlert('Lütfen silmek için en az bir taşınmaz seçin.', 'alert-danger');
      this.closeDeleteModal();
      return;
    }

    const deleteRequests = selectedProperties.map(property =>
      this.propertyService.deleteProperty(property.id).toPromise()
    );

    Promise.all(deleteRequests)
      .then(() => {
        this.properties = this.properties.filter(property => !property.selected);
        this.filteredProperties = this.properties.slice();
        this.updatePagedProperties();
        this.initializeMap();
        this.showAlert('Seçili veriler başarıyla silindi!', 'alert-success');
        const log = {
          UserId: this.userId ? Number(this.userId) : 0,
          UserMail: this.userMail,
          Durum: 'Başarılı',
          IslemTip: 'Taşınmaz Silme',
          Aciklama: `${selectedProperties.length} taşınmaz silindi.`
        };
        this.logService.addLog(log).subscribe(
          () => console.log('Log başarıyla kaydedildi.'),
          (error) => console.error('Log kaydı sırasında hata oluştu:', error)
        );
      })
      .catch(error => {
        console.error('Silme işlemi başarısız:', error);
        this.showAlert('Veriler silinirken bir hata oluştu.', 'alert-danger');
      })
      .finally(() => {
        this.closeDeleteModal();
      });
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

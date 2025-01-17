import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../services/property.service';
import { Router } from '@angular/router';
import { LogService } from '../services/log.service';
import { AuthService } from '../services/auth.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { toLonLat, fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import ScaleLine from 'ol/control/ScaleLine';
import { defaults as defaultControls } from "ol/control";
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

  map!: Map;
  osmLayer!: TileLayer;
  googleLayer!: TileLayer;
  markerSource!: VectorSource;
  markerLayer!: VectorLayer;
  googleLayerVisible: boolean = false; // Google Maps katmanının görünürlüğü
  osmLayerOpacity: number = 1; // OpenStreetMap katmanının opaklık seviyesi
  googleLayerOpacity: number = 1; // Google Maps katmanının opaklık seviyesi

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private logService: LogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadIller();
    this.initializeMap();
    const osmCheckbox = document.getElementById('osm-layer') as HTMLInputElement;
    if (osmCheckbox) {
      osmCheckbox.checked = true;
    }
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



  initializeMap(): void {
    // Marker için vektör kaynağı
    this.markerSource = new VectorSource();
    this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Marker icon URL
                scale: 0.05,
            }),
        }),
    });

    // OpenStreetMap Katmanı
    this.osmLayer = new TileLayer({
        source: new OSM(),
        visible: true, // Başlangıçta OSM açık
        opacity: this.osmLayerOpacity,
    });

    // Google Maps Katmanı
    this.googleLayer = new TileLayer({
        source: new XYZ({
            url: 'http://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
            maxZoom: 20,
        }),
        visible: this.googleLayerVisible, // Başlangıçta Google Maps kapalı
        opacity: this.googleLayerOpacity,
    });

    // Ölçek Çizgisi Kontrolü
    const scaleLineControl = new ScaleLine({
        units: 'metric', // Ölçü birimi metre
        bar: true,       // Çubuk gösterimi
        text: true,      // Metin gösterimi
        minWidth: 100,   // Minimum genişlik
    });

    // Harita
    this.map = new Map({
        target: 'map',
        layers: [this.osmLayer, this.googleLayer, this.markerLayer],
        view: new View({
            center: fromLonLat([35.2433, 38.9637]), // Türkiye'nin merkez koordinatları
            zoom: 6, // Yakınlaştırma seviyesi
        }),
        controls: defaultControls().extend([scaleLineControl]), // Ölçek kontrolü burada eklendi
    });

    // Harita tıklama olayı
    this.map.on('click', (event) => {
        const coordinates = toLonLat(event.coordinate);
        console.log('Tıklanan Koordinatlar:', coordinates);
        this.addMarker(event.coordinate);

        // Koordinatları form alanına yerleştir
        this.koordinat = `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
    });
    console.log(this.map.getControls().getArray());
    // Haritanın sol altına opaklık kontrolleri ekleme
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
    osmOpacityInput.value = this.osmLayerOpacity.toString();
    osmOpacityInput.style.marginBottom = '10px';
    osmOpacityInput.addEventListener('input', () => {
        this.setOSMLayerOpacity(parseFloat(osmOpacityInput.value));
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
    googleOpacityInput.value = this.googleLayerOpacity.toString();
    googleOpacityInput.addEventListener('input', () => {
        this.setGoogleLayerOpacity(parseFloat(googleOpacityInput.value));
    });

    // Opaklık kontrollerini container'a ekleyin
    opacityContainer.appendChild(osmOpacityLabel);
    opacityContainer.appendChild(osmOpacityInput);
    opacityContainer.appendChild(googleOpacityLabel);
    opacityContainer.appendChild(googleOpacityInput);

    // Opaklık container'ını harita elementine ekleyin
    this.map.getTargetElement().appendChild(opacityContainer);
}


  addMarker(coordinate: [number, number]): void {
    this.markerSource.clear(); // Önceki markerları temizle
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    this.markerSource.addFeature(marker);
  }


  toggleOSMLayer(): void {
    this.osmLayer.setVisible(true);
    this.googleLayer.setVisible(false);

    const osmButton = document.getElementById('osm-layer-button') as HTMLElement;
    const googleButton = document.getElementById('google-layer-button') as HTMLElement;

    osmButton.style.background = '#198754'; // OpenStreetMap için yeşil
    osmButton.style.color = 'white';

    googleButton.style.background = '#6c757d'; // Google Maps için gri
    googleButton.style.color = 'white';

    console.log('OpenStreetMap etkinleştirildi.');
  }

  toggleGoogleLayer(): void {
    this.googleLayer.setVisible(true);
    this.osmLayer.setVisible(false);

    const osmButton = document.getElementById('osm-layer-button') as HTMLElement;
    const googleButton = document.getElementById('google-layer-button') as HTMLElement;

    googleButton.style.background = '#198754'; // Google Maps için yeşil
    googleButton.style.color = 'white';

    osmButton.style.background = '#6c757d'; // OpenStreetMap için gri
    osmButton.style.color = 'white';

    console.log('Google Maps etkinleştirildi.');
  }



  // OpenStreetMap opaklık ayarı
  setOSMLayerOpacity(opacity: number): void {
    if (this.osmLayer) {
      this.osmLayer.setOpacity(opacity);
      console.log(`OpenStreetMap Opaklık: ${opacity}`);
    }
  }

  // Google Maps opaklık ayarı
  setGoogleLayerOpacity(opacity: number): void {
    if (this.googleLayer) {
      this.googleLayer.setOpacity(opacity);
      console.log(`Google Maps Opaklık: ${opacity}`);
    }
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
        const errorMessage = error.error.message || 'Hata oluştu.Lütfen doğru değerler girin.';
        this.showAlert(errorMessage, 'alert-danger');
      }
    );
  }
  cancel(): void {
    this.router.navigate(['/ana-menu']);
  }
}

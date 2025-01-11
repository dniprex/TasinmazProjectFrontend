import { Component, OnInit } from '@angular/core';
import { PropertyService } from './services/property.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  properties: any[] = []; // API'den gelen veriler burada tutulur
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  constructor(private propertyService: PropertyService) { }


  ngOnInit(): void {
    this.propertyService.getProperties().subscribe(
      (data) => {
        this.properties = data;
        console.log(this.properties);
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }
}

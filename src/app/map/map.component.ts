import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map!: Map;

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true, 
        }),
        new TileLayer({
          source: new XYZ({
            url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          }),
          visible: false, 
        }),
      ],
      view: new View({
        center: [0, 0], 
        zoom: 2,
      }),
    });
  }

  toggleLayerVisibility(layerIndex: number) {
    const layer = this.map.getLayers().item(layerIndex);
    layer.setVisible(!layer.getVisible());
  }
}

import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, SimpleChanges} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Polyline from 'ol/format/Polyline';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import LineString from 'ol/geom/LineString';
import {HttpClient} from '@angular/common/http';
import {AngularFireStorage} from '@angular/fire/storage';
import {take} from 'rxjs/operators';
import {easeOut} from 'ol/easing';
import {unByKey} from 'ol/Observable';
import {getVectorContext} from 'ol/render';
import Address from '../../../../models/Address';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {RouteCoordinatesService} from '../../../../services/route/route-coordinates.service';
@Component({
  selector: 'app-pop-up-map',
  templateUrl: './pop-up-map.component.html',
  styleUrls: ['./pop-up-map.component.scss']
})
export class PopUpMapComponent implements AfterViewInit {
  map;
  vectorLayer = new VectorLayer();
  vectorLayerRoute = new VectorLayer();

  // vectorLayer;
  coordinatesSkuska = [[2.173403, 40.385064], [2.273403, 41.385064]];
  // skusam vytvorit trasu
  points;

  places = [];

  carFromDetail;

  pointsFeature;
  coordinatesFeature;

  view;

  tileLayer = new TileLayer({
    source: new OSM({
      wrapX: false,
    }),
  });

  blikaAuto = false;

  resizeObservable$: Observable<Event>;
  resizeSubscription$: Subscription;
  constructor() { }

  notifyMe(addresses: any[]){
    if (addresses !== undefined) {
      this.addMarker(addresses);
    }
  }



  ngAfterViewInit(): void {
    // setTimeout(() =>
    //   {
    this.view = new View({
      center: olProj.fromLonLat([0, 0]),
      zoom: 1
    });

    this.map = new Map({
      target: 'mapPopUp',
      layers: [
        this.tileLayer, this.vectorLayer
      ],
      view: this.view
    });

    setTimeout(() =>
      {
        this.map.updateSize();
      },
      1000);

    setTimeout(() =>
      {
        this.resizeObservable$ = fromEvent(window, 'resize');
        this.resizeSubscription$ = this.resizeObservable$.subscribe( evt => {
          setTimeout(() =>
            {
              this.map.updateSize();
            },
            1000);
        });

      },
      500);

  }



  addMarker(addresses: any[]){
    this.places = [];

    if (this.coordinatesFeature != null || this.coordinatesFeature !== undefined){
      this.places.push(this.coordinatesFeature);
    }


    if (addresses) {
      // for (let i = 0; i < addresses.length; i++) {
      //   if (addresses[i].coordinatesOfTownsLon){
          const iconFeature = new Feature({
            geometry: new Point(fromLonLat([addresses[0], addresses[1]])),
            name: 'place'
          });

          const iconStyle = new Style({
            image: new CircleStyle({
              radius: 8,
              stroke: new Stroke({
                color: '#fff'
              }),
              fill: new Fill({
                color: '#ff0000'
              }),
            }),
          });
          iconFeature.setStyle(iconStyle);
          this.places.push(iconFeature);
        // }
      // }



    }



    // this.coordinatesFeature =
    const vectorSource = new VectorSource({
      features: this.places,
    });

    if (this.map){
      this.map.removeLayer(this.vectorLayer);
      this.map.removeLayer(this.vectorLayer);
      this.map.removeLayer(this.vectorLayer);
    }


    this.vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.vectorLayer.setZIndex(2);
    this.map.addLayer(this.vectorLayer);

    this.view.fit(vectorSource.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50} );

  }
}

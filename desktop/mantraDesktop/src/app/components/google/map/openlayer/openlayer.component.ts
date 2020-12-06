import {Component, EventEmitter, Input, OnInit, SimpleChanges} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import {Subject} from "rxjs";
@Component({
  selector: 'app-openlayer',
  templateUrl: './openlayer.component.html',
  styleUrls: ['./openlayer.component.scss']
})
export class OpenlayerComponent implements OnInit {
  map;
  vectorLayer = new VectorLayer();


  constructor() { }


  notifyMe(lat, lon, car){
    this.addMarker(lat,lon, car);
  }

  ngOnInit(): void {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }), this.vectorLayer
      ],
      view: new View({
        center: olProj.fromLonLat([0, 0]),
        zoom: 1
      })
    });
  }
  addMarker(lat, lon, car){
    var places = [];
    if (car.lattitude != undefined){

      var carFeature1 = new Feature({
        geometry: new Point(fromLonLat([car.longtitude, car.lattitude])),
        name: 'car'
      });

      var carStyle1 = new Style({
        image: new Icon({
          color: '#8959A8',
          crossOrigin: 'anonymous',
          src: 'assets/logo/truck.png',
          scale: 0.05

        })
      });
      carFeature1.setStyle(carStyle1);
      places.push(carFeature1);
    }

    for (let i = 0; i<car.length; i++){
      console.log(car[i].lattitude)

      if (car[i].lattitude != undefined){

        var carFeature = new Feature({
          geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
          name: 'car'
        });


        var carStyle = new Style({
          image: new Icon({
            color: '#8959A8',
            crossOrigin: 'anonymous',
            src: 'assets/logo/truck.png',
            scale: 0.03

          })
        });
        carFeature.setStyle(carStyle);
        places.push(carFeature);
      }
    }



    if (lat.length > 0) {
      for (let i = 0; i < lat.length; i++) {
        var iconFeature = new Feature({
          geometry: new Point(fromLonLat([lon[i], lat[i]])),
          name: 'place'
        });

        var iconStyle = new Style({
          image: new CircleStyle({
            radius: 8,
            stroke: new Stroke({
              color: '#fff'
            }),
            fill: new Fill({
              color: '#ff0000'
            })
          })
        });
        iconFeature.setStyle(iconStyle);
        places.push(iconFeature)
      }


      if (lon.length === 1) {
        this.map.getView().setCenter(fromLonLat([lon, lat]))
        this.map.getView().setZoom(8)
      } else {
        // console.log(lon.length - 1)
        // this.map.getView().animate({
        //   center: fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])),
        //   zoom: 8,
        //   duration: 1000
        // })
        this.map.getView().setCenter(fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])));
        this.map.getView().setZoom(8);
      }
    }

    var vectorSource = new VectorSource({
      features: places,
    });

    this.map.removeLayer(this.vectorLayer)
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.map.addLayer(this.vectorLayer);
  }
}

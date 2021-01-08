import {Component, EventEmitter, Input, OnInit, SimpleChanges} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Polyline from 'ol/format/Polyline';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style'
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
import {HttpClient} from "@angular/common/http";
import {AngularFireStorage} from "@angular/fire/storage";
import {take} from "rxjs/operators";


@Component({
  selector: 'app-openlayer',
  templateUrl: './openlayer.component.html',
  styleUrls: ['./openlayer.component.scss']
})
export class OpenlayerComponent implements OnInit {
  map;
  vectorLayer = new VectorLayer();
  // vectorLayer;
  coordinatesSkuska = [[2.173403, 40.385064], [2.273403,41.385064]];
  //skusam vytvorit trasu
  points;

  places = [];

  pointsFeature;
  coordinatesFeature;

  constructor(private http: HttpClient, private storage: AngularFireStorage) { }


  notifyMe(lat, lon, car, route){
    if (lat.length > 0) {
      this.addMarker(lat, lon, car);
    }

    if (this.coordinatesFeature == undefined && car !== undefined) {
        this.addRoute(route);
      }
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


  addRoute(car){
    var outputData;
    const ref = this.storage.ref('Routes/' + car.id + '.json');
    var stahnute = ref.getDownloadURL().subscribe(data => {
      // console.log(data);

      this.http.get(data, { responseType: 'text' as 'json' }).pipe(take(1)).subscribe(text =>{
          outputData = text;

          //zmena na json
          outputData = JSON.parse(outputData);
          //zmena na pole
          outputData = outputData.map(Object.values);

          // zo sygicu mi pridu hodnoty * 100000 - mapy podporuju len normalny format preto to delim 100000
          var finishArray = outputData.map(prvePole =>
            prvePole.map(prvok => prvok / 100000));
          this.points = finishArray;

          var route = new LineString(this.points)
            .transform('EPSG:4326', 'EPSG:3857');

          var routeCoords = route.getCoordinates();
          var routeLength = routeCoords.length;

          var routeFeature = new Feature({
            type: 'route',
            geometry: route
          });
          var routeStyle = new Style({
            stroke: new Stroke({
              width: 6,
              color: [246, 36, 89, 0.8]
            })
          });
          routeFeature.setStyle(routeStyle);


          this.places.push(routeFeature);
          this.coordinatesFeature = routeFeature;

          var vectorSource = new VectorSource({
            features: this.places,
          });

          this.map.removeLayer(this.vectorLayer)
          this.vectorLayer = new VectorLayer({
            source: vectorSource,
          });
          this.map.addLayer(this.vectorLayer);

        }, (error) => {
          console.log("trasa nenajdena")
        })
    },error => {
      console.log("trasa nenajdena")
    } );

  }

  addMarker(lat, lon, car){
    this.places = [];

    if (this.coordinatesFeature != null || this.coordinatesFeature != undefined){
      this.places.push(this.coordinatesFeature);
    }

    if (car !== undefined && car.lattitude != undefined){

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
      this.places.push(carFeature1);


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
        this.places.push(carFeature);
      }
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
            }),
          }),
          text: new Text({
            text: (i+1).toString(),
            fill: new Fill({
              color: '#fff',
            }),
          }),
        });
        iconFeature.setStyle(iconStyle);
        this.places.push(iconFeature)
      }



    }



    // this.coordinatesFeature =
    var vectorSource = new VectorSource({
      features: this.places,
    });

    this.map.removeLayer(this.vectorLayer)
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.map.addLayer(this.vectorLayer);

    if (lon.length === 1) {
      this.map.getView().setCenter(fromLonLat([lon, lat]))
      this.map.getView().setZoom(8)

    } else {
      // console.log(lon.length - 1)
      // this.map.getView().animate({
      //   center: fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])),
      //   zoom: 8,
      //   duration: 800
      // })
      this.map.getView().setCenter(fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])));
      this.map.getView().setZoom(8);
    }

  }
}

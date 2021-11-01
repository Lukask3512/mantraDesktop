import {AfterViewInit, Component, EventEmitter, Input, OnInit, SimpleChanges} from '@angular/core';
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
import {easeOut} from 'ol/easing';
import {unByKey} from 'ol/Observable';
import {getVectorContext} from 'ol/render';
import Address from "../../../../models/Address";


@Component({
  selector: 'app-openlayer',
  templateUrl: './openlayer.component.html',
  styleUrls: ['./openlayer.component.scss']
})
export class OpenlayerComponent implements AfterViewInit{
  map;
  vectorLayer = new VectorLayer();
  // vectorLayer;
  coordinatesSkuska = [[2.173403, 40.385064], [2.273403,41.385064]];
  //skusam vytvorit trasu
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

  constructor(private http: HttpClient, private storage: AngularFireStorage) { }


  notifyMe(addresses: Address[], car){
    console.log(addresses, car , car)
    if (addresses != undefined) {
      this.addMarker(addresses, car);
    }

    if (this.coordinatesFeature == undefined && car !== undefined) {
      this.addRoute(car);
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
          target: 'map',
          layers: [
            this.tileLayer, this.vectorLayer
          ],
          view: this.view
        });
        // this.map.render();
      // },
      // 100);
  }


  addRoute(car){
    if (car && car.id){
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

  }

  addMarker(addresses: Address[], car){
    this.places = [];

    if (this.coordinatesFeature != null || this.coordinatesFeature != undefined){
      this.places.push(this.coordinatesFeature);
    }

    if (car !==null && car !== undefined && car.lattitude != undefined){
      this.carFromDetail = car
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
      if (car.status == 4 && this.blikaAuto == false){
        this.flashCar(carFeature1, 2000, car)
      }

      // for (let i = 0; i<car.length; i++){
      //   console.log(car[i].lattitude)
      //
      //   if (car[i].lattitude != undefined){
      //
      //     var carFeature = new Feature({
      //       geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
      //       name: 'car'
      //     });
      //
      //
      //     var carStyle = new Style({
      //       image: new Icon({
      //         color: '#8959A8',
      //         crossOrigin: 'anonymous',
      //         src: 'assets/logo/truck.png',
      //         scale: 0.03
      //
      //       })
      //     });
      //
      //     carFeature.setStyle(carStyle);
      //     this.places.push(carFeature);
      //   }
      // }
    }



    if (addresses) {
      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i].coordinatesOfTownsLon){
        var iconFeature = new Feature({
          geometry: new Point(fromLonLat([addresses[i].coordinatesOfTownsLon, addresses[i].coordinatesOfTownsLat])),
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



    }



    // this.coordinatesFeature =
    var vectorSource = new VectorSource({
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
    this.map.addLayer(this.vectorLayer);

    this.view.fit(vectorSource.getExtent(), {padding: [100,100,100,100],minResolution: 50} )


    // if (lon.length === 1) {
    //   this.map.getView().setCenter(fromLonLat([lon, lat]))
    //   this.map.getView().setZoom(8)
    //
    // } else {
    //   // console.log(lon.length - 1)
    //   // this.map.getView().animate({
    //   //   center: fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])),
    //   //   zoom: 8,
    //   //   duration: 800
    //   // })
    //   this.map.getView().setCenter(fromLonLat(([lon[lon.length - 1], lat[lat.length - 1]])));
    //   this.map.getView().setZoom(8);
    // }

  }

  flashCar(feature, duration, car) {
    var boolean = false;
    // if (this.pulseCar) {
    var start = +new Date();
    this.blikaAuto = true;
    //setCenter
    this.map.getView().setCenter(fromLonLat([car.longtitude, car.lattitude]))
    this.map.getView().setZoom(10);


    // var flash = this.flash(feature, duration);
    let animate =  (event) => {
      // let carInData = this.carsFromDatabase.find(findCar => findCar.id == car.id);
      if (this.carFromDetail.status != 4){
        return;
      }

      // canvas context where the effect will be drawn
      var vectorContext = getVectorContext(event);
      var frameState = event.frameState;

      // create a clone of the original ol.Feature
      // on each browser frame a new style will be applied
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      var radius = easeOut(elapsedRatio) * 25 + 5;
      var opacity = easeOut(1 - elapsedRatio);


      // you can customize here the style
      // like color, width
      var style = new Style({
        image: new CircleStyle({
          radius: radius,
          snapToPixel: false,
          fill: new Fill({
            color: [240, 51, 51, opacity / 2]
          }),
          stroke: new Stroke({
            color: [240, 51, 51, opacity],
            width: 0.25 + opacity
          }),

        })
      });

      var styledelete = new Style({
      });


      // if (!vectorContext){
      vectorContext.setStyle(styledelete);
      vectorContext.setStyle(style);

      // }
      vectorContext.drawGeometry(flashGeom);
      // map.render();

      if (elapsed > duration) { // stop the effect

        start = +new Date();
        // if (boolean == false) {
        // this.flashCar(feature, 3000, car);
        this.tileLayer.on('postrender', animate);
        boolean = true;
        // this.map.render();
        // return;

        // }else{
        //   return;
        // }
      }
      this.map.render();

    }
    var listenerKey = this.tileLayer.on('postrender', animate); // to remove the listener after the duration


  }
}

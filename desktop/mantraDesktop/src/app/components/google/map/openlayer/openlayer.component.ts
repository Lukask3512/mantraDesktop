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
  selector: 'app-openlayer',
  templateUrl: './openlayer.component.html',
  styleUrls: ['./openlayer.component.scss']
})
export class OpenlayerComponent implements AfterViewInit{
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

  constructor(private http: HttpClient, private storage: AngularFireStorage,
              private routeCoordinates: RouteCoordinatesService) { }


  notifyMe(addresses: Address[], car){
    if (addresses !== undefined) {
      this.addMarker(addresses, car);
    }

    if (this.coordinatesFeature === undefined && car !== undefined) {
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



  addRoute(car){
    if (car && car.id){
      this.routeCoordinates.getRoute(car.id).subscribe((nasolSom) => {
        if (nasolSom !== undefined || nasolSom !== null){
          setTimeout(() => {

        let outputData;
        const ref = this.storage.ref('Routes/' + car.id + '.json');
        const stahnute = ref.getDownloadURL().subscribe(data => {
          // console.log(data);

          this.http.get(data, {responseType: 'text' as 'json'}).pipe(take(1)).subscribe(text => {
            outputData = text;

            // zmena na json
            outputData = JSON.parse(outputData);
            // zmena na pole
            outputData = outputData.map(Object.values);

            // zo sygicu mi pridu hodnoty * 100000 - mapy podporuju len normalny format preto to delim 100000
            const finishArray = outputData.map(prvePole =>
              prvePole.map(prvok => prvok / 100000));
            this.points = finishArray;

            const route = new LineString(this.points)
              .transform('EPSG:4326', 'EPSG:3857');

            const routeCoords = route.getCoordinates();
            const routeLength = routeCoords.length;

            const routeFeature = new Feature({
              type: 'route',
              geometry: route
            });
            const routeStyle = new Style({
              stroke: new Stroke({
                width: 6,
                color: [246, 36, 89, 0.8]
              })
            });
            routeFeature.setStyle(routeStyle);


            // this.places.push(routeFeature);

            const trasa = [routeFeature];
            // this.coordinatesFeature = routeFeature;

            const vectorSource = new VectorSource({
              features: trasa,
            });

            this.map.removeLayer(this.vectorLayerRoute);
            this.vectorLayerRoute = new VectorLayer({
              source: vectorSource,
            });
            this.vectorLayerRoute.setZIndex(1);
            this.map.addLayer(this.vectorLayerRoute);

          }, (error) => {
            console.log('trasa nenajdena');
          });
        }, error => {
          console.log('trasa nenajdena');
        });
          }, 3000);
        }
      });
    }

  }

  addMarker(addresses: Address[], car){
    this.places = [];

    if (this.coordinatesFeature != null || this.coordinatesFeature !== undefined){
      this.places.push(this.coordinatesFeature);
    }

    if (car !== null && car !== undefined && car.lattitude !== undefined){
      this.carFromDetail = car;
      const carFeature1 = new Feature({
        geometry: new Point(fromLonLat([car.longtitude, car.lattitude])),
        name: 'car'
      });

      const carStyle1 = new Style({
        image: new Icon({
          color: '#8959A8',
          crossOrigin: 'anonymous',
          src: 'assets/logo/truck.png',
          scale: 0.05

        })
      });
      carFeature1.setStyle(carStyle1);
      this.places.push(carFeature1);
      if (car.status === 4 && this.blikaAuto === false){
        this.flashCar(carFeature1, 2000, car);
      }
    }



    if (addresses) {
      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i].coordinatesOfTownsLon){
        const iconFeature = new Feature({
          geometry: new Point(fromLonLat([addresses[i].coordinatesOfTownsLon, addresses[i].coordinatesOfTownsLat])),
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
          text: new Text({
            text: (i + 1).toString(),
            fill: new Fill({
              color: '#fff',
            }),
          }),
        });
        iconFeature.setStyle(iconStyle);
        this.places.push(iconFeature);
      }
      }



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

  flashCar(feature, duration, car) {
    // let boolean = false;
    // if (this.pulseCar) {
    let start = +new Date();
    this.blikaAuto = true;
    // setCenter
    this.map.getView().setCenter(fromLonLat([car.longtitude, car.lattitude]));
    this.map.getView().setZoom(10);

    // var flash = this.flash(feature, duration);
    const animate =  (event) => {
      // let carInData = this.carsFromDatabase.find(findCar => findCar.id == car.id);
      if (this.carFromDetail.status !== 4){
        return;
      }

      // canvas context where the effect will be drawn
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;

      // create a clone of the original ol.Feature
      // on each browser frame a new style will be applied
      const flashGeom = feature.getGeometry().clone();
      const elapsed = frameState.time - start;
      const elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      const radius = easeOut(elapsedRatio) * 25 + 5;
      const opacity = easeOut(1 - elapsedRatio);


      // you can customize here the style
      // like color, width
      const style = new Style({
        image: new CircleStyle({
          radius,
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

      const styledelete = new Style({
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
        // boolean = true;
        // this.map.render();
        // return;

        // }else{
        //   return;
        // }
      }
      this.map.render();

    };
    const listenerKey = this.tileLayer.on('postrender', animate); // to remove the listener after the duration


  }
}

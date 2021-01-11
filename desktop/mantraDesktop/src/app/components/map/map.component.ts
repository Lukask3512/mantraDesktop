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
import {DataService} from "../../data/data.service";
import Route from "../../models/Route";
import {RouteService} from "../../services/route.service";
import {CarService} from "../../services/car.service";
import Cars from "../../models/Cars";
import {RouteStatusService} from "../../data/route-status.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {RouteToCarComponent} from "../dialogs/route-to-car/route-to-car.component";
import {easeOut} from 'ol/easing';
import {unByKey} from 'ol/Observable';
import {getVectorContext} from 'ol/render';
import {BehaviorSubject} from "rxjs";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map;
  vectorLayerAdress = new VectorLayer();
  vectorLayerCars = new VectorLayer();
  vectorLayerCoordinates = new VectorLayer();
  // vectorLayer;
  coordinatesSkuska = [[2.173403, 40.385064], [2.273403,41.385064]];
  //skusam vytvorit trasu
  points;

  carWarningStatus = []; // ukladam si vectori sem, aby sa neduplikovali

  colors = ['#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#E67E22', '#F1C40F', '#E67E22',
  '#641E16', '#4A235A', '#0B5345', '#7D6608', '#626567', '#424949']

  //features pre mapu
  places = [];
  cars = [];
  routes = [];

  pointsFeature;
  coordinatesFeature;

  carsFromDatabase;
  routesFromDatabase;
  adressesFromDatabase;

  private _routesToShow = new BehaviorSubject<any>([]);
  readonly routes$ = this._routesToShow.asObservable();

  carToShow: Cars;
  routesToShow: Route[];

  pulseCar:boolean = false;
  pulseMarker:boolean = false;

  tileLayer = new TileLayer({
    source: new OSM({
      wrapX: false,
    }),
  });

  view;
  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog) { }


  ngOnInit(): void {
    this.view = new View({
      center: olProj.fromLonLat([0, 0]),
      zoom: 1
    });

    this.map = new Map({
      target: 'map',
      layers: [
        this.tileLayer, this.vectorLayerAdress
      ],
      view: this.view
    });

    // this.carsFromDatabase = this.dataService.getAllCars()

    this.routeService.routes$.subscribe(newRoutes => {
      this.pulseMarker = false;
      this.adressesFromDatabase = newRoutes;
      this.addMarker(this.adressesFromDatabase);
    });

    this.carService.cars$.subscribe(newCars => {
      this.carsFromDatabase = newCars;
      this.addCars(this.carsFromDatabase);
    });

    // this.sendCarsToRoute();


    //onlick
    this.map.on('click', evt => {
      var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      if (feature) {
        console.log(feature.get('type'))
        var type = feature.get('type');
        if (type == "car"){
          this.onClickFindInfo(feature.get('name'))
        }
        else if(type == "route"){
          this.onClickFindInfoAdress(feature.get('name'))
        }
        // $(element).popover('show');
      } else {
        // $(element).popover('dispose');
      }
    });

    this.checkFeatureUnderMouse(); //pointer
  }
//ak kliknem na auto
  onClickFindInfo(id){
    this.carToShow = this.carsFromDatabase.find(car => car.id ==id);
    this.routesToShow = this.adressesFromDatabase.filter(route => route.carId == this.carToShow.id);
  }

  //ak kliknem na auto
  onClickFindInfoAdress(id){
    console.log(id)
    this.routesToShow = this.adressesFromDatabase.filter(route => route.id == id);
    this.carToShow = this.carsFromDatabase.find(car => car.id == this.routesToShow[0].carId)
    // this.carToShow = this.carsFromDatabase.find(car => car.id == this.routesToShow[0].carId);
  }



  // getLatLonFromActive(routes){
  //   console.log(routes)
  //
  //   routes.forEach(route => {
  //
  //
  //       // this.addMarker(route.coordinatesOfTownsLat, route.coordinatesOfTownsLon, this.colors[color]);
  //     this.addMarker(routes, this.colors[color]);
  //     this.addRoute(route, this.colors[color])
  //
  //   })
  // }

  sendCarsToRoute(){
    var color = -1;
    this.dataService.getAllCars().forEach(car => {
      color++;
      if (color >= this.colors.length){
        color = 0;
      }

      this.addRoute(car, this.colors[color])
    });
  }

  addRoute(route, color){
    this.routes = [];
    var outputData;
    const ref = this.storage.ref('Routes/' + route.id + '.json');
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

        var routeString = new LineString(this.points)
          .transform('EPSG:4326', 'EPSG:3857');

        var routeFeature = new Feature({
          type: 'route',
          geometry: routeString,
          name: route.id
        });
        var routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: color
          })
        });
        routeFeature.setStyle(routeStyle);


        this.routes.push(routeFeature);
        this.coordinatesFeature = routeFeature;

        var vectorSource = new VectorSource({
          features: this.routes
        });

        this.map.removeLayer(this.vectorLayerCoordinates)
        this.vectorLayerCoordinates = new VectorLayer({
          source: vectorSource,
        });
        this.vectorLayerCoordinates.setZIndex(1);
        this.map.addLayer(this.vectorLayerCoordinates);

        var vectorNaZobrazenieAllFeatures =  new VectorSource({
          features: this.places.concat(this.cars).concat(this.routes)
        });

        // var velkost = this.map.getSize();
        // console.log(velkost)
        // this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50} )

      }, (error) => {
        console.log("trasa nenajdena")
      })
    },error => {
      console.log("trasa nenajdena")
    } );

  }

  checkFeatureUnderMouse(){
    this.map.on("pointermove", function (evt)
    {   var hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) { return true; });
      if (hit) this.getViewport().style.cursor = 'pointer';
      else this.getViewport().style.cursor = '';
    });
  }

  addCars(car){
      this.cars = [];
      // this.carWarningStatus = [];
      this.pulseCar = false;


    if (car !== undefined){
        for (let i = 0; i<car.length; i++){

          //update vozidla ak mam nakliknute nejake
          if ( this.carToShow != undefined && car[i].id == this.carToShow.id){
            this.onClickFindInfo(car[i].id);
            console.log("som nasiel same")
          }



          // console.log(car[i].lattitude)

          if (car[i].lattitude != undefined){

            var carFeature = new Feature({
              geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
              name: car[i].id,
              type: "car"
            });


            var carStyle = new Style({
              image: new Icon({
                color: '#8959A8',
                crossOrigin: 'anonymous',
                src: 'assets/logo/truck.png',
                scale: 0.05
              })
            });
            carFeature.setStyle(carStyle);
            this.cars.push(carFeature);
            if (car[i].status == 4) {
              this.pulseCar = true;




              //pre blikanie
              var isThereCar = this.carWarningStatus.filter(findCar => findCar.id == car[i].id);
              console.log(isThereCar)

              if (isThereCar.length == 0 ){
                this.flashCar(carFeature, 1000, car[i]);
                this.carWarningStatus.push(car[i]);
              }

            }else{
              this.carWarningStatus = this.carWarningStatus.filter(findCar => findCar.id != car[i].id);
            }
          }
        }
      }
    this.map.removeLayer(this.vectorLayerCars)

      var vectorSource = new VectorSource({
        features: this.cars
      });

      this.vectorLayerCars = new VectorLayer({
        source: vectorSource,
      });
    this.vectorLayerCars.setZIndex(3);
      this.map.addLayer(this.vectorLayerCars);

    var vectorNaZobrazenieAllFeatures =  new VectorSource({
      features: this.places.concat(this.cars).concat(this.routes)
    });
    this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50} )
    }

   flashCar(feature, duration, car) {
     var boolean = false;
    if (this.pulseCar) {
      var start = +new Date();


      // var flash = this.flash(feature, duration);
       let animate =  (event) => {
         let carInData = this.carsFromDatabase.find(findCar => findCar.id == car.id);
         if (carInData.status != 4){
              return;
         }

         // var ssThereCar = this.carWarningStatus.filter(findCar => findCar.id == car.id);
         // console.log(c)
         // if (ssThereCar != undefined && ssThereCar.length > 1) {
         //   return;
         // }


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

  // flashMarker(feature, duration) {
  //   if (this.pulseMarker) {
  //     var start = +new Date();
  //     var map = this.map;
  //
  //     // var flash = this.flash(feature, duration);
  //     let animate =  (event) => {
  //       // canvas context where the effect will be drawn
  //
  //       var vectorContext = getVectorContext(event);
  //
  //       var frameState = event.frameState;
  //
  //       // create a clone of the original ol.Feature
  //       // on each browser frame a new style will be applied
  //       var flashGeom = feature.getGeometry().clone();
  //       var elapsed = frameState.time - start;
  //       var elapsedRatio = elapsed / duration;
  //       // radius will be 5 at start and 30 at end.
  //       var radius = easeOut(elapsedRatio) * 25 + 5;
  //       var opacity = easeOut(1 - elapsedRatio);
  //
  //
  //       // you can customize here the style
  //       // like color, width
  //       var style = new Style({
  //         image: new CircleStyle({
  //           radius: radius,
  //           snapToPixel: false,
  //           fill: new Fill({
  //             color: [240, 51, 51, opacity / 2]
  //           }),
  //           stroke: new Stroke({
  //             color: [240, 51, 51, opacity],
  //             width: 0.25 + opacity
  //           }),
  //
  //         })
  //       });
  //
  //
  //         vectorContext.setStyle(style);
  //         vectorContext.drawGeometry(flashGeom);
  //
  //
  //
  //       if (elapsed > duration) { // stop the effect
  //         if (this.pulseMarker){
  //           // start = +new Date();
  //           // flashGeom = feature.getGeometry().clone();
  //           // elapsed = frameState.time - start;
  //           // elapsedRatio = elapsed / duration;
  //           // // radius will be 5 at start and 30 at end.
  //           // radius = easeOut(elapsedRatio) * 25 + 5;
  //           // opacity = easeOut(1 - elapsedRatio);
  //           // // this.flashMarker(feature,duration);
  //           start = +new Date();
  //           this.tileLayer.on('postrender', animate);
  //         }
  //         else{
  //           vectorContext.setStyle(null);
  //           vectorContext.drawGeometry(null);
  //           unByKey(listenerKey);
  //           return;
  //         }
  //
  //       }else{
  //         if (!this.pulseMarker) {
  //           vectorContext.setStyle(null);
  //           vectorContext.drawGeometry(null);
  //           unByKey(listenerKey);
  //           return;
  //         }
  //       }
  //
  //       map.render();
  //     }
  //     var listenerKey = this.tileLayer.on('postrender', animate); // to remove the listener after the duration
  //
  //
  //   }
  // }




  addMarker(routes: Route[]){
    this.places = [];

    // this.map.removeLayer(this.vectorLayer)
    if (this.coordinatesFeature != null || this.coordinatesFeature != undefined){
      this.places.push(this.coordinatesFeature);
    }
    var color = -1;


  routes.forEach((route, index) => {

    if (this.routesToShow != undefined)
      console.log(this.routesToShow[0].id);
      console.log(route.id)
    if (this.routesToShow != undefined && route.id == this.routesToShow[0].id){
      console.log("som nasiel same")
      this.onClickFindInfoAdress(route.id);
    }


    color++;
    if (color >= this.colors.length){
      color = 0;
    }
    this.addRoute(route, this.colors[color]);

    if (route.coordinatesOfTownsLat.length > 0) {
      for (let i = 0; i < route.coordinatesOfTownsLat.length; i++) {
        var iconFeature = new Feature({
          geometry: new Point(fromLonLat([route.coordinatesOfTownsLon[i], route.coordinatesOfTownsLat[i]])),
          name: route.id,
          type: "route"
        });

        if (route.status[i] == 3){
          var iconStyle = new Style({
            image: new CircleStyle({
              radius: 8,
              stroke: new Stroke({
                color: '#7FFF00'
              }),
              fill: new Fill({
                color: this.colors[color]
              }),
            }),
            text: new Text({
              text: (i+1).toString() + "✓",
              fill: new Fill({
                color: '#fff',
              }),
            })
          });
        }
        else if (route.status[i] == 4){
          var iconStyle = new Style({
            image: new CircleStyle({
              radius: 10,
              stroke: new Stroke({
                color: '#FF0000'
              }),
              fill: new Fill({
                color: this.colors[color]
              }),
            }),
            text: new Text({
              text: (i+1).toString() + "X",
              fill: new Fill({
                color: '#fff',
              }),
            })
          });
          this.pulseMarker=true;
          // this.flashMarker(iconFeature, 1000);
        }else{
          var iconStyle = new Style({
            image: new CircleStyle({
              radius: 8,
              stroke: new Stroke({
                color: '#fff'
              }),
              fill: new Fill({
                color: this.colors[color]
              }),
            }),
            text: new Text({
              text: (i+1).toString(),
              fill: new Fill({
                color: '#fff',
              }),
            })
          });
        }


        iconFeature.setStyle(iconStyle);
        this.places.push(iconFeature)

      }
    }

  });



    // .concat(this.routes).concat(this.cars),
    // this.coordinatesFeature =
    var vectorSource = new VectorSource({
      features: this.places
    });

    this.map.removeLayer(this.vectorLayerAdress)
    this.vectorLayerAdress = new VectorLayer({
      source: vectorSource,
    });
    this.vectorLayerAdress.setZIndex(2);
    this.map.addLayer(this.vectorLayerAdress);
    if (vectorSource.getFeatures()[0] != undefined) {


      var feature = vectorSource.getFeatures()[0];
      var polygon = feature.getGeometry();

      var vectorNaZobrazenieAllFeatures =  new VectorSource({
        features: this.places.concat(this.cars).concat(this.routes)
      });

      // var velkost = this.map.getSize();
      // console.log(velkost)
      this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50} )
    }



    // if (routes.length === 1) {
    //   this.map.getView().setCenter(fromLonLat([routes[0].coordinatesOfTownsLon, routes[0].coordinatesOfTownsLat]))
    //   this.map.getView().setZoom(8)
    //
    // } else {
    //   // this.map.getView().animate({
    //   //   center: fromLonLat(([routes[0].coordinatesOfTownsLon[routes[0].coordinatesOfTownsLon.length - 1], routes[0].coordinatesOfTownsLon[routes[0].coordinatesOfTownsLon.length - 1]])),
    //   //   zoom: 8,
    //   //   duration: 800
    //   // })
    //   // this.map.getView().setCenter(fromLonLat(([routes[routes.l][route.coordinatesOfTownsLon.length - 1],
    //   //   route.coordinatesOfTownsLat[route.coordinatesOfTownsLat.length - 1]])));
    //   // this.map.getView().setZoom(8);
    // }

  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    return date.toLocaleString();
  }

  openAddDialog(route: Route, newRoute: boolean, routeId: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      routesTowns: route.nameOfTowns,
      routesLat: route.coordinatesOfTownsLat,
      routesLon: route.coordinatesOfTownsLon,
      routesType: route.type,
      routeId: routeId,
      routeStatus: route.status,
      aboutRoute: route.aboutRoute,
      newRoute: newRoute
    };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value)
      if (value === undefined){
        return;
      }else{
        this.carToShow = value.car;
        return;
      }
    });
  }
}


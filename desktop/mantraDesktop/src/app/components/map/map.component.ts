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
export class MapComponent {
  map;
  vectorLayerAdress = new VectorLayer();
  vectorLayerCars = new VectorLayer();
  vectorLayerCoordinates;
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

  firstZoomCars = false;
  firstZoomAddress = false;


  tileLayer = new TileLayer({
    source: new OSM({
      wrapX: false,
    }),
  });

  view;
  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog) { }


  ngAfterViewInit(): void {
    setTimeout(() =>
    {
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
      this.carService.cars$.subscribe(newCars => {
        this.carsFromDatabase = newCars;
        this.addCars(this.carsFromDatabase);
        console.log("nacitavam auto")

      });

    this.routeService.routes$.subscribe(newRoutes => {
      this.pulseMarker = false;
      this.adressesFromDatabase = newRoutes;
      console.log("nacitavam marker")
      console.log(newRoutes)
      this.addMarker(this.adressesFromDatabase);
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
          this.onClickFindInfo(feature.get('name'));
          this.zoomToAddressOrCar(feature)
        }

        else if(type == "town"){
          this.zoomToAddressOrCar(feature)
          this.onClickFindInfoAdress(feature.get('name'))
        }
        else if(type == "route"){
          this.zoomToRoute(feature)
          this.onClickFindInfoAdress(feature.get('name'))
        }
        // $(element).popover('show');
      } else {
        // $(element).popover('dispose');
      }
    });

    this.checkFeatureUnderMouse(); //pointer
    },
      200);
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

  addRoute(routes) {
    this.routes = [];
    var outputData;

    routes.forEach((route, index) => {



    const ref = this.storage.ref('Routes/' + route.id + '.json');
    var stahnute = ref.getDownloadURL().subscribe(data => {


      this.http.get(data, {responseType: 'text' as 'json'}).pipe(take(1)).subscribe(text => {

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
            color: this.getColorByIndex(index)
          })
        });
        routeFeature.setStyle(routeStyle);

      // console.log(routeFeature);
      // console.log(route)
        this.routes.push(routeFeature);
      this.pridajCestyNaMapu();


      }, (error) => {
        console.log("trasa nenajdena1")
      })
    }, error => {
      console.log("trasa nenajdena2")
    });

  });
    if (routes.length == 0){
      this.map.removeLayer(this.vectorLayerCoordinates)
    }
  }

  pridajCestyNaMapu(){
    var vectorSource = new VectorSource({
      features: this.routes
    });
    this.map.removeLayer(this.vectorLayerCoordinates)
    this.vectorLayerCoordinates = new VectorLayer({
      source: vectorSource,
    });
    this.vectorLayerCoordinates.setZIndex(1);
    this.map.addLayer(this.vectorLayerCoordinates);
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
    this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50,
      duration: 800} )

    if (this.firstZoomCars == false){

      this.firstZoomCars = true;
    }

    }

   flashCar(feature, duration, car) {
     var boolean = false;
    if (this.pulseCar) {
      var start = +new Date();

      //setCenter
        this.map.getView().setCenter(fromLonLat([car.longtitude, car.lattitude]))
        this.map.getView().setZoom(8);


      // var flash = this.flash(feature, duration);
       let animate =  (event) => {
         let carInData = this.carsFromDatabase.find(findCar => findCar.id == car.id);
         if (carInData.status != 4){
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

         vectorContext.setStyle(styledelete);
          vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);

        if (elapsed > duration) { // stop the effect
            start = +new Date();
            this.tileLayer.on('postrender', animate);
            boolean = true;
        }
        this.map.render();
      }
      var listenerKey = this.tileLayer.on('postrender', animate); // to remove the listener after the duration

    }
  }


  addMarker(routes: Route[]){
    this.places = [];

    if (this.coordinatesFeature != null || this.coordinatesFeature != undefined){
      this.places.push(this.coordinatesFeature);
    }
    var color = -1;

    if (routes.length == 0){
      this.map.removeLayer(this.vectorLayerCoordinates);
      this.map.removeLayer(this.vectorLayerCoordinates);
    }

  routes.forEach((route, index) => {

    if (this.routesToShow != undefined)
      console.log(this.routesToShow[0].id);
      console.log(route.id)
    if (this.routesToShow != undefined && route.id == this.routesToShow[0].id){

      this.onClickFindInfoAdress(route.id);
    }

    if (route.coordinatesOfTownsLat.length > 0) {
      for (let i = 0; i < route.coordinatesOfTownsLat.length; i++) {
        var iconFeature = new Feature({
          geometry: new Point(fromLonLat([route.coordinatesOfTownsLon[i], route.coordinatesOfTownsLat[i]])),
          name: route.id,
          type: "town"
        });

        if (route.status[i] == 3){
          var iconStyle = new Style({
            image: new CircleStyle({
              radius: 8,
              stroke: new Stroke({
                color: '#7FFF00'
              }),
              fill: new Fill({
                color: this.getColorByIndex(index)
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
                color: this.getColorByIndex(index)
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
        }else{
          var iconStyle = new Style({
            image: new CircleStyle({
              radius: 8,
              stroke: new Stroke({
                color: '#fff'
              }),
              fill: new Fill({
                color: this.getColorByIndex(index)
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
        this.places.push(iconFeature);
        if (index + 1 == routes.length){
          setTimeout(() =>
            {
              //chvilu pockam kym natiahnem cesty, ak by ju nahodou auto updatlo
              this.addRoute(routes);
            },
            1500);
        }

      }
    }

  });
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

      setTimeout( () => {
        var vectorNaZobrazenieAllFeatures = new VectorSource({
          features: this.places.concat(this.cars).concat(this.routes)
        });

        if (this.firstZoomAddress == false){
          this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50,
            duration: 800} )
          this.firstZoomAddress = true;
        }
      }, 1500 );


    }

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

  closeInfo(){
    this.carToShow = null;
    this.routesToShow = null;
    var vectorNaZobrazenieAllFeatures = new VectorSource({
      features: this.places.concat(this.cars).concat(this.routes)
    });
    this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50,
      duration: 800} );
  }

  zoomToAddressOrCar(address){
    var poloha = address.getGeometry().getCoordinates()
    this.view.animate({
      center: poloha,
      duration: 500,
      zoom: 12
    });
  }

  zoomToRoute(address){
    console.log(address)
    console.log(address.getGeometry().getExtent())
    var celaCesta = address.getGeometry().getExtent()

    this.view.fit(celaCesta, {padding: [100,100,100,100],
      minResolution: 50,
      duration: 800} )

  }

  getColorByIndex(index){
    var ktoruFarbu;
    if (index >= this.colors.length){
      ktoruFarbu = index % this.colors.length;
      return this.colors[ktoruFarbu];
    }else{
      ktoruFarbu = index;
      return this.colors[ktoruFarbu]
    }
  }

}


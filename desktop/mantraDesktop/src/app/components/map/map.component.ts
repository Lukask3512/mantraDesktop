import {Component} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';

import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style'
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';

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
import {getDistance} from 'ol/sphere';
import {getLength} from 'ol/sphere';
import {toLonLat} from 'ol/proj';
import {transform} from 'ol/proj';
import {OfferRouteService} from "../../services/offer-route.service";
import {Routes} from "@angular/router";
import {DetailAboutRouteService} from "../../services/detail-about-route.service";
import DeatilAboutAdresses from "../../models/DeatilAboutAdresses";
import {CountFreeSpaceService} from "../../data/count-free-space.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  map;
  vectorLayerAdress = new VectorLayer();
  vectorLayerCars = new VectorLayer();
  vectorLayerOffersGreen = new VectorLayer();
  vectorLayerOffersRed = new VectorLayer();
  vectorLayerOffersYellow = new VectorLayer();

  vectorLayerOffersRoutesGreen = new VectorLayer();
  vectorLayerOffersRoutesYellow = new VectorLayer();
  vectorLayerOffersRoutesRed = new VectorLayer();
  vectorLayerCoordinates;
  // vectorLayer;
  //skusam vytvorit trasu
  points;

  carWarningStatus = []; // ukladam si vectori sem, aby sa neduplikovali

  colors = ['#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#E67E22', '#F1C40F', '#E67E22',
  '#641E16', '#4A235A', '#0B5345', '#7D6608', '#626567', '#424949']


  //features pre mapu
  places = [];
  offersGreen = [];
  offersYellow = [];
  offersRed = [];

  offersRouteGreen = [];
  offersRouteYellow = [];
  offersRouteRed = [];

  cars = [];
  routes = [];
  indexiMiestKdeNalozit = [];

  pointsFeature;
  coordinatesFeature;

  carsFromDatabase;
  routesFromDatabase;
  adressesFromDatabase: Route[];
  offersFromDatabase: Route[];

  private _routesToShow = new BehaviorSubject<any>([]);
  readonly routes$ = this._routesToShow.asObservable();

  carToShow: Cars;
  routesToShow: Route[];
  offersToShow;
  distanceOfOffer: number;

  pulseCar:boolean = false;
  pulseMarker:boolean = false;

  firstZoomCars = false;
  firstZoomAddress = false;

  indexisOfFreeTowns;


  tileLayer = new TileLayer({
    source: new OSM({
      wrapX: false,
    }),
  });

  view;
  maxPrekrocenieRozmerov;
  red = false;
  green = true;
  yellow = true;

  freeCars: Cars[] = [];
  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService) { }

              routeDetail(route){
              this.dataService.changeRealRoute(route);
            }

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
      });

      const myPromise = new Promise((resolve, reject) => {
        this.routeService.routes$.subscribe(newRoutes => {
          this.pulseMarker = false;
          var cestySDetailami = [];
          this.adressesFromDatabase = newRoutes;
          this.adressesFromDatabase.forEach(preprava => {

            var detailArray = [];
            var prepravasDetailom;
            preprava.detailsAboutAdresses.forEach(detail => {
              this.routeDetailService.myDetails$.subscribe(allDetails => {
                var oneDetail = allDetails.find(oneMyDetail => oneMyDetail.id == detail)
                detailArray.push(oneDetail);
              });
            })
            var volnaVahaPreAuto = this.routeDetailService.countFreeWeightOfCarOnAdress(detailArray, preprava);
            prepravasDetailom = {...preprava, detailArray, volnaVahaPreAuto};
            console.log(prepravasDetailom)
            cestySDetailami.push(prepravasDetailom)
          })
          console.log(cestySDetailami)
          this.adressesFromDatabase = cestySDetailami;
          this.addMarker(this.adressesFromDatabase);
          resolve(true);
        });
      });
      myPromise.then(res => {
        var carsArray = [];
        this.adressesFromDatabase.forEach(oneRoute => {
          carsArray.push(oneRoute.carId);
        })
        this.freeCars = this.carsFromDatabase.filter(oneCar => !carsArray.includes(oneCar.id))
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

          // console.log(feature.getGeometry())
          // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
          // this.countDistance(feature.getGeometry(), [48.896324, 19.267890])
          this.onClickFindInfoAdress(feature.get('name'))
        }
        else if(type == "offer"){
          this.zoomToRoute(feature)
          console.log(feature.getGeometry())          // console.log(feature.getGeometry())
          // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
          // this.countDistance(feature.getGeometry(), [48.896324, 19.267890])
          this.onClickFindInfoOffer(feature.get('name'), feature)
        }
        // $(element).popover('show');
      } else {
        // $(element).popover('dispose');
      }
    });

    this.checkFeatureUnderMouse(); //pointer
    },
      200);

    this.countDistance([48.920836,19.180706], [48.920779,19.180593])
  }
//ak kliknem na auto
  onClickFindInfo(id){
    this.carToShow = this.carsFromDatabase.find(car => car.id ==id);
    this.routesToShow = this.adressesFromDatabase.filter(route => route.carId == this.carToShow.id);
    this.offersToShow = null;
  }

  //ak kliknem na auto
  onClickFindInfoAdress(id){
    console.log(id)
    this.routesToShow = this.adressesFromDatabase.filter(route => route.id == id);
    this.carToShow = this.carsFromDatabase.find(car => car.id == this.routesToShow[0].carId)
    // this.carToShow = this.carsFromDatabase.find(car => car.id == this.routesToShow[0].carId);
    this.offersToShow = null;
  }

  //ak kliknem na auto
  onClickFindInfoOffer(id, feature){
    this.offersToShow = this.offersFromDatabase.filter(route => route.id == id);
    // this.countFreeSpaceService.countFreeSpace(this.offersToShow[0].detailArray,this.offersToShow[0].detailArray, )
    this.distanceOfOffer = Math.round(((getLength(feature.getGeometry())/100) / 1000) * 100)
    this.carToShow = null;
    this.routesToShow = null;
    console.log(this.offersToShow)
  }

  // pri kliku na ponuku vratim pole indexov - aby som zobrazil kde je vhodne nalozit
  countIndexisOfferAndRoute(route, offer, mestoIndex){
    console.log(route);
    console.log(offer)
    // var index = this.countFreeSpaceService.countFreeSpace(route.detailArray, offer.detailArray, route.carId, route, this.maxPrekrocenieRozmerov, offer);
    // var jetam = index.poleMiestKdeSaVopcha.find(oneIndex => oneIndex == mestoIndex);
    // if (jetam == mestoIndex){
    //   return true
    // }else{
    //   return false;
    // }
  }

  countFreeIndexis(route, offer){
    this.indexisOfFreeTowns =  this.countFreeSpaceService.countFreeSpace(route.detailArray, offer.detailArray, route.carId, route, this.maxPrekrocenieRozmerov, offer);
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
        // console.log(this.points)
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


    if (this.firstZoomCars == false){
      this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50,
        duration: 800} )
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
    if (dateUtc == null){
      return "Neznámy"
    }
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
    this.offersToShow = null;
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

  //vrati najkratsiu vzdialenost od trasy
  countDistance(from, to){
    let distance = 100000000;
    from.forEach(array => {
      var pole = transform(array, 'EPSG:3857', 'EPSG:4326');
        var oneDistance = getDistance(pole, to);
        if (oneDistance < distance){
          distance = oneDistance;
        }
    });
    return distance;
  }

  //hodim lat lon od do a vrati mi dlzku v metroch
  countDistancePoints(from, to){
      // console.log(array[0].toFixed(2));
      // console.log(array[1].toFixed(2));

      // var fromPoint = transform(from, 'EPSG:3857', 'EPSG:4326');
      // var toPoint = transform(to, 'EPSG:3857', 'EPSG:4326');
      // console.log(toLonLat(pole))
      let distance = getDistance(from, to);
      // if (distance < 2000){
        return distance;
      // }
  }
  // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
  offersUpdate(emitFromFilter){

    if (emitFromFilter == null && this.map != undefined){
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen)
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow)
      this.map.removeLayer(this.vectorLayerOffersRoutesRed)
      this.map.removeLayer(this.vectorLayerOffersGreen);
      this.map.removeLayer(this.vectorLayerOffersRed);
      this.map.removeLayer(this.vectorLayerOffersYellow);
    }else if (emitFromFilter != null){
      console.log(emitFromFilter)
      var offers = emitFromFilter.offers;
      var minVzdialenost = emitFromFilter.minDistance;
      var maxVzdialenost = emitFromFilter.maxDistance;
      var maxPrekrocenieVahy = emitFromFilter.weight;
      var maxPrekrocenieRozmerov = emitFromFilter.size;
      this.maxPrekrocenieRozmerov = maxPrekrocenieRozmerov;
      console.log(maxPrekrocenieRozmerov)
      console.log(maxPrekrocenieVahy)
    setTimeout( () => {
      var poleSMinVzdialenostamiOdAdries = [];
      offers.forEach((oneRouteOffer, indexOffer) => { //prechaedzam ponukami

        //tot si priradujem detail a maxVahu ponuky
        var detailArray = [];
        var prepravasDetailom;
        oneRouteOffer.detailsAboutAdresses.forEach(detail => { // prechadzam detailami
          this.routeDetailService.offerDetails$.subscribe(allDetails => {
            detailArray.push(allDetails.find(oneMyDetail => oneMyDetail.id == detail));
          });
        });
        var maxVaha = 0;
        var sumVaha = 0;
        detailArray.forEach((oneDetail, index ) => { //detailom a zistujem max vahu
        if (oneDetail.weight != null){
          oneDetail.weight.forEach(vaha => {
            if (oneRouteOffer.type[index] == 'nakladka'){
              sumVaha += vaha;
              if (sumVaha > maxVaha){
                maxVaha = sumVaha;
              }
            }else{
              sumVaha -= vaha;
            }
          })

        }
        })
        prepravasDetailom = {...oneRouteOffer, detailArray, maxVaha};

        //tu konci priradovanie detialov a max vah


        var jednaPonuka = {...prepravasDetailom, minVzdialenost: 10000000000, maxVzdialenost: 0,
          flag: 0, zelenePrepravy: [], zltePrepravy: [], zeleneAuta: [], zlteAuta: []}; //0 cervena, 1 zlta, 2 greeeen
        if (oneRouteOffer.takenBy == "" && this.dataService.getMyIdOrMaster() != oneRouteOffer.createdBy){

          var zltePrepravy = [];
          var zelenePrepravy = [];
        this.adressesFromDatabase.forEach((route, index) => { //prechazdam vsetkymi prepravami
          if(this.vectorLayerCoordinates != undefined)
          var routeLine = this.vectorLayerCoordinates.getSource().getFeatures().find(oneFeature => oneFeature.get('name') == route.id);

          // console.log(this.vectorLayerCoordinates.getFeatures())

          // console.log(this.vectorLayerOffersRoutes.getDataFeatures())
          var sediVzdialenost = false;
          var sediVaha = false;
          var sediVahaYellow = false;
          // @ts-ignore
          var vopchaSa = this.countFreeSpaceService.countFreeSpace(route.detailArray, jednaPonuka.detailArray, route.carId, route, maxPrekrocenieRozmerov, oneRouteOffer);

          var adresaMinVzialenost = 100000000;
          var adresaMaxVzdialenost = 0;

          route.coordinatesOfTownsLon.forEach((lon, indexLon) => { //prechadzam miestami v preprave

            //vaha
            // @ts-ignore
            if (route.volnaVahaPreAuto[indexLon] >= jednaPonuka.maxVaha){
              sediVaha = true;
            }else { // @ts-ignore
              if ((route.volnaVahaPreAuto[indexLon] * maxPrekrocenieVahy) >= jednaPonuka.maxVaha){
                sediVahaYellow = true;
              }
            }


            oneRouteOffer.coordinatesOfTownsLat.forEach((offerLat, offerLatIndex) => { //prechadzam miestami v ponuke

                             //toto treba kuknut vravia mi to interesting vzdialenosti
              if (routeLine != undefined){

                var vzdialenostOdTrasy = this.countDistance(routeLine.getGeometry().getCoordinates(), [oneRouteOffer.coordinatesOfTownsLon[offerLatIndex], oneRouteOffer.coordinatesOfTownsLat[offerLatIndex]]);

                              //kontrolujem najkratsiu vzdialenost od trasy
                              if (vzdialenostOdTrasy < jednaPonuka.minVzdialenost){
                                jednaPonuka.minVzdialenost = vzdialenostOdTrasy;
                                adresaMinVzialenost = vzdialenostOdTrasy;
                              }
              }
              var vzdielenost = this.countDistancePoints([oneRouteOffer.coordinatesOfTownsLon[offerLatIndex], oneRouteOffer.coordinatesOfTownsLat[offerLatIndex]],
                [route.coordinatesOfTownsLon[indexLon], route.coordinatesOfTownsLat[indexLon]]);
              if (vzdielenost < jednaPonuka.minVzdialenost) {
                                jednaPonuka.minVzdialenost = vzdielenost;
                                adresaMinVzialenost = vzdielenost;
                              }
                              if (vzdielenost > jednaPonuka.maxVzdialenost) {
                                jednaPonuka.maxVzdialenost = vzdielenost;
                                adresaMaxVzdialenost = vzdielenost;
                              }

                                //tu davam flagy - ak je vzdialenost mensia vacsia - taku davam flagu
                                //ked som na konci skontrulujem ci sedi vzdialenost
                              if (offerLatIndex == oneRouteOffer.coordinatesOfTownsLat.length - 1) {
                                var flags = 0;

                                var indexVPoli = vopchaSa.poleMiestKdeSaVopcha.indexOf(indexLon); // ci do mesta vopcha
                                var prekrocil = vopchaSa.prekrocenieOPercenta[indexVPoli]; //ak false vopcha, ak true tak sa vopcha
                                                                          //o uzivatelom definove % - yellow




                                if (sediVaha &&  indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
                                  flags = 3;
                                  zelenePrepravy.push({...route, vopchaSa});
                                }else if (sediVaha &&  indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
                                  flags = 2;
                                  zltePrepravy.push({...route, vopchaSa});
                                }
                                else if ((sediVahaYellow && !sediVaha) && indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
                                  flags = 2;
                                  zltePrepravy.push({...route, vopchaSa});
                                }
                                else if ((sediVahaYellow && !sediVaha) && indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
                                  flags = 2;
                                  zltePrepravy.push({...route, vopchaSa});
                                }
                                if (flags > jednaPonuka.flag){
                                  jednaPonuka.flag = flags;
                                }
                              }
                            })

            });
          // zltePrepravy = [...new Set(zltePrepravy)]; //odstranujem duplikaty
          // zelenePrepravy = [...new Set(zelenePrepravy)];
          zltePrepravy = zltePrepravy.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
          zelenePrepravy = zelenePrepravy.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
          // console.log(zelenePrepravy)
              jednaPonuka.zelenePrepravy = zelenePrepravy;
              jednaPonuka.zltePrepravy = zltePrepravy;
          })
        this.kontrolaFreeAutOdPonuk(jednaPonuka, maxPrekrocenieVahy,maxPrekrocenieRozmerov, minVzdialenost, maxVzdialenost);
        poleSMinVzdialenostamiOdAdries.push(jednaPonuka);
        }

      });

      setTimeout( () => {
        console.log(poleSMinVzdialenostamiOdAdries)
        this.offersFromDatabase = poleSMinVzdialenostamiOdAdries
          this.drawOffers(poleSMinVzdialenostamiOdAdries);
      }, 500 );
    }, 500 );
    // console.log(routes);
    }

  }

  kontrolaFreeAutOdPonuk(ponuka, maxPrekrocenieVahy, maxPrekrocenieRozmerov, minVzdialenost, maxVzdialenost){
    var jednaPonuka = ponuka

    this.freeCars.forEach(oneCar => {
      var vopchaSa = this.countFreeSpaceService.countFreeSpace(jednaPonuka.detailArray, null, oneCar.id, jednaPonuka, maxPrekrocenieRozmerov, null);
      var adresaMinVzialenost = 100000000;
      var adresaMaxVzdialenost = 0;
      var sediVaha = false;
      var sediVahaYellow = false;

        if (oneCar.nosnost >= jednaPonuka.maxVaha){
          sediVaha = true;
        }else {
          if ((oneCar.nosnost * maxPrekrocenieVahy) >= jednaPonuka.maxVaha){
            sediVahaYellow = true;
          }
        }
      jednaPonuka.coordinatesOfTownsLat.forEach((oneAdresa, indexTown) => {
          var vzdielenost = this.countDistancePoints([oneCar.longtitude, oneCar.lattitude],
            [jednaPonuka.coordinatesOfTownsLon[indexTown], jednaPonuka.coordinatesOfTownsLat[indexTown]]);
          if (vzdielenost < adresaMinVzialenost) {
            adresaMinVzialenost = vzdielenost;
          }
          if (vzdielenost > adresaMaxVzdialenost) {
            adresaMaxVzdialenost = vzdielenost;
          }
        });
        var flags = 0;

        var pocetMiestKdeSaVopcha = vopchaSa.poleMiestKdeSaVopcha // ci do mesta vopcha
        var prekrocil = false; //ak false vopcha, ak true tak sa vopcha
        //o uzivatelom definove % - yellow

      vopchaSa.prekrocenieOPercenta.forEach(onePrekrocenie => {
        if (onePrekrocenie == true){
          prekrocil = true;
        }
      })



        if (sediVaha && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
          adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
          flags = 3;
          jednaPonuka.zeleneAuta.push(oneCar);
        }else if (sediVaha &&  pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
          adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
          flags = 2;
          jednaPonuka.zlteAuta.push(oneCar);
        }
        else if ((sediVahaYellow && !sediVaha) && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
          adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
          flags = 2;
          jednaPonuka.zlteAuta.push(oneCar);
        }
        else if ((sediVahaYellow && !sediVaha) && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
          adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
          flags = 2;
          jednaPonuka.zlteAuta.push(oneCar);
        }
        if (flags > jednaPonuka.flag){
          jednaPonuka.flag = flags;
        }
    })
    return jednaPonuka
  }

  offersShow(which){
    console.log(which);
    if (which.vyhovuje){
      this.red = true
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      this.map.addLayer(this.vectorLayerOffersRoutesGreen);
    }else{
      this.red = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
    }

    if (which.trocha){
      this.yellow = true;
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      this.map.addLayer(this.vectorLayerOffersRoutesYellow);
    }else{
      this.yellow = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
    }

    if (which.nie){
      this.red = true;
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      this.map.addLayer(this.vectorLayerOffersRoutesRed);
    }else{
      this.red = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
    }
  }

  drawOffers(offers){
    this.offersGreen = []
    this.offersRed = [];
    this.offersYellow = [];

    this.offersRouteRed = [];
    this.offersRouteGreen = [];
    this.offersRouteYellow = [];
    this.offersToShow = null
    offers.forEach((route, index) => {
      var coordinatesToArray = [];
      route.coordinatesOfTownsLat.forEach((lat, index) => {
        coordinatesToArray.push([route.coordinatesOfTownsLon[index], route.coordinatesOfTownsLat[index]])
      })
      //draw lines
      var routeString = new LineString(coordinatesToArray)
        .transform('EPSG:4326', 'EPSG:3857');

      // var indexInArray = this.offersFromDatabase.findIndex(onerRute => onerRute == route)
      // this.offersFromDatabase[indexInArray].
      // console.log(routeString.getLength())

      var routeFeature = new Feature({
        type: 'offer',
        geometry: routeString,
        name: route.id
      });
      var routeStyle;
      if (route.flag < 2){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [207, 0, 15, 0.45]
          })
        });

      }else if (route.flag == 2){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [247, 202, 24, 0.6]
          })
        });

      }else{
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [10, 255, 10, 0.45]
          })
        });
      }

      var styles = [];

      routeFeature.getGeometry().forEachSegment(function (start, end){
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(
          new Style({
            geometry: new Point(end),
            image: new Icon({
              src: 'assets/logo/arrow.png',
              anchor: [0.75, 0.5],
              scale: 0.05,
              rotateWithView: true,
              rotation: -rotation,
            }),
          })
        );
      })
      styles.push(routeStyle)
      routeFeature.setStyle(styles);

      if (route.flag < 2){
        this.offersRouteRed.push(routeFeature);
      }else if (route.flag == 2){
        this.offersRouteYellow.push(routeFeature);
      }else{
        this.offersRouteGreen.push(routeFeature);
      }


      if (this.routesToShow != undefined && route.id == this.routesToShow[0].id){

        // this.onClickFindInfoOffer(route.id);
      }

      if (route.coordinatesOfTownsLat.length > 0) {
        for (let i = 0; i < route.coordinatesOfTownsLat.length; i++) {
          var iconFeature = new Feature({
            geometry: new Point(fromLonLat([route.coordinatesOfTownsLon[i], route.coordinatesOfTownsLat[i]])),
            name: route.id,
            type: "town"
          });
          var iconStyle;
          if (route.flag < 2) {
            iconStyle = new Style({
              image: new CircleStyle({
                radius: 10,
                stroke: new Stroke({
                  color: [207, 0, 15, 1]
                }),
                fill: new Fill({
                  color: [207, 0, 15, 0.45]
                }),
              }),
              text: new Text({
                text: (i + 1).toString(),
                fill: new Fill({
                  font: '15px sans-serif',
                  color: [255, 255, 255, 1],
                }),
              })
            });
          }
          else if (route.flag == 2) {
            iconStyle = new Style({
              image: new CircleStyle({
                radius: 10,
                stroke: new Stroke({
                  color: [247, 202, 24, 1]
                }),
                fill: new Fill({
                  color: [247, 202, 24, 0.45]
                }),
              }),
              text: new Text({
                text: (i + 1).toString(),
                fill: new Fill({
                  font: '15px sans-serif',
                  color: [0, 0, 0, 1],
                }),
              })
            });
          }
          else {
            iconStyle = new Style({
              image: new CircleStyle({
                radius: 10,
                stroke: new Stroke({
                  color: [10, 255, 10, 1]
                }),
                fill: new Fill({
                  color: [10, 255, 10, 0.45]
                }),
              }),
              text: new Text({
                text: (i + 1).toString(),
                fill: new Fill({
                  font: '15px sans-serif',
                  color: [0, 0, 0, 1],
                }),
              })
            });
          }
          iconFeature.setStyle(iconStyle);

          //red offers
          if (route.flag < 2){
            this.offersRed.push(iconFeature);
          }else if (route.flag == 2){
            this.offersYellow.push(iconFeature)
          }else{
            this.offersGreen.push(iconFeature)
          }



        }
      }

    });
  //offerroutes
  //   console.log
    var vectorSourceRoutesGreen = new VectorSource({
      features: this.offersRouteGreen
    });

    var vectorSourceRoutesYellow = new VectorSource({
      features: this.offersRouteYellow
    });

    var vectorSourceRoutesRed = new VectorSource({
      features: this.offersRouteRed
    });


    this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
    this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
    this.map.removeLayer(this.vectorLayerOffersRoutesRed);
    this.vectorLayerOffersRoutesGreen = new VectorLayer({
      source: vectorSourceRoutesGreen,
    });
    this.vectorLayerOffersRoutesYellow = new VectorLayer({
      source: vectorSourceRoutesYellow,
    });
    this.vectorLayerOffersRoutesRed = new VectorLayer({
      source: vectorSourceRoutesRed,
    });

    this.vectorLayerOffersRoutesGreen.setZIndex(1);
    this.vectorLayerOffersRoutesYellow.setZIndex(1);
    this.vectorLayerOffersRoutesRed.setZIndex(1);

    if (this.green){
      this.map.addLayer(this.vectorLayerOffersRoutesGreen);
    }
    if (this.yellow){
      this.map.addLayer(this.vectorLayerOffersRoutesYellow);
    }
    if (this.red){
      this.map.addLayer(this.vectorLayerOffersRoutesRed);
    }



    // var vectorSourceGreen = new VectorSource({
    //   features: this.offersGreen
    // });
    //
    // var vectorSourceYellow = new VectorSource({
    //   features: this.offersYellow
    // });
    //
    // var vectorSourceRed = new VectorSource({
    //   features: this.offersRed
    // });

    //
    // this.map.removeLayer(this.vectorLayerOffersRed);
    // this.map.removeLayer(this.vectorLayerOffersYellow);
    // this.map.removeLayer(this.vectorLayerOffersGreen);

    // this.vectorLayerOffersGreen = new VectorLayer({
    //   source: vectorSourceGreen,
    // });
    //
    // this.vectorLayerOffersYellow = new VectorLayer({
    //   source: vectorSourceYellow,
    // });
    //
    // this.vectorLayerOffersRed = new VectorLayer({
    //   source: vectorSourceRed,
    // });

    this.vectorLayerAdress.setZIndex(2);
    this.map.addLayer(this.vectorLayerOffersGreen);
    this.map.addLayer(this.vectorLayerOffersYellow);
    this.map.addLayer(this.vectorLayerOffersRed);


    // if (vectorSource.getFeatures()[0] != undefined) {
    //
    //
    //   var feature = vectorSource.getFeatures()[0];
    //   var polygon = feature.getGeometry();
    //
    //   setTimeout( () => {
    //     var vectorNaZobrazenieAllFeatures = new VectorSource({
    //       features: this.places.concat(this.cars).concat(this.routes)
    //     });
    //
    //     if (this.firstZoomAddress == false){
    //       this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100,100,100,100],minResolution: 50,
    //         duration: 800} )
    //       this.firstZoomAddress = true;
    //     }
    //   }, 1500 );
    //
    //
    // }
  }

  vypocitajVahuPreMesto(infoMesto: DeatilAboutAdresses){
    var vahaVMeste = 0;
    infoMesto.weight.forEach(vaha => {
      vahaVMeste += vaha;
    });
    return vahaVMeste;
  }

  // vypocitajVahuPreMesto(infoMesto: DeatilAboutAdresses){
  //   var vahaVMeste = 0;
  //   infoMesto.weight.forEach(vaha => {
  //     vahaVMeste += vaha;
  //   });
  //   return vahaVMeste;
  // }


}


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
  vectorLayerOffers = new VectorLayer();
  vectorLayerOffersRoutes = new VectorLayer();
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
  offers = [];
  offersRoute = [];
  cars = [];
  routes = [];

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
  offersToShow: Route[];
  distanceOfOffer: number;

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
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService) { }


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
        console.log(this.carsFromDatabase);

      });

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
    this.distanceOfOffer = Math.round(((getLength(feature.getGeometry())/100) / 1000) * 100)
    this.carToShow = null;
    this.routesToShow = null;
    console.log(this.offersToShow)

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

    if (emitFromFilter == null){
      this.map.removeLayer(this.vectorLayerOffersRoutes)
      this.map.removeLayer(this.vectorLayerOffers)
    }else{
      console.log(emitFromFilter)
      var offers = emitFromFilter.offers;
      var minVzdialenost = emitFromFilter.minDistance;
      var maxVzdialenost = emitFromFilter.maxDistance;
      var maxPrekrocenieVahy = emitFromFilter.weight;
      var maxPrekrocenieRozmerov = emitFromFilter.size;
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
        })
        prepravasDetailom = {...oneRouteOffer, detailArray, maxVaha};

        //tu konci priradovanie detialov a max vah


        var jednaPonuka = {...prepravasDetailom, minVzdialenost: 10000000000, maxVzdialenost: 0, flag: 0}; //0 cervena, 1 zlta, 2 greeeen
        if (oneRouteOffer.takenBy == ""){

        this.adressesFromDatabase.forEach((route, index) => { //prechazdam vsetkymi prepravami
          var routeLine = this.vectorLayerCoordinates.getSource().getFeatures().find(oneFeature => oneFeature.get('name') == route.id);

          // console.log(this.vectorLayerCoordinates.getFeatures())

          // console.log(this.vectorLayerOffersRoutes.getDataFeatures())
          var sediVzdialenost = false;
          var sediVaha = false;
          var sediVahaYellow = false;
          // @ts-ignore
          var vopchaSa = this.countFreeSpaceService.countFreeSpace(route.detailArray, jednaPonuka.detailArray, route.carId, route, maxPrekrocenieRozmerov);

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
                              var vzdialenostOdTrasy = this.countDistance(routeLine.getGeometry().getCoordinates(), [oneRouteOffer.coordinatesOfTownsLon[offerLatIndex], oneRouteOffer.coordinatesOfTownsLat[offerLatIndex]]);


                              var vzdielenost = this.countDistancePoints([oneRouteOffer.coordinatesOfTownsLon[offerLatIndex], oneRouteOffer.coordinatesOfTownsLat[offerLatIndex]],
                                [route.coordinatesOfTownsLon[indexLon], route.coordinatesOfTownsLat[indexLon]]);
                              //kontrolujem najkratsiu vzdialenost od trasy
                              if (vzdialenostOdTrasy < jednaPonuka.minVzdialenost){
                                jednaPonuka.minVzdialenost = vzdialenostOdTrasy;
                                adresaMinVzialenost = vzdialenostOdTrasy;
                              }
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
                                // if(adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost){
                                //   // jednaPonuka.flag += 1;
                                //   flags++;
                                // }
                                // if (sediVaha){
                                //   flags++;
                                // }
                                //
                                // //index miest kde sa vopcha nova preprava
                                // if (indexLon == vopchaSa.find(oneId => oneId == indexLon)){
                                //   flags++;
                                // }
                                //
                                // if (flags > jednaPonuka.flag){
                                //   jednaPonuka.flag = flags;
                                // }

                                var indexVPoli = vopchaSa.poleMiestKdeSaVopcha.indexOf(indexLon); // ci do mesta vopcha
                                var prekrocil = vopchaSa.prekrocenieOPercenta[indexVPoli]; //ak false vopcha, ak true tak sa vopcha
                                // console.log(indexVPoli);                                  //o uzivatelom definove % - yellow
                                // console.log(prekrocil);

                                // console.log(vopchaSa)
                                if (sediVaha &&  indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
                                  flags = 3;
                                }else if ((sediVahaYellow && !sediVaha) && indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
                                  flags = 2;
                                }
                                else if ((sediVahaYellow && !sediVaha) && indexLon == vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
                                  flags = 2;
                                }
                                if (flags > jednaPonuka.flag){
                                  jednaPonuka.flag = flags;
                                }
                              }
                            })

            });

          })

        poleSMinVzdialenostamiOdAdries.push(jednaPonuka);
        }

      });
      console.log(poleSMinVzdialenostamiOdAdries);


      //pridavam detail k prepravam
      // var cestySDetailami = [];
      // poleSMinVzdialenostamiOdAdries.forEach(preprava => {
      //   var detailArray = [];
      //   var prepravasDetailom;
      //   preprava.detailsAboutAdresses.forEach(detail => {
      //     this.routeDetailService.offerDetails$.subscribe(allDetails => {
      //       detailArray.push(allDetails.find(oneMyDetail => oneMyDetail.id == detail));
      //     });
      //   });
      //   var maxVaha = 0;
      //   var sumVaha = 0;
      //   detailArray.forEach((oneDetail, index ) => {
      //
      //     oneDetail.weight.forEach(vaha => {
      //       if (preprava.type[index] == 'nakladka'){
      //         sumVaha += vaha;
      //         if (sumVaha > maxVaha){
      //           maxVaha = sumVaha;
      //         }
      //       }else{
      //         sumVaha -= vaha;
      //       }
      //     })
      //   })
      //   prepravasDetailom = {...preprava, detailArray, maxVaha};
      //   cestySDetailami.push(prepravasDetailom)
      // })
      // console.log(cestySDetailami)
      setTimeout( () => {
        console.log(poleSMinVzdialenostamiOdAdries)
        this.offersFromDatabase = poleSMinVzdialenostamiOdAdries
          this.drawOffers(poleSMinVzdialenostamiOdAdries);
      }, 500 );
    }, 500 );
    // console.log(routes);
    }

  }

  drawOffers(offers){
    this.offers = []
    this.offersRoute = [];
    var styles = [];

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
      if (route.flag == 0){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [46, 49, 49, 0.3]
          })
        });

      }else if (route.flag == 1){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [46, 49, 49, 0.3]
          })
        });

      }else{
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [46, 49, 49, 0.3]
          })
        });
      }


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

      this.offersRoute.push(routeFeature)


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
          // }
          // else if (route.status[i] == 4){
          //   var iconStyle = new Style({
          //     image: new CircleStyle({
          //       radius: 10,
          //       stroke: new Stroke({
          //         color: [10, 255, 10, 1]
          //       }),
          //       fill: new Fill({
          //         color: [10, 255, 10, 0.55]
          //       }),
          //     }),
          //     text: new Text({
          //       text: (i+1).toString() + "X",
          //       fill: new Fill({
          //         color: '#fff',
          //       }),
          //     })
          //   });
          //   this.pulseMarker=true;
          // }else{
          //   var iconStyle = new Style({
          //     image: new CircleStyle({
          //       radius: 10,
          //       stroke: new Stroke({
          //         color: [10, 255, 10, 1]
          //       }),
          //       fill: new Fill({
          //         color: [10, 255, 10, 0.55]
          //       }),
          //     }),
          //     text: new Text({
          //       text: (i+1).toString(),
          //       fill: new Fill({
          //         color: '#fff',
          //       }),
          //     })
          //   });
          // }



          iconFeature.setStyle(iconStyle);
          this.offers.push(iconFeature);


        }
      }

    });
  //offerroutes
  //   console.log
    var vectorSourceRoutes = new VectorSource({
      features: this.offersRoute
    });
    this.map.removeLayer(this.vectorLayerOffersRoutes)
    this.vectorLayerOffersRoutes = new VectorLayer({
      source: vectorSourceRoutes,
    });

    this.vectorLayerOffersRoutes.setZIndex(1);
    this.map.addLayer(this.vectorLayerOffersRoutes);



    var vectorSource = new VectorSource({
      features: this.offers
    });

    this.map.removeLayer(this.vectorLayerOffers)
    this.vectorLayerOffers = new VectorLayer({
      source: vectorSource,
    });
    this.vectorLayerAdress.setZIndex(2);
    this.map.addLayer(this.vectorLayerOffers);


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


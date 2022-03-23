import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';

import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';


import LineString from 'ol/geom/LineString';
import {HttpClient} from '@angular/common/http';
import {AngularFireStorage} from '@angular/fire/storage';
import {getArea} from 'ol/sphere';
import {DataService} from '../../data/data.service';
import Route from '../../models/Route';
import {RouteService} from '../../services/route.service';
import {CarService} from '../../services/car.service';
import Cars from '../../models/Cars';
import {RouteStatusService} from '../../data/route-status.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {RouteToCarComponent} from '../dialogs/route-to-car/route-to-car.component';
import {easeOut} from 'ol/easing';
import {unByKey} from 'ol/Observable';
import {getVectorContext} from 'ol/render';
import {BehaviorSubject} from 'rxjs';
import {getDistance} from 'ol/sphere';
import {getLength} from 'ol/sphere';
import {toLonLat} from 'ol/proj';
import {transform} from 'ol/proj';
import {OfferRouteService} from '../../services/offer-route.service';
import {Routes} from '@angular/router';
import {DetailAboutRouteService} from '../../services/detail-about-route.service';
import DeatilAboutAdresses from '../../models/DeatilAboutAdresses';
import {CountFreeSpaceService} from '../../data/count-free-space.service';
import {AddressService} from '../../services/address.service';
import Address from '../../models/Address';
import {DragAndDropListComponent} from '../transportation/drag-and-drop-list/drag-and-drop-list.component';
import {PackageService} from '../../services/package.service';
import {DrawOfferService} from './draw-offer.service';
import {CarItiDetailComponent} from './car-iti-detail/car-iti-detail.component';
import {ChoosCarToMoveComponent} from '../transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import Predpoklad from '../../models/Predpoklad';
import {VodicService} from '../../services/vodic.service';
import Vodic from '../../models/Vodic';
import {take} from 'rxjs/operators';
import {RouteCoordinatesService} from '../../services/route/route-coordinates.service';
import Overlay from 'ol/Overlay';
import {Cluster, Vector as VectorSource} from 'ol/source';
import {CarsPopUpComponent} from './cars-pop-up/cars-pop-up.component';
import {OffersPopUpComponent} from './offers-pop-up/offers-pop-up.component';
import {PosliPonukuComponent} from '../transportation/offer/detail/posli-ponuku/posli-ponuku.component';
import Dispecer from '../../models/Dispecer';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LogDialogComponent} from '../dialogs/log-dialog/log-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {CarInfoComponent} from './car-info/car-info.component';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  map;
  vectorLayerAdress = new VectorLayer();
  vectorLayerCars = new VectorLayer();
  vectorLayerOtherCars = new VectorLayer();
  vectorLayerOffersGreen = new VectorLayer();
  vectorLayerOffersRed = new VectorLayer();
  vectorLayerOffersYellow = new VectorLayer();

  vectorLayerOffersRoutesGreen = new VectorLayer();
  vectorLayerOffersRoutesYellow = new VectorLayer();
  vectorLayerOffersRoutesRed = new VectorLayer();
  vectorLayerCoordinates;

  emitFromFilter;
  // vectorLayer;
  // skusam vytvorit trasu
  points;

  carWarningStatus = []; // ukladam si vectori sem, aby sa neduplikovali


  colors = ['#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#E67E22', '#F1C40F', '#E67E22',
    '#641E16', '#4A235A', '#0B5345', '#7D6608', '#626567', '#424949'];


  vectorSourcePreTrasy;

  // features pre mapu
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

  lastClickedOnRoute;

  carsWithItinerar;

  carsToDisplayFromFilter: string[] = null;

  carsFromDatabase: Cars[];
  routesFromDatabase;
  adressesFromDatabase: Address[];
  offersFromDatabase: Route[];

  // pomocna premenna na stahovanie trasy
  pocetAut = 0;

  private _routesToShow = new BehaviorSubject<any>([]);
  readonly routes$ = this._routesToShow.asObservable();

  carToShow: Cars;
  routesToShow: Address[];
  offersToShow;
  distanceOfOffer: number;

  pulseCar = false;
  pulseMarker = false;

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

  lastClickedOnaddressId;


  clustersOfOffers;

  overlay;
  overlayOffer;
  overlayCar;

  content;
  closer;
  container;
  containerOffer;
  carContainer;

  carsToDisplay;


  carUnderMouse: string;

  snackBarIsOpen = false;

  lastZoom;
  centerOfZoom;

  addressVectorSource: VectorSource;

  carVectorSource: VectorSource;
  carClusterSource: Cluster;

  otherCarVectorSource: VectorSource;
  otherCarClusterSource: Cluster;

  @ViewChild('dragDrop')
  private dragComponent: DragAndDropListComponent;

  @ViewChild('infoElement')
  private infoDivElement: ElementRef;

  @ViewChild('transportationElement')
  private transportationElement: ElementRef;

  @ViewChild('filterElement')
  private filterElement: ElementRef;


  @ViewChild(CarItiDetailComponent)
  private carIti: CarItiDetailComponent;

  @ViewChild(ChoosCarToMoveComponent)
  private chooseCar: ChoosCarToMoveComponent;

  @ViewChild(CarsPopUpComponent)
  private chooseCarPopup: CarsPopUpComponent;

  @ViewChild(CarInfoComponent)
  private carInfo: CarInfoComponent;

  @ViewChild(OffersPopUpComponent)
  private chooseOfferPoUp: OffersPopUpComponent;

  @ViewChild(PosliPonukuComponent)
  private posliPonuku: PosliPonukuComponent;

  @Output() carIdEmitter = new EventEmitter<string>();
  @Output() offerIdEmitter = new EventEmitter<{}>();

  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService,
              private drawOffer: DrawOfferService, private vodicService: VodicService,
              private routeCoordinates: RouteCoordinatesService, private _snackBar: MatSnackBar,
              private translation: TranslateService) {
  }

  routeDetail(route) {
    this.dataService.changeRealRoute(route);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

        this.container = document.getElementById('popup');
        this.containerOffer = document.getElementById('offerPopUp');
        this.carContainer = document.getElementById('carPopup');
        this.content = document.getElementById('popup-content');
        this.closer = document.getElementById('popup-closer');


        this.carVectorSource = new VectorSource({
        });

        this.otherCarVectorSource = new VectorSource({
        });

        this.carClusterSource = new Cluster({
          distance: 40,
          minDistance: 20,
          source: this.carVectorSource,
        });

        this.otherCarClusterSource = new Cluster({
          distance: 40,
          minDistance: 20,
          source: this.otherCarVectorSource,
        });

        this.overlay = new Overlay({
          element: this.container,
          autoPan: true,
          autoPanAnimation: {
            duration: 250,
          },
        });

        this.overlayOffer = new Overlay({
          element: this.containerOffer,
          autoPan: true,
          autoPanAnimation: {
            duration: 250,
          },
        });

        this.overlayCar = new Overlay({
          element: this.carContainer,
          autoPan: true,
          autoPanAnimation: {
            duration: 250,
          },
        });

        this.lastZoom = localStorage.getItem('zoomLevel');
        this.centerOfZoom = localStorage.getItem('zoomCenter');

        if (this.lastZoom && this.centerOfZoom && !isNaN(this.centerOfZoom[0])) {
          this.centerOfZoom = this.centerOfZoom.split(',');
          this.view = new View({
            center: olProj.fromLonLat(this.centerOfZoom),
            zoom: this.lastZoom
          });
        } else {
          this.view = new View({
            center: olProj.fromLonLat([0, 0]),
            zoom: 1
          });
        }


        this.map = new Map({
          target: 'map',
          layers: [
            this.tileLayer, this.vectorLayerAdress
          ],
          overlays: [this.overlay, this.overlayOffer, this.overlayCar],
          view: this.view
        });

        // onlick
        this.map.on('click', evt => {
          const feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
          });

          if (feature) {
            const type = feature.get('type');
            if (feature.get('features')){
              if (feature.get('features')[0].get('type') === 'car'){
                if (feature.get('features').length === 1){ // ak som klikol na 1 auto
                  this.clickedOnCar(feature.get('features')[0].get('name'));
                  const coordinate = evt.coordinate;
                  this.overlayCar.setPosition(coordinate);
                  // this.overlay.setPosition(coordinate);
                  // this.openPopUp(evt.coordinate);
                  // this.onClickFindInfo(feature.get('features')[0].get('name'));
                  // // this.zoomToAddressOrCar(feature);
                  // this.zoomToCarAndIti(feature.get('features')[0].get('name'));
                  // this.scrollToInfo();

                }else{ // ak som klikol na viacero aut
                  const coordinate = evt.coordinate;
                  this.overlay.setPosition(coordinate);
                  this.chooseCarPopup.setCars(feature.get('features'));
                }
              }
              if (feature.get('features')[0].get('type') === 'offer'){
                if (feature.get('features').length === 1){ // ak som klikol na 1 auto
                  // this.onClickFindInfoOffer(feature.get('features')[0].get('name'), feature);
                  // this.zoomToAddressOrCar(feature);
                  // this.zoomToCarAndIti(feature.get('features')[0].get('name'));
                  // this.scrollToInfo();
                  this.offerFromDialog(feature.get('features')[0].get('name'));

                }else{ // ak som klikol na viacero ponuk
                  const coordinate = evt.coordinate;
                  this.overlayOffer.setPosition(coordinate);
                  this.chooseOfferPoUp.setOffers(feature.get('features'));
                }
              }
              if (feature.get('features')[0].get('type') === 'otherCar'){
                // console.log('ostatne');
              }
            }else{ // ked to nie je cluster - ciary medzdi ponukami
              if (feature.get('type') === 'offer'){
                  this.offerFromDialog(feature.get('name'));
              }
            }
          } else {
            this.closePopUp();
          }
        });
        this.checkFeatureUnderMouse(); // pointer
      },
      200);

  }

  clickedOnCar(carId){
    this.carInfo.setCarId(carId);
    this.carIdEmitter.emit(carId);
  }

  openPopUp(coordinates){
    this.overlayCar.setPosition(coordinates);
  }

  checkFeatureUnderMouse() {
    this.map.on('pointermove', (evt) => {
      const hit = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => true);
      if (hit) {
        this.map.getViewport().style.cursor = 'pointer';
        // this.newInfoForFeature(evt);
      } else {
        this.map.getViewport().style.cursor = '';
        // if (this.carUnderMouse){
        //   this.carUnderMouse = null;
        // }
      }
    });
  }

  newInfoForFeature(evt){
    // const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
    //   return feature;
    // });
    // const carId = feature.get('features')[0].get('name');
    // this.carUnderMouse = carId;

  }

  // TODO to by som mohol upravit vytvaranie novych layerov... ako to mam aj inde
  drawCars(car: Cars[]){
    if (!this.map){
      setTimeout(() => {
        this.drawCars(car);

      }, 200);
      return;
    }
    this.carsFromDatabase = car;
    this.cars = [];
    // this.carWarningStatus = [];
    this.pulseCar = false;



    if (car !== undefined){
      for (let i = 0; i < car.length; i++){


        if (car[i].lattitude !== undefined){

          const carFeature = new Feature({
            geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
            name: car[i].id,
            type: 'car'
          });


          if (!this.carsToDisplayFromFilter){
            this.cars.push(carFeature);
          }
          else if (this.carsToDisplayFromFilter.includes(car[i].id) || car[i].status === 4){
            this.cars.push(carFeature);
          }
          if (car[i].status === 4) {
            this.pulseCar = true;


            // pre blikanie
            const isThereCar = this.carWarningStatus.filter(findCar => findCar.id === car[i].id);

            if (isThereCar.length === 0 ){
              this.flashCar(carFeature, 1000, car[i]);
              this.carWarningStatus.push(car[i]);
            }

          }else{
            this.carWarningStatus = this.carWarningStatus.filter(findCar => findCar.id !== car[i].id);
          }
        }


        if (car[i].itinerar.length === 0 && this.vectorSourcePreTrasy){
          const feature2 = this.vectorSourcePreTrasy.getFeatureById(car[i].id);
          if (feature2){
            this.vectorSourcePreTrasy.removeFeature(feature2);
          }
        }
      }



    }

    // this.map.removeLayer(this.vectorLayerCars);
    if (this.carVectorSource){
      this.carVectorSource.clear();
    }
    this.carVectorSource.addFeatures(this.cars);



    if (this.cars && this.cars.length > 0){



      const styleCache = {};
      if (this.map && this.vectorLayerCars){
        this.map.removeLayer(this.vectorLayerCars);
      }
      this.vectorLayerCars = new VectorLayer({
        source: this.carClusterSource,
        style: (feature) => {
          const size = feature.get('features').length;
          let style = styleCache[size];
          if (!style){
            if (size > 1) {
              style = new Style({
                image: new Icon({
                  color: '#8959A8',
                  crossOrigin: 'anonymous',
                  src: 'assets/logo/truck.png',
                  scale: 0.05
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: '#fff',
                  }),
                }),
              });
              styleCache[size] = style;
            }else{
              const carId = feature.get('features')[0].get('name');
              const carToShow: Cars = this.carsFromDatabase.find(carFrom => carFrom.id === carId);
              if (this.carUnderMouse){
                style = new Style({
                  image: new Icon({
                    color: '#8959A8',
                    crossOrigin: 'anonymous',
                    src: 'assets/logo/truck.png',
                    scale: 0.05
                  }),
                  text: new Text({
                    text: 'som pro pro pro',
                    font: 15 + 'px sans-serif',
                    fill: new Fill({
                      color: '#000000',
                    }),
                    offsetY: 20
                  }),
                });
              }else{
                style = new Style({
                  image: new Icon({
                    color: '#8959A8',
                    crossOrigin: 'anonymous',
                    src: 'assets/logo/truck.png',
                    scale: 0.05
                  }),
                  text: new Text({
                    text: carToShow.ecv,
                    font: 15 + 'px sans-serif',
                    fill: new Fill({
                      color: '#000000',
                    }),
                    offsetY: 20
                  }),
                });
              }

              styleCache[size] = style;
            }
          }

          return style;
        },
      });

      this.vectorLayerCars.setZIndex(3);

      this.map.addLayer(this.vectorLayerCars);




      // if (this.firstZoomCars === false){
      //   const vectorNaZobrazenieAllFeatures =  new VectorSource({
      //     features: this.cars
      //   });
      //
      //
      //   this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
      //     duration: 800} );
      //   this.firstZoomCars = true;
      //   setTimeout(() => {
      //     this.lastZoom = this.map.getView().getZoom();
      //     localStorage.setItem('zoomLevel', this.lastZoom);
      //     this.centerOfZoom = transform(this.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
      //     localStorage.setItem('zoomCenter', this.centerOfZoom);
      //   }, 2000);
      //
      // }
    }

  }

  drawRoute(route: Feature){
    if (route){
    if (!this.vectorSourcePreTrasy) {
      this.vectorSourcePreTrasy = new VectorSource({
        features: [route]
      });

      this.vectorLayerCoordinates = new VectorLayer({
        source: this.vectorSourcePreTrasy,
      });
      this.map.addLayer(this.vectorLayerCoordinates);

    }
    this.vectorLayerCoordinates.setZIndex(1);

    this.vectorSourcePreTrasy.clear();
    this.vectorSourcePreTrasy.addFeature(route);
    }else if (this.vectorSourcePreTrasy){
      this.vectorSourcePreTrasy.clear();
    }

  }

  drawAddresses(addresses: Address[]){
    if (!addresses){
      return;
    }
    this.places = [];
    addresses.forEach((oneAddress, addressIndex) => {
      const iconFeature = new Feature({
        geometry: new Point(fromLonLat([oneAddress.coordinatesOfTownsLon, oneAddress.coordinatesOfTownsLat])),
        name: oneAddress.id,
        type: 'town',
        // carId: car.id
      });

      const iconStyle = new Style({
        image: new CircleStyle({
          radius: 8,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            // color: this.getColorByIndex(cisloAuta)
          }),
        }),
        text: new Text({
          text: (addressIndex + 1).toString(),
          fill: new Fill({
            color: '#fff',
          }),
        })
      });

      iconFeature.setStyle(iconStyle);
      this.places.push(iconFeature);
    });
    this.zoomToAddressInRouteAndCar(this.places);
    if (!this.addressVectorSource){
      this.addressVectorSource = new VectorSource({
        // features: [this.places]
      });
      this.addressVectorSource.addFeatures(this.places);
      this.vectorLayerAdress.setSource(this.addressVectorSource);
      this.vectorLayerAdress.setZIndex(2);

      this.map.addLayer(this.vectorLayerAdress);

    }else{
      this.addressVectorSource.clear();
      this.addressVectorSource.addFeatures(this.places);
    }

  }


  flashCar(feature, duration, car) {
    // let boolean = false;
    if (this.pulseCar) {
      let start = +new Date();

      // setCenter
      this.map.getView().setCenter(fromLonLat([car.longtitude, car.lattitude]));
      this.map.getView().setZoom(8);


      // var flash = this.flash(feature, duration);
      const animate =  (event) => {
        const carInData = this.carsFromDatabase.find(findCar => findCar.id == car.id);
        if (carInData.status !== 4){
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

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);

        if (elapsed > duration) { // stop the effect
          start = +new Date();
          this.tileLayer.on('postrender', animate);
          // boolean = true;
        }
        this.map.render();
      };
      const listenerKey = this.tileLayer.on('postrender', animate); // to remove the listener after the duration

    }
  }

  drawOffers(offers, cars, emitFromFilter){
    if (offers === null){
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      this.map.removeLayer(this.vectorLayerOffersGreen);
      this.map.removeLayer(this.vectorLayerOffersRed);
      this.map.removeLayer(this.vectorLayerOffersYellow);
      this.map.removeLayer(this.clustersOfOffers);
      return;
    }
    this.emitFromFilter = emitFromFilter;
    const maxPrekrocenieVahy = emitFromFilter.weight;
    this.maxPrekrocenieRozmerov = emitFromFilter.size;
    this.offersFromDatabase = offers;
    const carsCounted = cars.map(oneCar => oneCar.id);
    this.offersGreen = [];
    this.offersRed = [];
    this.offersYellow = [];

    this.offersRouteRed = [];
    this.offersRouteGreen = [];
    this.offersRouteYellow = [];
    // aby som si aktualizoval ponuku
    if (this.offersToShow){
      offers.forEach(onePonuka => {
        if (onePonuka.id === this.offersToShow.id){
          this.offersToShow = onePonuka;
          this.carIti.setPonuka(this.offersToShow);
          this.chooseCar.setFarby(this.offersToShow);
          this.carIti.setPrekrocenieVelkosti(this.maxPrekrocenieRozmerov);
        }
      });
    }
    const dispecer: Dispecer = this.dataService.getDispecer();
    // this.offersToShow = null;
    offers.forEach((route, index) => {
      let nezobrazovat = false;
      if (dispecer.nezobrazovatPonuky){
        if (dispecer.nezobrazovatPonuky.find(oneId => oneId === route.id)){
          nezobrazovat = true;
        }else{
          nezobrazovat = false;
        }
      }


      const isThereMyCarGreen = route.zelenePrepravy.find(car => carsCounted.includes(car.id));
      let isThereMyCarYellow;
      if (!isThereMyCarGreen){
        isThereMyCarYellow = route.zltePrepravy.find(car => carsCounted.includes(car.id));
      }

      const coordinatesToArray = [];
      route.adresyVPonuke.forEach((adresa, index) => {
        coordinatesToArray.push([adresa.coordinatesOfTownsLon, adresa.coordinatesOfTownsLat]);
      });

      // draw lines
      const routeString = new LineString(coordinatesToArray)
        .transform('EPSG:4326', 'EPSG:3857');

      const routeFeature = new Feature({
        type: 'offer',
        geometry: routeString,
        name: route.id
      });
      let routeStyle;


      if (route.flag >= 3 && !nezobrazovat){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [10, 255, 10, 0.45]
          })
        });
      }
      else if (route.flag === 2 && !nezobrazovat){
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
            color: [207, 0, 15, 0.45]
          })
        });
      }

      const styles = [];

      routeFeature.getGeometry().forEachSegment((start, end) => {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
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
      });
      styles.push(routeStyle);
      routeFeature.setStyle(styles);

      if (route.flag >= 3 && isThereMyCarGreen && !nezobrazovat){
        this.offersRouteGreen.push(routeFeature);
      }
      else if (route.flag === 2 && isThereMyCarYellow && !nezobrazovat){
        this.offersRouteYellow.push(routeFeature);
      }else{
        this.offersRouteRed.push(routeFeature);
      }


      if (route.adresyVPonuke.length > 0) {
        // tu vyberiem len 1. a posledny bod - na ikony a tie dam co clusterov
        // for (let i = 0; i < route.adresyVPonuke.length; i++) {

        const iconFeature = new Feature({
          geometry: new Point(fromLonLat([route.adresyVPonuke[0].coordinatesOfTownsLon, route.adresyVPonuke[0].coordinatesOfTownsLat])),
          name: route.id,
          type: 'offer',
          startPoint: true
        });
        const lengthOfAdd = route.adresyVPonuke.length;
        const iconFeatureLast = new Feature({
          geometry: new Point(fromLonLat([route.adresyVPonuke[lengthOfAdd - 1].coordinatesOfTownsLon, route.adresyVPonuke[lengthOfAdd - 1].coordinatesOfTownsLat])),
          name: route.id,
          type: 'offer',
          startPoint: false
        });

        if (route.flag >= 3 && isThereMyCarGreen && !nezobrazovat){
          this.offersGreen.push(iconFeature);
          this.offersGreen.push(iconFeatureLast);
        }
        else if (route.flag === 2 && isThereMyCarYellow && !nezobrazovat){
          this.offersYellow.push(iconFeature);
          this.offersYellow.push(iconFeatureLast);
        }else{
          this.offersRed.push(iconFeature);
          this.offersRed.push(iconFeatureLast);
        }

      }

    });

    let zobrazitPodlaFarby = [];
    if (this.green){
      zobrazitPodlaFarby = [...this.offersGreen];
    }
    if (this.yellow){
      zobrazitPodlaFarby = [...this.offersYellow, ...zobrazitPodlaFarby];
    }
    if (this.red){
      zobrazitPodlaFarby = [...this.offersRed, ...zobrazitPodlaFarby];
    }

    this.map.removeLayer(this.clustersOfOffers);
    this.pridajClaster(zobrazitPodlaFarby);

    this.clustersOfOffers.setZIndex(4);
    this.map.addLayer(this.clustersOfOffers);

    const vectorSourceRoutesGreen = new VectorSource({
      features: this.offersRouteGreen
    });

    const vectorSourceRoutesYellow = new VectorSource({
      features: this.offersRouteYellow
    });

    const vectorSourceRoutesRed = new VectorSource({
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
      if (this.vectorLayerOffersRoutesGreen){
        this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      }
      this.map.addLayer(this.vectorLayerOffersRoutesGreen);
    }
    if (this.yellow){
      if (this.vectorLayerOffersRoutesYellow){
        this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      }
      this.map.addLayer(this.vectorLayerOffersRoutesYellow);
    }
    if (this.red){
      if (this.vectorLayerOffersRoutesRed){
        this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      }
      this.map.addLayer(this.vectorLayerOffersRoutesRed);
    }


    this.vectorLayerAdress.setZIndex(2);
    if (this.vectorLayerOffersGreen){
      this.map.removeLayer(this.vectorLayerOffersGreen);
    }
    if (this.vectorLayerOffersYellow){
      this.map.removeLayer(this.vectorLayerOffersYellow);
    }
    if (this.vectorLayerOffersRed){
      this.map.removeLayer(this.vectorLayerOffersRed);
    }
    this.map.addLayer(this.vectorLayerOffersGreen);
    this.map.addLayer(this.vectorLayerOffersYellow);
    this.map.addLayer(this.vectorLayerOffersRed);


    // if (fitOffers){
    //   // this.fitAllOffers();
    // }
  }

  // ked z cakarne chcem prejst do ponuky, vratim si feature
  getFeatureFromOffer(routes){
    const route = routes[0];
    const coordinatesToArray = [];
    route.adresyVPonuke.forEach((adresa, index) => {
      coordinatesToArray.push([adresa.coordinatesOfTownsLon, adresa.coordinatesOfTownsLat]);
    });

    // draw lines
    const routeString = new LineString(coordinatesToArray)
      .transform('EPSG:4326', 'EPSG:3857');

    const routeFeature = new Feature({
      type: 'offer',
      geometry: routeString,
      name: route.id
    });
    return routeFeature;
  }

  public reDrawOffers(carsId, cars){
    if (carsId){
      this.carsToDisplay = carsId;
    }else{
      this.carsToDisplay = this.carsFromDatabase.map(oneCar => oneCar.id);
    }
    // setTimeout(() => {
    this.drawOffers(this.offersFromDatabase, cars, this.emitFromFilter);
    this.pocetAut = 0; // ked auto, ktore nema ziadnu adresu dostane prepravu, aby sa mu nacitala trasa
    // }, 2500);
  }

  offersShow(which){
    let ktoreClastreUkazat = [];
    if (which.vyhovuje){
      this.green = true;
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      this.map.addLayer(this.vectorLayerOffersRoutesGreen);
      ktoreClastreUkazat = [...this.offersGreen];
    }else{
      this.green = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
    }

    if (which.trocha){
      ktoreClastreUkazat = [...this.offersYellow, ...ktoreClastreUkazat];
      this.yellow = true;
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      this.map.addLayer(this.vectorLayerOffersRoutesYellow);
    }else{
      this.yellow = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
    }

    if (which.nie){
      ktoreClastreUkazat = [...this.offersRed, ...ktoreClastreUkazat];
      this.red = true;
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      this.map.addLayer(this.vectorLayerOffersRoutesRed);
    }else{
      this.red = false;
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
    }
    this.map.removeLayer(this.clustersOfOffers);
    this.pridajClaster(ktoreClastreUkazat);

    this.clustersOfOffers.setZIndex(4);
    this.map.addLayer(this.clustersOfOffers);
    // this.fitAllOffers();
  }

  pridajClaster(zobrazitPodlaFarby){
    const pociatocne = new VectorSource({
      features: zobrazitPodlaFarby,
    });
    const clusterSource = new Cluster({
      distance: 40,
      minDistance: 20,
      source: pociatocne,
    });

    const styleCache = {};
    this.clustersOfOffers = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const size = feature.get('features').length;
        const style = styleCache[size];
        // if (!style) {
        if (size === 1){
          if (feature.get('features')[0].get('startPoint') === true){

            const stylik = new Style({
              image: new Icon({
                color: '#ffffff',
                crossOrigin: 'anonymous',
                src: 'assets/logo/startPoint.png',
                scale: 0.5
              }),
            });
            return stylik;

          }
          else{
            const stylik = new Style({
              image: new Icon({
                color: '#8959A8',
                crossOrigin: 'anonymous',
                src: 'assets/logo/finishFlag.png',
                scale: 0.5
              }),
            });

            return stylik;
          }
        }else{
          const stylik = new Style({
            image: new CircleStyle({
              radius: 9,
              stroke: new Stroke({
                color: '#000000'
              }),
              fill: new Fill({
                color: '#000000'
              }),
            }),
            text: new Text({
              text: size.toString(),
              scale: 1.3,
              fill: new Fill({
                color: '#fff',
              }),
            }),
          });
          return stylik;
        }
      },
    });
  }

  closePopUpCar(whatClicek){

  }

  closePopUp() {
    this.overlay.setPosition(undefined);
    this.carToShow  = null;
    this.closer.blur();
    this.overlayOffer.setPosition(undefined);
    this.overlayCar.setPosition(undefined);
    if (this.vectorSourcePreTrasy){
      this.vectorSourcePreTrasy.clear();
    }
    if (this.addressVectorSource){
      this.addressVectorSource.clear();
    }
  }

  offerFromDialog(offerId){
    const allOffers = this.offersGreen.concat(this.offersYellow).concat(this.offersRed);
    const feature = allOffers.find(oneFeature => oneFeature.get('name') === offerId);
    if (offerId){
      // this.onClickFindInfoOffer(offerId, feature);
      console.log(offerId);
      this.offerIdEmitter.emit({offerId, feature});
    }
    this.closePopUp();

  }


  onResize() {
    setTimeout( () => {
      this.map.updateSize();
    }, 200);
  }

  whichCarsToShow(carsId){
    console.log(carsId);
    if (!carsId){
      this.carsToDisplayFromFilter = null;
    }else{
      this.carsToDisplayFromFilter = carsId;
    }
    // this.addCars(this.carsFromDatabase);
    this.drawCars(this.carsFromDatabase);
    // if (this.addressVectorSource){
    //   this.vectorSourcePreTrasy.clear();
    //   this.addressVectorSource.clear();
    // }
  }

  otherCarsToShow(car: Cars[]){
    if (!car){
      if (this.map && this.vectorLayerOtherCars){
        this.map.removeLayer(this.vectorLayerOtherCars);
      }
      return;
    }
    if (!this.map){
      setTimeout(() => {
        this.otherCarsToShow(car);
      }, 200);
      return;
    }

    const otherCarsFeature = [];

    if (car !== undefined){
      for (let i = 0; i < car.length; i++){


        if (car[i].lattitude !== undefined){

          const carFeature = new Feature({
            geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
            name: car[i].id,
            type: 'otherCar'
          });
          otherCarsFeature.push(carFeature);
        }
      }



    }

    // this.map.removeLayer(this.vectorLayerCars);
    if (this.otherCarVectorSource){
      this.otherCarVectorSource.clear();
    }
    this.otherCarVectorSource.addFeatures(otherCarsFeature);



    if (this.cars && this.cars.length > 0){



      const styleCache = {};
      if (this.map && this.vectorLayerOtherCars){
        this.map.removeLayer(this.vectorLayerOtherCars);
      }
      this.vectorLayerOtherCars = new VectorLayer({
        source: this.otherCarClusterSource,
        style: (feature) => {
          const size = feature.get('features').length;
          let style = styleCache[size];
          if (!style){
            if (size > 1) {
              style = new Style({
                image: new Icon({
                  color: '#8959A8',
                  crossOrigin: 'anonymous',
                  src: 'assets/logo/truck.png',
                  scale: 0.05
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: '#fff',
                  }),
                }),
              });
              styleCache[size] = style;
            }else{
                style = new Style({
                  image: new Icon({
                    color: '#8959A8',
                    crossOrigin: 'anonymous',
                    src: 'assets/logo/truck.png',
                    scale: 0.05
                  }),
                });
                styleCache[size] = style;
            }
          }

          return style;
        },
      });

      this.vectorLayerOtherCars.setZIndex(3);

      this.map.addLayer(this.vectorLayerOtherCars);

    }

  }

  zoomToCarAndIti(carFeatureFrom){
    const carFeature = carFeatureFrom;
    const idAuta = carFeatureFrom.get('name');
    const vozidlo: Cars = this.carsFromDatabase.find(allCars => allCars.id === idAuta);
    const vectorSource = this.vectorLayerAdress.getSource();
    const features = vectorSource.getFeatures();
    const featuresToShow = [];
    featuresToShow.push(carFeature);
    for (let i = 0; i < features.length; i++) {
      if (vozidlo.itinerar.includes(features[i].get('name'))) {
        featuresToShow.push(features[i]);
      }
    }
    if (featuresToShow.length === 1){
      const poloha = featuresToShow[0].getGeometry().getCoordinates();
      this.view.animate({
        center: poloha,
        duration: 500,
        zoom: 15
      });
    }else{
      const vectorSourceToZoom = new VectorSource({
        features: featuresToShow
      });
      this.view.fit(vectorSourceToZoom.getExtent(), {
        padding: [80, 80, 80, 80],
        duration: 800
      });
    }
  }

  zoomToAddressInRouteAndCar(addressesFeature){
    const features =  addressesFeature;

      const vectorSourceToZoom = new VectorSource({
        features: features
      });
      this.view.fit(vectorSourceToZoom.getExtent(), {
        padding: [80, 80, 80, 80],
        duration: 800
      });
  }

  zoomToRoute(address){
    const celaCesta = address.getGeometry().getExtent();

    this.view.fit(celaCesta, {padding: [80, 80, 80, 80],
      minResolution: 50,
      duration: 800} );

  }

}

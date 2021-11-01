import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
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


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
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
  // skusam vytvorit trasu
  points;

  carWarningStatus = []; // ukladam si vectori sem, aby sa neduplikovali

  emitFromFilter;

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

  pointsFeature;
  coordinatesFeature;

  carsWithItinerar;

  carsToDisplay;

  carsFromDatabase: Cars[];
  routesFromDatabase;
  adressesFromDatabase: Address[];
  offersFromDatabase: Route[];

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
  content;
  closer;
  container;
  containerOffer;
  @ViewChild('dragDrop')
  private dragComponent: DragAndDropListComponent;

  @ViewChild('infoElement')
  private infoDivElement: ElementRef;

  @ViewChild('filterElement')
  private filterElement: ElementRef;



  @ViewChild(CarItiDetailComponent)
  private carIti: CarItiDetailComponent;

  @ViewChild(ChoosCarToMoveComponent)
  private chooseCar: ChoosCarToMoveComponent;

  @ViewChild(CarsPopUpComponent)
  private chooseCarPopup: CarsPopUpComponent;

  @ViewChild(OffersPopUpComponent)
  private chooseOfferPoUp: OffersPopUpComponent;

  @ViewChild(PosliPonukuComponent)
  private posliPonuku: PosliPonukuComponent

  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService,
              private drawOffer: DrawOfferService, private vodicService: VodicService,
              private routeCoordinates: RouteCoordinatesService) { }

              routeDetail(route){
              this.dataService.changeRealRoute(route);
            }

  ngAfterViewInit(): void {
    setTimeout(() =>
    {

      this.container = document.getElementById('popup');
      this.containerOffer = document.getElementById('offerPopUp');
      this.content = document.getElementById('popup-content');
      this.closer = document.getElementById('popup-closer');

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


      this.view = new View({
      center: olProj.fromLonLat([0, 0]),
      zoom: 1
    });

      this.map = new Map({
      target: 'map',
      layers: [
        this.tileLayer, this.vectorLayerAdress
      ],
      overlays: [this.overlay, this.overlayOffer],
      view: this.view
    });

      this.carService.cars$.subscribe(newCars => {
          this.carsFromDatabase = newCars;
          this.carsToDisplay = this.carsFromDatabase.map(oneCar => oneCar.id);
          this.addCars(this.carsFromDatabase);

          setTimeout(() => {
            this.addRouteNewSystem();
          }, 1000);
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
              this.zoomToAddressOrCar(feature);
              if (feature.get('features').length === 1){ // ak som klikol na 1 auto
                this.onClickFindInfo(feature.get('features')[0].get('name'));
              }else{ // ak som klikol na viacero aut
                const coordinate = evt.coordinate;
                this.overlay.setPosition(coordinate);
                this.chooseCarPopup.setCars(feature.get('features'));
              }
            }
          if (feature.get('features')[0].get('type') === 'offer'){
            this.zoomToAddressOrCar(feature);
            if (feature.get('features').length === 1){ // ak som klikol na 1 auto
              this.onClickFindInfoOffer(feature.get('features')[0].get('name'), feature);
            }else{ // ak som klikol na viacero ponuk
              const coordinate = evt.coordinate;
              this.overlayOffer.setPosition(coordinate);
              this.chooseOfferPoUp.setOffers(feature.get('features'));
            }
          }
        }
        else if (type === 'car'){
          this.onClickFindInfo(feature.get('name'));
          this.zoomToAddressOrCar(feature);
        }

        else if (type === 'town'){

          this.zoomToAddressOrCar(feature);
          this.onClickFindInfoAdress(feature.get('name'));
          this.lastClickedOnaddressId = feature.get('name');
        }
        else if (type === 'route'){
          this.zoomToRoute(feature);

          // console.log(feature.getGeometry())
          // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
          // this.countDistance(feature.getGeometry(), [48.896324, 19.267890])
          this.onClickFindInfo(feature.get('name'));
        }
        else if (type === 'offer'){
          this.zoomToRoute(feature);

          // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
          // this.countDistance(feature.getGeometry(), [48.896324, 19.267890])
          this.onClickFindInfoOffer(feature.get('name'), feature);
        }
        // $(element).popover('show');
      } else {
        // $(element).popover('dispose');
      }
    });

      this.checkFeatureUnderMouse(); // pointer
    },
      200);

    this.countDistance([48.920836, 19.180706], [48.920779, 19.180593]);
  }

  carFromDialog(carId){
    this.closePopUp();
    if (carId){
      this.onClickFindInfo(carId);
    }
  }

  offerFromDialog(offerId){
    this.closePopUp();
    if (offerId){
      this.onClickFindInfoOffer(offerId, null);
    }
  }

  closePopUp(){
    this.overlay.setPosition(undefined);
    this.closer.blur();
    this.overlayOffer.setPosition(undefined);
  }

  scrollToInfo(){
    setTimeout(() => {
      this.infoDivElement.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }, 150);
  }

  scrollToUp(){
    setTimeout(() => {
      this.filterElement.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }, 100);
  }

// ak kliknem na auto
  onClickFindInfo(id){
    this.carToShow = this.carsWithItinerar.find(car => car.id === id);
    this.offersToShow = null;
    this.routesToShow = undefined;
    setTimeout(() => {
      // @ts-ignore
      this.dragComponent.setAddresses(this.carToShow.itiAdresy);
    }, 100);
    this.scrollToInfo();
  }

  // ak kliknem na adresu
  onClickFindInfoAdress(id){
    let adresyVRoute = this.routeService.getRoutesNoSub().find(oneRoute => oneRoute.addresses.includes(id));
    if (!adresyVRoute){
      adresyVRoute = this.offerRouteService.getRoutesNoSub().find(oneRoute => oneRoute.addresses.includes(id));
    }
    const adresy = this.adressesFromDatabase.filter(oneAdresa => adresyVRoute.addresses.includes(oneAdresa.id));
    this.routesToShow = adresyVRoute.addresses.map((i) => adresy.find((j) => j.id === i));

    this.carToShow = this.carsFromDatabase.find(car => car.id === this.routesToShow[0].carId);
    this.offersToShow = null;
    setTimeout(() => {
      this.dragComponent.setAddresses(this.routesToShow);
    }, 100);
    this.scrollToInfo();
  }

  // ak kliknem na ponuku
  async onClickFindInfoOffer(id, feature){
    this.offersToShow = this.offersFromDatabase.find(route => route.id === id);
    if (feature){
      this.distanceOfOffer = Math.round(((getLength(feature.getGeometry()) / 100) / 1000) * 100);
    }
    this.carToShow = null;
    this.routesToShow = null;
    await this.sleep(200);
    this.chooseCar.setFarby(this.offersToShow);
    this.posliPonuku.setOfferId(this.offersToShow.id);
    this.carIti.setPonuka(this.offersToShow);
    this.carIti.setPrekrocenieVelkosti(this.maxPrekrocenieRozmerov);
    this.scrollToInfo();

  }
  sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addRouteNewSystem(){
    this.carService.cars$.subscribe(allCars => {
        allCars.forEach(oneCar => {
          if (oneCar.itinerar && oneCar.itinerar.length > 0){
          let outputData;
          this.routeCoordinates.getRoute(oneCar.id).subscribe((nasolSom) => {
            if (nasolSom) {
              const ref = this.storage.ref('Routes/' + oneCar.id + '.json');
              setTimeout(() => {


                const stahnute = ref.getDownloadURL().pipe(take(1)).subscribe(data => {
                  if (data) {
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
                      // console.log(this.points)
                      const routeString = new LineString(this.points)
                        .transform('EPSG:4326', 'EPSG:3857');

                      const routeFeature = new Feature({
                        type: 'route',
                        geometry: routeString,
                        name: oneCar.id,
                        id: oneCar.id
                      });
                      const poziciaAuta = this.carsFromDatabase.findIndex(carFromd => carFromd.id === oneCar.id);
                      const routeStyle = new Style({
                        stroke: new Stroke({
                          width: 6,
                          color: this.getColorByIndex(poziciaAuta)
                        })
                      });
                      routeFeature.setId(oneCar.id);
                      routeFeature.setStyle(routeStyle);

                      // console.log(routeFeature);
                      // console.log(route)
                      this.routes.push(routeFeature);
                      this.pridajCestyNaMapu(routeFeature, oneCar.id);


                    }, (error) => {
                      console.log('trasa nenajdena1');
                    });
                  }

                }, (error) => {
                  console.log('trasa nenajdena2');
                  stahnute.unsubscribe();
                });
              }, 1000);
            } //
          });
        }
        });
    });
  }

  addRoute(carId, colorIndex) {
    const route = {id: carId};
    this.routes = [];
    let outputData;

    // routes.forEach((route, index) => {

  // this.ca

    const ref = this.storage.ref('Routes/' + route.id + '.json');
    try {
      const stahnute = ref.getDownloadURL().subscribe(data => {

    if (data){

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
          // console.log(this.points)
          const routeString = new LineString(this.points)
            .transform('EPSG:4326', 'EPSG:3857');

          const routeFeature = new Feature({
            type: 'route',
            geometry: routeString,
            name: route.id
          });
          const routeStyle = new Style({
            stroke: new Stroke({
              width: 6,
              color: this.getColorByIndex(colorIndex)
            })
          });
          routeFeature.setStyle(routeStyle);

          // console.log(routeFeature);
          // console.log(route)
          this.routes.push(routeFeature);
          this.pridajCestyNaMapu(routeFeature, route.id);


        }, (error) => {
          console.log('trasa nenajdena1');
        });
}

      }, (error) => {
        console.log('trasa nenajdena2');
        stahnute.unsubscribe();
      });
    }catch (err){
      console.log('catchol som');
    }

  // });
  //   if (routes == 0){
  //     this.map.removeLayer(this.vectorLayerCoordinates)
  //   }
  }

  pridajCestyNaMapu(feature, carId){
    if (!this.vectorSourcePreTrasy){
      this.vectorSourcePreTrasy = new VectorSource({
        // features: this.routes
      });

      this.vectorLayerCoordinates = new VectorLayer({
        source: this.vectorSourcePreTrasy,
      });
      this.vectorLayerCoordinates.setZIndex(1);
      this.map.addLayer(this.vectorLayerCoordinates);

    }else{
      const feature = this.vectorSourcePreTrasy.getFeatureById(carId);
      if (feature){
        this.vectorSourcePreTrasy.removeFeature(feature);
      }
    }
    this.vectorSourcePreTrasy.addFeature(feature);
    // this.map.removeLayer(this.vectorLayerCoordinates);
  }

  checkFeatureUnderMouse(){
    this.map.on('pointermove', function(evt)
    {   const hit = this.forEachFeatureAtPixel(evt.pixel, function(feature, layer) { return true; });
        if (hit) { this.getViewport().style.cursor = 'pointer'; }
      else { this.getViewport().style.cursor = ''; }
    });
  }

  addCars(car){
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




            // const carStyle = new Style({
            //   image: new Icon({
            //     color: '#8959A8',
            //     crossOrigin: 'anonymous',
            //     src: 'assets/logo/truck.png',
            //     scale: 0.05
            //   })
            // });
            // carFeature.setStyle(carStyle);
            this.cars.push(carFeature);
            if (car[i].status === 4) {
              this.pulseCar = true;


              // pre blikanie
              const isThereCar = this.carWarningStatus.filter(findCar => findCar.id == car[i].id);

              if (isThereCar.length === 0 ){
                this.flashCar(carFeature, 1000, car[i]);
                this.carWarningStatus.push(car[i]);
              }

            }else{
              this.carWarningStatus = this.carWarningStatus.filter(findCar => findCar.id != car[i].id);
            }
          }


          // tot mam auto a mohol by som relativne itinerar odoslat na vykreslenie aj s farbou
          // update vozidla ak mam nakliknute nejake
          if (this.carToShow && car[i] && car[i].id === this.carToShow.id && !this.routesToShow){
            setTimeout(() =>
              {

                this.onClickFindInfo(car[i].id);
                console.log('som nasiel same');
              },
              500);
          }

        }



      }
      this.addAddresses();
      this.map.removeLayer(this.vectorLayerCars);

      const vectorSource = new VectorSource({
        features: this.cars
      });

      // this.vectorLayerCars = new VectorLayer({
      //   source: clusterSource,
      // });

      if (this.cars && this.cars.length > 0){


    const clusterSource = new Cluster({
      distance: 40,
      minDistance: 20,
      source: vectorSource,
    });
    const styleCache = {};
    this.vectorLayerCars = new VectorLayer({
      source: clusterSource,
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
            style = new Style({
              image: new Icon({
                color: '#8959A8',
                crossOrigin: 'anonymous',
                src: 'assets/logo/truck.png',
                scale: 0.05
              }),
              text: new Text({
                text: carToShow.ecv,
                fill: new Fill({
                  color: '#000000',
                }),
                offsetY: 15
              }),
            });
            styleCache[size] = style;
          }
        }

        return style;
      },
    });

    this.vectorLayerCars.setZIndex(3);
    this.map.addLayer(this.vectorLayerCars);

    const vectorNaZobrazenieAllFeatures =  new VectorSource({
      features: this.places.concat(this.cars).concat(this.routes)
    });


    if (this.firstZoomCars === false){
        this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
          duration: 800} );
        this.firstZoomCars = true;
    }
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

         const styledelete = new Style({
         });

         vectorContext.setStyle(styledelete);
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

  public reDrawOffers(carsId){
    if (carsId){
      this.carsToDisplay = carsId;
    }else{
      this.carsToDisplay = this.carsFromDatabase.map(oneCar => oneCar.id);
    }
    setTimeout(() => {
      this.drawOffers(this.offersFromDatabase);
    }, 2500);
  }

  public reDrawOffersNoDelay(){
      this.drawOffers(this.offersFromDatabase);
  }


  addAddresses(){
    let mojeAdresy: Address[];

    this.addressService.address$.subscribe(allAddresses => { // tu by som mal natiahnut aj ponuky a dat to dokopy
        this.addressService.offerAddresses$.subscribe(allOffers => {

        this.places = [];
        this.adressesFromDatabase = allAddresses.concat(allOffers);

        const carsWithIti = [];
        this.carsFromDatabase.forEach(oneCar => {
          if (oneCar.itinerar) {
            const itinerarAuta: Address[] = [];
            const detailAuta: any[] = [];
            oneCar.itinerar.forEach(addId => {
              const detailVMeste = [];
              const vsetkyAdresy = this.addressService.getAddresses().concat(this.addressService.getAddressesFromOffer());
              const oneAdd = vsetkyAdresy.find(oneAdd => oneAdd.id === addId);
              if (oneAdd) {
                if (itinerarAuta.find(oneIti => oneIti.id === oneAdd.id)) { // hladam duplikat
                  const indexAdresy = itinerarAuta.findIndex(oneIti => oneIti.id === oneAdd.id);
                  itinerarAuta[indexAdresy] = oneAdd;
                } else {
                  itinerarAuta.push(oneAdd);
                }
                const allPackages = this.packageService.getAllPackages().concat(this.packageService.getAllOfferPackages());
                oneAdd.packagesId.forEach(onePackId => {
                  detailVMeste.push(allPackages.find(onePackage => onePackage.id === onePackId));
                });
              }
              detailAuta.push(detailVMeste);
            });
            carsWithIti.push({...oneCar, itiAdresy: itinerarAuta, detailIti: detailAuta});
          }

        });
        this.carsWithItinerar = carsWithIti;

        if (this.carToShow && this.carsWithItinerar && !this.routesToShow){
          this.onClickFindInfo(this.carToShow.id);
        }
        else if (this.carToShow && this.carsWithItinerar && this.routesToShow){
          this.onClickFindInfoAdress(this.lastClickedOnaddressId);
        }

        mojeAdresy = allAddresses.concat(allOffers);


        mojeAdresy.forEach((oneAddress, index) => {
          const car = this.carsFromDatabase.find(oneCar => {
            if (oneCar.itinerar) {
              if (oneCar.itinerar.includes(oneAddress.id)) {
                return true;
              }
            }
          });


          if (car) {
            const cisloAuta = this.carsFromDatabase.findIndex(oneCar => oneCar.id == car.id);
            const cisloItinerara = car.itinerar.findIndex(oneAdd => oneAdd == oneAddress.id);

            // this.addRoute(this.carsFromDatabase[cisloAuta].id, cisloAuta);

            const iconFeature = new Feature({
              geometry: new Point(fromLonLat([oneAddress.coordinatesOfTownsLon, oneAddress.coordinatesOfTownsLat])),
              name: oneAddress.id,
              type: 'town'
            });

            const iconStyle = new Style({
              image: new CircleStyle({
                radius: 8,
                stroke: new Stroke({
                  color: '#fff'
                }),
                fill: new Fill({
                  color: this.getColorByIndex(cisloAuta)
                }),
              }),
              text: new Text({
                text: (cisloItinerara + 1).toString(),
                fill: new Fill({
                  color: '#fff',
                }),
              })
            });

            iconFeature.setStyle(iconStyle);
            this.places.push(iconFeature);
          }
        });
        const vectorSource = new VectorSource({
          features: this.places
        });

        this.map.removeLayer(this.vectorLayerAdress);
        this.vectorLayerAdress = new VectorLayer({
          source: vectorSource,
        });
        this.vectorLayerAdress.setZIndex(2);
        this.map.addLayer(this.vectorLayerAdress);
        if (vectorSource.getFeatures()[0] !== undefined) {


          const feature = vectorSource.getFeatures()[0];
          const polygon = feature.getGeometry();

          setTimeout(() => {
            const vectorNaZobrazenieAllFeatures = new VectorSource({
              features: this.places.concat(this.cars).concat(this.routes)
            });

            if (this.firstZoomAddress === false) {
              this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {
                padding: [100, 100, 100, 100], minResolution: 50,
                duration: 800
              });
              this.firstZoomAddress = true;
            }
          }, 1500);


        }
      });
      });


  }


  addMarker(cars: Cars[]){
    this.places = [];

    // if (this.coordinatesFeature != null || this.coordinatesFeature != undefined){
    //   this.places.push(this.coordinatesFeature);
    // }
    const color = -1;

    if (cars.length === 0){
      this.map.removeLayer(this.vectorLayerCoordinates);
      this.map.removeLayer(this.vectorLayerCoordinates);
    }
    let adresa: Address;
    this.addressService.address$.subscribe(allAddresses => {
      // adresa =
    });
    cars.forEach((car, index) => {



      new Promise((resolve, reject) => {
        if (car.itinerar && car.itinerar.length > 0) {
          for (let i = 0; i < car.itinerar.length; i++) {
            console.log('som in da for' + car);



            const iconFeature = new Feature({
                geometry: new Point(fromLonLat([adresa.coordinatesOfTownsLon, adresa.coordinatesOfTownsLat])),
                name: adresa.id,
                type: 'town'
              });

            let iconStyle;
            if (adresa.status === 3) {
                iconStyle = new Style({
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
                    text: (i + 1).toString() + '✓',
                    fill: new Fill({
                      color: '#fff',
                    }),
                  })
                });
              } else if (adresa.status === 4) {
                 iconStyle = new Style({
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
                    text: (i + 1).toString() + 'X',
                    fill: new Fill({
                      color: '#fff',
                    }),
                  })
                });
                 this.pulseMarker = true;
              } else {
                 iconStyle = new Style({
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
                    text: (i + 1).toString(),
                    fill: new Fill({
                      color: '#fff',
                    }),
                  })
                });
              }


            iconFeature.setStyle(iconStyle);
            this.places.push(iconFeature);




          }
          resolve();
        }
      }).then(() => {

      if (adresa){
        setTimeout(() =>
          {
            // chvilu pockam kym natiahnem cesty, ak by ju nahodou auto updatlo
            // this.addRoute(car);
          },
          1500);
      }

      console.log(this.places);
      const vectorSource = new VectorSource({
        features: this.places
      });

      // this.map.removeLayer(this.vectorLayerAdress)
      this.vectorLayerAdress = new VectorLayer({
        source: vectorSource,
      });
      this.vectorLayerAdress.setZIndex(2);
      this.map.addLayer(this.vectorLayerAdress);
      if (vectorSource.getFeatures()[0] != undefined) {


        const feature = vectorSource.getFeatures()[0];
        const polygon = feature.getGeometry();

        setTimeout( () => {
          const vectorNaZobrazenieAllFeatures = new VectorSource({
            features: this.places.concat(this.cars).concat(this.routes)
          });

          if (this.firstZoomAddress === false){
            this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
              duration: 800} );
            this.firstZoomAddress = true;
          }
        }, 1500 );


      }
      });

  });
  }

  fitAllOffers(){
    let whichFeatruresFit = [];
    if (this.green){
      whichFeatruresFit = this.offersGreen;
    }
    if (this.yellow){
      whichFeatruresFit = [...whichFeatruresFit, ...this.offersYellow];
    }
    if (this.red){
      whichFeatruresFit = [...whichFeatruresFit, ...this.offersRed];
    }
    setTimeout( () => {
      const vectorNaZobrazenieAllFeatures = new VectorSource({
        features: whichFeatruresFit
      });
      this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
          duration: 800
        });
    }, 2000);
  }

  estimatedTimeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  closeInfo(){
    this.carToShow = null;
    this.routesToShow = null;
    this.offersToShow = null;
    const vectorNaZobrazenieAllFeatures = new VectorSource({
      features: this.places.concat(this.cars).concat(this.routes)
    });
    this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
      duration: 800} );
    this.scrollToUp();
  }

  zoomToAddressOrCar(address){
    const poloha = address.getGeometry().getCoordinates();
    this.view.animate({
      center: poloha,
      duration: 500,
      zoom: 12
    });
  }

  zoomToRoute(address){
    const celaCesta = address.getGeometry().getExtent();

    this.view.fit(celaCesta, {padding: [100, 100, 100, 100],
      minResolution: 50,
      duration: 800} );

  }

  getColorByIndex(index){
    let ktoruFarbu;
    if (index >= this.colors.length){
      ktoruFarbu = index % this.colors.length;
      return this.colors[ktoruFarbu];
    }else{
      ktoruFarbu = index;
      return this.colors[ktoruFarbu];
    }
  }

  // vrati najkratsiu vzdialenost od trasy
  countDistance(from, to){
    let distance = 100000000;
    from.forEach(array => {
      const pole = transform(array, 'EPSG:3857', 'EPSG:4326');
      const oneDistance = getDistance(pole, to);
      if (oneDistance < distance){
          distance = oneDistance;
        }
    });
    return distance;
  }

  // hodim lat lon od do a vrati mi dlzku v metroch
  countDistancePoints(from, to){
      const distance = getDistance(from, to);
      return distance;
  }
  // skontroluj ci sedi nakl hrana pre auto
  checkNaklHrana(car: Cars, vyskaNaklHrany){
    if (vyskaNaklHrany && vyskaNaklHrany.maxVyska > -1){
      const carMin = car.nakladaciaHrana[0];
      const carMax = car.nakladaciaHrana[1];
      if (carMax){
        if (vyskaNaklHrany.maxVyska <= carMax && vyskaNaklHrany.minVyska >= carMin){
          return true;
        }else{
          return false;
        }
      }else{
        if (vyskaNaklHrany.maxVyska <= carMin && vyskaNaklHrany.minVyska >= carMin){
          return true;
        }else{
          return false;
        }
      }
    }else{
      return true;
    }
  }

  offersUpdate(emitFromFilter){
    if (emitFromFilter == null && this.map !== undefined){
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      this.map.removeLayer(this.vectorLayerOffersGreen);
      this.map.removeLayer(this.vectorLayerOffersRed);
      this.map.removeLayer(this.vectorLayerOffersYellow);
      this.map.removeLayer(this.clustersOfOffers);
    }else if (emitFromFilter != null){
      this.emitFromFilter = emitFromFilter.offers;
      const offers: Route[] = emitFromFilter.offers;
      const minVzdialenost = emitFromFilter.minDistance;
      const maxVzdialenost = emitFromFilter.maxDistance;
      const maxPrekrocenieVahy = emitFromFilter.weight;
      const maxPrekrocenieRozmerov = emitFromFilter.size;
      const typeOfDistance = emitFromFilter.typeDistance;
      this.maxPrekrocenieRozmerov = maxPrekrocenieRozmerov;

      setTimeout( () => {
      const poleSMinVzdialenostamiOdAdries = [];
      offers.forEach((oneRouteOffer, indexOffer) => { // prechaedzam ponukami

        const adresyVPonuke: Address[] = [];
        const detailVPonuke: any[] = [];
        oneRouteOffer.addresses.forEach((addId, indexAdresa)  => {
          const adresa: Address = this.adressesFromDatabase.find(oneAdd => oneAdd.id === addId);
          adresyVPonuke.push(adresa);

          const packageVPoradiPreAdresu: DeatilAboutAdresses[] = [];
          if (adresa){
            adresa.packagesId.forEach(onePackageId => {
              let balik: DeatilAboutAdresses = this.packageService.getOnePackage(onePackageId);
              if (balik){
                balik.id = onePackageId;
              }else{
                setTimeout( () => {
                  balik = this.packageService.getOnePackage(onePackageId);
                  if (balik){
                    balik.id = onePackageId;
                  }
                }, 700 );
              }
              packageVPoradiPreAdresu.push(balik);
            });
          }

          detailVPonuke.push(packageVPoradiPreAdresu);
        });
        // tot si priradujem detail a maxVahu ponuky
        const detailArray = [];
        let prepravasDetailom;
        let maxVaha = 0;
        let sumVaha = 0;

        detailVPonuke.forEach((oneDetail, indexTown ) => { // detailom a zistujem max vahu
          oneDetail.forEach((onePackage, indexPackage) => {
            if (onePackage){
                if (adresyVPonuke[indexTown].type === 'nakladka'){
                  sumVaha += onePackage.weight;
                  if (sumVaha > maxVaha){
                    maxVaha = sumVaha;
                  }
                }else{
                  sumVaha -= onePackage.weight;
                }
            }
          });
        });


        // todo tu daco spravit aby to nepocitalo prepravy kde nemam detail, ale aby sa to zopakovalo napr o sekundu...
        detailVPonuke.forEach(oneAdressDetail => {
          if (!oneAdressDetail){
            setTimeout( () => {
              this.offersUpdate(emitFromFilter);
              return;
            }, 1000 );
          }
          oneAdressDetail.forEach(oneDetail => {
            if (!oneDetail){
              setTimeout( () => {
                this.offersUpdate(emitFromFilter);
                return;
              }, 1000 );
            }
          });
        });

        console.log(detailVPonuke[0]);
        console.log(detailVPonuke[0][0]);
        prepravasDetailom = {...oneRouteOffer, adresyVPonuke, maxVaha, detailVPonuke};
        if (prepravasDetailom.detailVPonuke[0]){
          const ponukaPreMesta = this.countFreeSpaceService.vypocitajPocetPalietVPonuke(prepravasDetailom);
          const pocetTonVPonuke = this.countFreeSpaceService.pocetTonVKazdomMeste(ponukaPreMesta);
        }

        // tu konci priradovanie detialov a max vah


        const jednaPonuka = {...prepravasDetailom, minVzdialenost: 10000000000, maxVzdialenost: 0,
          flag: 0, zelenePrepravy: [], zltePrepravy: [], zeleneAuta: [], zlteAuta: []}; // 0 cervena, 1 zlta, 2 greeeen
        if ((oneRouteOffer.takenBy === '' && oneRouteOffer.createdBy !== this.dataService.getMyIdOrMaster()) || (oneRouteOffer.takenBy === this.dataService.getMyIdOrMaster() &&
        oneRouteOffer.offerInRoute === '' && oneRouteOffer.createdBy !== this.dataService.getMyIdOrMaster())){
          let zltePrepravy = [];
          let zelenePrepravy = [];


          this.carsWithItinerar.forEach((car, carIndex) => { // prechadzam autami
            const itinerarAutaPocetPalietVMeste = this.countFreeSpaceService.vypocitajPocetPalietVKazomMeste(car);
            const pocetTonVIti = this.countFreeSpaceService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
            const volnaVahaPreAutovIti = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, 1);
            const volnaVahaPreAutovItiSPrekrocenim = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, maxPrekrocenieVahy);
            const vopchaSa = this.countFreeSpaceService.countFreeSpace(car, jednaPonuka, maxPrekrocenieRozmerov);


            if (this.vectorLayerCoordinates !== undefined) {

              const sediVzdialenost = false;
              }
            let sediVaha = false;
            let sediVahaYellow = false;
          // @ts-ignore
          //  var vopchaSa = this.countFreeSpaceService.countFreeSpace(ca maxPrekrocenieRozmerov, oneRouteOffer);

            const adresaMinVzialenost = 100000000;
            const adresaMaxVzdialenost = 0;

            let maxVzdialenostOdCelehoItinerara;
            car.itiAdresy.forEach((route, indexLon) => { // prechadzam itinerarom auta

               // vaha
              if (volnaVahaPreAutovIti[indexLon] >= jednaPonuka.maxVaha){
              sediVaha = true;
              }else { // @ts-ignore
                if (volnaVahaPreAutovItiSPrekrocenim[indexLon] >= jednaPonuka.maxVaha){
                  sediVahaYellow = true;
                }
              }

              let routeStringBetweenAdresses;

              if (car.itiAdresy.length > indexLon + 1){
                routeStringBetweenAdresses = new LineString([[
                  car.itiAdresy[indexLon].coordinatesOfTownsLon,
                  car.itiAdresy[indexLon].coordinatesOfTownsLat],
                  [car.itiAdresy[indexLon + 1 ].coordinatesOfTownsLon,
                    car.itiAdresy[indexLon + 1 ].coordinatesOfTownsLat]]);

              }else{
                routeStringBetweenAdresses = new LineString([[
                  car.itiAdresy[indexLon].coordinatesOfTownsLon,
                  car.itiAdresy[indexLon].coordinatesOfTownsLat],
                  [car.itiAdresy[indexLon].coordinatesOfTownsLon,
                    car.itiAdresy[indexLon].coordinatesOfTownsLat]]);
              }

              let adr = true;
              let ruka = true;
              let teplotnaSpec = true;
              // tu si zistim maximalne vzdialenosti od itinerara pre vsetky adresy v ponuke...
              if (indexLon === 0){
                maxVzdialenostOdCelehoItinerara = 0;
                if (typeOfDistance === 'maxAll'){ // ked hladam maximalnu vzdialenost vsetkych adriest
                // tu si poskladam vlastnu cestu z itinerara
                const poleKadePojdem = [];
                // tu by som si mal na zaciatok pushnut poziciu auta
                poleKadePojdem.push([car.longtitude, car.lattitude]);
                car.itiAdresy.forEach(jednaAdresa => {
                  poleKadePojdem.push([jednaAdresa.coordinatesOfTownsLon, jednaAdresa.coordinatesOfTownsLat]);
                });
                const myItiString = new LineString(poleKadePojdem);



                prepravasDetailom.adresyVPonuke.forEach((jednaAdPonuka, indexAd) => {
                  const vzdialenostOdTrasy = this.countClosesPoint(myItiString,
                    [jednaAdPonuka.coordinatesOfTownsLon,
                      jednaAdPonuka.coordinatesOfTownsLat] );

                  if (vzdialenostOdTrasy > maxVzdialenostOdCelehoItinerara){
                        maxVzdialenostOdCelehoItinerara = vzdialenostOdTrasy;
                      }
                    });
                }
                else{ // ak hladam len max vzdialenost 1. adresy
                  const from = [car.longtitude , car.lattitude];
                  const to = [prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLon ,
                    prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLat];
                  maxVzdialenostOdCelehoItinerara = this.countDistancePoints(from, to);
                }
              }

              const vyskaHrany = this.countFreeSpaceService.checkMaxMinNaklHrana(prepravasDetailom.detailVPonuke);
              const vyhodujeVyskaHrany = this.checkNaklHrana(car, vyskaHrany);

              let poslednyIndexStihacky = this.dataService.najdiNajskorsiLastTimeArrival(prepravasDetailom.adresyVPonuke, car.itiAdresy, car);

              if (poslednyIndexStihacky === null){
                poslednyIndexStihacky = 1000;
              }
              // tu si ulozim najvacsiu vzdialenost od mesta v itinerari
              const maximalnaVzialenostOdMesta = 0;
              let stihnemPrijst = true;

              prepravasDetailom.adresyVPonuke.forEach((offerLat, offerLatIndex) => { // prechadzam miestami v ponuke
                // tu by som si mal skontrolovat estimatedCasy prijazdov,  a ci stihnem vylozit poslednu vykladku z ponuky
                if (offerLat.datumLastPrijazdy !== '0'){
                  const dateLast = (new Date(offerLat.datumLastPrijazdy));
                  if (offerLat.casLastPrijazdu !== '0'){
                    dateLast.setHours(offerLat.casLastPrijazdu.substring(0, 2), offerLat.casLastPrijazdu.substring(3, 5));
                  }
                  const dateEsti = (new Date(route.estimatedTimeArrival));
                  const from = [car.longtitude , car.lattitude];
                  const to = [offerLat.coordinatesOfTownsLon , offerLat.coordinatesOfTownsLat];
                  // od auta k adrese z ponuky
                  const vzdialenostOdAutaKAdrese = this.countDistancePoints(from, to) / 1000; // chcem to v km, preto / 1000
                  const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
                  const casPrichoduAuta = new Date();
                  casPrichoduAuta.setHours(casPrichoduAuta.getHours() + casOdAutaKAdrese);
                  const rozdielVMili = dateLast.getTime() - casPrichoduAuta.getTime(); // tu mam ulozeny rozdiel v case mezdi last a esti
                  if (rozdielVMili < 0){ // tu kontrolujem ci stihe auto prijst do vsetkych bodov v ponuke
                    stihnemPrijst = false;
                  }

                }

                // tu si kontrolujem abs ruku a teplotu
                if (offerLat.ruka && !car.ruka){
                  ruka = false;
                }
                if (offerLat.adr && !car.adr){
                  adr = false;
                }
                if (offerLat.teplota && (car.minTeplota >= offerLat.teplota ||
                  car.maxTeplota <= offerLat.teplota)){
                  teplotnaSpec = false;
                }
                if (!car.minTeplota && offerLat.teplota){
                  teplotnaSpec = false;
                }


                                // tu davam flagy - ak je vzdialenost mensia vacsia - taku davam flagu
                                // ked som na konci skontrulujem ci sedi vzdialenost
                if (offerLatIndex === oneRouteOffer.addresses.length - 1 && ruka && adr && teplotnaSpec && stihnemPrijst) {
                  const vopchasaCezOtvory = this.countFreeSpaceService.ciSaVopchaTovarCezNakladaciPriestor(car, prepravasDetailom.detailVPonuke);
                  if (vopchasaCezOtvory && vyhodujeVyskaHrany) {

                  let flags = 0;

                  if (car.minTeplota <= teplotnaSpec && car.maxTeplota >= teplotnaSpec) {

                  }

                  const indexVPoli = vopchaSa.poleMiestKdeSaVopcha.indexOf(indexLon); // ci do mesta vopcha
                  const prekrocil = vopchaSa.prekrocenieOPercenta[indexVPoli]; // ak false vopcha, ak true tak sa vopcha
                  // o uzivatelom definove % - yellow

                  if (indexLon <= poslednyIndexStihacky && sediVaha && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                    maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil) {
                    flags = 3;
                    zelenePrepravy.push({...car, vopchaSa});
                  } else if (indexLon <= poslednyIndexStihacky && sediVaha && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                    maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil) {
                    flags = 2;
                    zltePrepravy.push({...car, vopchaSa});
                  } else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha
                      .find(oneId => oneId === indexLon) &&
                    maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil && indexLon <= poslednyIndexStihacky) {
                    flags = 2;
                    zltePrepravy.push({...car, vopchaSa});
                  } else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId === indexLon) &&
                    maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil && indexLon <= poslednyIndexStihacky) {
                    flags = 2;
                    zltePrepravy.push({...car, vopchaSa});
                  }
                  if (flags > jednaPonuka.flag) {
                    jednaPonuka.flag = flags;
                  }
                }
                              }
                            });

            });
            // pre auta ktore maju prazdy itinerar
            if (car.itiAdresy.length === 0){
              let adr = true;
              let ruka = true;
              let teplotnaSpec = true;



              const vyskaHrany = this.countFreeSpaceService.checkMaxMinNaklHrana(prepravasDetailom.detailVPonuke);
              const vyhodujeVyskaHrany = this.checkNaklHrana(car, vyskaHrany);

              let poslednyIndexStihacky = this.dataService.najdiNajskorsiLastTimeArrival(prepravasDetailom.adresyVPonuke, car.itiAdresy, car);
              let stihnemPrijst = true;
              if (poslednyIndexStihacky === null){
                poslednyIndexStihacky = 1000;
              }


              const poleKadePojdem = [];
              // vaha
              if (volnaVahaPreAutovIti[0] >= jednaPonuka.maxVaha){
                sediVaha = true;
              }else { // @ts-ignore
                if (volnaVahaPreAutovItiSPrekrocenim[0] >= jednaPonuka.maxVaha){
                  sediVahaYellow = true;
                }
              }
              if (typeOfDistance === 'maxAll') { // ked hladam maximalnu vzdialenost vsetkych adriest
                // tu by som si mal na zaciatok pushnut poziciu auta
                poleKadePojdem.push([car.longtitude, car.lattitude]);
                poleKadePojdem.push([car.longtitude, car.lattitude]);

                const myItiString = new LineString(poleKadePojdem);

                maxVzdialenostOdCelehoItinerara = 0;
                prepravasDetailom.adresyVPonuke.forEach((jednaAdPonuka, indexAd) => {
                  if (jednaAdPonuka.datumLastPrijazdy !== '0'){
                    const dateLast = (new Date(jednaAdPonuka.datumLastPrijazdy));
                    if (jednaAdPonuka.casLastPrijazdu !== '0'){
                      dateLast.setHours(jednaAdPonuka.casLastPrijazdu.substring(0, 2), jednaAdPonuka.casLastPrijazdu.substring(3, 5));
                    }
                    const dateEsti = (new Date(jednaAdPonuka.estimatedTimeArrival));
                    const from = [car.longtitude , car.lattitude];
                    const to = [jednaAdPonuka.coordinatesOfTownsLon , jednaAdPonuka.coordinatesOfTownsLat];
                    // od auta k adrese z ponuky
                    const vzdialenostOdAutaKAdrese = this.countDistancePoints(from, to) / 1000; // chcem to v km, preto / 1000
                    const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
                    const casPrichoduAuta = new Date();
                    casPrichoduAuta.setHours(casPrichoduAuta.getHours() + casOdAutaKAdrese);
                    const rozdielVMili = dateLast.getTime() - casPrichoduAuta.getTime(); // tu mam ulozeny rozdiel v case mezdi last a esti
                    if (rozdielVMili < 0){ // tu kontrolujem ci stihe auto prijst do vsetkych bodov v ponuke
                      stihnemPrijst = false;
                    }

                  }
                  // tu si kontrolujem abs ruku a teplotu
                  if (jednaAdPonuka.ruka && !car.ruka){
                    ruka = false;
                  }
                  if (jednaAdPonuka.adr && !car.adr){
                    adr = false;
                  }
                  if (jednaAdPonuka.teplota && (car.minTeplota >= jednaAdPonuka.teplota ||
                    car.maxTeplota <= jednaAdPonuka.teplota)){
                    teplotnaSpec = false;
                  }
                  if (!car.minTeplota && jednaAdPonuka.teplota){
                    teplotnaSpec = false;
                  }

                  const vzdialenostOdTrasy = this.countClosesPoint(myItiString,
                    [jednaAdPonuka.coordinatesOfTownsLon,
                      jednaAdPonuka.coordinatesOfTownsLat]);

                  if (vzdialenostOdTrasy > maxVzdialenostOdCelehoItinerara) {
                    maxVzdialenostOdCelehoItinerara = vzdialenostOdTrasy;
                  }
                });
              }else{ // ak hladam len max vzdialenost 1. adresy
                const from = [car.longtitude , car.lattitude];
                const to = [prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLon ,
                  prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLat];
                maxVzdialenostOdCelehoItinerara = this.countDistancePoints(from, to);
              }

              const prekrocil = vopchaSa.prekrocenieOPercenta[0];
              const vopchasaCezOtvory = this.countFreeSpaceService.ciSaVopchaTovarCezNakladaciPriestor(car, prepravasDetailom.detailVPonuke);

              if (ruka && adr && teplotnaSpec && stihnemPrijst && vopchasaCezOtvory && vyhodujeVyskaHrany){


              if (sediVaha && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil){
                zelenePrepravy.push({...car, vopchaSa});
                jednaPonuka.flag = 3;
              }else if (sediVaha && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil){
                zltePrepravy.push({...car, vopchaSa});
                jednaPonuka.flag = 2;
              }
              else if ((sediVahaYellow && !sediVaha) && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil){
                zltePrepravy.push({...car, vopchaSa});
                jednaPonuka.flag = 2;
              }
            }
            }

            zltePrepravy = zltePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            zelenePrepravy = zelenePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

            zelenePrepravy = zelenePrepravy.filter(({ id: id1 }) => !zltePrepravy.some(({ id: id2 }) => id2 === id1));
            jednaPonuka.zelenePrepravy = zelenePrepravy;
            jednaPonuka.zltePrepravy = zltePrepravy;
            if (this.carsWithItinerar.length - 1 === carIndex){
              poleSMinVzdialenostamiOdAdries.push(jednaPonuka);
            }
          });

        }
      });

      setTimeout( () => {
        this.offersFromDatabase = poleSMinVzdialenostamiOdAdries;
        this.drawOffers(poleSMinVzdialenostamiOdAdries);
      }, 500 );
    }, 500 );
    // console.log(routes);
    }

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
    this.fitAllOffers();
  }

    countClosesPoint(routeString, lonLatMy){
      let closesPoint;
      for (let i = 0; i < 21; i++) {
        const coordinateOfNajblizsiBod = routeString.getCoordinateAt(0.05 * i);
        // var lonlat = transform(coordinateOfNajblizsiBod, 'EPSG:3857', 'EPSG:4326');
        const vzdialenost = this.countDistancePoints(coordinateOfNajblizsiBod, lonLatMy);
        if (!closesPoint) {
            closesPoint = vzdialenost;
          } else if (closesPoint > vzdialenost) {
            closesPoint = vzdialenost;
          }
      }
      return closesPoint;
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
          let style = styleCache[size];
          if (!style) {
            if (size === 1){
              console.log(feature.get('features')[0].get('startPoint'));
              if (feature.get('features')[0].get('startPoint') === true){
                console.log('nasel som start');
                console.log(feature.get('features')[0].get('startPoint'));

                style = new Style({
                  image: new Icon({
                    color: '#8959A8',
                    crossOrigin: 'anonymous',
                    src: 'assets/logo/startPoint.png',
                    scale: 0.5
                  }),
                });

              }else{
                style = new Style({
                  image: new Icon({
                    color: '#8959A8',
                    crossOrigin: 'anonymous',
                    src: 'assets/logo/finishFlag.png',
                    scale: 0.5
                  }),
                });
              }
            }else{
              style = new Style({
                image: new CircleStyle({
                  radius: 10,
                  stroke: new Stroke({
                    color: '#fff',
                  }),
                  fill: new Fill({
                    color: '#3399CC',
                  }),
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: '#fff',
                  }),
                }),
              });
            }

            styleCache[size] = style;
          }
          return style;
        },
      });
    }

  drawOffers(offers){
    this.fitAllOffers();
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


      const isThereMyCarGreen = route.zelenePrepravy.find(car => this.carsToDisplay.includes(car.id));
      let isThereMyCarYellow;
      if (!isThereMyCarGreen){
        isThereMyCarYellow = route.zltePrepravy.find(car => this.carsToDisplay.includes(car.id));
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

      // if (route.flag < 2){
      //   routeStyle = new Style({
      //     stroke: new Stroke({
      //       width: 6,
      //       color: [207, 0, 15, 0.45]
      //     })
      //   });
      //
      // }else if (route.flag === 2){
      //   routeStyle = new Style({
      //     stroke: new Stroke({
      //       width: 6,
      //       color: [247, 202, 24, 0.6]
      //     })
      //   });
      //
      // }else{
      //   routeStyle = new Style({
      //     stroke: new Stroke({
      //       width: 6,
      //       color: [10, 255, 10, 0.45]
      //     })
      //   });
      // }

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
      // if (route.flag < 2){
      //   this.offersRouteRed.push(routeFeature);
      // }else if (route.flag === 2){
      //   this.offersRouteYellow.push(routeFeature);
      // }else{
      //   this.offersRouteGreen.push(routeFeature);
      // }

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


        // if (route.flag < 2) { //  cervena
        //   this.offersRed.push(iconFeature);
        //   this.offersRed.push(iconFeatureLast);
        // }
        // else if (route.flag === 2) { // zlta
        //   this.offersYellow.push(iconFeature);
        //   this.offersYellow.push(iconFeatureLast);
        // }
        // else {
        //   this.offersGreen.push(iconFeature);
        //   this.offersGreen.push(iconFeatureLast);
        // }

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

  vypocitajVahuPreMesto(infoMesto){
    let vahaVMeste = 0;
    infoMesto.weight.forEach(vaha => {
      vahaVMeste += vaha;
    });
    return vahaVMeste;
  }

  getVodic(): Vodic{
    return this.vodicService.justGetVodici.find(oneVodic => oneVodic.id === this.carToShow.driverInside);
  }

  // vypocitajVahuPreMesto(infoMesto: DeatilAboutAdresses){
  //   var vahaVMeste = 0;
  //   infoMesto.weight.forEach(vaha => {
  //     vahaVMeste += vaha;
  //   });
  //   return vahaVMeste;
  // }

  // ked kliknem na ponuku a potom na auto, tak odoslem auto s itinerarnom do componentu carIti
  choosenCar(car){
    const carWithIti = this.carsWithItinerar.find(oneCar => oneCar.id == car.id);
    this.carIti.setCar(carWithIti);
  }

  getPredpoklad(predpoklad: Predpoklad){
    const car = this.carsWithItinerar.find(oneCar => oneCar.ecv === predpoklad.ecv);
    this.carIti.spracujPredpoklad(predpoklad, car);
  }

  otvorAuto(car){
    this.offersToShow = undefined;
    this.routesToShow = undefined;
    setTimeout(() => {
      this.carToShow = this.carsWithItinerar.find(oneCar => oneCar.id === car.id);
    }, 300);
  }

}


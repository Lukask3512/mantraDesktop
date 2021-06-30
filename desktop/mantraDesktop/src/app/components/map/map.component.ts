import {AfterViewInit, Component, ViewChild} from '@angular/core';
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
import VectorSource from 'ol/source/Vector';

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

  colors = ['#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#E67E22', '#F1C40F', '#E67E22',
  '#641E16', '#4A235A', '#0B5345', '#7D6608', '#626567', '#424949'];


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

  @ViewChild('dragDrop')
  private dragComponent: DragAndDropListComponent;

  @ViewChild(CarItiDetailComponent)
  private carIti: CarItiDetailComponent;

  @ViewChild(ChoosCarToMoveComponent)
  private chooseCar: ChoosCarToMoveComponent;

  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService, private drawOffer: DrawOfferService) { }

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
    new Promise((resolve, reject) => {
        this.carService.cars$.subscribe(newCars => {
          this.carsFromDatabase = newCars;
          this.addCars(this.carsFromDatabase);
          resolve();
        });
      }).then(() => {
        this.addAddresses();
        // this.addRoute();

      });



    // onlick
    this.map.on('click', evt => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
      });
      if (feature) {
        console.log(feature.get('type'));
        const type = feature.get('type');
        if (type === 'car'){
          this.onClickFindInfo(feature.get('name'));
          this.zoomToAddressOrCar(feature);
        }

        else if (type === 'town'){

          this.zoomToAddressOrCar(feature);
          this.onClickFindInfoAdress(feature.get('name'));
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
          console.log(feature.getGeometry());          // console.log(feature.getGeometry())
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
// ak kliknem na auto
  onClickFindInfo(id){
    this.carToShow = this.carsWithItinerar.find(car => car.id == id);
    this.offersToShow = null;
    this.routesToShow = undefined;
    setTimeout(() => {
      // @ts-ignore
      this.dragComponent.setAddresses(this.carToShow.itiAdresy);
    }, 100);

  }

  // ak kliknem na adresu
  onClickFindInfoAdress(id){
    let adresyVRoute = this.routeService.getRoutesNoSub().find(oneRoute => oneRoute.addresses.includes(id));
    if (!adresyVRoute){
      adresyVRoute = this.offerRouteService.getRoutesNoSub().find(oneRoute => oneRoute.addresses.includes(id));
    }
    const adresy = this.adressesFromDatabase.filter(oneAdresa => adresyVRoute.addresses.includes(oneAdresa.id));
    this.routesToShow = adresyVRoute.addresses.map((i) => adresy.find((j) => j.id === i));
    console.log(adresy);
    console.log(adresyVRoute);
    console.log(this.routesToShow);
    // this.routesToShow = this.carsWithItinerar.filter(route => route.id == id);
    this.carToShow = this.carsFromDatabase.find(car => car.id === this.routesToShow[0].carId);
    // this.carToShow = this.carsFromDatabase.find(car => car.id == this.routesToShow[0].carId);
    this.offersToShow = null;
    console.log(this.carToShow[0]);
    setTimeout(() => {
      this.dragComponent.setAddresses(this.routesToShow);
    }, 100);
  }

  // ak kliknem na ponuku
  async onClickFindInfoOffer(id, feature){
    this.offersToShow = this.offersFromDatabase.find(route => route.id === id);
    // this.countFreeSpaceService.countFreeSpace(this.offersToShow[0].detailArray,this.offersToShow[0].detailArray, )
    this.distanceOfOffer = Math.round(((getLength(feature.getGeometry()) / 100) / 1000) * 100);
    this.carToShow = null;
    this.routesToShow = null;
    console.log(this.offersToShow);
    await this.sleep(200);
    this.chooseCar.setFarby(this.offersToShow);
    this.carIti.setPonuka(this.offersToShow);
    this.carIti.setPrekrocenieVelkosti(this.maxPrekrocenieRozmerov);
    // this.carIti.setPrekrocenieVahy(this.va);

  }
  sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  countFreeIndexis(route, offer){
    // this.indexisOfFreeTowns =  this.countFreeSpaceService
    // .countFreeSpace(route.detailArray, offer.detailArray, route.carId, route, this.maxPrekrocenieRozmerov, offer);
  }

  addRoute(carId, colorIndex) {
    const route = {id: carId};
    this.routes = [];
    let outputData;

    // routes.forEach((route, index) => {



    const ref = this.storage.ref('Routes/' + route.id + '.json');
    const stahnute = ref.getDownloadURL().subscribe(data => {


      this.http.get(data, {responseType: 'text' as 'json'}).subscribe(text => {
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
        this.pridajCestyNaMapu();


      }, (error) => {
        console.log('trasa nenajdena1');
      });
    }, error => {
      console.log('trasa nenajdena2');
    });

  // });
  //   if (routes == 0){
  //     this.map.removeLayer(this.vectorLayerCoordinates)
  //   }
  }

  pridajCestyNaMapu(){
    const vectorSource = new VectorSource({
      features: this.routes
    });
    this.map.removeLayer(this.vectorLayerCoordinates);
    this.vectorLayerCoordinates = new VectorLayer({
      source: vectorSource,
    });
    this.vectorLayerCoordinates.setZIndex(1);
    this.map.addLayer(this.vectorLayerCoordinates);
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

          // update vozidla ak mam nakliknute nejake
          if ( this.carToShow !== undefined && car[i].id === this.carToShow.id){
            this.onClickFindInfo(car[i].id);
            console.log('som nasiel same');
          }

          if (car[i].lattitude !== undefined){

            const carFeature = new Feature({
              geometry: new Point(fromLonLat([car[i].longtitude, car[i].lattitude])),
              name: car[i].id,
              type: 'car'
            });


            const carStyle = new Style({
              image: new Icon({
                color: '#8959A8',
                crossOrigin: 'anonymous',
                src: 'assets/logo/truck.png',
                scale: 0.05
              })
            });
            carFeature.setStyle(carStyle);
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

        }
      }
      this.map.removeLayer(this.vectorLayerCars);

      const vectorSource = new VectorSource({
        features: this.cars
      });

      this.vectorLayerCars = new VectorLayer({
        source: vectorSource,
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

  addAddresses(){
    let mojeAdresy: Address[];

    this.addressService.address$.subscribe(allAddresses => { // tu by som mal natiahnut aj ponuky a dat to dokopy
        this.addressService.offerAddresses$.subscribe(allOffers => {

        this.places = [];
        this.adressesFromDatabase = allAddresses.concat(allOffers);

        // var mamTamAuto = this.carsWithItinerar.findIndex(onecar => onecar.id == car.id); //auto s iti
        const carsWithIti = [];
        this.carsFromDatabase.forEach(oneCar => {
          if (oneCar.itinerar) {
            const itinerarAuta: Address[] = [];
            const detailAuta: any[] = [];
            oneCar.itinerar.forEach(addId => {
              const detailVMeste = [];
              this.addressService.getOneAddresById(addId).subscribe(oneAdd => {
                if (oneAdd) {
                  itinerarAuta.push(oneAdd);
                  oneAdd.packagesId.forEach(onePackId => {
                    detailVMeste.push(this.packageService.getOnePackage(onePackId));
                  });
                } else {
                  this.addressService.getOneAddresFromOfferById(addId).subscribe(offerAdd => {
                    itinerarAuta.push(offerAdd);
                    if (oneAdd){
                      oneAdd.packagesId.forEach(onePackId => {
                      detailVMeste.push(this.packageService.getOnePackage(onePackId));
                      });
                    }
                  });
                }
              });
              detailAuta.push(detailVMeste);
            });
            carsWithIti.push({...oneCar, itiAdresy: itinerarAuta, detailIti: detailAuta});
          }

        });
        this.carsWithItinerar = carsWithIti;
        // mojeAdresy = allAddresses.filter(oneAddress => oneAddress.status != 3);
        mojeAdresy = allAddresses.concat(allOffers);


        mojeAdresy.forEach((oneAddress, index) => {
          // this.carsFromDatabase.forEach(oneCar => {
          //   var car = oneCar.itinerar.find(addId => addId == oneAddress.id);
          // })

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

            this.addRoute(this.carsFromDatabase[cisloAuta].id, cisloAuta);

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



    // if (this.routesToShow != undefined)
    //   console.log(this.routesToShow[0].id);
    //   console.log(route.id)
    // if (this.routesToShow != undefined && route.id == this.routesToShow[0].id){
    //
    //   this.onClickFindInfoAdress(route.id);
    // }

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
    // var vectorSource = new VectorSource({
    //   features: this.places
    // });
    //
    // this.map.removeLayer(this.vectorLayerAdress)
    // this.vectorLayerAdress = new VectorLayer({
    //   source: vectorSource,
    // });
    // this.vectorLayerAdress.setZIndex(2);
    // this.map.addLayer(this.vectorLayerAdress);
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

  estimatedTimeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  openAddDialog(route: Route, newRoute: boolean, routeId: string) {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.data = {
    //   routesTowns: route.nameOfTowns,
    //   routesLat: route.coordinatesOfTownsLat,
    //   routesLon: route.coordinatesOfTownsLon,
    //   routesType: route.type,
    //   routeId: routeId,
    //   routeStatus: route.status,
    //   aboutRoute: route.aboutRoute,
    //   newRoute: newRoute
    // };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value);
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
    const vectorNaZobrazenieAllFeatures = new VectorSource({
      features: this.places.concat(this.cars).concat(this.routes)
    });
    this.view.fit(vectorNaZobrazenieAllFeatures.getExtent(), {padding: [100, 100, 100, 100], minResolution: 50,
      duration: 800} );
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

  // this.countDistance(feature.getGeometry().getCoordinates(), [20.226853, 49.055083])
  offersUpdate(emitFromFilter){
    console.log(this.carsWithItinerar);
    if (emitFromFilter == null && this.map !== undefined){
      this.map.removeLayer(this.vectorLayerOffersRoutesGreen);
      this.map.removeLayer(this.vectorLayerOffersRoutesYellow);
      this.map.removeLayer(this.vectorLayerOffersRoutesRed);
      this.map.removeLayer(this.vectorLayerOffersGreen);
      this.map.removeLayer(this.vectorLayerOffersRed);
      this.map.removeLayer(this.vectorLayerOffersYellow);
    }else if (emitFromFilter != null){
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
          adresa.packagesId.forEach(onePackageId => {
            const balik: DeatilAboutAdresses = this.packageService.getOnePackage(onePackageId);
            if (balik){
              balik.id = onePackageId;
            }
            packageVPoradiPreAdresu.push(balik);
          });
          detailVPonuke.push(packageVPoradiPreAdresu);
        });
        console.log(detailVPonuke);
        // tot si priradujem detail a maxVahu ponuky
        const detailArray = [];
        let prepravasDetailom;
        // oneRouteOffer.detailsAboutAdresses.forEach(detail => { // prechadzam detailami
        //   this.routeDetailService.offerDetails$.subscribe(allDetails => {
        //     detailArray.push(allDetails.find(oneMyDetail => oneMyDetail.id == detail));
        //   });
        // });
        let maxVaha = 0;
        let sumVaha = 0;

       // TODO: zakomentovane len pre zmenu modelu, dokoncit
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


        prepravasDetailom = {...oneRouteOffer, adresyVPonuke, maxVaha, detailVPonuke};
        const ponukaPreMesta = this.countFreeSpaceService.vypocitajPocetPalietVPonuke(prepravasDetailom);
        const pocetTonVPonuke = this.countFreeSpaceService.pocetTonVKazdomMeste(ponukaPreMesta);
        console.log(pocetTonVPonuke);
        // tu konci priradovanie detialov a max vah


        const jednaPonuka = {...prepravasDetailom, minVzdialenost: 10000000000, maxVzdialenost: 0,
          flag: 0, zelenePrepravy: [], zltePrepravy: [], zeleneAuta: [], zlteAuta: []}; // 0 cervena, 1 zlta, 2 greeeen
        if (oneRouteOffer.takenBy === '' || (oneRouteOffer.takenBy === this.dataService.getMyIdOrMaster() &&
        oneRouteOffer.offerInRoute === '')){
        // && this.dataService.getMyIdOrMaster() != oneRouteOffer.createdBy //toto tam pridat potom..
          let zltePrepravy = [];
          let zelenePrepravy = [];
          // this.drawOffer.vypocitajFreeCiSaVopcha(this.carsWithItinerar, jednaPonuka, maxPrekrocenieRozmerov)
        // this.adressesFromDatabase.forEach((route, index) => { //prechazdam vsetkymi mojimi adresami

          this.carsWithItinerar.forEach(car => { // prechadzam autami
            const itinerarAutaPocetPalietVMeste = this.countFreeSpaceService.vypocitajPocetPalietVKazomMeste(car);
            console.log(itinerarAutaPocetPalietVMeste);
            const pocetTonVIti = this.countFreeSpaceService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
            console.log(pocetTonVIti);

            const volnaVahaPreAutovIti = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, 1);
            const volnaVahaPreAutovItiSPrekrocenim = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, maxPrekrocenieVahy);
            console.log(volnaVahaPreAutovIti);
            const vopchaSa = this.countFreeSpaceService.countFreeSpace(car, jednaPonuka, maxPrekrocenieRozmerov);


            if (this.vectorLayerCoordinates !== undefined) {
          // var routeLine = this.vectorLayerCoordinates.getSource().getFeatures().find(oneFeature => oneFeature.get('name') == route.id);

          // console.log(this.vectorLayerCoordinates.getFeatures())

          // console.log(this.vectorLayerOffersRoutes.getDataFeatures())
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
          // route.coordinatesOfTownsLon.forEach((lon, indexLon) => { //prechadzam miestami v preprave
              console.log(route);


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

              // tu si zistim maximalne vzdialenosti od itinerara pre vsetky adresy v ponuke...
              if (indexLon === 0){
                maxVzdialenostOdCelehoItinerara = 0;
                if (typeOfDistance === 'maxAll'){ // ked hladam maximalnu vzdialenost vsetkych adriest
                // tu si poskladam vlastnu cestu z itinerara
                const poleKadePojdem = [];
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

              // tu si ulozim najvacsiu vzdialenost od mesta v itinerari
              const maximalnaVzialenostOdMesta = 0;
              prepravasDetailom.adresyVPonuke.forEach((offerLat, offerLatIndex) => { // prechadzam miestami v ponuke


                                // tu davam flagy - ak je vzdialenost mensia vacsia - taku davam flagu
                                // ked som na konci skontrulujem ci sedi vzdialenost
                if (offerLatIndex === oneRouteOffer.addresses.length - 1) {
                                let flags = 0;

                                const indexVPoli = vopchaSa.poleMiestKdeSaVopcha.indexOf(indexLon); // ci do mesta vopcha
                                const prekrocil = vopchaSa.prekrocenieOPercenta[indexVPoli]; // ak false vopcha, ak true tak sa vopcha
                                                                          // o uzivatelom definove % - yellow




                                if (sediVaha &&  indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil){
                                  flags = 3;
                                  zelenePrepravy.push({...car, vopchaSa});
                                }else if (sediVaha &&  indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                                  maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil){
                                  flags = 2;
                                  zltePrepravy.push({...car, vopchaSa});
                                }
                                else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha
                                  .find(oneId => oneId === indexLon) &&
                                  maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil){
                                   flags = 2;
                                   zltePrepravy.push({...car, vopchaSa});
                                }
                                else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha.
                                  find(oneId => oneId === indexLon) &&
                                  maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil){
                                  flags = 2;
                                  zltePrepravy.push({...car, vopchaSa});
                                }
                                if (flags > jednaPonuka.flag){
                                  jednaPonuka.flag = flags;
                                }
                              }
                            });

            });

            zltePrepravy = zltePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            zelenePrepravy = zelenePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

            zelenePrepravy = zelenePrepravy.filter(({ id: id1 }) => !zltePrepravy.some(({ id: id2 }) => id2 === id1));
            jednaPonuka.zelenePrepravy = zelenePrepravy;
            jednaPonuka.zltePrepravy = zltePrepravy;
            poleSMinVzdialenostamiOdAdries.push(jednaPonuka);
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

  // kontrolaFreeAutOdPonuk(ponuka, maxPrekrocenieVahy, maxPrekrocenieRozmerov, minVzdialenost, maxVzdialenost){
  //   var jednaPonuka = ponuka
  //
  //   this.freeCars.forEach(oneCar => {
  //     var vopchaSa = this.countFreeSpaceService.countFreeSpace(jednaPonuka.detailArray, null,
  //     oneCar.id, jednaPonuka, maxPrekrocenieRozmerov, null);
  //     var adresaMinVzialenost = 100000000;
  //     var adresaMaxVzdialenost = 0;
  //     var sediVaha = false;
  //     var sediVahaYellow = false;
  //
  //       if (oneCar.nosnost >= jednaPonuka.maxVaha){
  //         sediVaha = true;
  //       }else {
  //         if ((oneCar.nosnost * maxPrekrocenieVahy) >= jednaPonuka.maxVaha){
  //           sediVahaYellow = true;
  //         }
  //       }
  //     jednaPonuka.coordinatesOfTownsLat.forEach((oneAdresa, indexTown) => {
  //         var vzdielenost = this.countDistancePoints([oneCar.longtitude, oneCar.lattitude],
  //           [jednaPonuka.coordinatesOfTownsLon[indexTown], jednaPonuka.coordinatesOfTownsLat[indexTown]]);
  //         if (vzdielenost < adresaMinVzialenost) {
  //           adresaMinVzialenost = vzdielenost;
  //         }
  //         if (vzdielenost > adresaMaxVzdialenost) {
  //           adresaMaxVzdialenost = vzdielenost;
  //         }
  //       });
  //       var flags = 0;
  //
  //       var pocetMiestKdeSaVopcha = vopchaSa.poleMiestKdeSaVopcha // ci do mesta vopcha
  //       var prekrocil = false; //ak false vopcha, ak true tak sa vopcha
  //       //o uzivatelom definove % - yellow
  //
  //     vopchaSa.prekrocenieOPercenta.forEach(onePrekrocenie => {
  //       if (onePrekrocenie == true){
  //         prekrocil = true;
  //       }
  //     })
  //
  //
  //
  //       if (sediVaha && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
  //         adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
  //         flags = 3;
  //         jednaPonuka.zeleneAuta.push(oneCar);
  //       }else if (sediVaha &&  pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
  //         adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
  //         flags = 2;
  //         jednaPonuka.zlteAuta.push(oneCar);
  //       }
  //       else if ((sediVahaYellow && !sediVaha) && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
  //         adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && prekrocil){
  //         flags = 2;
  //         jednaPonuka.zlteAuta.push(oneCar);
  //       }
  //       else if ((sediVahaYellow && !sediVaha) && pocetMiestKdeSaVopcha.length == jednaPonuka.coordinatesOfTownsLat.length &&
  //         adresaMinVzialenost < minVzdialenost && adresaMaxVzdialenost < maxVzdialenost && !prekrocil){
  //         flags = 2;
  //         jednaPonuka.zlteAuta.push(oneCar);
  //       }
  //       if (flags > jednaPonuka.flag){
  //         jednaPonuka.flag = flags;
  //       }
  //   })
  //   return jednaPonuka
  // }

  offersShow(which){
    console.log(which);
    if (which.vyhovuje){
      this.red = true;
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

//   countRandomArray(array1, array2){
//
//   }
//
//   skuskaVzdialenostiOdCiary(){
//     const routeString = new LineString([[14, 49], [25, 49], [28, 40]])
//       .transform('EPSG:4326', 'EPSG:3857');
//     const routeFeature = new Feature({
//       type: 'offer',
//       geometry: routeString,
//       name: 'skuskaLiny'
//     });
//
//     let routeStyle;
//     routeStyle = new Style({
//       stroke: new Stroke({
//         width: 6,
//         color: [207, 0, 15, 0.45]
//       })
//     });
//     const styles = [];
//
//     routeFeature.getGeometry().forEachSegment((start, end) => {
//       const dx = end[0] - start[0];
//       const dy = end[1] - start[1];
//       const rotation = Math.atan2(dy, dx);
//       // arrows
//       styles.push(
//         new Style({
//           geometry: new Point(end),
//           image: new Icon({
//             src: 'assets/logo/arrow.png',
//             anchor: [0.75, 0.5],
//             scale: 0.05,
//             rotateWithView: true,
//             rotation: -rotation,
//           }),
//         })
//       );
//     });
//     styles.push(routeStyle);
//     routeFeature.setStyle(styles);
//     this.offersRouteRed.push(routeFeature);
//     const vectorSourceRoutesRed = new VectorSource({
//       features: this.offersRouteRed
//     });
//     this.vectorLayerOffersRoutesRed = new VectorLayer({
//       source: vectorSourceRoutesRed,
//     });
//     this.map.addLayer(this.vectorLayerOffersRoutesRed);
//
//     // bod
//     const iconFeature = new Feature({
//       geometry: new Point(fromLonLat([19, 51])),
//       name: 'adresa.id',
//       type: 'town'
//     });
//
//     const iconStyle = new Style({
//         image: new CircleStyle({
//           radius: 8,
//           stroke: new Stroke({
//             color: '#fff'
//           }),
//           fill: new Fill({
//             color: this.getColorByIndex(6)
//           }),
//         }),
//         text: new Text({
//           text: (1).toString(),
//           fill: new Fill({
//             color: '#fff',
//           }),
//         })
//       });
//
//     iconFeature.setStyle(iconStyle);
//
//     const vectorSource = new VectorSource({
//     features: [iconFeature]
//   });
//
//   // this.map.removeLayer(this.vectorLayerAdress)
//     const skusobny = new VectorLayer({
//     source: vectorSource,
//   });
//   // this.vectorLayerAdress.setZIndex(2);
//     this.map.addLayer(skusobny);
//
//
//
//   // var coordinateOfNajblizsiBod = routeString.getClosestPoint([18.740801,49.219452])
//     // toto je cislo od 0 - zaciatok po 1 koniec liny...s tymto bnudem hladat najkratsiu vzdialenost k mojmo bodu
//     // var coordinateOfNajblizsiBod = routeString.getCoordinateAt(0.5)
//     // console.log(coordinateOfNajblizsiBod)
//     // var lonlat = transform(coordinateOfNajblizsiBod, 'EPSG:3857', 'EPSG:4326');
//     // // var lon = lonlat[0];
//     // // var lat = lonlat[1];
//     // console.log(lonlat)
//     // console.log(this.countDistancePoints(lonlat, [18.740801,49.219452]));
//     const minVzdialenost = this.countClosesPoint(routeString, [19, 51]);
//     console.log(minVzdialenost);
// }

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

  drawOffers(offers){
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
        }
      })
    }

    // this.offersToShow = null;
    offers.forEach((route, index) => {
      const coordinatesToArray = [];
      route.adresyVPonuke.forEach((adresa, index) => {
        coordinatesToArray.push([adresa.coordinatesOfTownsLon, adresa.coordinatesOfTownsLat]);
      });
      // draw lines
      const routeString = new LineString(coordinatesToArray)
        .transform('EPSG:4326', 'EPSG:3857');

      // var indexInArray = this.offersFromDatabase.findIndex(onerRute => onerRute == route)
      // this.offersFromDatabase[indexInArray].
      // console.log(routeString.getLength())

      const routeFeature = new Feature({
        type: 'offer',
        geometry: routeString,
        name: route.id
      });
      let routeStyle;
      if (route.flag < 2){
        routeStyle = new Style({
          stroke: new Stroke({
            width: 6,
            color: [207, 0, 15, 0.45]
          })
        });

      }else if (route.flag === 2){
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

      if (route.flag < 2){
        this.offersRouteRed.push(routeFeature);
      }else if (route.flag === 2){
        this.offersRouteYellow.push(routeFeature);
      }else{
        this.offersRouteGreen.push(routeFeature);
      }


      // if (this.routesToShow !== undefined && route.id === this.routesToShow[0].id){
      //
      //   // this.onClickFindInfoOffer(route.id);
      // }

      if (route.adresyVPonuke.length > 0) {
        for (let i = 0; i < route.adresyVPonuke.length; i++) {
          const iconFeature = new Feature({
            geometry: new Point(fromLonLat([route.adresyVPonuke[i].coordinatesOfTownsLon, route.adresyVPonuke[i].coordinatesOfTownsLat])),
            name: route.id,
            type: 'town'
          });
          let iconStyle;
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
          else if (route.flag === 2) {
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

          // red offers
          if (route.flag < 2){
            this.offersRed.push(iconFeature);
          }else if (route.flag === 2){
            this.offersYellow.push(iconFeature);
          }else{
            this.offersGreen.push(iconFeature);
          }



        }
      }

    });
  // offerroutes
  //   console.log
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

  vypocitajVahuPreMesto(infoMesto){
    let vahaVMeste = 0;
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

  // ked kliknem na ponuku a potom na auto, tak odoslem auto s itinerarnom do componentu carIti
  choosenCar(car){
    let carWithIti = this.carsWithItinerar.find(oneCar => oneCar.id == car.id);
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


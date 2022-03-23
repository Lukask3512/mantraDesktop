import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Cars from '../../../models/Cars';
import Address from '../../../models/Address';
import Route from '../../../models/Route';
import {BehaviorSubject} from 'rxjs';
import {DragAndDropListComponent} from '../../transportation/drag-and-drop-list/drag-and-drop-list.component';
import {CarItiDetailComponent} from '../car-iti-detail/car-iti-detail.component';
import {ChoosCarToMoveComponent} from '../../transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import {CarsPopUpComponent} from '../cars-pop-up/cars-pop-up.component';
import {CarInfoComponent} from '../car-info/car-info.component';
import {OffersPopUpComponent} from '../offers-pop-up/offers-pop-up.component';
import {PosliPonukuComponent} from '../../transportation/offer/detail/posli-ponuku/posli-ponuku.component';
import {HttpClient} from '@angular/common/http';
import {AngularFireStorage} from '@angular/fire/storage';
import {DataService} from '../../../data/data.service';
import {RouteService} from '../../../services/route.service';
import {CarService} from '../../../services/car.service';
import {RouteStatusService} from '../../../data/route-status.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {OfferRouteService} from '../../../services/offer-route.service';
import {DetailAboutRouteService} from '../../../services/detail-about-route.service';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {AddressService} from '../../../services/address.service';
import {PackageService} from '../../../services/package.service';
import {DrawOfferService} from '../draw-offer.service';
import {VodicService} from '../../../services/vodic.service';
import {RouteCoordinatesService} from '../../../services/route/route-coordinates.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {take} from 'rxjs/operators';
import Feature from 'ol/Feature';
import Vodic from '../../../models/Vodic';
import Predpoklad from '../../../models/Predpoklad';
import {LogDialogComponent} from '../../dialogs/log-dialog/log-dialog.component';
import LineString from 'ol/geom/LineString';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import {MapComponent} from '../map.component';
import {CountOffersService} from '../count-offers.service';
import {OfferDetailComponent} from '../offer-detail/offer-detail.component';
import {OfferCreatorDetailComponent} from '../offer-creator-detail/offer-creator-detail.component';
import {NewTransportComponent} from '../../transportation/new-transport/new-transport.component';
import {MyRouteDetailComponent} from '../my-route-detail/my-route-detail.component';
import {MyOfferDetailComponent} from '../my-offer-detail/my-offer-detail.component';

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  styleUrls: ['./map-wrapper.component.scss']
})
export class MapWrapperComponent implements AfterViewInit {


  cars: Cars[];
  carsToMap: Cars[];

  allAddresses: Address[];

  // pomocna premenna na stahovanie trasy
  pocetAut = 0;
  points;
  routes = []; // tu mam features trasy

  colors = ['#C0392B', '#9B59B6', '#2980B9', '#1ABC9C', '#27AE60', '#E67E22', '#F1C40F', '#E67E22',
    '#641E16', '#4A235A', '#0B5345', '#7D6608', '#626567', '#424949'];

  maxPrekrocenieRozmerov = 0;
  maxPrekrocenieVahy = 0;

  myTransportOpen = false;
  myCakarenOpen = false;
  offerDetailOpen = false;

  allCountedOffers;

  @ViewChild('dragDrop')
  private dragComponent: DragAndDropListComponent;

  @ViewChild('infoElement')
  private infoDivElement: ElementRef;

  @ViewChild('transportationElement')
  private transportationElement: ElementRef;

  @ViewChild('offerDetailElement')
  private offerDetailElement: ElementRef;

  @ViewChild('offerCreatorDetailElement')
  private offerCreatorDetailElement: ElementRef;

  @ViewChild('cakarenElement')
  private cakarenElement: ElementRef;

  @ViewChild('filterElement')
  private filterElement: ElementRef;


  @ViewChild('myRouteElement')
  private myRouteElement: ElementRef;


  @ViewChild(CarItiDetailComponent)
  private carIti: CarItiDetailComponent;

  @ViewChild(MyRouteDetailComponent)
  private newTransportComponent: MyRouteDetailComponent;

  @ViewChild(OfferDetailComponent)
  private offerDetailComponent: OfferDetailComponent;

  @ViewChild(MyOfferDetailComponent)
  private offerCreatorDetailComponent: MyOfferDetailComponent;

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

  @ViewChild(MapComponent)
  private mapComponent: MapComponent;


  constructor(private http: HttpClient, private storage: AngularFireStorage, private dataService: DataService,
              private routeService: RouteService, private carService: CarService, public routeStatusService: RouteStatusService,
              private dialog: MatDialog, private offerRouteService: OfferRouteService,
              private routeDetailService: DetailAboutRouteService, private countFreeSpaceService: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService,
              private drawOffer: DrawOfferService, private vodicService: VodicService,
              private routeCoordinates: RouteCoordinatesService, private _snackBar: MatSnackBar,
              private translation: TranslateService, private countOffersService: CountOffersService) {
  }

  routeDetail(route) {
    this.dataService.changeRealRoute(route);
  }

  ngAfterViewInit(): void {
        this.carService.cars$.subscribe(newCars => {
          this.cars = newCars;
          this.carsToMap = JSON.parse(JSON.stringify(newCars));
          this.mapComponent.drawCars(this.carsToMap);
        });
        this.addressService.address$.subscribe(allAddresses => {
          this.addressService.offerAddresses$.subscribe(allOfferAddresses => {
            this.allAddresses = allAddresses.concat(allOfferAddresses);
          });
        });
        this.addRouteNewSystem();
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addRouteNewSystem() {
    this.carService.cars$.subscribe(allCars => {
      if (this.pocetAut !== allCars.length) {
        this.pocetAut = allCars.length;
        allCars.forEach(oneCar => {
          if (oneCar.itinerar && oneCar.itinerar.length > 0) {
            let outputData;
            this.routeCoordinates.getRoute(oneCar.id).subscribe((nasolSom) => {
              if (nasolSom || nasolSom === false) {
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
                        const poziciaAuta = this.carsToMap.findIndex(carFromd => carFromd.id === oneCar.id);
                        const routeStyle = new Style({
                          stroke: new Stroke({
                            width: 6,
                            color: this.getColorByIndex(poziciaAuta)
                          })
                        });
                        routeFeature.setId(oneCar.id);
                        routeFeature.setStyle(routeStyle);

                        this.routes = this.routes.filter(oneFeature => oneFeature.getId() !== oneCar.id);
                        this.routes.push(routeFeature);


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
      }

    });
  }

  sendRoute(carId){
    const car = this.cars.find(allCars => allCars.id === carId);
    const adresy = this.sendAddressesToMapByCar(car);
    const routeToShow = this.routes.find(oneFeature => oneFeature.getId() === carId);
    this.mapComponent.drawRoute(routeToShow);
    this.mapComponent.drawAddresses(adresy);
  }

  sendAddressesToMapByCar(car: Cars): Address[]{
    const addressesToMap = [];
    car.itinerar.forEach(oneAddresId => {
      addressesToMap.push(this.allAddresses.find(oneAddress => oneAddress.id === oneAddresId));
    });
    return addressesToMap;
  }

  showAddressesByRoute(address: Address[]){
    if (address === null){
      this.mapComponent.closePopUp();
    }
    const routeToShow = this.routes.find(oneFeature => oneFeature.getId() === address[0].carId);
    this.mapComponent.drawRoute(routeToShow);
    this.mapComponent.drawAddresses(address);
  }

  getColorByIndex(index) {
    let ktoruFarbu;
    if (index >= this.colors.length) {
      ktoruFarbu = index % this.colors.length;
      return this.colors[ktoruFarbu];
    } else {
      ktoruFarbu = index;
      return this.colors[ktoruFarbu];
    }
  }


  toDateLastUpdateOfCar(datum) {
    const date = new Date(datum);
    return date.toDateString() + ' ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
  }

  closeAll(){
    this.closeInfoDetail();
    this.closeInfoCreatorDetail();
    this.closeInfoCakaren();
    this.closeInfoMoje();
    this.closeInfoRouteDetail();
  }

  vysunBocneInfo() {
    if (this.myCakarenOpen || this.offerDetailOpen){
      this.closeAll();
      this.openInfoMoje();
    }
    else if (document.getElementById('mapWrapper').style.width === '70%') {
      document.getElementById('mapWrapper').style.width = '100%';
      this.closeAll();
    } else {
      this.closeAll();
      this.openInfoMoje();
    }
  }

  vysunCakaren(){
    if (this.myTransportOpen || this.offerDetailOpen){
      this.closeAll();
      this.openInfoCakaren();
    }
    else if (document.getElementById('mapWrapper').style.width === '70%') {
      document.getElementById('mapWrapper').style.width = '100%';
      this.closeAll();

    } else {
      this.closeAll();
      this.openInfoCakaren();

    }
  }

  public reDrawOffers(carsId){
    this.mapComponent.reDrawOffers(carsId, this.getCarsWithEverything());

  }

  offersShow(which){
    this.mapComponent.offersShow(which);
  }

  offersUpdate(emitFromFilter){
    if (emitFromFilter == null){
      this.mapComponent.drawOffers(null, null, emitFromFilter);
    }else if (emitFromFilter != null) {
      console.log(emitFromFilter);
      this.maxPrekrocenieVahy = emitFromFilter.weight;
      this.maxPrekrocenieRozmerov = emitFromFilter.size;
      this.countOffersService.offersUpdate(emitFromFilter, this.getCarsWithEverything()).then(resolve => {
        console.log(resolve);
        this.mapComponent.drawOffers(resolve, this.getCarsWithEverything(), emitFromFilter);
        this.allCountedOffers = JSON.parse(JSON.stringify(resolve));
      });
    }
  }

  getCarsWithEverything(){
    let mamVsetkyBaliky = true;
    const carsWithIti = [];
    this.cars.forEach(oneCar => {
      if (oneCar.itinerar) {
        const itinerarAuta: Address[] = [];
        const detailAuta: any[] = [];
        oneCar.itinerar.forEach(addId => {
          const detailVMeste = [];
          const vsetkyAdresy = this.addressService.getAddresses().concat(this.addressService.getAddressesFromOffer());
          const oneAdd = vsetkyAdresy.find(oneAddress => oneAddress.id === addId);
          if (oneAdd) {
            if (itinerarAuta.find(oneIti => oneIti.id === oneAdd.id)) { // hladam duplikat
              const indexAdresy = itinerarAuta.findIndex(oneIti => oneIti.id === oneAdd.id);
              itinerarAuta[indexAdresy] = oneAdd;
            } else {
              itinerarAuta.push(oneAdd);
            }
            const allPackages = this.packageService.getAllPackages().concat(this.packageService.getAllOfferPackages());
            oneAdd.packagesId.forEach(onePackId => {
              const balik = allPackages.find(onePackage => onePackage.id === onePackId);
              detailVMeste.push(balik);
              if (!balik){
                mamVsetkyBaliky = false;
              }
            });
          }

          detailAuta.push(detailVMeste);
        });
        carsWithIti.push({...oneCar, itiAdresy: itinerarAuta, detailIti: detailAuta});
      }

    });
    return carsWithIti;
    // console.log(carsWithIti)
  }

  displayOffer(offer){
    const countedOffer = this.allCountedOffers.find(oneOffer => oneOffer.id === offer.offerId);
    this.closeAll();
    this.openInfoOfferDetail();
    this.offerDetailComponent.setOffer(countedOffer, offer.feature, this.maxPrekrocenieVahy, this.maxPrekrocenieRozmerov);
    this.mapComponent.onResize();
  }

  openInfoMoje(){
    this.closeAll();
    document.getElementById('mapWrapper').style.width = '70%';
    this.transportationElement.nativeElement.style.display = 'block';
    this.mapComponent.onResize();
    this.myTransportOpen = true;
  }



  closeInfoMoje(){
    this.transportationElement.nativeElement.style.display = 'none';
    this.mapComponent.onResize();
    this.myTransportOpen = false;

  }

  openInfoCakaren(){
    this.closeAll();
    document.getElementById('mapWrapper').style.width = '70%';
    this.cakarenElement.nativeElement.style.display = 'block';
    this.mapComponent.onResize();
    this.myCakarenOpen = true;
  }

  closeInfoCakaren(){
    this.cakarenElement.nativeElement.style.display = 'none';
    this.mapComponent.onResize();
    this.myCakarenOpen = false;
  }

  openInfoOfferDetail(){
    document.getElementById('mapWrapper').style.width = '70%';
    this.offerDetailElement.nativeElement.style.display = 'block';
    this.mapComponent.onResize();
    this.offerDetailOpen = true;
  }

  closeInfoDetail(){
    this.offerDetailElement.nativeElement.style.display = 'none';
    this.mapComponent.onResize();
    this.offerDetailOpen = false;
  }

  openInfoOfferCreatorDetail(){
    document.getElementById('mapWrapper').style.width = '70%';
    this.offerCreatorDetailElement.nativeElement.style.display = 'block';
    this.mapComponent.onResize();
    this.offerDetailOpen = true;
  }

  closeInfoCreatorDetail(){
    this.offerCreatorDetailElement.nativeElement.style.display = 'none';
    this.mapComponent.onResize();
    this.offerDetailOpen = false;
  }

  openInfoRouteDetail(){
    document.getElementById('mapWrapper').style.width = '70%';
    this.offerDetailOpen = true;
    this.myRouteElement.nativeElement.style.display = 'block';
    this.mapComponent.onResize();
  }

  closeInfoRouteDetail(){
    this.myRouteElement.nativeElement.style.display = 'none';
    this.mapComponent.onResize();
    this.offerDetailOpen = false;
  }

  successfullAddedToCar(){
    this.offerDetailElement.nativeElement.style.display = 'none';
    this.openInfoMoje();
  }

  otvorPonukuZCakarne(route: Route){
    if (route.createdBy === this.dataService.getMyIdOrMaster()){
      this.dataService.changeRealRoute(route);
      this.closeAll();
      this.openInfoOfferCreatorDetail();
      return;
    }
    const akoKebyPonuka = {
    offers : [route],
      minDistance: 5000 * 1000, maxDistance: 5000 * 1000,
      weight: 1, size:  1, typeDistance: 'maxAll',
      ukazat: true
    };
    console.log(akoKebyPonuka);

    // this.maxPrekrocenieVahy = emitFromFilter.weight;
    // this.maxPrekrocenieRozmerov = emitFromFilter.size;
    this.countOffersService.offersUpdate(akoKebyPonuka, this.getCarsWithEverything()).then(resolve => {
      console.log(resolve);
      const featureOffer = this.mapComponent.getFeatureFromOffer(resolve);
      console.log(featureOffer);
      this.offerDetailComponent.setOffer(resolve[0], featureOffer, this.maxPrekrocenieVahy, this.maxPrekrocenieRozmerov);
      this.openInfoOfferDetail();
      this.closeInfoCakaren();
    });
  }

  otvorPrepravu(route: Route){
    this.dataService.changeRealRoute(route);
    this.closeAll();
    this.openInfoRouteDetail();
  }

  otvorPonuku(route: Route){
    this.dataService.changeRealRoute(route);
    this.closeAll();
    this.openInfoOfferCreatorDetail();

  }

  whichCarsToShow(cars){
    this.mapComponent.whichCarsToShow(cars);
  }

  otherCarsToShow(cars) {
    this.mapComponent.otherCarsToShow(cars);
  }

    closeInfo(){
    this.closeAll();
    this.showAddressesByRoute(null);
    document.getElementById('mapWrapper').style.width = '100%';
  }

  addNewRoute(){
    this.dataService.changeRealRoute(null);
  }




}

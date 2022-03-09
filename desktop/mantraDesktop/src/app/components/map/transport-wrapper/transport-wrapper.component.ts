import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import Route from '../../../models/Route';
import {RouteStatusService} from '../../../data/route-status.service';
import {RouteService} from '../../../services/route.service';
import {CarService} from '../../../services/car.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DataService} from '../../../data/data.service';
import {Router} from '@angular/router';
import {AddressService} from '../../../services/address.service';
import {OfferRouteService} from '../../../services/offer-route.service';
import {DispecerService} from '../../../services/dispecer.service';
import {CompanyService} from '../../../services/company.service';
import Dispecer from '../../../models/Dispecer';
import {RepeatRouteDialogComponent} from '../../dialogs/repeat-route-dialog/repeat-route-dialog.component';
import {DeleteRouteComponent} from '../../dialogs/delete-route/delete-route.component';
import Address from '../../../models/Address';
import {PackageService} from '../../../services/package.service';
import {MainDetailAboutComponent} from '../../transportation/main-detail-about/main-detail-about.component';
import {LogDialogComponent} from '../../dialogs/log-dialog/log-dialog.component';
import {CancelRouteFromCarDialogComponent} from '../../dialogs/cancel-route-from-car-dialog/cancel-route-from-car-dialog.component';
import {CountOffersService} from '../count-offers.service';
import {OfferToCarDialogComponent} from '../../dialogs/offer-to-car-dialog/offer-to-car-dialog.component';

@Component({
  selector: 'app-transport-wrapper',
  templateUrl: './transport-wrapper.component.html',
  styleUrls: ['./transport-wrapper.component.scss']
})
export class TransportWrapperComponent implements OnInit {
  clickedOnThis: Route;

  allActiveRoutes: Route[];


  allActiveRoutesOffer: Route[];


  routesToShow: Route[];
  routesToShowOffers: Route[];
  active = true;

  displayedColumns: string[] = ['naklady', 'vykladky'];

  spans = [];

  showMineRoutes = true;

  detail = [];

  @ViewChild('inputFilter') inputFilter;

  @ViewChild(MainDetailAboutComponent)
  private mainDetailAboutComponent: MainDetailAboutComponent;

  @Output() addressesEmitter = new EventEmitter<Address[]>();

  @Output() otvorPonukuEmitter = new EventEmitter<Route>();
  @Output() otvorPrepravuEmitter = new EventEmitter<Route>();

  constructor(public routeStatusService: RouteStatusService, private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService, private offerService: OfferRouteService,
              private dispecerService: DispecerService, private companyService: CompanyService,
              private packageService: PackageService, private countOfferService: CountOffersService) {

  }

  getMyCompany(){
    return this.dataService.getLoggedInCompany().name;
  }

  filterTowns(text){
    const zFiltra = text.target.value.replace(/[^a-zA-Z ]/g, '').toLowerCase();
    const routyNaZombrazenie = [];
    let adresy;
    if (this.active){
      if (this.showMineRoutes){
        adresy = this.allActiveRoutes;
      }else{
        adresy = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
      }
    }

    // kontrola nazvu miest
    for (let i = 0; i < adresy.length; i++) {
      for (let j = 0; j < adresy[i].addresses.length; j++) {
        const adresa = this.addressService.getOneAddresByIdGet(adresy[i].addresses[j]);
        if (adresa.nameOfTown.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(zFiltra)){
          routyNaZombrazenie.push(adresy[i]);
          break;
        }
      }
    }

    // kontrola spolocnosti
    for (let i = 0; i < adresy.length; i++) {
      const dispecer: Dispecer = this.dispecerService.getDispecerFromAnotherCompanies(adresy[i].createdBy);
      if (dispecer){
        const company = this.companyService.getAnotherCompanies(dispecer.companyId);
        if (company.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(zFiltra)){
          if (!routyNaZombrazenie.find(oneRoute => oneRoute.id === adresy[i].id)){
            routyNaZombrazenie.push(adresy[i]);
          }
        }
      }
    }

    if (this.showMineRoutes){
      this.routesToShow = adresy.filter(oneRoute => routyNaZombrazenie.find(oneRouteToShow => oneRouteToShow.id === oneRoute.id));
    }else{
      this.routesToShowOffers = adresy.filter(oneRoute => routyNaZombrazenie.find(oneRouteToShow => oneRouteToShow.id === oneRoute.id));
    }
  }

  routeDetail(route: Route){
    if (this.clickedOnThis && this.clickedOnThis.id === route.id){
      this.clickedOnThis = null;
      this.addressesEmitter.emit(null);
      return;
    }
    this.clickedOnThis = route;

    this.sendRouteToMap(route);

  }

  getClass(tab: string){
    if (tab === 'active' && this.active){
      return 'green';
    }else if (tab === 'nonActive' && !this.active){
      return 'orangered';
    }
    if (tab === 'mine' && this.showMineRoutes){
      return 'darkorange';
    }
    if (tab === 'offers' && !this.showMineRoutes){
      return 'darkorange';
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  getDispecerId(){
    return this.dataService.getMyIdOrMaster();
  }

  ngOnInit(): void {
    this.routeService.routes$.subscribe(newRoutes => {
      this.allActiveRoutes = newRoutes.filter(oneRoute => oneRoute.takenBy === '');
      this.mineRoutes();
    });


    this.offerService.routes$.subscribe(routes => {


      var moje = routes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId() && oneRoute.takenBy && oneRoute.takenBy !== '');
      var zobrate =  routes.filter(oneRoute => oneRoute.takenBy === this.getDispecerId());
      this.allActiveRoutesOffer = moje.concat(zobrate);


    });

  }

  openLog(){
    let allAddresses: Address[] = this.addressService.addressesGet.concat(this.addressService.addressesOfferGet);
    allAddresses.filter(allAddressess => this.clickedOnThis.addresses.includes(allAddressess.id));
    allAddresses = this.clickedOnThis.addresses.map((i) => allAddresses.find((j) => j.id === i)); // ukladam ich do poradia
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      addresses: allAddresses,
      route: this.clickedOnThis,
    };
    dialogConfig.width = '70%';


    const dialogRef = this.dialog.open(LogDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }

  activeRoutes(){
    this.active = true;
    if (this.showMineRoutes){
      this.routesToShow = this.allActiveRoutes;
      this.routesToShow = this.sortByFinished(this.routesToShow, false);

    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
      this.routesToShowOffers = this.sortByFinished(this.routesToShowOffers, false);
    }
    this.inputFilter.nativeElement.value = '';
  }

  offersRoutes(){
    this.showMineRoutes = false;
    if (this.active){
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
    }
    this.inputFilter.nativeElement.value = '';
  }
  mineRoutes(){
    this.showMineRoutes = true;
    if (this.active){
      this.routesToShow = this.allActiveRoutes;
      this.routesToShow = this.sortByFinished(this.routesToShow, false);
    }
    if (this.inputFilter){
      this.inputFilter.nativeElement.value = '';
    }
  }

  sortByFinished(arrayOfRoutes: Route[], finished: boolean){
    if (finished === true){
      return arrayOfRoutes.sort((a, b) => (a.finishedAt > b.finishedAt) ? 1 : ((b.finishedAt > a.finishedAt) ? -1 : 0)).reverse();
    }else{
      return arrayOfRoutes.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0)).reverse();
    }
  }

  timestamptToDate(timestamp){
    const date = new Date(timestamp * 1000);
    return date.toDateString();
  }

  carIdToName(carId){
    this.carServise.getCar(carId).subscribe(car => {
    });
  }


  openAddDialog(route: Route) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route
    };
    const dialogRef = this.dialog.open(RepeatRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else{
        this.activeRoutes();
        return;
      }
    });
  }
  deleteRoute(route: Route){
    const dialogRef = this.dialog.open(DeleteRouteComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.routesToShow = this.routesToShow.filter(oneRoute => oneRoute.id !== route.id);
        this.routeService.deleteRoute(route.id);
        route.addresses.forEach(oneAddressId => {
          this.addressService.deleteAddress(oneAddressId);
        });
      }
    });
  }

  deleteFromCar(route: Route){
    console.log(route);
    const routeToDetail = this.countOfferService.getRouteWithEverything(route);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route: routeToDetail.route,
      addresses: routeToDetail.adresyVPonuke,
      detail: routeToDetail.detailVPonuke
    };
    const dialogRef = this.dialog.open(CancelRouteFromCarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (!value){

      }else{
        // const car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
        //
        // this.addresses.forEach(oneAddress => {
        //   if (car.aktualnyNaklad){
        //     car.aktualnyNaklad.filter(onePackageId => !oneAddress.packagesId.includes(onePackageId));
        //   }
        //   oneAddress.carId = null;
        //   this.addressService.updateAddress(oneAddress);
        //   car.itinerar = car.itinerar.filter(oneId => oneId !== oneAddress.id);
        // });
        // this.route.carId = null;
        // this.route.offerInRoute = '';
        // this.routeService.updateRoute(this.route);
        // this.carService.updateCar(car, car.id);
      }

    });
  }

  addToCarOffer(route){
    console.log(route);
    const routeToDetail = this.countOfferService.getRouteWithEverything(route);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route: routeToDetail.route,
      address: routeToDetail.adresyVPonuke,
      detail: routeToDetail.detailVPonuke
    };
    const dialogRef = this.dialog.open(OfferToCarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {

    });
  }

  prejdiDoDetailuPrepravy(route: Route){
    this.otvorPrepravuEmitter.emit(route);
    setTimeout(() =>
      {
        this.sendRouteToMap(route);
      },
      100);
  }

  prejdiDoDetailuPonuky(route: Route){
    this.otvorPonukuEmitter.emit(route);
    setTimeout(() =>
      {
        this.sendRouteToMap(route);
      },
      100);
  }

  sendRouteToMap(route: Route){
    const routeToDetail = this.countOfferService.getRouteWithEverything(route);
    this.addressesEmitter.emit(routeToDetail.adresyVPonuke);
    setTimeout(() =>
      {
        this.mainDetailAboutComponent.setRoute(routeToDetail);
      },
      100);
  }
}

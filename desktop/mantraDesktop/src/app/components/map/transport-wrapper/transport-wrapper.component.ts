import {Component, OnInit, ViewChild} from '@angular/core';
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

  constructor(public routeStatusService: RouteStatusService, private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService, private offerService: OfferRouteService,
              private dispecerService: DispecerService, private companyService: CompanyService,
              private packageService: PackageService,) {

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
      return;
    }
    this.clickedOnThis = route;
    let allAddresses: Address[] = this.addressService.addressesGet.concat(this.addressService.addressesOfferGet);
    allAddresses.filter(allAddressess => route.addresses.includes(allAddressess.id));
    allAddresses = route.addresses.map((i) => allAddresses.find((j) => j.id === i)); // ukladam ich do poradia
    const myPackages = [];
    const detailAr = {detailArray: [], townsArray: [], packageId: []};
    allAddresses.forEach(oneAddress => {
      oneAddress.packagesId.forEach( oneId => {
        if (oneAddress.type === 'nakladka'){
          const balik = this.packageService.getOnePackage(oneId);
          myPackages.push(balik);
        }else{
          // tu by som mal vlozit len indexy do vykladky
          this.detail.forEach((oneDetail, townId) => {
            if (oneDetail.townsArray === undefined){
              oneDetail.forEach((oneDetailId, packageId) => {
                if (oneDetailId && oneDetailId.id === oneId){
                  detailAr.detailArray.push(packageId);
                  detailAr.townsArray.push(townId);
                  detailAr.packageId.push(oneDetailId.id);
                }
              });
            }
          });
        }
      });
      if (myPackages.length !== 0){
        this.detail.push(myPackages);
      }else{
        this.detail.push(detailAr);
      }
    });

    const routeToDetail = {
      adresyVPonuke: allAddresses,
      detailVPonuke: this.detail
    };
    setTimeout(() =>
      {
        this.mainDetailAboutComponent.setRoute(routeToDetail);

      },
      100);

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
}

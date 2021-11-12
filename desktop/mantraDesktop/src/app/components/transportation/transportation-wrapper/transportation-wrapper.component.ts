import {Component, OnInit, ViewChild} from '@angular/core';
import {RouteService} from '../../../services/route.service';
import {CarService} from '../../../services/car.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import Route from '../../../models/Route';
import {RouteStatusService} from '../../../data/route-status.service';
import {DataService} from '../../../data/data.service';
import {Router} from '@angular/router';
import {DeleteRouteComponent} from '../../dialogs/delete-route/delete-route.component';
import {AddressService} from '../../../services/address.service';
import {RepeatRouteDialogComponent} from '../../dialogs/repeat-route-dialog/repeat-route-dialog.component';
import {OfferRouteService} from '../../../services/offer-route.service';
import {DispecerService} from '../../../services/dispecer.service';
import {CompanyService} from '../../../services/company.service';
import Dispecer from '../../../models/Dispecer';

@Component({
  selector: 'app-transportation-wrapper',
  templateUrl: './transportation-wrapper.component.html',
  styleUrls: ['./transportation-wrapper.component.scss']
})
export class TransportationWrapperComponent implements OnInit {
  allActiveRoutes: Route[];
  allFinishedRoutes;

  allActiveRoutesOffer: Route[];
  allFinishedRoutesOffer: Route[];

  routesToShow: Route[];
  routesToShowOffers: Route[];
  active = true;

  displayedColumns: string[] = ['naklady', 'vykladky'];

  spans = [];

  showMineRoutes = true;

  @ViewChild('inputFilter') inputFilter;

  constructor(public routeStatusService: RouteStatusService, private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService, private offerService: OfferRouteService,
              private dispecerService: DispecerService, private companyService: CompanyService) {

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
    }else{
      if (this.showMineRoutes){
        adresy = this.allFinishedRoutes;
      }else{
        adresy = this.allActiveRoutesOffer.filter(oneRoute => oneRoute.finished);
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
      this.allActiveRoutes = newRoutes;
      this.mineRoutes();
    });


    this.routeService.finishedRoutes$.subscribe(routes => {
      this.allFinishedRoutes = routes;
    });

    this.offerService.routes$.subscribe(routes => {


      var moje = routes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId() && oneRoute.takenBy && oneRoute.takenBy !== '');
      var zobrate =  routes.filter(oneRoute => oneRoute.takenBy === this.getDispecerId());
      this.allActiveRoutesOffer = moje.concat(zobrate);


    });

  }

  activeRoutes(){
    this.active = true;
    if (this.showMineRoutes){
      this.routesToShow = this.allActiveRoutes;
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
    }
    this.inputFilter.nativeElement.value = '';
  }

  nonActiveRoutes(){
    this.active = false;
    if (this.showMineRoutes){
      this.routesToShow = this.allFinishedRoutes;
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => oneRoute.finished);
    }
    this.inputFilter.nativeElement.value = '';
  }

  offersRoutes(){
    this.showMineRoutes = false;
    if (this.active){
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => oneRoute.finished);
    }
    this.inputFilter.nativeElement.value = '';
  }
  mineRoutes(){
    this.showMineRoutes = true;
    if (this.active){
      this.routesToShow = this.allActiveRoutes;
    }else{
      this.routesToShow = this.allFinishedRoutes;
    }
    if (this.inputFilter){
      this.inputFilter.nativeElement.value = '';
    }
  }



  timestamptToDate(timestamp){
    let date = new Date(timestamp * 1000);
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
        return;
      }
    });
  }

  routeDetail(route: Route){
    this.dataService.changeRealRoute(route);
  }

  deleteRoute(route: Route){
    const dialogRef = this.dialog.open(DeleteRouteComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        route.addresses.forEach(oneAddressId => {
          this.addressService.deleteAddress(oneAddressId);
        });
        this.routeService.deleteRoute(route.id);
      }
    });
  }


}

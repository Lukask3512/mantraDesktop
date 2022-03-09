import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {OfferRouteService} from '../../../services/offer-route.service';
import {RouteStatusService} from '../../../data/route-status.service';
import {DataService} from '../../../data/data.service';
import {MatDialog} from '@angular/material/dialog';
import {AddressService} from '../../../services/address.service';
import {DispecerService} from '../../../services/dispecer.service';
import {CompanyService} from '../../../services/company.service';
import Route from '../../../models/Route';
import Dispecer from '../../../models/Dispecer';
import {DeleteRouteComponent} from '../../dialogs/delete-route/delete-route.component';
import Address from '../../../models/Address';
import {CountOffersService} from '../count-offers.service';
import {MainDetailAboutComponent} from '../../transportation/main-detail-about/main-detail-about.component';

@Component({
  selector: 'app-cakaren-wrapper',
  templateUrl: './cakaren-wrapper.component.html',
  styleUrls: ['./cakaren-wrapper.component.scss']
})
export class CakarenWrapperComponent implements OnInit {

  clickedOnThis: Route;

  @ViewChild(MainDetailAboutComponent)
  private mainDetailAboutComponent: MainDetailAboutComponent;

  @Output() addressesEmitter = new EventEmitter<Address[]>();

  @Output() otvorPonukuEmitter = new EventEmitter<Route>();


  constructor(private offerService: OfferRouteService, public routeStatusService: RouteStatusService,
              private dataService: DataService,  private dialog: MatDialog, private addressService: AddressService,
              private dispecerService: DispecerService, private companyService: CompanyService,
              private countOfferService: CountOffersService) { }

  @ViewChild('inputFilter') inputFilter;

  routes: Route[];
  finishedRoutes: Route[];

  routesToShow: Route[];
  finishedRoutesToShow: Route[];
  whatIsActive = 1;
  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.routes = routes.filter(oneRoute => oneRoute.finished === false);

      this.finishedRoutes = routes.filter(oneRoute => oneRoute.finished === true);
      this.reClickOnTab();
    });
  }

  filterTowns(text){
    const zFiltra = text.target.value.replace(/[^a-zA-Z ]/g, '').toLowerCase();
    const routyNaZombrazenie = [];
    let adresy;


    // kontrola nazvu miest
    for (let i = 0; i < this.routes.length; i++) {
      for (let j = 0; j < this.routes[i].addresses.length; j++) {
        const adresa = this.addressService.getOneAddresByIdGet(this.routes[i].addresses[j]);
        if (adresa.nameOfTown.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(zFiltra)){
          routyNaZombrazenie.push(this.routes[i]);
          break;
        }
      }
    }

    // kontrola spolocnosti
    for (let i = 0; i < this.routes.length; i++) {
      const dispecer: Dispecer = this.dispecerService.getDispecerFromAnotherCompanies(this.routes[i].createdBy);
      if (dispecer){
        const company = this.companyService.getAnotherCompanies(dispecer.companyId);
        if (company.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(zFiltra)){
          if (!routyNaZombrazenie.find(oneRoute => oneRoute.id === this.routes[i].id)){
            routyNaZombrazenie.push(this.routes[i]);
          }
        }
      }
    }

    if (this.whatIsActive === 1){
      this.routesToShow = this.routes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId() && !oneRoute.finished);
      this.routesToShow = this.routesToShow.filter(oneRoute => routyNaZombrazenie.find(oneRouteToShow => oneRouteToShow.id === oneRoute.id));
    }else{
      this.routesToShow = this.routes.filter(oneRoute => (oneRoute.takenBy === '' && oneRoute.offerFrom.includes(this.getDispecerId()) && !oneRoute.finished));
      this.routesToShow = this.routesToShow.filter(oneRoute => routyNaZombrazenie.find(oneRouteToShow => oneRouteToShow.id === oneRoute.id));
    }
  }

  routeDetail(route){
    if (this.clickedOnThis && this.clickedOnThis.id === route.id){
      this.clickedOnThis = null;
      this.addressesEmitter.emit(null);
      return;
    }
    this.clickedOnThis = route;

    this.sendRouteToMap(route);
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

  getClass(tab: string){
    if (tab === 'all' && this.whatIsActive === 0){
      return 'green';
    }else if (tab === 'mine' && this.whatIsActive === 1){
      return 'green';
    }else if (tab === 'assigned' && this.whatIsActive === 2){
      return 'green';
    }
  }



  vymazatPonuku(route){
    this.offerService.deleteRoute(route.id);
  }


  deleteRoute(route: Route){
    const dialogRef = this.dialog.open(DeleteRouteComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.offerService.deleteRoute(route.id);
      }
    });
  }

  getDispecerId(){
    return this.dataService.getMyIdOrMaster();
  }

  // ked sa mi updatnu routy aby ma neprekliklo na iny tab
  reClickOnTab(){
    if (this.whatIsActive === 0){
      this.allActive();
    }else if (this.whatIsActive === 1){
      this.mine();
    }else if (this.whatIsActive === 2){
      this.assigned();
    }
  }

  allActive(){
    this.finishedRoutesToShow = null;
    this.routesToShow = this.routes.filter(oneRoute => oneRoute.takenBy === '' && !oneRoute.offerFrom.includes(this.getDispecerId())
      && oneRoute.createdBy !== this.getDispecerId());
    this.whatIsActive = 0;
  }
  mine(){
    this.routesToShow = this.routes.filter(oneRoute => (oneRoute.takenBy === '' && oneRoute.createdBy === this.getDispecerId() && !oneRoute.finished));
    this.whatIsActive = 1;
    if (this.inputFilter){
      this.inputFilter.nativeElement.value = '';
    }
  }

  assigned(){
    this.routesToShow = this.routes.filter(oneRoute => (oneRoute.takenBy === '' && oneRoute.offerFrom.includes(this.getDispecerId()) && !oneRoute.finished));
    this.whatIsActive = 2;
    if (this.inputFilter){
      this.inputFilter.nativeElement.value = '';
    }
  }

  getAnimation(route: Route){
    if (route.ponuknuteTo === this.getDispecerId()){ // ked mam ponuku na finalne prijatie
      return 'blickAnimation';
    }
    const ponukySkontrolovane = this.offerService.getSkontrolovanePonuky().find(oneRoute => oneRoute === route.id);
    if (ponukySkontrolovane){
      return; // ked som to uz pozrel
    }else{
      // moje
      if (this.whatIsActive === 1){
        if (route.offerFrom.length === 0 || route.ponuknuteTo !== ''){
          return;
        }else{
          return 'blickAnimation';
        }
      }
      if (this.whatIsActive === 2){
        if (route.ponuknuteTo === this.getDispecerId()){
          return 'blickAnimation';
        }
      }
    }
  }

  prejdiDoDetailuPonuky(route: Route){
    this.otvorPonukuEmitter.emit(route);
    setTimeout(() =>
      {
        this.sendRouteToMap(route);
      },
      100);
  }



}

import {Component, OnInit, ViewChild} from '@angular/core';
import {OfferRouteService} from '../../../../services/offer-route.service';
import Route from '../../../../models/Route';
import {RouteStatusService} from '../../../../data/route-status.service';
import {DataService} from '../../../../data/data.service';
import {DeleteRouteComponent} from '../../../dialogs/delete-route/delete-route.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import Dispecer from '../../../../models/Dispecer';
import {AddressService} from '../../../../services/address.service';
import {DispecerService} from '../../../../services/dispecer.service';
import {CompanyService} from '../../../../services/company.service';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {

  constructor(private offerService: OfferRouteService, public routeStatusService: RouteStatusService,
              private dataService: DataService,  private dialog: MatDialog, private addressService: AddressService,
              private dispecerService: DispecerService, private companyService: CompanyService) { }

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
    this.dataService.changeRealRoute(route);
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



  deleteRoute(route: Route){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      deleteOffer: true
    };
    const dialogRef = this.dialog.open(DeleteRouteComponent, dialogConfig);
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

}

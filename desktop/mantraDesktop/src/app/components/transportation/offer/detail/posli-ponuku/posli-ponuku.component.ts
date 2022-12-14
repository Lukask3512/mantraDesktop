import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataService} from '../../../../../data/data.service';
import {OfferRouteService} from '../../../../../services/offer-route.service';
import Dispecer from '../../../../../models/Dispecer';
import {DispecerService} from '../../../../../services/dispecer.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../../../dialogs/add-car-dialog/add-car-dialog.component';
import {ComapnyContantsDialogComponent} from '../../../../dialogs/comapny-contants-dialog/comapny-contants-dialog.component';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-posli-ponuku',
  templateUrl: './posli-ponuku.component.html',
  styleUrls: ['./posli-ponuku.component.scss']
})
export class PosliPonukuComponent implements OnInit {

  runningInterval = false;
  stopInterval = false;

  offer; // ponuku ktoru som dal
  @Input() route; // ponuka
  @Input() price: number;
  @Input() offerId;

  disableButtonAfterAdd = false;

  dispecer: Dispecer;
  @Output() whichOffersToShow = new EventEmitter<any>();
  @Output() offerConfirm = new EventEmitter<string>();

  constructor(private dataService: DataService, private offerService: OfferRouteService,
              private dispecerService: DispecerService, private dialog: MatDialog, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    // natiahnem si original offere lebo z mapy mam upravenu
    this.listenToROute();
    this.dispecer = this.dataService.getDispecer();

  }

  listenToROute(){
    this.offerService.routes$.subscribe(allRoutes => {
      this.route = allRoutes.find(oneOffer => oneOffer.id === this.offerId);

      if (this.route && this.route.offerFrom !== undefined){
        if (this.route.offerFrom.length === 0){
          this.offer = undefined;
        }
        let nasielSom = false;
        this.route.offerFrom.forEach((offer, index) => {
          if (offer === this.getDispecerId()){
            this.offer = this.route.priceFrom[index];
            nasielSom = true;
          }
        });
        if (nasielSom === false){
          this.offer = undefined;
        }
      }
    });
  }

  setOfferId(offerID){
    this.offerId = offerID;
    this.offer = undefined;
    this.listenToROute();
  }

  openContats(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.route;
    const dialogRef = this.dialog.open(ComapnyContantsDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

  setRoute(route){
    this.route = route;
  }

  getDispecerId(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy === 'master'){
      return this.dataService.getDispecer().id;
    }else{
      return this.dataService.getDispecer().createdBy;
    }
  }

  deleteMyPriceOffer(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy === 'master'){
      idCreated = this.dataService.getDispecer().id;
    }else{
      idCreated = this.dataService.getDispecer().createdBy;
    }

    this.route.offerFrom.forEach((offer, index) => {
      if (offer === this.getDispecerId()){
        this.route.offerFrom.splice(index, 1);
        this.route.priceFrom.splice(index, 1);
      }
    });
    this.price = undefined;
    this.offer = undefined;
    this.offerService.updateRoute(this.route);
    this.disableButtonAfterAdd = true;
    setTimeout(() => {
      this.disableButtonAfterAdd = false;
    }, 3000);
  }

  addPrice(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      idCreated = this.dataService.getDispecer().id;
    }else{
      idCreated = this.dataService.getDispecer().createdBy;
    }

    if (this.route.price > 0){
      if (this.price === undefined){
        this.price = 0;
      }
    }else{
      if (this.price === undefined){
        return;
      }
    }

    this.route.offerFrom.forEach((offer, index) => {
      if (offer === this.getDispecerId()){
        this.route.offerFrom.splice(index, 1);
        this.route.priceFrom.splice(index, 1);
      }
    });


    this.route.offerFrom.push(idCreated);
    this.route.priceFrom.push(this.price);
    this.offer = JSON.parse(JSON.stringify(this.price));
    this.price = undefined;
    this.offerService.updateRoute(this.route);
    this.disableButtonAfterAdd = true;
    setTimeout(() => {
      this.disableButtonAfterAdd = false;
    }, 3000);
  }

  addPriceWithDelay(){
    this.runningInterval = true;
      setTimeout(() => {
        this.runningInterval = false;
        if (this.stopInterval === false){
          this.addPrice();
        }
        this.stopInterval = false;
      }, 3000);


  }

  deleteMyPriceIfRunning(){
    if (this.runningInterval){
      this.stopInterval = true;
    }else{
      this.deleteMyPriceOffer();
    }
  }

  confirm(){
    this.route.takenBy = this.getDispecerId();
    if (this.route.price === 0){  // ak cenu nenahodila spolocnost, cena sa nastavi podla prijatej ponuky
      this.route.price = this.offer;
    }
    this.route.forEveryone = false;

    this.route.finalAcceptDate = new Date().toString();

    this.offerService.updateRoute(this.route);
    this.offerConfirm.emit(this.route.takenBy);

  }

  cancelOffer(){
    this.route.forEveryone = true;
    // tu skontrolujem komu to bolo zadane , a ak sa cena zhoduje s jeho znamena to ze cenu zmenim na 0;
    var indexVOffer = this.route.offerFrom.findIndex(element => element === this.route.ponuknuteTo);
    var ponukaZa = this.route.priceFrom[indexVOffer];
    if (ponukaZa === this.route.price){
      this.route.price = 0;
    }
    this.route.ponuknuteTo = '';
    this.route.takenBy = '';
    this.route.offerInRoute = '';
    this.offerService.updateRoute(this.route);
  }

  doNotShow(){
    if (!this.dispecer.nezobrazovatPonuky){
      this.dispecer.nezobrazovatPonuky = [this.route.id];
    }else{
      this.dispecer.nezobrazovatPonuky.push(this.route.id);
    }
    this.dispecerService.updateDispecer(this.dispecer);
    this.dataService.setDispecer(this.dispecer);
    this.whichOffersToShow.emit();
  }

  showOnMap(){
    this.dispecer.nezobrazovatPonuky = this.dispecer.nezobrazovatPonuky.filter(oneId => oneId !== this.route.id);
    this.dispecerService.updateDispecer(this.dispecer);
    this.dataService.setDispecer(this.dispecer);
    this.whichOffersToShow.emit();
  }

  ifNezobrazuje(){
    if (!this.dispecer.nezobrazovatPonuky){
      return true;
    }
    if (this.dispecer.nezobrazovatPonuky.find(oneId => oneId === this.route.id)){
      return false;
    }else{
      return true;
    }
  }

}

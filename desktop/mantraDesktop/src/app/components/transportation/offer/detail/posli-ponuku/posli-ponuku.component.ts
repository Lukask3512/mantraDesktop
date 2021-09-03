import {Component, Input, OnInit} from '@angular/core';
import {DataService} from '../../../../../data/data.service';
import {OfferRouteService} from '../../../../../services/offer-route.service';

@Component({
  selector: 'app-posli-ponuku',
  templateUrl: './posli-ponuku.component.html',
  styleUrls: ['./posli-ponuku.component.scss']
})
export class PosliPonukuComponent implements OnInit {

  offer; // ponuku ktoru som dal
  @Input() route; // ponuka
  @Input() price: number;
  @Input() offerId;
  constructor(private dataService: DataService, private offerService: OfferRouteService) { }

  ngOnInit(): void {
    // natiahnem si original offere lebo z mapy mam upravenu
    this.offerService.routes$.subscribe(allRoutes => {
      this.route = allRoutes.find(oneOffer => oneOffer.id === this.offerId);

      if (this.route && this.route.offerFrom !== undefined){
        this.route.offerFrom.forEach((offer, index) => {
          if (offer === this.getDispecerId()){
            this.offer = this.route.priceFrom[index];
          }
        });
      }
    });
  }

  setOfferId(offerID){
    this.offerId = offerID;
    this.offer = undefined;
    this.ngOnInit();
  }

  // setOffer(offer){
  //   this.offer = offer;
  // }

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
  }

  addPrice(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
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
    if (this.price === undefined){
      this.price = 0;
    }
    this.route.offerFrom.push(idCreated);
    this.route.priceFrom.push(this.price);
    this.price = undefined;
    this.offerService.updateRoute(this.route);
  }

  confirm(){
    this.route.takenBy = this.getDispecerId();
    if (this.route.price === 0){  // ak cenu nenahodila spolocnost, cena sa nastavi podla prijatej ponuky
      this.route.price = this.offer;
    }
    this.route.forEveryone = false;
    this.offerService.updateRoute(this.route);
    // this.fakeRoute = JSON.parse(JSON.stringify(this.route));
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

}
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import Cars from '../../../models/Cars';
import Route from '../../../models/Route';
import {OfferRouteService} from '../../../services/offer-route.service';

@Component({
  selector: 'app-offers-pop-up',
  templateUrl: './offers-pop-up.component.html',
  styleUrls: ['./offers-pop-up.component.scss']
})
export class OffersPopUpComponent implements OnInit {

  constructor(private offerService: OfferRouteService) { }
  container;
  content;
  closer;

  offers: Route[];
  @Output() offerEmitter = new EventEmitter<Route>();
  ngOnInit(): void {
    this.container = document.getElementById('popup');
    this.content = document.getElementById('popup-content');
    this.closer = document.getElementById('popup-closer');
  }

  closePopUp(){
    this.offerEmitter.emit(null);
    this.closer.blur();
  }

  chooseOffer(carid){
    this.offerEmitter.emit(carid);
    this.closer.blur();
  }

  setOffers(features: any[]){
    const idPonuk = [];
    for (let i = 0; i < features.length; i++) {
      idPonuk.push(features[i].values_.name);
    }
    this.offers = this.offerService.getRoutesNoSub().filter(car => idPonuk.includes(car.id));
  }
}

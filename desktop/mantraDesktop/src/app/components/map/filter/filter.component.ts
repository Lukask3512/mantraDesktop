import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {OfferRouteService} from "../../../services/offer-route.service";
import Route from "../../../models/Route";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
//prijima offer, filtruje a preposiela mape
export class FilterComponent implements OnInit {

  checked:boolean = false;

  constructor(private offerService: OfferRouteService) { }
  offers: Route[];
  @Output() offersToMap = new EventEmitter<Route[]>();

  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.offers = routes;
      this.filterOffers();
    });
  }

  filterOffers(){
    if (!this.checked){
      this.offersToMap.emit(null);
    }else{
      this.offersToMap.emit(this.offers);
    }
  }

}

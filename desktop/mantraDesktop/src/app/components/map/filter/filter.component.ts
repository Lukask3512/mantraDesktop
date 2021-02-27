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

  maxDistance
  minDistance;

  constructor(private offerService: OfferRouteService) { }
  offers: Route[];
  @Output() offersToMap = new EventEmitter<any>();

  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.offers = routes;
      this.filterOffers();
    });
  }

  filterOffers(){
    console.log(this.offers)
    if (!this.checked){
      this.offersToMap.emit(null);
    }else{
      this.offersToMap.emit({offers :this.offers, minDistance: this.minDistance * 1000, maxDistance: this.maxDistance * 1000} );
    }
  }

}

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {OfferRouteService} from "../../../services/offer-route.service";
import Route from "../../../models/Route";


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
// prijima offer, filtruje a preposiela mape
export class FilterComponent implements OnInit {

  checked: boolean = false;

  typeDistance = 'maxAll';
  maxDistance = 500;
  minDistance = 50;
  weight = 0;
  size = 0;

  vyhovuje = true;
  povPre = true;
  prekrocenie = false;

  constructor(private offerService: OfferRouteService) { }
  offers: Route[];
  @Output() offersToMap = new EventEmitter<any>();
  @Output() owhichToShow = new EventEmitter<any>();


  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      if (!this.offers){
        setTimeout(() => {
          this.offers = routes;
          this.filterOffers();
        }, 1000);
      }else{
        setTimeout(() => {
          this.offers = routes;
          this.filterOffers();
        }, 4000);
      }
    });
  }

  filterOffers(){
    if (!this.checked){
      this.offersToMap.emit(null);
    }else{
      this.offersToMap.emit({offers : this.offers, minDistance: this.minDistance * 1000, maxDistance: this.maxDistance * 1000,
      weight: this.vypocitajPrekrocenie(this.weight), size:  this.vypocitajPrekrocenie(this.size), typeDistance: this.typeDistance} );
    }
  }

  vypocitajPrekrocenie(prekrocenie){
    var percentaNaCislo = (100 + prekrocenie) / 100;
    return percentaNaCislo;
  }

  updateMatLabelForm(){
    this.owhichToShow.emit({vyhovuje: this.vyhovuje, trocha: this.povPre, nie: this.prekrocenie})
  }

}

import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {OfferRouteService} from '../../../services/offer-route.service';
import Route from '../../../models/Route';
import {PackageService} from '../../../services/package.service';
import {ChoosCarToMoveComponent} from '../../transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import {MatAccordion, MatExpansionPanel} from '@angular/material/expansion';


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

  fewSecDisable = true;

  constructor(private offerService: OfferRouteService, private packageService: PackageService) { }
  offers: Route[];
  @Output() offersToMap = new EventEmitter<any>();
  @Output() owhichToShow = new EventEmitter<any>();
  @Output() carsToShow = new EventEmitter<any[]>();
  @Output() changeSize = new EventEmitter<boolean>();

  @ViewChild(MatExpansionPanel) mat: MatExpansionPanel;

  ngOnInit(): void {
    setTimeout(() => {
      this.fewSecDisable = false;
    }, 5000);

    this.offerService.routes$.subscribe(routes => {
      if (!this.offers){
        setTimeout(() => {
          this.offers = routes.filter(oneRoute => oneRoute.finished === false);
          this.filterOffers(false);
        }, 3000);
      }else{
        setTimeout(() => {
          this.offers = routes.filter(oneRoute => oneRoute.finished === false);
          this.filterOffers(false);
        }, 1000);
      }
    });
  }

  zmensiHeightCelkovejVysky(){

  }

  filterOffers(ukazatPonuky: boolean){

    if (this.offers.length > 0){
      if (!this.checked){
        this.mat.close();
        this.offersToMap.emit(null);

      }else{
        this.offersToMap.emit({offers : this.offers, minDistance: this.minDistance * 1000, maxDistance: this.maxDistance * 1000,
          weight: this.vypocitajPrekrocenie(this.weight), size:  this.vypocitajPrekrocenie(this.size), typeDistance: this.typeDistance,
          ukazat: ukazatPonuky} );

        this.fewSecDisable = true;
        setTimeout(() => {
          this.fewSecDisable = false;
        }, 100);
      }
    }
  }

  vypocitajPrekrocenie(prekrocenie){
    const percentaNaCislo = (100 + prekrocenie) / 100;
    return percentaNaCislo;
  }

  updateMatLabelForm(){
    this.owhichToShow.emit({vyhovuje: this.vyhovuje, trocha: this.povPre, nie: this.prekrocenie});
  }

  whichCars(carsId: string[]){
    this.carsToShow.emit(carsId);
  }

  catchOpen(){
    console.log('som otvoril');
    if (!this.checked){
      this.checked = true;
      this.filterOffers(true);
      this.mat.open();
    }
  }

  catchClose(){
    this.changeSize.emit(true);
  }

}

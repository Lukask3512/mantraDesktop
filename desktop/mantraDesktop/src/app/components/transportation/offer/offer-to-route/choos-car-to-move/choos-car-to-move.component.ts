import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {CarService} from '../../../../../services/car.service';
import Cars from '../../../../../models/Cars';
import {ShowItinerarComponent} from '../show-itinerar/show-itinerar.component';

@Component({
  selector: 'app-choos-car-to-move',
  templateUrl: './choos-car-to-move.component.html',
  styleUrls: ['./choos-car-to-move.component.scss']
})
export class ChoosCarToMoveComponent implements OnInit {

  @ViewChild(ShowItinerarComponent)
  private itinerarComponent: ShowItinerarComponent;

  @Output() carOutput = new EventEmitter<Cars>();
  ponukaSFarbamiAut;

  constructor(private carService: CarService) { }
  cars: Cars[];
  car: Cars;
  ngOnInit(): void {
    this.carService.cars$.subscribe(allCars => {
      this.cars = allCars;
    });
  }

  setCar(car: Cars){
    this.carOutput.emit(car);
  }

  chooseClass(car){
    if (this.ponukaSFarbamiAut){
      const green = this.ponukaSFarbamiAut.zelenePrepravy.find(myCar => myCar.id === car.id);
      const yellow = this.ponukaSFarbamiAut.zltePrepravy.find(myCar => myCar.id === car.id);
      if (green){
        return 'greenCol';
      }else if (yellow){
        return 'yellowCol';
      }
    }
  }

  setFarby(offer){
    this.ponukaSFarbamiAut = offer;
  }

}

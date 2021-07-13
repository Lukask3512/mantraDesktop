import {Component, Input, OnInit} from '@angular/core';
import Cars from '../../../../models/Cars';
import {CarService} from '../../../../services/car.service';

@Component({
  selector: 'app-car-naklad',
  templateUrl: './car-naklad.component.html',
  styleUrls: ['./car-naklad.component.scss']
})
export class CarNakladComponent implements OnInit {

 @Input() car: Cars;
  detail;
  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.cars$.subscribe(allCars => {
      this.car = allCars.find(oneCar => oneCar.id === this.car.id);
    });
  }
}

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import Cars from "../../../models/Cars";
import {CarService} from "../../../services/car.service";
import {RouteStatusService} from "../../../data/route-status.service";

@Component({
  selector: 'app-car-pop-up',
  templateUrl: './car-pop-up.component.html',
  styleUrls: ['./car-pop-up.component.scss']
})
export class CarPopUpComponent implements OnInit {

  constructor(private carService: CarService, public routeStatus: RouteStatusService) { }
  container;
  content;
  closer;

  cars: Cars[];
  oldCarIds: string[]
  @Output() carEmitter = new EventEmitter<Cars>();
  ngOnInit(): void {
    this.container = document.getElementById('popup');
    this.content = document.getElementById('popup-content');
    this.closer = document.getElementById('popup-closer');
  }

  closePopUp(){
    this.carEmitter.emit(null);
    this.closer.blur();
  }
  setCars(carIds: string[]){
    if (JSON.stringify(this.oldCarIds) !== JSON.stringify(carIds)){
      this.oldCarIds = carIds;
      this.cars = this.carService.getAllCars().filter(oneCar => carIds.includes(oneCar.id));
    }

  }

}

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CarService} from '../../../../services/car.service';
import Cars from '../../../../models/Cars';
import Route from '../../../../models/Route';

@Component({
  selector: 'app-choose-car-to-map',
  templateUrl: './choose-car-to-map.component.html',
  styleUrls: ['./choose-car-to-map.component.scss']
})
export class ChooseCarToMapComponent implements OnInit {

  constructor(private carService: CarService) { }

  cars: Cars[];
  checkedCars = [];
  allCarsChecked = true;
  @Output() carEmitter = new EventEmitter<string[]>();
  ngOnInit(): void {
    this.getCars();
  }

  getCars(){
    this.cars = this.carService.getAllCars();
    if (!this.cars){
      setTimeout(() => {
        this.getCars();
      }, 1000);
    }
  }

  catchChange(id){
    if (this.checkedCars){
      var jeTam = this.checkedCars.find(carsId => carsId === id);
      if (jeTam){
        this.checkedCars = this.checkedCars.filter(cars => cars !== id);
      }else{
        this.checkedCars.push(id);
      }
    }else{
      this.checkedCars = [];
      this.checkedCars.push(id);
    }
    this.carEmitter.emit(this.checkedCars);
  }

  catchAllCars(){
    this.allCarsChecked = !this.allCarsChecked;
    if (!this.allCarsChecked){
      this.carEmitter.emit(this.checkedCars);
    }else{
      this.carEmitter.emit(undefined);
    }
  }
}

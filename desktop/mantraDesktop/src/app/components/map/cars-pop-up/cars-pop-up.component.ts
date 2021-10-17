import {Component, OnInit} from '@angular/core';
import Cars from '../../../models/Cars';
import { Output, EventEmitter } from '@angular/core';
import {CarService} from '../../../services/car.service';


@Component({
  selector: 'app-cars-pop-up',
  templateUrl: './cars-pop-up.component.html',
  styleUrls: ['./cars-pop-up.component.scss']
})
export class CarsPopUpComponent implements OnInit {

  constructor(private carService: CarService) { }
  container;
  content;
  closer;

  cars: Cars[];
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

    chooseCar(carid){
      this.carEmitter.emit(carid);
      this.closer.blur();
    }

    setCars(features: any[]){
      const idAut = [];
      for (let i = 0; i < features.length; i++) {
        // console.log(features[i]);
        console.log(features[i].values_.name);
        idAut.push(features[i].values_.name);
      }
      this.cars = this.carService.getAllCars().filter(car => idAut.includes(car.id));
    }

}

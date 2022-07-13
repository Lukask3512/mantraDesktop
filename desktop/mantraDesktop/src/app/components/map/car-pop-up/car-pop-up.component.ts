import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import Cars from "../../../models/Cars";
import {CarService} from "../../../services/car.service";

@Component({
  selector: 'app-car-pop-up',
  templateUrl: './car-pop-up.component.html',
  styleUrls: ['./car-pop-up.component.scss']
})
export class CarPopUpComponent implements OnInit {

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

}

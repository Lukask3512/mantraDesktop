import {Component, Input, OnInit} from '@angular/core';
import {CarService} from "../../../services/car.service";

@Component({
  selector: 'app-find-car-by-id',
  templateUrl: './find-car-by-id.component.html',
  styleUrls: ['./find-car-by-id.component.scss']
})
export class FindCarByIdComponent implements OnInit {

  @Input() carId: string;
  carName;
  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.getCar(this.carId).subscribe(car => {
      this.carName = car;
    })
  }

}

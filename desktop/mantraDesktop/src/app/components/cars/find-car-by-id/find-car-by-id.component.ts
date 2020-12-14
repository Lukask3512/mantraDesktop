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
  carUndefined;
  constructor(private carService: CarService) { }

  ngOnInit(): void {
    if (this.carId != null){
      this.carService.getCar(this.carId).subscribe(car => {
        this.carName = car;
        this.carUndefined = null;
      });
    }else{
      this.carUndefined = "Nepriradene"
    }

  }

}

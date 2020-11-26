import {Component, OnInit, ViewChild} from '@angular/core';
import {CarService} from "../../services/car.service";
import {OpenlayerComponent} from "../google/map/openlayer/openlayer.component";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  cars;
  @ViewChild('child')
  private child: OpenlayerComponent;
  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.getCars().subscribe(cars => {
        this.cars = cars;
        console.log(cars)
      this.child.notifyMe([], [], this.cars);

    })
  }

}

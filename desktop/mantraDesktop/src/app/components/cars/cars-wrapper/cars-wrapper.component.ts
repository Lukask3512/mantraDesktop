import { Component, OnInit } from '@angular/core';
import {CarService} from "../../../services/car.service";
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import Cars from "../../../models/Cars";

@Component({
  selector: 'app-cars-wrapper',
  templateUrl: './cars-wrapper.component.html',
  styleUrls: ['./cars-wrapper.component.scss']
})
export class CarsWrapperComponent implements OnInit {
  // dataSource = new MatTableDataSource<Cars>(this.cars);
  constructor(private carService: CarService) { }
  cars;
  ngOnInit(): void {
    // this.carService.getCars().subscribe(cars => {
    //   this.cars = cars;
    //   console.log(this.cars);
    // });
  }

}

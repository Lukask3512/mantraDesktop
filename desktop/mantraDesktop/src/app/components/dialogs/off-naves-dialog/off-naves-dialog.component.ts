import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import Cars from "../../../models/Cars";
import {CarService} from "../../../services/car.service";
import {NewCarComponent} from "../../cars/new-car/new-car.component";

@Component({
  selector: 'app-off-naves-dialog',
  templateUrl: './off-naves-dialog.component.html',
  styleUrls: ['./off-naves-dialog.component.scss']
})
export class OffNavesDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private carService: CarService,
              public dialogRef: MatDialogRef<OffNavesDialogComponent>) { }
  car: Cars;
  ngOnInit(): void {
    this.car = this.data.car;
  }

  removeNaves(){
    this.car.navesis.pop();
    this.carService.addNavesToCar(this.car, this.car.id);
    this.close();
  }

  close(){
    this.dialogRef.close();
  }

}

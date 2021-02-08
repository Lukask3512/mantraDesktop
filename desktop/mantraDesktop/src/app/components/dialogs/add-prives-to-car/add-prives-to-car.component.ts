import {Component, Inject, OnInit} from '@angular/core';
import {PrivesService} from "../../../services/prives.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CarService} from "../../../services/car.service";
import Cars from "../../../models/Cars";

@Component({
  selector: 'app-add-prives-to-car',
  templateUrl: './add-prives-to-car.component.html',
  styleUrls: ['./add-prives-to-car.component.scss']
})
export class AddPrivesToCarComponent implements OnInit {

  constructor(private privesService: PrivesService, public dialogRef: MatDialogRef<AddPrivesToCarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private carService: CarService) { }
priveses;
  ngOnInit(): void {


    this.carService.cars$.subscribe(cars => {
      var autaSPrivesmi;
      var priradenePrivesy = [];
      autaSPrivesmi = cars.filter(car => car.navesis.length > 0);
      autaSPrivesmi.forEach(auto => {
        priradenePrivesy.push(auto.navesis[0]);
      });
      this.privesService.prives$.subscribe(priveses => {
        this.priveses = priveses.filter(prives => !priradenePrivesy.includes(prives.id));
      })

    })
  }
  addPricesToCar(prives){
      // this.data.car.navesis.add(prives.id);
      var autoSNavesom: Cars = this.data.car;
      autoSNavesom.navesis.push(prives.id)
    this.carService.addNavesToCar(autoSNavesom, autoSNavesom.id);
      this.dialogRef.close();
  }

}

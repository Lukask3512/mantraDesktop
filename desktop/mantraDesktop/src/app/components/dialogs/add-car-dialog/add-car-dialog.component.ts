import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {CarService} from "../../../services/car.service";
import Cars from "../../../models/Cars";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NewCarComponent} from "../../cars/new-car/new-car.component";
import {DataService} from "../../../data/data.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {take} from "rxjs/operators";

@Component({
  selector: 'app-add-car-dialog',
  templateUrl: './add-car-dialog.component.html',
  styleUrls: ['./add-car-dialog.component.scss']
})
export class AddCarDialogComponent implements OnInit {

  carForm = this.fb.group({
    ecv: ['', Validators.required],
    phone: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private carService: CarService, public dialogRef: MatDialogRef<NewCarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private dataServce: DataService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  saveCar(){
    // console.log(this.carService.getCarByEcv("Skuska1"))
    this.carService.getCarByEcv(this.assignToCar().ecv).pipe(take(1)).subscribe(car => {
      console.log(car)
      if (car.length == 0){
        this.carService.getCarByNumber(this.assignToCar().phoneNumber).pipe(take(1)).subscribe(carByNumber => {
          if (carByNumber.length > 0) {
            this.snackBar.open('Vložené tel. číslo sa už nachádza v databáze', 'Ok', {
              duration: 5000
            });
            return;
          }
          else{
            this.carService.createCar(this.assignToCar());
            this.dialogRef.close();
            return;

          }
        })


      }else{
        this.snackBar.open('Vložené ECV sa už nachádza v databáze', 'Ok', {
          duration: 5000
        });
        return;
      }

    })
    //
  }

  assignToCar(): Cars {
    var createdBy;

    if (this.dataServce.getDispecer().createdBy !== 'master'){
      createdBy = this.dataServce.getDispecer().createdBy;
    }
    else {
      createdBy = this.dataServce.getDispecer().id;
    }
    return {
      ecv: this.carForm.get('ecv').value,
      phoneNumber: this.carForm.get('phone').value,
      createdBy: createdBy,
      status: -2
    };
  }

}

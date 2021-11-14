import {Component, Inject, OnInit} from '@angular/core';
import {CarService} from '../../../services/car.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-car-dialog',
  templateUrl: './delete-car-dialog.component.html',
  styleUrls: ['./delete-car-dialog.component.scss']
})
export class DeleteCarDialogComponent implements OnInit {

  constructor(private carService: CarService, @Inject(MAT_DIALOG_DATA) public data: {car: any, route: boolean},
              public dialogRef: MatDialogRef<DeleteCarDialogComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  delete(carId){
    console.log(carId);
    this.carService.deleteCar(carId);
    this.close();
  }

  deleteRoute(){
    this.dialogRef.close({event: true});
  }

}

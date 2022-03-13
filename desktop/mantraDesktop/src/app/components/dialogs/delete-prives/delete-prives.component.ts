import {Component, Inject, OnInit} from '@angular/core';
import {CarService} from '../../../services/car.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PrivesService} from '../../../services/prives.service';

@Component({
  selector: 'app-delete-prives',
  templateUrl: './delete-prives.component.html',
  styleUrls: ['./delete-prives.component.scss']
})
export class DeletePrivesComponent implements OnInit {

  constructor(private privesService: PrivesService, @Inject(MAT_DIALOG_DATA) public data: {car: any, route: boolean},
              public dialogRef: MatDialogRef<DeletePrivesComponent>, private carService: CarService) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  delete(carId){
    console.log(carId);
    const car = this.carService.getAllCars().find(oneCar => oneCar.navesis.includes(carId));
    if (car){
      car.navesis = car.navesis.filter(oneNaves => oneNaves !== carId);
      this.carService.updateCar(car, car.id);
    }
    this.privesService.deletePrives(carId);
    this.close();
  }

  deleteRoute(){
    this.dialogRef.close({event: true});
  }

}

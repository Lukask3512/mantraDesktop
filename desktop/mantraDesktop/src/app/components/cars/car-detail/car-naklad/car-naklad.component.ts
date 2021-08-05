import {Component, Input, OnInit} from '@angular/core';
import Cars from '../../../../models/Cars';
import {CarService} from '../../../../services/car.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {LogDialogComponent} from '../../../dialogs/log-dialog/log-dialog.component';
import {ShowDetailDialogComponent} from '../../../dialogs/show-detail-dialog/show-detail-dialog.component';

@Component({
  selector: 'app-car-naklad',
  templateUrl: './car-naklad.component.html',
  styleUrls: ['./car-naklad.component.scss']
})
export class CarNakladComponent implements OnInit {

 @Input() car: Cars;
  detail;
  constructor(private carService: CarService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.carService.cars$.subscribe(allCars => {
      this.car = allCars.find(oneCar => oneCar.id === this.car.id);
    });
  }

  openDialog(id, carId){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      detailId: id,
      carId: this.car.id,
    };
    dialogConfig.width = '70%';
    dialogConfig.height = '70%';

    const dialogRef = this.dialog.open(ShowDetailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }
}

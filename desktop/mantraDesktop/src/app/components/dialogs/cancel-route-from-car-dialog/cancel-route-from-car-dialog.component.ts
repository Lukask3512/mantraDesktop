import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';
import Address from '../../../models/Address';
import Route from '../../../models/Route';
import {CarService} from '../../../services/car.service';
import {AddressService} from '../../../services/address.service';
import {RouteService} from '../../../services/route.service';

@Component({
  selector: 'app-cancel-route-from-car-dialog',
  templateUrl: './cancel-route-from-car-dialog.component.html',
  styleUrls: ['./cancel-route-from-car-dialog.component.scss']
})
export class CancelRouteFromCarDialogComponent implements OnInit {
  route: Route;
  addresses: Address[];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CancelRouteFromCarDialogComponent>, private carService: CarService,
              private addressService: AddressService, private routeService: RouteService) { }

  ngOnInit(): void {
    this.route = this.data.route;
    this.addresses = this.data.addresses;

  }

  yes(){
      const car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);

      this.addresses.forEach(oneAddress => {
      if (car.aktualnyNaklad){
        car.aktualnyNaklad.filter(onePackageId => !oneAddress.packagesId.includes(onePackageId));
      }
      oneAddress.carId = null;
      this.addressService.updateAddress(oneAddress);
      car.itinerar = car.itinerar.filter(oneId => oneId !== oneAddress.id);
    });
      this.route.carId = null;
      this.route.offerInRoute = '';
      this.routeService.updateRoute(this.route);
      this.carService.updateCar(car, car.id);
      this.dialogRef.close(true);
  }

  close(){
    this.dialogRef.close();
  }

}

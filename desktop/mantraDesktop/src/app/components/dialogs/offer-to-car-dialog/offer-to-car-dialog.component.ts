import {Component, Inject, OnInit} from '@angular/core';
import Address from '../../../models/Address';
import Route from '../../../models/Route';
import {PrivesService} from '../../../services/prives.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CarService} from '../../../services/car.service';

@Component({
  selector: 'app-offer-to-car-dialog',
  templateUrl: './offer-to-car-dialog.component.html',
  styleUrls: ['./offer-to-car-dialog.component.scss']
})
export class OfferToCarDialogComponent implements OnInit {

  route: Route;
  address: Address[];
  constructor(public dialogRef: MatDialogRef<OfferToCarDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.route = this.data.route;
    this.address = this.data.address;
  }

}

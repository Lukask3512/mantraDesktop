import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-offer-price',
  templateUrl: './offer-price.component.html',
  styleUrls: ['./offer-price.component.scss']
})
export class OfferPriceComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<OfferPriceComponent>) { }

  price: number;
  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  add(){
    if(!this.price){
      this.dialogRef.close(0);
    }else
    this.dialogRef.close(this.price);
  }

}

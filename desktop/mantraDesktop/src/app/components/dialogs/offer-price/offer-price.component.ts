import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-offer-price',
  templateUrl: './offer-price.component.html',
  styleUrls: ['./offer-price.component.scss']
})
export class OfferPriceComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<OfferPriceComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

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

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Cars from '../../../models/Cars';

@Component({
  selector: 'app-zmen-vysku-poistky-uauta',
  templateUrl: './zmen-vysku-poistky-uauta.component.html',
  styleUrls: ['./zmen-vysku-poistky-uauta.component.scss']
})
export class ZmenVyskuPoistkyUAutaComponent implements OnInit {

  vyskaPoistky: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {car: Cars, poistka: number},
              public dialogRef: MatDialogRef<ZmenVyskuPoistkyUAutaComponent>) { }

  ngOnInit(): void {
    this.vyskaPoistky = this.data.poistka;

  }

  close(){
    this.dialogRef.close();
  }

  change(){
    this.dialogRef.close({vyskaPoistky: this.vyskaPoistky});
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';

@Component({
  selector: 'app-cancel-route-from-car-dialog',
  templateUrl: './cancel-route-from-car-dialog.component.html',
  styleUrls: ['./cancel-route-from-car-dialog.component.scss']
})
export class CancelRouteFromCarDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CancelRouteFromCarDialogComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  yes(){
    this.dialogRef.close(true);
  }

  closeDialog(){
    this.dialogRef.close();
  }

  close(){
    this.dialogRef.close();
  }

}

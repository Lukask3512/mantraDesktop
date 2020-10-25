import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {AddCarDialogComponent} from "../../dialogs/add-car-dialog/add-car-dialog.component";


@Component({
  selector: 'app-new-car',
  templateUrl: './new-car.component.html',
  styleUrls: ['./new-car.component.scss']
})
export class NewCarComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }
  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(AddCarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

}

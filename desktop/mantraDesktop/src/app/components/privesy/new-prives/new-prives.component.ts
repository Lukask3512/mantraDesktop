import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AddPrivesDialogComponent} from "../../dialogs/add-prives-dialog/add-prives-dialog.component";

@Component({
  selector: 'app-new-prives',
  templateUrl: './new-prives.component.html',
  styleUrls: ['./new-prives.component.scss']
})
export class NewPrivesComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }
  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(AddPrivesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

}

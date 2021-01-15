import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-route',
  templateUrl: './delete-route.component.html',
  styleUrls: ['./delete-route.component.scss']
})
export class DeleteRouteComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<DeleteRouteComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  delete(){
    this.dialogRef.close({event: true});
  }

}

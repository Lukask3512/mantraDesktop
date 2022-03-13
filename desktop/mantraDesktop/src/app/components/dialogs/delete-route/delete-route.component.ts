import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-route',
  templateUrl: './delete-route.component.html',
  styleUrls: ['./delete-route.component.scss']
})
export class DeleteRouteComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<DeleteRouteComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  delete(){
    this.dialogRef.close({event: true});
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import Dispecer from "../../../models/Dispecer";

@Component({
  selector: 'app-delete-dispecer',
  templateUrl: './delete-dispecer.component.html',
  styleUrls: ['./delete-dispecer.component.scss']
})
export class DeleteDispecerComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {dispecer: Dispecer}, public dialogRef: MatDialogRef<DeleteDispecerComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  deleteDispecer(){
    this.dialogRef.close({event: true})
  }

}

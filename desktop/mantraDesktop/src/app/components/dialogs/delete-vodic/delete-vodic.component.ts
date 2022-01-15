import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Dispecer from '../../../models/Dispecer';
import Vodic from '../../../models/Vodic';

@Component({
  selector: 'app-delete-vodic',
  templateUrl: './delete-vodic.component.html',
  styleUrls: ['./delete-vodic.component.scss']
})
export class DeleteVodicComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {dispecer: Vodic}, public dialogRef: MatDialogRef<DeleteVodicComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  deleteDispecer(){
    this.dialogRef.close({event: true});
  }

}

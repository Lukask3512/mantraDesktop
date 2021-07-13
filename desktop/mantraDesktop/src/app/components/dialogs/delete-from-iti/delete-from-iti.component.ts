import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Dispecer from '../../../models/Dispecer';
import Address from '../../../models/Address';

@Component({
  selector: 'app-delete-from-iti',
  templateUrl: './delete-from-iti.component.html',
  styleUrls: ['./delete-from-iti.component.scss']
})
export class DeleteFromItiComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {adresa: Address}, public dialogRef: MatDialogRef<DeleteFromItiComponent>) { }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

  deleteAddress(){
    this.dialogRef.close({event: true});
  }
}

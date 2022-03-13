import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, Validators} from "@angular/forms";


@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.scss']
})
export class EditInfoComponent implements OnInit {

  routeInfo = this.fb.group({
    info: ['', Validators.required],
  });
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EditInfoComponent>, private fb: FormBuilder) { }

  ngOnInit(): void {
    if (this.data.routeInfo !== undefined)
    this.routeInfo.controls['info'].setValue(this.data.routeInfo);
  }

  updateRouteInfo(){
    this.dialogRef.close({routeInfo: this.routeInfo.get('info').value});
  }

  close(){
    this.dialogRef.close();
  }

}

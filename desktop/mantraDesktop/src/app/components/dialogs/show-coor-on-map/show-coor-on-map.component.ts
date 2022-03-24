import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {PopUpMapComponent} from '../../google/map/pop-up-map/pop-up-map.component';
import {ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-show-coor-on-map',
  templateUrl: './show-coor-on-map.component.html',
  styleUrls: ['./show-coor-on-map.component.scss']
})
export class ShowCoorOnMapComponent implements AfterViewInit {

  lattitude;
  longtitude;
  @ViewChild(PopUpMapComponent) mapComponent: PopUpMapComponent;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ShowCoorOnMapComponent>,
              private cdref: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.lattitude = this.data.lat;
    this.longtitude = this.data.lon;
    this.mapComponent.notifyMe([this.longtitude, this.lattitude]);
    this.cdref.detectChanges();
  }

  close(){
    this.dialogRef.close();
  }

}

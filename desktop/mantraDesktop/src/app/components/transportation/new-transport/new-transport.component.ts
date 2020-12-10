import {Component, OnInit, ViewChild} from '@angular/core';
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AddCarDialogComponent} from "../../dialogs/add-car-dialog/add-car-dialog.component";
import {RouteToCarComponent} from "../../dialogs/route-to-car/route-to-car.component";

@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements OnInit {

  routesTowns: string[] = [];
  routesLat: string[] = [];
  routesLon: string[] = [];
  type: string[] = [];

  change:boolean;
  @ViewChild('child')
  private child: OpenlayerComponent;
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.change = false;
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.type = [];
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLon, event.previousIndex, event.currentIndex);
    moveItemInArray(this.type, event.previousIndex, event.currentIndex);
    this.change = true;
  }

  getAdress(adress){
    this.routesTowns.push(adress);
    this.change = true;
  }
  getLat(lat){
    this.routesLat.push(lat);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getLon(lon){
    this.routesLon.push(lon);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getType(type){
    this.type.push(type);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      routesTowns: this.routesTowns,
      routesLat: this.routesLat,
      routesLon: this.routesLon,
      routesType: this.type
    };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }


}

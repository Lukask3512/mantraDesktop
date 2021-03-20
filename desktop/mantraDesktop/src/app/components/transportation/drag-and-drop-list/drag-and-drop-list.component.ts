import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import Route from "../../../models/Route";
import { EventEmitter } from '@angular/core';
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import {MatDialog} from "@angular/material/dialog";
import {RouteStatusService} from "../../../data/route-status.service";
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-drag-and-drop-list',
  templateUrl: './drag-and-drop-list.component.html',
  styleUrls: ['./drag-and-drop-list.component.scss']
})
export class DragAndDropListComponent{

  @Input() draggable = false;
  @Input() route: Route;
  arrayOfDetail;
  @Output() arrayOfDetailEvent = new EventEmitter<any>();
  @Output() outputRoute = new EventEmitter<Route>();
  @Output() clickedOnRoute = new EventEmitter<number>();
  constructor(private dialog: MatDialog, public routeStatus: RouteStatusService, private dataService: DataService) { }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.route.nameOfTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.type, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.status, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.aboutRoute, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.detailsAboutAdresses, event.previousIndex, event.currentIndex);
    moveItemInArray(this.arrayOfDetail, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.casPrijazdu, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.casLastPrijazdu, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.datumPrijazdu, event.previousIndex, event.currentIndex);
    moveItemInArray(this.route.datumLastPrijazdy, event.previousIndex, event.currentIndex);

    this.outputRoute.emit(this.route);
    this.arrayOfDetailEvent.emit(this.arrayOfDetail);
  }


  deleteTown(routeTown){
    for (let i = 0; i < this.route.nameOfTowns.length; i++){
      if (this.route.nameOfTowns[i] == routeTown){
        this.route.nameOfTowns.splice(i,1);
        this.route.coordinatesOfTownsLon.splice(i,1);
        this.route.coordinatesOfTownsLat.splice(i,1);
        this.route.type.splice(i,1);
        this.route.status.splice(i, 1);
        this.route.aboutRoute.splice(i,1);
      }
    }
    this.outputRoute.emit(this.route);
  }

  setDetails(arrayOfDetails){
    console.log("som dostal")
    console.log(arrayOfDetails)
    this.arrayOfDetail = arrayOfDetails;
    // this.arrayOfDetail[i].sizeS
    // console.log(this.arrayOfDetail[0])
  }

  sendTown(index){
    this.clickedOnRoute.emit(index);
  }

  editInfo(routeInfo, id){
    const dialogRef = this.dialog.open(EditInfoComponent, {
      data: {routeInfo: routeInfo }
    });
    console.log(routeInfo)
    dialogRef.afterClosed().subscribe(value => {

      if (value.routeInfo !== undefined){
        this.route.aboutRoute[id] = value.routeInfo;
        this.outputRoute.emit(this.route);
      }else {
        return;
      }
    });
  }

  checkFinished(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      idCreated = this.dataService.getDispecer().id
    }else{
      idCreated = this.dataService.getDispecer().createdBy
    }
    console.log()
    if (this.route.createdBy !=  idCreated){
      return false;
    }
    if (this.route !== undefined && this.route.finished){
      return false;
    }else if(this.route == undefined){
      return true
    }else {
      return true;
    }
  }

}

import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import Route from "../../../models/Route";
import { EventEmitter } from '@angular/core';
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import {MatDialog} from "@angular/material/dialog";
import {RouteStatusService} from "../../../data/route-status.service";
import {DataService} from "../../../data/data.service";
import Address from "../../../models/Address";

@Component({
  selector: 'app-drag-and-drop-list',
  templateUrl: './drag-and-drop-list.component.html',
  styleUrls: ['./drag-and-drop-list.component.scss']
})
export class DragAndDropListComponent implements OnInit {

  @Input() draggable = false;

  @Input() address: Address[];
  @Input() detailArray;
  @Input() detailPositions;


  @Output() outputRoute = new EventEmitter<Address[]>();
  @Output() clickedOnRoute = new EventEmitter<number>();
  constructor(private dialog: MatDialog, public routeStatus: RouteStatusService, private dataService: DataService) { }


  setAddresses(addresses: Address[]){
    this.address = addresses;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.address, event.previousIndex, event.currentIndex);

    this.outputRoute.emit(this.address);
    // this.arrayOfDetailEvent.emit(this.arrayOfDetail);
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return "Neznámy"
    }
    return date.toLocaleString();
  }

  deleteTown(routeTown){
    // for (let i = 0; i < this.route.nameOfTowns.length; i++){
    //   if (this.route.nameOfTowns[i] == routeTown){
    //     this.route.nameOfTowns.splice(i,1);
    //     this.route.coordinatesOfTownsLon.splice(i,1);
    //     this.route.coordinatesOfTownsLat.splice(i,1);
    //     this.route.type.splice(i,1);
    //     this.route.status.splice(i, 1);
    //     this.route.aboutRoute.splice(i,1);
    //   }
    // }
    // this.outputRoute.emit(this.route);
  }

  setDetails(arrayOfDetails){
    console.log("som dostal")
    console.log(arrayOfDetails)
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
        // this.route.aboutRoute[id] = value.routeInfo;
        this.outputRoute.emit(this.address);
      }else {
        return;
      }
    });
  }

  checkFinished(){
    return true;
    // var idCreated;
    // if (this.dataService.getDispecer().createdBy == 'master'){
    //   idCreated = this.dataService.getDispecer().id
    // }else{
    //   idCreated = this.dataService.getDispecer().createdBy
    // }
    // console.log()
    // if (this.address.createdBy !=  idCreated){
    //   return false;
    // }
    // if (this.route !== undefined && this.route.finished){
    //   return false;
    // }else if(this.route == undefined){
    //   return true
    // }else {
    //   return true;
    // }
  }

  ngOnInit(): void {
    console.log(this.address)
  }

}

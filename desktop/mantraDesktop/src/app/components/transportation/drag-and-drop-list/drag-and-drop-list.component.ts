import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import Route from "../../../models/Route";
import { EventEmitter } from '@angular/core';
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import {MatDialog} from "@angular/material/dialog";
import {RouteStatusService} from "../../../data/route-status.service";
import {DataService} from "../../../data/data.service";
import Address from "../../../models/Address";
import DeatilAboutAdresses from "../../../models/DeatilAboutAdresses";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  constructor(private dialog: MatDialog, public routeStatus: RouteStatusService, private dataService: DataService,
              private _snackBar: MatSnackBar) { }


  setAddresses(addresses: Address[]){
    this.address = addresses;
  }

  //kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      for (const [index, detailElement] of detail.townsArray.entries()) {
        var mestoNakladky = detail.townsArray[index];
        //+1 lebo pred to som hodil novy item
        if (mestoNakladky +1 > current){ // ak je mesto kde nakladam vyzsie ako aktualny index vykladky
          mozemPresunut = false;
        }
      }
    }else{ //a tu ked nakladku
      for (const [indexNakBalika, detailElement] of detail.entries()) {
        for (const [indexMesta, oneDetail] of this.detailArray.entries()) {
          if (oneDetail.townsArray){
            for (const [index, oneBalik] of oneDetail.townsArray.entries()) {
              if (oneDetail.townsArray[index] == previous && oneDetail.detailArray[index] == indexNakBalika){
                if (indexMesta-1 < current){
                  mozemPresunut = false;
                }
              }
            }
          }
        }
      }
    }
    return mozemPresunut;
  }

  //kontrola ci mozem prehodit mesta - podla detailu
  zmenIdckaVykladok(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      //podla previous a currnet budem muiset pomenit indexy vykladok
    }else{ //a tu ked nakladku
      //tu budem musiet tiez podla previous a currnet zmenit indexy + zmenit indexy vykladky
    }
    return mozemPresunut;
  }


  drop(event: CdkDragDrop<Address[]>) {
    var presuvaciDetail = this.detailArray[event.previousIndex];
    var mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
    if (mozemPresunut){
      //tu budem musiet este v detaile upravit indexes
      moveItemInArray(this.detailArray, event.previousIndex, event.currentIndex);
      moveItemInArray(this.address, event.previousIndex, event.currentIndex);
      this.outputRoute.emit(this.address);
    }else{
      this.openSnackBar("Túto zmenu nemôžete vykonať.", "OK")
    }

    // this.arrayOfDetailEvent.emit(this.arrayOfDetail);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000
    });
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
    this.detailArray = arrayOfDetails;
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

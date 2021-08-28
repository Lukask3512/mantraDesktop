import {Component, Input, OnInit, Output} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import { EventEmitter } from '@angular/core';
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {RouteStatusService} from "../../../data/route-status.service";
import {DataService} from "../../../data/data.service";
import Address from "../../../models/Address";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AddressService} from '../../../services/address.service';
import {ShowDetailDialogComponent} from '../../dialogs/show-detail-dialog/show-detail-dialog.component';

@Component({
  selector: 'app-drag-and-drop-list',
  templateUrl: './drag-and-drop-list.component.html',
  styleUrls: ['./drag-and-drop-list.component.scss']
})
export class DragAndDropListComponent implements OnInit {

  @Input() draggable = false;
  @Input() updatable = false;

  @Input() address: Address[];
  @Input() detailArray;
  @Input() detailPositions;


  @Output() outputRoute = new EventEmitter<Address[]>();
  @Output() outputDetails = new EventEmitter<any[]>();
  @Output() clickedOnRoute = new EventEmitter<number>();

  @Output() deleteFromIti = new EventEmitter<Address>();
  @Output() deleteFromItiTownIndex = new EventEmitter<any>();
  constructor(private dialog: MatDialog, public routeStatus: RouteStatusService, private dataService: DataService,
              private _snackBar: MatSnackBar, private addressService: AddressService) { }


  setAddresses(addresses: Address[]){
    this.address = addresses;
  }

  // kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      for (const [index, detailElement] of detail.townsArray.entries()) {
        var mestoNakladky = detail.townsArray[index];
        //+1 lebo pred to som hodil novy item
        if (mestoNakladky + 1 > current){ // ak je mesto kde nakladam vyzsie ako aktualny index vykladky
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


  // kontrola ci mozem prehodit mesta - podla detailu
  zmenIdckaVykladok(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      if (current > previous){ // ak presuniem dalej
        for (let i = previous; i <= current; i++) {
          if (this.detailArray[i].townsArray == undefined){ // ak najdem nakladku
            //tak skontrolujem od nej dalej vsetky jej  vykladky a upravim index na +1 alebo -1
            for (let j = i; j < this.detailArray.length; j++) { // idem odtial a dalej - dozadu netreba
              if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                for (let k = 0; k < this.detailArray[i].length; k++) { // prechadzam vsetkymi detailami a porovnavam
                  for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                    // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                    if (i == this.detailArray[j].townsArray[l] && k == this.detailArray[j].detailArray[l]){
                      //ak sedia tak by som mal vo vykladke upravit index mesta
                      this.detailArray[j].townsArray[l] = this.detailArray[j].townsArray[l] - 1; // pretoze ho preskocil, to znamena ze nakladka padla o 1 mesto dole
                    }
                  }

                }

              }

            }

          }
        }
      }else{ // ked presuniem vykladku do zadu
        for (let i = current; i <= previous; i++) {
          if (this.detailArray[i].townsArray == undefined){ // ak najdem nakladku
            //tak skontrolujem od nej dalej vsetky jej  vykladky a upravim index na +1 alebo -1
            for (let j = i; j < this.detailArray.length; j++) { // idem odtial a dalej - dozadu netreba
              if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                for (let k = 0; k < this.detailArray[i].length; k++) { // prechadzam vsetkymi detailami a porovnavam
                  for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                    // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                    if (i == this.detailArray[j].townsArray[l] && k == this.detailArray[j].detailArray[l]){
                      //ak sedia tak by som mal vo vykladke upravit index mesta
                      this.detailArray[j].townsArray[l] = this.detailArray[j].townsArray[l] + 1; // pretoze ho preskocil, to znamena ze nakladka padla o 1 mesto dole
                    }
                  }

                }

              }

            }

          }
        }
      }

    }else{ //a tu nakladku
      //tiez ak najdem nakladku, tak od nej zmenim vsetky jej detaily vo vykladkach o +1 alebo -1
        if (current > previous){
          var arrayAddress = [];
          var arrayTowns = [];
          var arrayCurrentIndex = [];
          for (let i = 0; i < detail.length; i++) { // najprv  idem len pre nakladku ktoru presuvam
              for (let j = current; j < this.detailArray.length; j++) {
                if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                    for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                      // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                      if (this.detailArray[j].townsArray[l] == previous && l == i){ //j == previous znamena mesto a i == i znamena ktory index vykladky
                        //ak sedia tak by som mal vo vykladke upravit index mesta
                        // this.detailArray[j].townsArray[l] = current; // current je index kde skocila nakladka
                        //neulozil som si to hned lebo potom dalej mi to menilo indexy tiez pri dalsich nakladkach
                        arrayAddress.push(j);
                        arrayTowns.push(l);
                        arrayCurrentIndex.push(current);
                      }
                    }
                }
              }
            }
          //+1 pretoze este to neni premenene a s aktualnou sompracoval hore
          //toto robim pre zvysne nakladky ak boli medzi current a previous
          for (let i = previous + 1; i <= current; i++) { // robim to len pre nakladky ak boli medzi preskocenymi
            if (this.detailArray[i].townsArray == undefined){ // ak najdem nakladku
              //tak skontrolujem od nej dalej vsetky jej  vykladky a upravim index na +1 alebo -1
              for (let j = i; j < this.detailArray.length; j++) { // idem odtial a dalej - dozadu netreba
                if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                  // for (let k = 0; k < this.detailArray[j].length; k++) { // prechadzam vsetkymi detailami a porovnavam
                    for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                      // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                      console.log(this.detailArray[j]);
                      console.log(this.detailArray[j].townsArray);
                      console.log(this.detailArray[j].townsArray[l]);
                      if (i == this.detailArray[j].townsArray[l] && l == this.detailArray[j].detailArray[l]){
                        //ak sedia tak by som mal vo vykladke upravit index mesta
                        this.detailArray[j].townsArray[l] = this.detailArray[j].townsArray[l] - 1; // pretoze ho preskocil, to znamena ze nakladka padla o 1 mesto dole
                      }
                    }

                  // }

                }

              }

            }
          }
          //na konci ukladam zmenene indexy menenej nakladky
          for (let i = 0; i < arrayTowns.length; i++) {
            this.detailArray[arrayAddress[i]].townsArray[arrayTowns[i]] = arrayCurrentIndex[i];
          }
        }else if (previous > current){
           arrayAddress = [];
           arrayTowns = [];
           arrayCurrentIndex = [];
          for (let i = 0; i < detail.length; i++) { // najprv  idem len pre nakladku ktoru presuvam
            for (let j = current; j < this.detailArray.length; j++) {
              if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                  // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                  if (this.detailArray[j].townsArray[l] == previous && l == i){ //j == previous znamena mesto a i == i znamena ktory index vykladky
                    //ak sedia tak by som mal vo vykladke upravit index mesta
                    // this.detailArray[j].townsArray[l] = current; // current je index kde skocila nakladka
                    arrayAddress.push(j);
                    arrayTowns.push(l);
                    arrayCurrentIndex.push(current);
                  }
                }
              }
            }
          }

          //toto robim pre zvysne nakladky ak boli medzi current a previous
          for (let i = current; i < previous; i++) { // robim to len pre nakladky ak boli medzi preskocenymi
            if (this.detailArray[i].townsArray == undefined){ // ak najdem nakladku
              //tak skontrolujem od nej dalej vsetky jej  vykladky a upravim index na +1 alebo -1
              for (let j = i; j < this.detailArray.length; j++) { // idem odtial a dalej - dozadu netreba
                if (this.detailArray[j].townsArray != undefined){ // ked najdem vykladku
                  // for (let k = 0; k < this.detailArray[j].length; k++) { // prechadzam vsetkymi detailami a porovnavam
                    for (let l = 0; l < this.detailArray[j].townsArray.length; l++) { // predhazam vykladkou
                      // porovnavam ci sedia indexy vo vykladke s indexom nakladky
                      console.log(this.detailArray[j]);
                      console.log(this.detailArray[j].townsArray);
                      console.log(this.detailArray[j].townsArray[l]);
                      if (i == this.detailArray[j].townsArray[l] && l == this.detailArray[j].detailArray[l]){
                        //ak sedia tak by som mal vo vykladke upravit index mesta
                        this.detailArray[j].townsArray[l] = this.detailArray[j].townsArray[l] + 1; // pretoze ho preskocil, to znamena ze nakladka padla o 1 mesto dole
                      }
                    }

                  // }

                }

              }

            }
          }
          //na konci ukladam zmenene indexy menenej nakladky
          for (let i = 0; i < arrayTowns.length; i++) {
            this.detailArray[arrayAddress[i]].townsArray[arrayTowns[i]] = arrayCurrentIndex[i];
          }
        }


        }

    return mozemPresunut;
  }

  setDragable(dragable){
    this.draggable = dragable;
  }

  // ci mozem upravovat info, vymazat trasu atd
  setUpdatable(update){
    this.updatable = update;
  }

  drop(event: CdkDragDrop<Address[]>) {
    var presuvaciDetail = this.detailArray[event.previousIndex];
    var mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
    if (mozemPresunut){
      this.zmenIdckaVykladok(presuvaciDetail, event.previousIndex, event.currentIndex);
      // tu budem musiet este v detaile upravit indexes
      moveItemInArray(this.detailArray, event.previousIndex, event.currentIndex);
      moveItemInArray(this.address, event.previousIndex, event.currentIndex);
      this.outputRoute.emit(this.address);
      this.outputDetails.emit(this.detailArray);
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

  deleteTownFromIti(townId){
    this.deleteFromIti.emit(townId);
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

      if (value && value.routeInfo !== undefined){
        this.address[id].aboutRoute = value.routeInfo;
        this.addressService.updateAddress(this.address[id]);
        // this.route.aboutRoute[id] = value.routeInfo;
        this.outputRoute.emit(this.address);
      }else {
        return;
      }
    });
  }

  openDialog(detailId){
    console.log(detailId);
    console.log(this.detailArray);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      detailId: detailId,
      carId: null,
    };
    dialogConfig.width = '70%';
    dialogConfig.height = '70%';

    const dialogRef = this.dialog.open(ShowDetailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }
  ngOnInit(): void {
    console.log(this.address)
  }

}

import { Component, OnInit } from '@angular/core';
import Address from '../../../../models/Address';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatSnackBar} from '@angular/material/snack-bar';
import {RouteStatusService} from '../../../../data/route-status.service';
import {PackageService} from '../../../../services/package.service';
import Cars from '../../../../models/Cars';
import {CarService} from '../../../../services/car.service';
import {ok} from 'assert';

@Component({
  selector: 'app-itinerar-da-d',
  templateUrl: './itinerar-da-d.component.html',
  styleUrls: ['./itinerar-da-d.component.scss']
})
export class ItinerarDaDComponent implements OnInit {

  address: Address[];
  detail = [];
  car: Cars;
  itiChanged = false;
  constructor(private _snackBar: MatSnackBar,  public routeStatus: RouteStatusService,
              private packageService: PackageService, private carService: CarService) { }

  ngOnInit(): void {
  }

  setAddress(address: Address[], car: Cars){
    this.address = address;
    this.car = car;
    this.stiahniDetail();
  }

  drop(event: CdkDragDrop<Address[]>) {
    var presuvaciDetail = this.detail[event.previousIndex];
    var mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
    if (mozemPresunut){
      moveItemInArray(this.detail, event.previousIndex, event.currentIndex);
      moveItemInArray(this.address, event.previousIndex, event.currentIndex);
      moveItemInArray(this.car.itinerar, event.previousIndex, event.currentIndex);
      this.itiChanged = true;
    }else{
      this.openSnackBar('Túto zmenu nemôžete vykonať.', 'OK');
    }

    // this.arrayOfDetailEvent.emit(this.arrayOfDetail);
  }

  // kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current){
    let mozemPresunut = true;
    if (detail.length > 0){
      for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
        if (this.address[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.address.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany.id && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.address[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.address.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany.id && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }
    }else{
      for (const [indexPresuvacieho, detailPresuvany] of detail.packageId.entries()) {
        if (this.address[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.address.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.address[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.address.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }
    }
    return mozemPresunut;
  }

  sendTown(i){

  }

  stiahniDetail(){
    this.detail = [];
    this.address.forEach(oneAddress => {
      var myPackages = [];
      var detailAr = {detailArray: [], townsArray: [], packageId: []}
      oneAddress.packagesId.forEach( oneId => {
        if (oneAddress.type === 'nakladka'){
          var balik = this.packageService.getOnePackage(oneId);
          myPackages.push(balik);
        }else{
          // u by som mal vlozit len indexy do vykladky
          this.detail.forEach((oneDetail, townId) => {
            if (oneDetail.townsArray === undefined){
              oneDetail.forEach((oneDetailId, packageId) => {
                if (oneDetailId.id === oneId){
                  detailAr.detailArray.push(packageId);
                  detailAr.townsArray.push(townId);
                  detailAr.packageId.push(oneDetailId.id);
                }
              });
            }
          });

        }
      });
      if (myPackages.length !== 0){
        this.detail.push(myPackages);
      }else{
        this.detail.push(detailAr);
      }

    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000
    });
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  updateItinerar(){
    this.carService.updateCar(this.car, this.car.id);
  }

}

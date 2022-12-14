import { Component, OnInit } from '@angular/core';
import Address from '../../../../models/Address';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatSnackBar} from '@angular/material/snack-bar';
import {RouteStatusService} from '../../../../data/route-status.service';
import {PackageService} from '../../../../services/package.service';
import Cars from '../../../../models/Cars';
import {CarService} from '../../../../services/car.service';
import {ok} from 'assert';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../../dialogs/add-car-dialog/add-car-dialog.component';
import {DeleteFromItiComponent} from '../../../dialogs/delete-from-iti/delete-from-iti.component';
import {EditInfoComponent} from '../../../dialogs/edit-info/edit-info.component';
import {AddressService} from '../../../../services/address.service';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from '../../../../data/data.service';

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
              private packageService: PackageService, private carService: CarService,
              private dialog: MatDialog, private addressService: AddressService,
              private translation: TranslateService, private dataService: DataService) { }

  ngOnInit(): void {
  }

  setAddress(address: Address[], car: Cars){
    if (!this.address){
      this.address = address;
    }else if (address.length === 0){
      this.address = [];
    }else{
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < address.length; i++) {
        const adresaVItinerari = this.address.find(oneAdress => oneAdress.id === address[i].id);
        const indexAdresyVIti = this.address.findIndex(oneAdress => oneAdress.id === address[i].id);
        const adresaVAute = this.car.itinerar.find(oneId => oneId === address[i].id);
        if (this.address.length !== car.itinerar.length){
          this.address = address;
          this.itiChanged = false;
          return;
        }
        if (!adresaVItinerari || !adresaVAute){
          this.address = address;
          this.itiChanged = false;
          return;
        }else{
          this.address[indexAdresyVIti] = address[i];
        }
      }
    }
    this.car = car;
    this.stiahniDetail();

  }

  drop(event: CdkDragDrop<Address[]>) {
    const presuvaciDetail = this.detail[event.previousIndex];
    const mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
    if (mozemPresunut){
      moveItemInArray(this.detail, event.previousIndex, event.currentIndex);
      moveItemInArray(this.address, event.previousIndex, event.currentIndex);
      moveItemInArray(this.car.itinerar, event.previousIndex, event.currentIndex);
      this.itiChanged = true;
    }else{
      this.openSnackBar(this.translation.instant('POPUPS.tutoZmenuNejdeVykonat'), 'OK');
    }

    // this.arrayOfDetailEvent.emit(this.arrayOfDetail);
  }

  getCountOfPackages(townIndex){
    return this.detail[townIndex].length;
  }

  // pre nakladky
  getBednaIndex(townIndex, detailIndex, carArray: boolean){
    if (carArray){
      return townIndex + 1;
    }
    let indexBedne = -1;
    for (let i = 0; i < townIndex; i++) {
      if (!this.detail[i].townsArray){ // len nakladky pocitam
        indexBedne += this.getCountOfPackages(i);
      }
    }
    indexBedne += detailIndex + 1;
    return this.dataService.getLetter(indexBedne);
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
      if (oneAddress){
        const myPackages = [];
        const detailAr = {detailArray: [], townsArray: [], packageId: [], carArray: []};
        oneAddress.packagesId.forEach( oneId => {
          if (oneAddress.type === 'nakladka'){
            const balik = this.packageService.getOnePackage(oneId);
            myPackages.push(balik);
          }else{
            const indexVAute = this.car.aktualnyNaklad.findIndex(oneId2 => oneId2 === oneId);
            if (indexVAute > -1){ // ak ho najdem  v aute, nehladam to medzi ostatnymi
              detailAr.detailArray.push(0);
              detailAr.townsArray.push(indexVAute);
              detailAr.packageId.push(oneId);
              detailAr.carArray.push(true);
            }else{
            // u by som mal vlozit len indexy do vykladky
              this.detail.forEach((oneDetail, townId) => {
                if (oneDetail.townsArray === undefined){
                  const packageIdd = oneDetail.findIndex(oneDetailId => oneDetailId.id === oneId);
                  const packagee = oneDetail.find(oneDetailId => oneDetailId.id === oneId);
                  if (packageIdd > -1){
                    detailAr.detailArray.push(packageIdd);
                    detailAr.townsArray.push(townId);
                    detailAr.packageId.push(packagee.id);
                    detailAr.carArray.push(false);
                  }
                }
              });
            }
          }
        });
        if (myPackages.length !== 0){
          this.detail.push(myPackages);
        }else{
          this.detail.push(detailAr);
        }
      }
    });
  }

  // // return id
  // findDetail(oneDetail, deilId){
  //   const detail = oneDetail.find(oneDetail2 => oneDetail2.id === deilId);
  //   return detail.id;
  // }

  deleteTownFromIti(address: Address){
    this.address = this.address.filter(adresa => adresa.id !== address.id);
    this.car.itinerar = this.car.itinerar.filter(adresaId => adresaId !== address.id);
    this.carService.updateCar(this.car, this.car.id);
    console.log(address);
  }

  openAddDialogToDelete(adresa: Address) {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    dialogConfig.data = {
      adresa
    };
    const dialogRef = this.dialog.open(DeleteFromItiComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        const indexAdries = [];
        indexAdries.push(adresa.id);
        this.address.forEach((jednaAdresa, indexik) => {
          if (jednaAdresa.id !== adresa.id){
            const packages = jednaAdresa.packagesId.find(oneId => adresa.packagesId.includes(oneId));
            if (packages){
              indexAdries.push(jednaAdresa.id);
            }
          }
        });
        this.car.itinerar = this.car.itinerar.filter(oneId => !indexAdries.includes(oneId));
        const adresyKtoreMazem = this.address.filter(oneAddress => indexAdries.includes(oneAddress.id));
        adresyKtoreMazem.forEach(oneAddress => {
          oneAddress.packagesId.forEach(oneDetailId => {
            const detail = this.car.aktualnyNaklad.find(oneId => oneId === oneDetailId);
            if (detail){
              this.car.aktualnyNaklad = this.car.aktualnyNaklad.filter(oneId => oneId !== detail);
            }
          });
        });
        this.carService.updateCar(this.car, this.car.id);
        this.address = this.address.filter(oneAddress => !indexAdries.includes(oneAddress.id));
      }
    });
  }

  openAddDialogToEditInfo(adresa: Address) {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const routeInfo =  adresa.aboutRoute;
    dialogConfig.data = {
      routeInfo
    };
    const dialogRef = this.dialog.open(EditInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.editInfoAddress(adresa, value.routeInfo);
      }
    });
  }

  editInfoAddress(adresa: Address, info){
    const adresaSInfom = this.address.find(oneAdd => oneAdd.id === adresa.id);
    adresaSInfom.aboutRoute = info;
    this.addressService.updateAddress(adresaSInfom);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000
    });
  }

  estimatedTimeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    if (dateUtc == null){
      return this.translation.instant('OFTEN.nerozhoduje');
    }
    return date.toLocaleString();
  }

  updateItinerar(){
    this.carService.updateCar(this.car, this.car.id);
  }

}

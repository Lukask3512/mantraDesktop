import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {OpenlayerComponent} from '../../google/map/openlayer/openlayer.component';
import {AdressesComponent} from '../../google/adresses/adresses.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../dialogs/add-car-dialog/add-car-dialog.component';
import {RouteToCarComponent} from '../../dialogs/route-to-car/route-to-car.component';
import Route from '../../../models/Route';
import {DataService} from '../../../data/data.service';
import {take} from 'rxjs/operators';
import {RouteService} from '../../../services/route.service';
import {EditInfoComponent} from '../../dialogs/edit-info/edit-info.component';
import {RouteStatusService} from '../../../data/route-status.service';
import {Subject} from 'rxjs';
import Cars from '../../../models/Cars';
import { jsPDF } from 'jspdf';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import DeatilAboutAdresses from '../../../models/DeatilAboutAdresses';

import {DetailAboutRouteService} from '../../../services/detail-about-route.service';
import OneDetailRoute from '../../../models/OneDetailRoute';
import {DragAndDropListComponent} from '../drag-and-drop-list/drag-and-drop-list.component';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {OfferPriceComponent} from '../../dialogs/offer-price/offer-price.component';
import Address from '../../../models/Address';
import {AddressService} from '../../../services/address.service';
import {NewFormComponent} from './new-form/new-form.component';
import {ShowDetailComponent} from './show-detail/show-detail.component';
import {PackageService} from '../../../services/package.service';
import {LogDialogComponent} from '../../dialogs/log-dialog/log-dialog.component';
import {Router} from '@angular/router';
import {AllDetailAboutRouteDialogComponent} from '../../dialogs/all-detail-about-route-dialog/all-detail-about-route-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgxSpinnerService} from 'ngx-spinner';
import {CancelRouteFromCarDialogComponent} from '../../dialogs/cancel-route-from-car-dialog/cancel-route-from-car-dialog.component';
import {CarService} from '../../../services/car.service';
import {MainDetailAboutComponent} from '../main-detail-about/main-detail-about.component';



@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements AfterViewInit, OnInit {
  addresses: Address[] = [];
  detail = [];


  // aby log sledoval zmeny ak zmenim trasu
  parentSubject: Subject<any> = new Subject();
  carId: string;
  car: Cars;
  route: Route;
  actualAdress: Address;

  infoAboutRoute = '';

  numberOfItems = 1;
  actualItemInForm = 0;

  detailAboutRoute: any; // detail ohladom 1 nakladky/vykladky... kde moze byt viacej ks
  oneDetailAboutRoute: DeatilAboutAdresses;
  arrayOfDetailsAbRoute: any[] =  [];
  fakeArrayOfDetailsAbRoute: any[] =  [];



  arrayOfStringOfDetails;

  // pole
  arrayOfDetailsPositions = [];


  minDate;
  labelPosition: 'nakladka' | 'vykladka';


  change: boolean;

  clickedOnIndexDetail: number;

  routeToDetail;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('childGoogle')
  private childGoogle: AdressesComponent;

  @ViewChild(NewFormComponent)
  private newFormChild: NewFormComponent;

  @ViewChild(ShowDetailComponent)
  private detailChild: ShowDetailComponent;

  @ViewChild(MainDetailAboutComponent)
  private mainDetailAboutComponent: MainDetailAboutComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog,
              private dataService: DataService, private routeService: RouteService,
              private detailAboutService: DetailAboutRouteService, private countFreeSpace: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService,
              private router: Router, private _snackBar: MatSnackBar, private spinner: NgxSpinnerService,
              private carService: CarService) { }





              ngOnInit() {
              }

  ngAfterViewInit(): void {
    setTimeout(() => { // pre exoressionchanged error...
    const loggedDispecer = this.dataService.getDispecer();
    let dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id;
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    this.route = new Route();
    this.route.carId = '';
    this.route.createdBy = dispecerId;
    this.route.finished = false;
    this.route.forEveryone = false;
    this.route.price = 0;
    this.route.takenBy = '';
    this.route.ponuknuteTo =  '';
    this.route.offerInRoute = '';


    this.detailAboutRoute = {};
    this.change = false;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route);
      if (route != null){
        this.spinner.show();
        this.route = route;
        this.addressService.address$.subscribe(alAdd => {

          let adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
          adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
          this.addresses = adresy;


          // this.child.notifyMe(this.addresses,  this.dataService.getOneCarById(this.carId), this.car);
          this.addresses.forEach(oneAddress => {
            const myPackages = [];
            const detailAr = {detailArray: [], townsArray: [], packageId: []};
            oneAddress.packagesId.forEach( oneId => {
              if (oneAddress.type === 'nakladka'){
                const balik = this.packageService.getOnePackage(oneId);
                myPackages.push(balik);
              }else{
                // tu by som mal vlozit len indexy do vykladky
                this.detail.forEach((oneDetail, townId) => {
                  if (oneDetail.townsArray === undefined){
                    oneDetail.forEach((oneDetailId, packageId) => {
                      if (oneDetailId && oneDetailId.id === oneId){
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

          if (this.route && this.route.id){
            this.childDropList.setDragable(false);
            this.childDropList.setUpdatable(true);
          }
          this.spinner.hide();
          this.childDropList.setDetails(this.detail);
          this.childDropList.setAddresses(this.addresses);

          this.routeToDetail = {
            adresyVPonuke: this.addresses,
            detailVPonuke: this.detail
          };

          setTimeout(() =>
            {
              this.mainDetailAboutComponent.setRoute(this.routeToDetail);
            },
            300);

        });


        this.carId = this.route.carId;
        if (this.carId){
          this.car = this.carService.getAllCars().find(oneCar => oneCar.id === this.carId);
          setTimeout(() =>
            {

              this.notifyChildren(this.route.id);
              this.child.notifyMe(this.addresses, this.car);
            },
            800);
        }else{
          setTimeout(() =>
            {
              this.notifyChildren(this.route.id);
              this.child.notifyMe(this.addresses,  null);

            },
            800);
        }


      }else{
        this.childDropList.setAddresses(null);
      }
    });
    });
  }

  getAddressFromDragAndSend(townIndex){
    const adresa = this.addresses[townIndex];
    const detail = this.detail[townIndex];
    this.newFormChild.setAddress(adresa, townIndex);
    this.newFormChild.setDetail(detail);
    this.clickedOnIndexDetail = townIndex;
  }

  receiveAddressUpdate(adreesIndex){
    console.log(adreesIndex);
    this.addresses[adreesIndex.index] = adreesIndex.adresa;
  }

  updateDetailOnTown(index: number){
    console.log(this.detail);
    if (this.detail[index][0] !== undefined){
    this.newFormChild.setDetail({detail: this.detail[index][0], indexBedne: 0, indexMesta: 0});
    this.newFormChild.setAddress(this.addresses[index], index);
    }
else{

      this.newFormChild.setDetail({detail: this.detail[index][0], indexBedne: 0, indexMesta: 0});
      this.newFormChild.setAddress(this.addresses[index], index);
    }
  }

  setDetailForm(detail){
    this.newFormChild.setDetailFromBaliky(detail);
  }


  onDropListDetailChange(detail){
    this.detail = detail;
    this.detailChild.setDetails(this.detail);
    this.dataService.setDetailSource(this.detail);
  }

  setMapPoints(){
    setTimeout(() =>
      {
        if (this.carId !== undefined || this.carId !==  null){
          this.child.notifyMe(this.addresses,  this.dataService.getOneCarById(this.carId));
        }
        else{
          this.child.notifyMe(this.addresses, this.car);

        }
      },
      800);
  }


  onDropListChange(changedRoute: Address[]){
    this.addresses = changedRoute;
    // this.dataService.checkAddressesTime(this.addresses);
    this.setMapPoints();
    this.clickedOnIndexDetail = undefined;
    this.change = true;
  }


  receiveAddress(address: Address){
    if (this.clickedOnIndexDetail !== undefined && this.clickedOnIndexDetail !== null){
      this.addresses[this.clickedOnIndexDetail] = address;
    }else{
      this.addresses.push(address);
    }
    this.child.notifyMe(this.addresses, undefined);
    this.clickedOnIndexDetail = undefined;
    this.checkAllDetails();

  }

  receiveDetail(detail){
    if (this.clickedOnIndexDetail !== undefined && this.clickedOnIndexDetail !== null){
      this.detail[this.clickedOnIndexDetail] = detail;
    }else{
      this.detail.push(detail);
    }
    this.detailChild.setDetails(this.detail);
    this.dataService.setDetailSource(this.detail);
    this.childDropList.setDetails(this.detail);
  }

  // tu si kontrolujem, ci som nahodou nezmenil baliky, a ci nevykladam taky ktory uz nemam
  checkAllDetails(){
    for (let i = 0; i < this.detail.length; i++) {
      if (this.addresses[i].type === 'vykladka'){ // tak hladam jej baliky
        for (let j = 0; j < this.detail[i].townsArray.length; j++) {
          console.log(this.detail[this.detail[i].townsArray[i]]);
          // console.log(this.detail[this.detail[i].townsArray[this.detail[i].detailArray]]);
          if (this.detail[this.detail[i].townsArray[j]][this.detail[i].detailArray[j]]){

          }else{
            console.log('som nanasiel a mal by tom to vyrantat');
            this.detail[i].townsArray.splice(j, 1);
            this.detail[i].detailArray.splice(j, 1);
          }
        }
      }
    }
  }

  receiveDetailPosition(detailPositions){
    this.arrayOfDetailsPositions.push(detailPositions);
  }


  notifyChildren(routeId) {
    this.parentSubject.next(routeId);
  }

  openAddDialog() {
    if ((this.route.ponuknuteTo && this.route.ponuknuteTo === '') || this.route.forEveryone){
      return;
    }
    const dialogConfig = new MatDialogConfig();

    if (this.route.id == undefined){
      dialogConfig.data = {
        carId: this.carId,
        addresses: this.addresses,
        newRoute: true,
        packages: this.detail,
        route: this.route
      };
    }

    else if (this.route.id == null) {
      dialogConfig.data = {
        carId: this.carId,
        addresses: this.addresses,
        newRoute: true,
        packages: this.detail,
        route: this.route
      };
    }else{
      dialogConfig.data = {
        addresses: this.addresses,
        newRoute: false,
        packages: this.detail,
        route: this.route
      };
    }


    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else if (value.event === true) {
        this.getNewRoute(this.route.id);
      }
    });
  }

 async saveAddresses(){
    const addressesId: string[] = [];
    for (const oneAddres of this.addresses){
      if (oneAddres.id){
        addressesId.push(oneAddres.id);
      }else{
        const createdBy = this.dataService.getMyIdOrMaster();
        const idcko = await this.addressService.createAddressWithId({...oneAddres});
        addressesId.push(idcko);
      }
    }
    this.route.addresses = addressesId;
  }

  sendToAllDispecers(price){
    this.route.forEveryone = true;
    this.route.offerFrom = [];
    this.route.priceFrom = [];
    this.route.price = price;

    console.log(this.route);
    this.routeService.createRoute({...this.route});

  }


  openAddDialogChangeCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route: this.route,
      newRoute: false
    };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value);
      if (value === undefined){
        return;
      }else if (value.event == true) {
        console.log(value.carId);
        this.carId = value.carId;
        this.change = false;
      }
    });
  }

  // just update route
  sendToDriver(){

    const route = {
        // carId: this.carId,
        // createdBy: this.createdById,
        route: this.route,
        // createdAt: (Date.now()/1000)
      };
    console.log(route);
    this.routeService.updateRoute(route);
    this.change = false;
  }

  //  updateDetails(){
  //   var poleDetailov = [...this.arrayOfDetailsAbRoute];
  //   console.log(this.arrayOfDetailsAbRoute)
  //   var bar = new Promise((resolve, reject) => {
  //     poleDetailov.forEach((route, index) => {
  //       console.log(index);
  //       console.log(route)
  //       if (this.arrayOfDetailsAbRoute[index].id != undefined) {
  //         console.log("updatujem");
  //         this.detailAboutService.updateDetail(route, route.id)
  //       } else {
  //         console.log("mal by som vytvorit a pushnut do details");
  //         this.route.detailsAboutAdresses.splice(index, 0, "ric");
  //         this.detailAboutService.createDetail(route);
  //       }
  //     })
  //   });
  //   console.log(this.route.detailsAboutAdresses);
  //   bar.then(() => {
  //     this.sendToDriver();
  //   });
  // }


  checkFinished(){
    if (this.route !== undefined && this.route.finished){
      return false;
    }else if (this.route == undefined){
      return true;
    }else {
      return true;
    }
  }

  estimatedTimeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    return date.toLocaleString();
  }



  checkAllDetailsInserted(){
    this.detailAboutRoute.sizeV.forEach((oneSize, index) => {
      if (this.detailAboutRoute.sizeV[index] >= 0){
        if (this.detailAboutRoute.sizeS[index] >= 0){
          if (this.detailAboutRoute.sizeD[index] >= 0){
            if (this.detailAboutRoute.weight[index] >= 0){
              if (this.detailAboutRoute.sizeV[index] >= 0){

              }
            }
          }
        }
      }
    });
  }
  openOfferDialog() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(OfferPriceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.createRoute(value);
        this.router.navigate(['/view/offerRoute']);
        // this.saveAddresses().then(() => {
        //   this.sendToAllDispecers(value)
        // })
      }
    });
  }

  najdiVykladkuTovaru(townId, detailId){
    for (const [idTown, oneDetail] of this.detail.entries()) {
      if (oneDetail.townsArray !== undefined){
        for (const [idDetail, onePackage] of oneDetail.townsArray.entries()) {
          if (oneDetail.townsArray[idDetail] == townId && oneDetail.detailArray[idDetail] == detailId){
            return {idTown, idDetail};
          }
        }
      }
    }
  }

  async addPonuka(){

    const carItinerarAddresses: Address[] = [];
    for (const [idTown, oneDetail] of this.detail.entries()) {
      if (oneDetail.townsArray == undefined){
        for (const [idPackage, onePackage] of oneDetail.entries()) {
          const packageId = this.packageService.createPackageWithId(onePackage);

          this.addresses[idTown].packagesId.push(packageId);

          // carItinerarAddresses[idTown].packagesId.push(packageId);
          const adresaVykladky = this.najdiVykladkuTovaru(idTown, idPackage);
          this.addresses[adresaVykladky.idTown].packagesId.push(packageId);
        }
      }
    }

    const addressesId: string[] = [];
    const newAddresses: string[] = [];
    console.log(carItinerarAddresses);
    for (const [id, oneAddres] of this.addresses.entries()){
      if (oneAddres.id){
        addressesId.push(oneAddres.id);
      }else{
        const createdBy = this.dataService.getMyIdOrMaster();
        oneAddres.createdBy = createdBy;
        oneAddres.carId = null;


        const idcko = await this.addressService.createAddressWithId({...oneAddres});
        addressesId.push(idcko);
        newAddresses.push(idcko);
      }
    }



    this.route.addresses = addressesId;



    // vratit id novych adries a ulozit ich do routy + ulozit routu a je dokonane
  }

  createMyRoute(){
    this.spinner.show();
    this.addPonuka().then(() => {
      let route: Route;
      route = JSON.parse(JSON.stringify(this.route));
      route.createdAt = (new Date()).toString();
      route.carId = null;
      route.finished = false;
      route.forEveryone = false;
      route.createdBy = this.dataService.getMyIdOrMaster();
      route.offerFrom = [];
      route.priceFrom = [];
      this.routeService.createRoute(route).then(resolve => {
        this.getNewRoute(resolve);
        this.childDropList.setDragable(false);
      });
    });
  }

  getCar(id){

  }

  getNewRoute(idRouty){
    setTimeout(() => {
      this.route = this.routeService.getRoutesNoSub().find(oneRoute => oneRoute.id === idRouty);
      if (!this.route){
        setTimeout(() => {
          this.getNewRoute(idRouty);
          return;
        }, 200);
        }
      this.route.id = idRouty;
      this.carId = this.route.carId;
      this.addressService.address$.subscribe(alAdd => {

        let adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
        adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
        this.addresses = adresy;

        this.routeToDetail = {
          adresyVPonuke: this.addresses,
          detailVPonuke: this.detail
        };

        setTimeout(() =>
          {
            this.mainDetailAboutComponent.setRoute(this.routeToDetail);
          },
          300);

        this.spinner.hide();
      });
    }, 100);
  }

  changeToOffer(){

  }

  cancelFromCarDialog(){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(CancelRouteFromCarDialogComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        if (!this.car){
          this.car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
        }
        this.addresses.forEach(oneAddress => {
          if (this.car.aktualnyNaklad){
            this.car.aktualnyNaklad.filter(onePackageId => !oneAddress.packagesId.includes(onePackageId));
          }
          oneAddress.carId = null;
          this.addressService.updateAddress(oneAddress);
          this.car.itinerar = this.car.itinerar.filter(oneId => oneId !== oneAddress.id);
        });
        this.route.carId = null;
        this.routeService.updateRoute(this.route);
        this.carService.updateCar(this.car, this.car.id);
        this.getNewRoute(this.route.id);
      }
    });
  }

  createRoute(price){
    if (this.route.id){
      this.route.forEveryone = true;
      this.route.offerFrom = [];
      this.route.priceFrom = [];
      this.route.price = price;
      this.routeService.updateRoute(this.route);
    }else{
      this.addPonuka().then(() => {
        let route: Route;
        route = JSON.parse(JSON.stringify(this.route));
        route.createdAt = (new Date()).toString();
        route.carId = null;
        route.finished = false;
        route.forEveryone = true;
        route.createdBy = this.dataService.getMyIdOrMaster();
        route.offerFrom = [];
        route.priceFrom = [];
        route.price = price;
        const idNewRouty = this.routeService.createRoute(route);
      });
    }
  }

  ciMozemVylozitBednu(detail, indexMesta, indexBedne){
    const moznyPocetVylozenia = 0;
    const pocetnalozeni = 0;
    const nakladky = [];
    // if (this.labelPosition == 'nakladka'){
    //   // this.fakeArrayOfDetailsAbRoute
    //   for (let i = 0; i < this.fakeArrayOfDetailsAbRoute.length; i++) {
    //     for (let j = 0; j < this.fakeArrayOfDetailsAbRoute[i].sizeS; j++) {
    //       if (indexMesta != i && indexBedne != j){ // aby som nenasiel sam seba
    //         if (this.arrayOfDetailsAbRoute[indexMesta].sizeS[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeS[j]  &&
    //           this.arrayOfDetailsAbRoute[indexMesta].sizeD[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeD[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].sizeV[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeV[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].weight[indexBedne] ==  this.arrayOfDetailsAbRoute[i].weight[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].polohaNakladania[indexBedne] ==  this.arrayOfDetailsAbRoute[i].polohaNakladania[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].stohovatelnost[indexBedne] ==  this.arrayOfDetailsAbRoute[i].stohovatelnost[j]){
    //           if (this.route.type[i] == 'nakladka'){
    //             pocetnalozeni++;
    //             nakladky.push({mesto: i, bedna: j});
    //           }
    //           if (this.route.type[i] == 'vykladka'){
    //             moznyPocetVylozenia++;
    //           }
    //         }
    //       }
    //     }
    //   }
    //   if (moznyPocetVylozenia != 0){
    //     for (let j = 0; j < moznyPocetVylozenia; j++) {
    //       this.fakeArrayOfDetailsAbRoute[nakladky[0].mesto].vylozene
    //
    //     }
    //   }
    //
    // }

    return true;
  }

  openLog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      addresses: this.addresses,
      route: this.route,
    };
    dialogConfig.width = '70%';


    const dialogRef = this.dialog.open(LogDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }

  vylozeneVsetko(){
    if (this.addresses.length <= 0 || this.addresses == null){
      return true;
    }

      const vylozene = this.dataService.vsetkoVylozeneGet;
    if (this.dataService.actualDetailGet !== null){
        return true;
      }
      if (vylozene){
        return false;
      }else{
        return true;
      }


  }

  vylozeneBaliky(){
    const vylozene = this.dataService.vsetkoVylozeneGet;
    if (vylozene){
      return true;
    }else{
      return false;
    }
  }

  deleteAddress(address: Address){
    console.log(this.detail);
    console.log(this.addresses);
    const deleteIndexis = [];
    const indexOfTown = this.addresses.findIndex(oneAddress => oneAddress.nameOfTown === address.nameOfTown && oneAddress.type === address.type);
    if (address.type === 'nakladka'){ // ak to je nakladka tak musim vymazat aj s nou suvisiace vykladky
      for (let i = indexOfTown; i < this.detail.length; i++) {
        if (this.detail[i].townsArray){
          for (let balikIndex = 0; balikIndex < this.detail[i].townsArray.length; balikIndex++) {
            if (this.detail[i].townsArray[balikIndex] === indexOfTown){
              deleteIndexis.push(i);
            }
          }
        }

      }
    }
    deleteIndexis.slice().reverse().forEach(oneIndex => {
      this.addresses.splice(oneIndex, 1);
      this.detail.splice(oneIndex, 1);
    });

    this.addresses.splice(indexOfTown, 1);
    this.detail.splice(indexOfTown, 1);
    this.childDropList.setDetails(this.detail);
    this.childDropList.setAddresses(this.addresses);
    this.detailChild.setDetails(this.detail);
    this.setMapPoints();

    this.dataService.setDetailSource(this.detail);
    this.newFormChild.deletePackages();
  }

  openAllDetailDialog(){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      addresses: this.addresses,
    };
    const dialogRef = this.dialog.open(AllDetailAboutRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }
}

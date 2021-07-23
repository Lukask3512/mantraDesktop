import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../../../data/data.service";
import {take} from "rxjs/operators";
import Route from "../../../../models/Route";
import {OpenlayerComponent} from "../../../google/map/openlayer/openlayer.component";
import {OfferRouteService} from "../../../../services/offer-route.service";
import {CarService} from "../../../../services/car.service";
import DeatilAboutAdresses from "../../../../models/DeatilAboutAdresses";
import {DetailAboutRouteService} from "../../../../services/detail-about-route.service";
import {DragAndDropListComponent} from "../../drag-and-drop-list/drag-and-drop-list.component";
import {AddressService} from "../../../../services/address.service";
import Address from "../../../../models/Address";
import {PackageService} from "../../../../services/package.service";
import {PosliPonukuComponent} from './posli-ponuku/posli-ponuku.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {LogDialogComponent} from '../../../dialogs/log-dialog/log-dialog.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements AfterViewInit {

  constructor(private dataService: DataService, private offerService: OfferRouteService, private carService: CarService,
              private detailService: DetailAboutRouteService, private addressesService: AddressService,
              private packageService: PackageService, private dialog: MatDialog) { }
  route: Route;
  fakeRoute: Route;
  price: number;
  offer: number;
  arrayOfDetailsAbRoute: any[] =  [];
  address: Address[];
  detail: any[] = [];

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;
  //
  // @ViewChild(PosliPonukuComponent)
  // private posliPonuku: PosliPonukuComponent;

  ngAfterViewInit(): void {

    this.dataService.currentRoute.subscribe(route => {
      this.route = route;
      this.fakeRoute = JSON.parse(JSON.stringify(this.route));
      this.offerService.routes$.subscribe(routes => {
        this.route = routes.find(oneRoute => oneRoute.id == route.id);
        // this.getDetails();
        if (this.route === undefined){
          this.route = this.fakeRoute;
        }



        this.addressesService.offerAddresses$.subscribe(alAdd => {
          var adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
          adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
          this.address = adresy;
          this.address.forEach(oneAddress => {
            var myPackages = [];
            var detailAr = {detailArray: [], townsArray: [], packageId: []}
            oneAddress.packagesId.forEach( oneId => {
              if (oneAddress.type == 'nakladka'){
                var balik = this.packageService.getOnePackage(oneId);
                myPackages.push(balik)
              }else{
                //tu by som mal vlozit len indexy do vykladky
                this.detail.forEach((oneDetail, townId) => {
                  if (oneDetail.townsArray == undefined){
                    oneDetail.forEach((oneDetailId, packageId) => {
                      if (oneDetailId.id == oneId){
                        detailAr.detailArray.push(packageId);
                        detailAr.townsArray.push(townId);
                        detailAr.packageId.push(oneDetailId.id);
                      }
                    })
                  }
                })

              }
            })
            if (myPackages.length != 0){
              this.detail.push(myPackages);
            }else{
              this.detail.push(detailAr);
            }

          });
          console.log(this.detail)
          if (this.detail)
          this.childDropList.setDetails(this.detail);

        })


        if (this.route.offerFrom != undefined){
          this.route.offerFrom.forEach((offer, index) => {
            if (offer == this.getDispecerId()){
              this.offer = this.route.priceFrom[index];
            }
          })
        }
      });
      setTimeout(() =>
        {
          // this.posliPonuku.setRoute(this.route);
          this.child.notifyMe(this.address, null, null);

          if (this.childDropList){
            // this.getDetails();
          }
          // this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon, null, undefined)
        },
        800);
    })
    }

    createdBy(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        idCreated = this.dataService.getDispecer().id
      }else{
        idCreated = this.dataService.getDispecer().createdBy
      }
      console.log()
      if (this.route.createdBy !=  idCreated){
        return false;
      }else{
        return true;
      }
    }

    getDispecerId(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        return this.dataService.getDispecer().id
      }else{
        return this.dataService.getDispecer().createdBy
      }
    }

  getCarById(){
    return this.carService.getAllCars().find(oneCar => oneCar.id === this.route.offerInRoute);
  }

  sendCar(car){
    this.dataService.changRoute(car);
  }

  // async getDetails(){
  //   for (const route of this.route.detailsAboutAdresses){
  //     this.detailService.offerDetails$.subscribe(res => {
  //      var detail =  res.find(offerDetail => offerDetail.id == route)
  //
  //       // @ts-ignore
  //       var detailAboutAdd: DeatilAboutAdresses = detail;
  //
  //       this.arrayOfDetailsAbRoute.push(detailAboutAdd);
  //       if (this.arrayOfDetailsAbRoute.length == this.route.detailsAboutAdresses.length){
  //         this.childDropList.setDetails(this.arrayOfDetailsAbRoute);
  //         console.log(this.arrayOfDetailsAbRoute)
  //       }
  //     })
  //
  //
  //   }
  // }

  vymazatPonuku(){
    this.offerService.deleteRoute(this.route.id);
  }

  changeRouteOnMap(route: Route){
    var carId = route.carId;
    var car;
    this.carService.cars$.pipe(take(1)).subscribe(cars => {
      car = cars.find(car => car.id == carId);
    })
    setTimeout(() =>
      {
        // this.child.notifyMe(route.coordinatesOfTownsLat, route.coordinatesOfTownsLon, car, route)
      },
      800);
  }

    addPrice(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        idCreated = this.dataService.getDispecer().id
      }else{
        idCreated = this.dataService.getDispecer().createdBy
      }

      this.route.offerFrom.forEach((offer, index) => {
        if (offer == this.getDispecerId()){
          this.route.offerFrom.splice(index, 1);
          this.route.priceFrom.splice(index, 1);
        }
      });
      if (this.price == undefined){
        this.price = 0;
      }
       this.route.offerFrom.push(idCreated);
      this.route.priceFrom.push(this.price);
      this.price = undefined;
      this.offerService.updateRoute(this.route);
    }

  deleteMyPriceOffer(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      idCreated = this.dataService.getDispecer().id
    }else{
      idCreated = this.dataService.getDispecer().createdBy
    }

    this.route.offerFrom.forEach((offer, index) => {
      if (offer == this.getDispecerId()){
        this.route.offerFrom.splice(index, 1);
        this.route.priceFrom.splice(index, 1);
      }
    });
    this.price = undefined;
    this.offer = undefined;
    this.offerService.updateRoute(this.route);
  }

  confirm(){
    this.route.takenBy = this.getDispecerId();
    if (this.route.price == 0){ //ak cenu nenahodila spolocnost, cena sa nastavi podla prijatej ponuky
      this.route.price = this.offer;
    }
    this.route.forEveryone = false;
    this.offerService.updateRoute(this.route);
    this.fakeRoute = JSON.parse(JSON.stringify(this.route));
  }

  cancelOffer(){
    this.route.forEveryone = true;
    //tu skontrolujem komu to bolo zadane , a ak sa cena zhoduje s jeho znamena to ze cenu zmenim na 0;
    var indexVOffer = this.route.offerFrom.findIndex(element => element == this.route.ponuknuteTo);
    var ponukaZa = this.route.priceFrom[indexVOffer];
    if (ponukaZa == this.route.price){
      this.route.price = 0;
    }
    this.route.ponuknuteTo = '';
    this.route.takenBy = '';
    this.route.offerInRoute = '';
    this.offerService.updateRoute(this.route);
  }

  chooseCompany(id){
    console.log(id);
    this.route.ponuknuteTo = id;
    this.offerService.updateRoute(this.route);
  }

  vypocitajVahuPreMesto(infoMesto){
    var vahaVMeste = 0;
    infoMesto.weight.forEach(vaha => {
      vahaVMeste += vaha;
    });
    return vahaVMeste;
  }

  openLog(){
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      addresses: this.address,
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


}

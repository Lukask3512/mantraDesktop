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
import {UpdateOfferPriceComponent} from '../../../dialogs/update-offer-price/update-offer-price.component';
import {OfferPriceComponent} from '../../../dialogs/offer-price/offer-price.component';
import {AllDetailAboutRouteDialogComponent} from '../../../dialogs/all-detail-about-route-dialog/all-detail-about-route-dialog.component';
import {DeleteRouteComponent} from '../../../dialogs/delete-route/delete-route.component';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import Company from '../../../../models/Company';
import {CancelRouteFromCarDialogComponent} from '../../../dialogs/cancel-route-from-car-dialog/cancel-route-from-car-dialog.component';
import Cars from '../../../../models/Cars';
import {RouteService} from '../../../../services/route.service';
import {DispecerService} from '../../../../services/dispecer.service';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {CompanyDetailComponent} from '../../../dialogs/company-detail/company-detail.component';
import {MatPaginator} from '@angular/material/paginator';
import {NgxSpinnerService} from 'ngx-spinner';
import {MainDetailAboutComponent} from '../../main-detail-about/main-detail-about.component';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements AfterViewInit {


  displayedColumns: string[] = ['companiesFromChild[i].name', 'route.priceFrom[i]', 'potvrdit', 'zrusit'];
  constructor(private dataService: DataService, private offerService: OfferRouteService, private carService: CarService,
              private detailService: DetailAboutRouteService, private addressesService: AddressService,
              private packageService: PackageService, private dialog: MatDialog, private router: Router,
              private _snackBar: MatSnackBar, private routeService: RouteService, private dispecerService: DispecerService,
              private spinner: NgxSpinnerService, private translate: TranslateService) { }
  route: Route;
  fakeRoute: Route;
  price: number;
  offer: number;

  address: Address[];
  detail: any[] = [];

  companiesFromChild = [];

  ponuknuteSplocnosti: Company;

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;

  @ViewChild('detailAboutComponent')
  private mainDetailAbout: MainDetailAboutComponent;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  dataSource;
  ngAfterViewInit(): void {
    // this.spinner.show();
    setTimeout(() => { // pre exoressionchanged error...

      this.dataService.currentRoute.subscribe(route => {
        console.log('zacinam')
        this.route = route;
        console.log(route);
        this.fakeRoute = JSON.parse(JSON.stringify(this.route));
        this.offerService.routes$.subscribe(routes => {
          this.route = routes.find(oneRoute => oneRoute.id == route.id);
          // this.getDetails();
          if (this.route === undefined) {
            this.route = this.fakeRoute;
          }
          setTimeout(() => {
              this.dataSource = new MatTableDataSource(this.route.offerFrom);
              this.dataSource.paginator = this.paginator;
              setTimeout(() => {
                this.dataSource.sort = this.sort;

              }, 1000);
            }, 1000);


          this.addressesService.offerAddresses$.subscribe(alAdd => {
            var adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
            adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
            this.address = adresy;
            // this.childDropList.setAddresses(this.address);
            this.address.forEach(oneAddress => {
              var myPackages = [];
              var detailAr = {detailArray: [], townsArray: [], packageId: []};
              if (oneAddress){
                oneAddress.packagesId.forEach(oneId => {
                  if (oneAddress.type === 'nakladka') {
                    var balik = this.packageService.getOnePackage(oneId);
                    myPackages.push(balik);
                  } else {
                    //tu by som mal vlozit len indexy do vykladky
                    this.detail.forEach((oneDetail, townId) => {
                      if (oneDetail.townsArray === undefined) {
                        oneDetail.forEach((oneDetailId, packageId) => {
                          if (oneDetailId && oneDetailId.id === oneId) {
                            detailAr.detailArray.push(packageId);
                            detailAr.townsArray.push(townId);
                            detailAr.packageId.push(oneDetailId.id);
                          }
                        });
                      }
                    });

                  }
                });
              }

              if (myPackages.length !== 0) {
                this.detail.push(myPackages);
              } else {
                this.detail.push(detailAr);
              }

            });

            const routeToDetail = {
              adresyVPonuke: this.address,
              detailVPonuke: this.detail
            };

            setTimeout(() =>
              {
                this.mainDetailAbout.setRoute(routeToDetail);
              },
              300);


            if (this.detail[0]){
              this.childDropList.setDetails(this.detail);
              // this.setDetailInDetail();

            }
          });


          if (this.route.offerFrom != undefined) {
            this.route.offerFrom.forEach((offer, index) => {
              if (offer == this.getDispecerId()) {
                this.offer = this.route.priceFrom[index];
              }
            });
          }
        });
        setTimeout(() => {
            this.child.notifyMe(this.address, null);
            this.dataSource = new MatTableDataSource(this.route.offerFrom);
            this.dataSource.sort = this.sort;
          },
          800);
      });
    });
    }


    nechcemZrusitPonuku(){
      this.route.dontWannaCancel = true;
      this.routeService.updateRoute(this.route);
    }



  openCompanyDetail(company: Company){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      company,
    };
    const dialogRef = this.dialog.open(CompanyDetailComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {

    });

  }

  setDetailInDetail(){
    // console.log(this.detail[0].detailArray.length > 0);
    if (this.detail[0].detailArray && this.detail[0].detailArray.length > 0){
      const detailTo = {
        adresyVPonuke: this.address,
        detailVPonuke: this.detail
      };
      if (this.mainDetailAbout){
        this.mainDetailAbout.setRoute(detailTo);
      }
    }
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

  getCompanyOffer(company: Company){
    this.ponuknuteSplocnosti = company;
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
    let dialogConfig = new MatDialogConfig();


    const dialogRef = this.dialog.open(DeleteRouteComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else{
        this.offerService.deleteRoute(this.route.id);
        this.openSnackBar(this.translate.instant('POPUPS.ponukaBolaVymazana'), 'Ok');
        this.router.navigate(['/view/offerRoute']);
      }
    });

  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
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

  tryCancelOffer(){
    if (this.createdBy()){
      this.route.cancelByCreator = true;
    }else{
      this.route.cancelByDriver = true;
    }
    if (this.route.cancelByCreator && this.route.cancelByDriver){
      this.route.finished = true;
    }
    this.offerService.updateRoute(this.route);
  }

  tryCancelOfferCancel(){
    if (this.createdBy()){
      this.route.cancelByCreator = false;
    }else{
      this.route.cancelByDriver = false;
    }
    this.offerService.updateRoute(this.route);
  }

  isCancel(){
    if (this.route.cancelByDriver && this.route.cancelByCreator){
      return true;
    }else{
      return false;
    }
  }

  chooseCompany(id){
    console.log(id);
    this.route.ponuknuteTo = id;
    this.offerService.updateRoute(this.route);
  }

  // TODO
  deleteCompany(indexOfCompany){
    this.route.offerFrom.splice(indexOfCompany, 1);
    this.route.priceFrom.splice(indexOfCompany, 1);
    this.offerService.updateRoute(this.route);
  }

  vypocitajVahuPreMesto(infoMesto){
    var vahaVMeste = 0;
    infoMesto.weight.forEach(vaha => {
      vahaVMeste += vaha;
    });
    return vahaVMeste;
  }

  cancelFromCarDialog(){
    var car: Cars = this.getCarById();
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(CancelRouteFromCarDialogComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        if (!car){
          car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
        }
        this.address.forEach(oneAddress => {
          if (car.aktualnyNaklad){
            car.aktualnyNaklad.filter(onePackageId => !oneAddress.packagesId.includes(onePackageId));
          }
          oneAddress.carId = null;
          this.addressesService.updateAddress(oneAddress);
          car.itinerar = car.itinerar.filter(oneId => oneId !== oneAddress.id);
        });
        this.route.carId = null;
        this.route.offerInRoute = '';
        this.routeService.updateRoute(this.route);
        this.carService.updateCar(car, car.id);
        // this.getNewRoute(this.route.id);
      }
    });
  }

  upravCenuPonuky(){
    let dialogConfig = new MatDialogConfig();


    const dialogRef = this.dialog.open(OfferPriceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else{
        if (value !== this.route.price){
          this.route.price = value;
          this.dispecerService.getAllDispecersWithNoShowRoute(this.route.id).pipe(take(1)).subscribe(allDispecers => {
            allDispecers.forEach(oneDispecer => {
              oneDispecer.nezobrazovatPonuky = oneDispecer.nezobrazovatPonuky.filter(oneRouteId => oneRouteId !== this.route.id);
              this.dispecerService.updateDispecer(oneDispecer);
            });
          });
          this.routeService.updateRoute(this.route);
        }
      }
    });
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

  openAllDetailDialog(){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      addresses: this.address,
    };
    const dialogRef = this.dialog.open(AllDetailAboutRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }

  getCompaniesFromChild(company: Company){
    this.companiesFromChild.push(company);
  }

  getCompanyById(companyid: string): Company{
    return this.companiesFromChild.find(oneCompany => oneCompany.id === companyid);
  }


}

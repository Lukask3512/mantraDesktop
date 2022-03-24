import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../../data/data.service';
import {take} from 'rxjs/operators';
import Route from '../../../../models/Route';
import {OpenlayerComponent} from '../../../google/map/openlayer/openlayer.component';
import {OfferRouteService} from '../../../../services/offer-route.service';
import {CarService} from '../../../../services/car.service';
import DeatilAboutAdresses from '../../../../models/DeatilAboutAdresses';
import {DetailAboutRouteService} from '../../../../services/detail-about-route.service';
import {DragAndDropListComponent} from '../../drag-and-drop-list/drag-and-drop-list.component';
import {AddressService} from '../../../../services/address.service';
import Address from '../../../../models/Address';
import {PackageService} from '../../../../services/package.service';
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
import {Subscription} from 'rxjs';
import {ComapnyContantsDialogComponent} from '../../../dialogs/comapny-contants-dialog/comapny-contants-dialog.component';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements AfterViewInit, OnDestroy {


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

  currentRouteUns: Subscription;
  offerRoutesUns: Subscription;
  offerAddUns: Subscription;


  ngAfterViewInit(): void {
    // this.spinner.show();
    setTimeout(() => { // pre exoressionchanged error...

      this.currentRouteUns = this.dataService.currentRoute.subscribe(route => {
        this.detail = [];
        console.log('zacinam');
        this.route = route;
        if (!this.route){
          return;
        }
        console.log(route);
        this.fakeRoute = JSON.parse(JSON.stringify(this.route));
        this.offerRoutesUns = this.offerService.routes$.subscribe(routes => {
          if (routes){

          this.route = routes.find(oneRoute => oneRoute.id === route.id);
          this.skontrolovanaPonuka();
          if (this.route === undefined) {
            this.route = this.fakeRoute;
          }
          // setTimeout(() => {
          this.dataSource = new MatTableDataSource(this.route.offerFrom);
          this.dataSource.paginator = this.paginator;
              // setTimeout(() => {
          this.dataSource.sort = this.sort;

              // }, 1000);
            // }, 1000);


          this.offerAddUns = this.addressesService.offerAddresses$.subscribe(alAdd => {
            let adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
            adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
            this.address = adresy;
            // this.childDropList.setAddresses(this.address);
            this.address.forEach(oneAddress => {
              const myPackages = [];
              const detailAr = {detailArray: [], townsArray: [], packageId: []};
              if (oneAddress){
                oneAddress.packagesId.forEach(oneId => {
                  if (oneAddress.type === 'nakladka') {
                    const balik = this.packageService.getOnePackage(oneId);
                    myPackages.push(balik);
                  } else {
                    // tu by som mal vlozit len indexy do vykladky
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


          if (this.route.offerFrom !== undefined) {
            this.route.offerFrom.forEach((offer, index) => {
              if (offer === this.getDispecerId()) {
                this.offer = this.route.priceFrom[index];
              }
            });

          }
          }
        });

        setTimeout(() => {
            // this.child.notifyMe(this.address, null);
            this.dataSource = new MatTableDataSource(this.route.offerFrom);
            this.dataSource.sort = this.sort;
          },
          800);
      });
    });
    }

    setRoute(route: Route){

    }

    skontrolovanaPonuka(){
    if (this.route && this.route.id){
      const routeID = this.offerService.getSkontrolovanePonuky().find(route => route === this.route.id);
      if (!routeID && this.route){
        this.offerService.setSkontrolovanePonuky(this.route.id);
        console.log('zapisujem');
      }
    }
    }

    nechcemZrusitPonuku(){
      this.getCarIfNoInData().then(car => {
        let carFromDb = car;
        if (!carFromDb){
          // @ts-ignore
          carFromDb = {
            lattitude: null,
            longtitude: null
          };
        }
        this.route.dontWannaCancel = true;
        if (this.createdBy()){
          this.route.cancelByCreatorDate = new Date().toString();
          this.route.cancelByCreatorLat = carFromDb.lattitude;
          this.route.cancelByCreatorLon = carFromDb.longtitude;
        }else{
          this.route.cancelByDriverDate = new Date().toString();
          this.route.cancelByDriverLat = carFromDb.lattitude;
          this.route.cancelByDriverLon = carFromDb.longtitude;
        }
        this.routeService.updateRoute(this.route);
      });
    }


    getCarIfNoInData(){
      return new Promise<Cars>((resolve, reject) => {
        if (!this.route.carId){
          resolve(null);
        }
        const car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
        if (!car) {
          this.carService.getCar(this.route.carId).pipe(take(1)).subscribe(oneCar => {
            resolve(oneCar);
          });
        }else{
          resolve(car);
        }
      });
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

    createdBy(){
      let idCreated;
      if (this.dataService.getDispecer().createdBy === 'master'){
        idCreated = this.dataService.getDispecer().id;
      }else{
        idCreated = this.dataService.getDispecer().createdBy;
      }
      console.log();
      if (this.route.createdBy !==  idCreated){
        return false;
      }else{
        return true;
      }
    }

    getDispecerId(){
      if (this.dataService.getDispecer().createdBy === 'master'){
        return this.dataService.getDispecer().id;
      }else{
        return this.dataService.getDispecer().createdBy;
      }
    }

  getCarById(){
    return this.carService.getAllCars().find(oneCar => oneCar.id === this.route.offerInRoute);
  }

  sendCar(car){
    this.dataService.changRoute(car);
  }

  vymazatPonuku(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      deleteOffer: true
    };

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
    const carId = route.carId;
    let car;
    this.carService.cars$.pipe(take(1)).subscribe(cars => {
      car = cars.find(carF => carF.id === carId);
    });
  }

    addPrice(){
      let idCreated;
      if (this.dataService.getDispecer().createdBy === 'master'){
        idCreated = this.dataService.getDispecer().id;
      }else{
        idCreated = this.dataService.getDispecer().createdBy;
      }

      this.route.offerFrom.forEach((offer, index) => {
        if (offer === this.getDispecerId()){
          this.route.offerFrom.splice(index, 1);
          this.route.priceFrom.splice(index, 1);
        }
      });
      if (this.price === undefined){
        this.price = 0;
      }
      this.route.offerFrom.push(idCreated);
      this.route.priceFrom.push(this.price);
      this.price = undefined;
      this.offerService.updateRoute(this.route);
    }

  checkIfDisabled(){
    if (this.route.price === 0 && (!this.price || this.price < 1)){
      return true;
    }else{
      return false;
    }
  }

  deleteMyPriceOffer(){
    this.route.offerFrom.forEach((offer, index) => {
      if (offer === this.getDispecerId()){
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
    if (this.route.price === 0){ // ak cenu nenahodila spolocnost, cena sa nastavi podla prijatej ponuky
      this.route.price = this.offer;
    }
    this.route.forEveryone = false;
    this.route.finalAcceptDate = new Date().toString();
    this.offerService.updateRoute(this.route);
    this.fakeRoute = JSON.parse(JSON.stringify(this.route));
  }

  cancelOffer(){
    this.route.forEveryone = true;
    // tu skontrolujem komu to bolo zadane , a ak sa cena zhoduje s jeho znamena to ze cenu zmenim na 0;
    const indexVOffer = this.route.offerFrom.findIndex(element => element === this.route.ponuknuteTo);
    const ponukaZa = this.route.priceFrom[indexVOffer];
    if (ponukaZa === this.route.price){
      this.route.price = 0;
    }
    this.route.ponuknuteTo = '';
    this.route.takenBy = '';
    this.route.offerInRoute = '';
    this.offerService.updateRoute(this.route);
  }

  tryCancelOffer(){
    let car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
    if (!car && this.route.carId){
      // toto tu je pre zadavatela, on nema prisup k vozidlu, preto to auto musim natiahnut
      this.carService.getCar(this.route.carId).pipe(take(1)).subscribe(oneCar => {
        car = oneCar;
        car.id = this.route.carId;

        // tu zacina magia
        if (this.createdBy()){
          this.route.cancelByCreator = true;
          this.route.cancelByCreatorDate = new Date().toString();
          this.route.cancelByCreatorLat = car.lattitude;
          this.route.cancelByCreatorLon = car.longtitude;
        }else{
          this.route.cancelByDriver = true;
          this.route.cancelByDriverDate = new Date().toString();
          this.route.cancelByDriverLat = car.lattitude;
          this.route.cancelByDriverLon = car.longtitude;
        }

        if (this.route.cancelByCreator && this.route.cancelByDriver){
          this.route.finished = true;
          // toto tu je pre zadavatela, on nema prisup k vozidlu, preto to auto musim natiahnut
          this.odstranZVozidla(car, true);
          this.offerService.updateRoute(this.route);

        }else{
          this.offerService.updateRoute(this.route);
        }

      });
    }else{
      // tu zacina magia
      if (this.createdBy()){
        this.route.cancelByCreator = true;
        this.route.cancelByCreatorDate = new Date().toString();
        if (this.route.carId && car){
          this.route.cancelByCreatorLat = car.lattitude;
          this.route.cancelByCreatorLon = car.longtitude;
        }

      }else{
        this.route.cancelByDriver = true;
        this.route.cancelByDriverDate = new Date().toString();
        if (this.route.carId && car) {
          this.route.cancelByDriverLat = car.lattitude;
          this.route.cancelByDriverLon = car.longtitude;
        }
      }

      if (this.route.cancelByCreator && this.route.cancelByDriver){
        this.route.finished = true;
        // toto tu je pre zadavatela, on nema prisup k vozidlu, preto to auto musim natiahnut
        if (this.route.carId && car){
          this.odstranZVozidla(car, true);
        }
        this.offerService.updateRoute(this.route);

      }else{
        this.offerService.updateRoute(this.route);
      }
    }
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

  deleteCompany(indexOfCompany){
    this.route.offerFrom.splice(indexOfCompany, 1);
    this.route.priceFrom.splice(indexOfCompany, 1);
    this.offerService.updateRoute(this.route);
  }

  cancelFromCarDialog(){
    let car: Cars = this.getCarById();
    const dialogRef = this.dialog.open(CancelRouteFromCarDialogComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        if (!car){
          car = this.carService.getAllCars().find(oneCar => oneCar.id === this.route.carId);
        }
        this.odstranZVozidla(car, false);
      }
    });
  }

  odstranZVozidla(car: Cars, cancelOffer: boolean){
    this.address.forEach(oneAddress => {
      if (car.aktualnyNaklad){
        car.aktualnyNaklad.filter(onePackageId => !oneAddress.packagesId.includes(onePackageId));
      }
      oneAddress.carId = null;
      if (cancelOffer){
        oneAddress.status = 6;
      }
      this.addressesService.updateAddress(oneAddress);
      car.itinerar = car.itinerar.filter(oneId => oneId !== oneAddress.id);
    });
    this.route.carId = null;
    this.route.offerInRoute = '';
    this.routeService.updateRoute(this.route);
    this.carService.updateCar(car, car.id);
  }

  upravCenuPonuky(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      changePrice: true
    };


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
    const dialogConfig = new MatDialogConfig();
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

  getCompaniesFromChild(company: Company, elementIndex){
    if (elementIndex === 0){
      this.companiesFromChild = [];
    }
    this.companiesFromChild.push(company);
  }

  getCompanyById(companyid: string): Company{
    return this.companiesFromChild.find(oneCompany => oneCompany.id === companyid);
  }

  ngOnDestroy(): void {
    if (this.offerAddUns){
      this.offerAddUns.unsubscribe();
    }
    if (this.offerRoutesUns){
      this.offerRoutesUns.unsubscribe();
    }
    if (this.currentRouteUns){
      this.currentRouteUns.unsubscribe();
    }
  }

  openContats(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.route;
    const dialogRef = this.dialog.open(ComapnyContantsDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }


}

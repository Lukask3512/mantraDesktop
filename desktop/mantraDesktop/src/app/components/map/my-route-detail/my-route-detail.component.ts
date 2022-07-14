import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import Address from '../../../models/Address';
import {Subject} from 'rxjs';
import Cars from '../../../models/Cars';
import Route from '../../../models/Route';
import DeatilAboutAdresses from '../../../models/DeatilAboutAdresses';
import {DragAndDropListComponent} from '../../transportation/drag-and-drop-list/drag-and-drop-list.component';
import {OpenlayerComponent} from '../../google/map/openlayer/openlayer.component';
import {AdressesComponent} from '../../google/adresses/adresses.component';
import {NewFormComponent} from '../../transportation/new-transport/new-form/new-form.component';
import {ShowDetailComponent} from '../../transportation/new-transport/show-detail/show-detail.component';
import {MainDetailAboutComponent} from '../../transportation/main-detail-about/main-detail-about.component';
import {FormBuilder} from '@angular/forms';
import {RouteStatusService} from '../../../data/route-status.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DataService} from '../../../data/data.service';
import {RouteService} from '../../../services/route.service';
import {DetailAboutRouteService} from '../../../services/detail-about-route.service';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {AddressService} from '../../../services/address.service';
import {PackageService} from '../../../services/package.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgxSpinnerService} from 'ngx-spinner';
import {CarService} from '../../../services/car.service';
import {RouteToCarComponent} from '../../dialogs/route-to-car/route-to-car.component';
import {OfferPriceComponent} from '../../dialogs/offer-price/offer-price.component';
import {CancelRouteFromCarDialogComponent} from '../../dialogs/cancel-route-from-car-dialog/cancel-route-from-car-dialog.component';
import {LogDialogComponent} from '../../dialogs/log-dialog/log-dialog.component';
import {AllDetailAboutRouteDialogComponent} from '../../dialogs/all-detail-about-route-dialog/all-detail-about-route-dialog.component';
import {FindCarByIdComponent} from '../../cars/find-car-by-id/find-car-by-id.component';
import {CountOffersService} from '../count-offers.service';

@Component({
  selector: 'app-my-route-detail',
  templateUrl: './my-route-detail.component.html',
  styleUrls: ['./my-route-detail.component.scss']
})
export class MyRouteDetailComponent implements AfterViewInit, OnInit, OnDestroy {

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

  currentRouteUns;
  addressesUns;
  addressesUns2;

  @Input() showMapAndBoz = true;


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

  @ViewChild(FindCarByIdComponent)
  private findCarByIdComponent: FindCarByIdComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog,
              private dataService: DataService, private routeService: RouteService,
              private detailAboutService: DetailAboutRouteService, private countFreeSpace: CountFreeSpaceService,
              private addressService: AddressService, private packageService: PackageService,
              private router: Router, private _snackBar: MatSnackBar, private spinner: NgxSpinnerService,
              private carService: CarService, private countOfferService: CountOffersService) { }


  ngOnDestroy(): void {
    if (this.addressesUns){
      this.addressesUns.unsubscribe();
    }
    if (this.addressesUns2){
      this.addressesUns2.unsubscribe();
    }
    if (this.currentRouteUns){
      this.currentRouteUns.unsubscribe();
    }
  }


  ngOnInit() {
  }

  getDispecerId(){
    return this.dataService.getMyIdOrMaster();
  }

  getMyCompany(){
    return this.dataService.getLoggedInCompany().name;
  }

  ngAfterViewInit(): void {
    setTimeout(() => { // pre exoressionchanged error...
      const loggedDispecer = this.dataService.getDispecer();
      let dispecerId;
      if (loggedDispecer.createdBy === 'master'){
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
      this.currentRouteUns = this.dataService.currentRoute.subscribe(route => {
        console.log(route);
        if (route != null){
          // this.spinner.show();
          this.route = route;
          this.addressesUns = this.addressService.address$.subscribe(alAdd => {

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

            this.spinner.hide();


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
          this.findCarByIdComponent.setCar(this.carId);
          if (this.carId){
            this.car = this.carService.getAllCars().find(oneCar => oneCar.id === this.carId);
            setTimeout(() =>
              {

                this.notifyChildren(this.route.id);

              },
              800);
          }else{
            setTimeout(() =>
              {
                this.notifyChildren(this.route.id);


              },
              800);
          }


        }
      });
    });
  }



  setDetailForm(detail){
    this.newFormChild.setDetailFromBaliky(detail);
  }


  notifyChildren(routeId) {
    this.parentSubject.next(routeId);
  }

  openAddDialog() {
    if ((this.route.ponuknuteTo && this.route.ponuknuteTo === '') || this.route.forEveryone){
      return;
    }
    const dialogConfig = new MatDialogConfig();

    if (this.route.id === undefined){
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


  checkFinished(){
    if (this.route !== undefined && this.route.finished){
      return false;
    }else if (this.route === undefined){
      return true;
    }else {
      return true;
    }
  }

  estimatedTimeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    return date.toLocaleString();
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
          if (oneDetail.townsArray[idDetail] === townId && oneDetail.detailArray[idDetail] === detailId){
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
      this.findCarByIdComponent.setCar(this.carId);
      this.addressesUns2 = this.addressService.address$.subscribe(alAdd => {

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

  cancelFromCarDialog(){
    const routeToDetail = this.countOfferService.getRouteWithEverything(this.route);

    const dialogConfig = new MatDialogConfig();

    const dialogRef = this.dialog.open(CancelRouteFromCarDialogComponent);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        // je to upravene uz

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


  vylozeneBaliky(){
    const vylozene = this.dataService.vsetkoVylozeneGet;
    if (vylozene){
      return true;
    }else{
      return false;
    }
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
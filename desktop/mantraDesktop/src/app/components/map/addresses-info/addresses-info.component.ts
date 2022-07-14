import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AddressService} from '../../../services/address.service';
import {RouteStatusService} from '../../../data/route-status.service';
import {OfferRouteService} from '../../../services/offer-route.service';
import {PackageService} from '../../../services/package.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {DataService} from '../../../data/data.service';
import Address from '../../../models/Address';
import Route from '../../../models/Route';
import Cars from '../../../models/Cars';
import {CarService} from '../../../services/car.service';

@Component({
  selector: 'app-addresses-info',
  templateUrl: './addresses-info.component.html',
  styleUrls: ['./addresses-info.component.scss']
})
export class AddressesInfoComponent implements OnInit, OnDestroy {

  @Input() route: Route;
  @Input() carItinerar: string[];
  @Input() forCar = false;
  addresses: Address[];

  addressesUns;

  car: Cars;


  constructor(private addressService: AddressService, public routeStatusService: RouteStatusService,
              private offerService: OfferRouteService, private packageService: PackageService,
              private spinner: NgxSpinnerService, private dataService: DataService, private carService: CarService) { }

  ngOnInit(): void {
    this.getAddresses();
    this.getCar();
  }

  getAddresses(){
    this.addressesUns = this.addressService.address$.subscribe(alAdd => {
      let adresy;
      if (this.route){
        adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
        adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
      }else if (this.carItinerar.length > 0){
        adresy = alAdd.filter(jednaAdresa => this.carItinerar.includes(jednaAdresa.id));
        adresy = this.carItinerar.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
      }

      this.addresses = adresy;

    });
  }

  toDate(date){
    if (date === '0'){
      return 'Nerozhoduje';
    }
    const datum = new Date(date);
    return datum.getUTCDate();
  }

  getCar() {
    if (this.route && this.route.carId) {
      this.carService.cars$.subscribe(allCars => {
        this.car = allCars.find(oneCar => oneCar.id === this.route.carId);
      });
    }
  }


  chooseColor(status: number){
    if (status === 3){
      return 'green';
    }
    if (status === 4 || status === 5 || status === 6){
      return 'red';
    }
  }

  chooseColorForLine(status: number){
    if (status === 1){
      return 'green';
    }
  }

  chooseBorderDown(){
    if (!this.forCar){
      return 'townsWrapper';
    }
  }

  changeRoute(){
    this.dataService.changeRealRoute(this.route);
  }


  ngOnDestroy(): void {
    if (this.addressesUns){
      this.addressesUns.unsubscribe();
    }
  }

  getSpecial(){
    let whichSpecial: {
      adr: boolean,
      ruka: boolean,
      teplota: boolean,
    };
    this.addresses.forEach(oneAddress => {
      if (oneAddress){
        if (oneAddress.adr){
          whichSpecial.adr = true;
        }
        if (oneAddress.ruka){
          whichSpecial.ruka = true;
        }
        if (oneAddress.teplota){
          whichSpecial.teplota = true;
        }
      }
    });
    return whichSpecial;
  }

}

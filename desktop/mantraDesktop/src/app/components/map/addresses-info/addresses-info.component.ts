import {Component, Input, OnInit} from '@angular/core';
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
export class AddressesInfoComponent implements OnInit {

  @Input() route: Route;
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

      let adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
      adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); // ukladam ich do poradia
      this.addresses = adresy;

    });
  }

  toDate(date){
    const datum = new Date(date);
    return datum.getDate();
  }

  getCar(){
    this.car = this.carService.getOneCarById(this.route.carId);
    if (!this.car){
      setTimeout(() => {
        this.car = this.carService.getOneCarById(this.route.carId);
      }, 2000);
    }
  }

}

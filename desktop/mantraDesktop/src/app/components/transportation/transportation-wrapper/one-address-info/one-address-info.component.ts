import {Component, Input, OnInit} from '@angular/core';
import {AddressService} from "../../../../services/address.service";
import Address from "../../../../models/Address";
import {RouteStatusService} from "../../../../data/route-status.service";
import {OfferRouteService} from "../../../../services/offer-route.service";

@Component({
  selector: 'app-one-address-info',
  templateUrl: './one-address-info.component.html',
  styleUrls: ['./one-address-info.component.scss']
})
export class OneAddressInfoComponent implements OnInit {

  @Input() addressaId: string;
  address: Address;
  constructor(private addressService: AddressService, public routeStatusService: RouteStatusService,
              private offerService: OfferRouteService) { }

  ngOnInit(): void {
    this.addressService.address$.subscribe(allAddresses => {
     this.address = allAddresses.find(address => address.id == this.addressaId);
     if (!this.address){
       this.getOffersAdd();
     }

    });
  }
  getOffersAdd(){
    this.addressService.offerAddresses$.subscribe(addresses => {
      this.address = addresses.find(address => address.id == this.addressaId);
    })
  }

}

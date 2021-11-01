import {Component, Input, OnInit} from '@angular/core';
import {AddressService} from "../../../../services/address.service";
import Address from "../../../../models/Address";
import {RouteStatusService} from "../../../../data/route-status.service";
import {OfferRouteService} from "../../../../services/offer-route.service";
import {PackageService} from '../../../../services/package.service';

@Component({
  selector: 'app-one-address-info',
  templateUrl: './one-address-info.component.html',
  styleUrls: ['./one-address-info.component.scss']
})
export class OneAddressInfoComponent implements OnInit {

  @Input() addressaId: string;
  @Input() addressIndex: number;
  @Input() allAddressesIds: string[];
  allAddresses: Address[];
  address: Address;
  detail = [];
  alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  constructor(private addressService: AddressService, public routeStatusService: RouteStatusService,
              private offerService: OfferRouteService, private packageService: PackageService) { }

  ngOnInit(): void {
    this.addressService.address$.subscribe(allAddresses => {
     this.address = allAddresses.find(address => address.id == this.addressaId);
     if (!this.address){
       this.getOffersAdd();
     }else{
       this.allAddresses = allAddresses;
       this.getMyAddresses();
     }

    });
  }
  getOffersAdd(){
    this.addressService.offerAddresses$.subscribe(addresses => {
      this.address = addresses.find(address => address.id == this.addressaId);
      this.allAddresses = addresses;
      this.getMyAddresses();
    });
  }

  getMyAddresses(){
    if (this.allAddressesIds){
      const adresy = this.allAddresses.filter(jednaAdresa => this.allAddressesIds.includes(jednaAdresa.id));
      this.allAddresses = this.allAddressesIds.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia
      this.getDetailsAboutAllAddresses();
    }

  }


  getDetailsAboutAllAddresses(){
    // this.detail = [];
    this.allAddresses.forEach((oneAddress, indexAddress) => {
      var myPackages = [];
      var detailAr = {detailArray: [], townsArray: [], packageId: []};
      if (oneAddress){
        oneAddress.packagesId.forEach( oneId => {
          if (oneAddress.type === 'nakladka'){
            var balik = this.packageService.getOnePackage(oneId);
            myPackages.push(balik);
          }else{
            //tu by som mal vlozit len indexy do vykladky
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
          if (this.detail[indexAddress]){
            this.detail[indexAddress] = myPackages;
          }else{
            this.detail.push(myPackages);
          }
        }else{
          if (this.detail[indexAddress]){
            this.detail[indexAddress] = detailAr;
          }else{
            this.detail.push(detailAr);
          }
        }
      }


    });
  }

  getCountOfPackages(townIndex){
    return this.detail[townIndex].length;
  }

  // pre nakladky
  getBednaIndex(townIndex, detailIndex){
    let indexBedne = -1;
    for (let i = 0; i < townIndex; i++) {
      if (!this.detail[i].townsArray){ // len nakladky pocitam
        indexBedne += this.getCountOfPackages(i);
      }
    }
    indexBedne += detailIndex + 1;
    return this.alphabet[indexBedne];
  }

}

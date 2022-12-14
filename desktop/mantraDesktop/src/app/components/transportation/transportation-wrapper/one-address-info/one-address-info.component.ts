import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AddressService} from "../../../../services/address.service";
import Address from "../../../../models/Address";
import {RouteStatusService} from "../../../../data/route-status.service";
import {OfferRouteService} from "../../../../services/offer-route.service";
import {PackageService} from '../../../../services/package.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {DataService} from '../../../../data/data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-one-address-info',
  templateUrl: './one-address-info.component.html',
  styleUrls: ['./one-address-info.component.scss']
})
export class OneAddressInfoComponent implements OnInit, OnDestroy {

  @Input() addressaId: string;
  @Input() addressIndex: number;
  @Input() allAddressesIds: string[];
  allAddresses: Address[];
  address: Address;
  detail = [];

  subMyRoutes: Subscription;
  subOfferRoutes: Subscription;

  constructor(private addressService: AddressService, public routeStatusService: RouteStatusService,
              private offerService: OfferRouteService, private packageService: PackageService,
              private spinner: NgxSpinnerService, private dataService: DataService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.subMyRoutes = this.addressService.address$.subscribe(allAddresses => {
     this.address = allAddresses.find(address => address.id === this.addressaId);
     if (!this.address){
       this.getOffersAdd();
     }else{
       this.allAddresses = allAddresses;
       if (this.subOfferRoutes){
         this.subOfferRoutes.unsubscribe();
       }
       this.getMyAddresses();
     }

    });
  }
  getOffersAdd(){
    this.subOfferRoutes = this.addressService.offerAddresses$.subscribe(addresses => {
      if (!this.address){
        this.address = addresses.find(address => address.id === this.addressaId);
        this.allAddresses = addresses;
        this.getMyAddresses();
        if (this.address){
          if (this.subMyRoutes){
            this.subMyRoutes.unsubscribe();
          }
        }
      }
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
            if (!balik){
              setTimeout(() => {
                this.getDetailsAboutAllAddresses();
              }, 1000);
            }
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

      this.spinner.hide();
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
    return this.dataService.getLetter(indexBedne);
  }

  ngOnDestroy(): void {
    if (this.subMyRoutes){
      this.subMyRoutes.unsubscribe();
    }
    if (this.subOfferRoutes){
      this.subOfferRoutes.unsubscribe();
    }
  }

}

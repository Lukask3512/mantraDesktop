import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import Cars from "../../../../models/Cars";
import Address from "../../../../models/Address";
import {AddressService} from "../../../../services/address.service";
import {DataService} from "../../../../data/data.service";
import {CarService} from "../../../../services/car.service";
import {PackageService} from "../../../../services/package.service";
import {RouteService} from '../../../../services/route.service';

@Component({
  selector: 'app-route-to-itinerar',
  templateUrl: './route-to-itinerar.component.html',
  styleUrls: ['./route-to-itinerar.component.scss']
})
export class RouteToItinerarComponent implements OnInit {

  @Input() car: Cars;
  @Input() newRoute: Address[];
  @Input() newDetails;
  @Output() addressesId = new EventEmitter<string[]>();
  @Output() offerInCar = new EventEmitter<Cars>();
  newRouteCopy: Address[];
  carItinerarAddresses: Address[] = [];
  constructor(private addressService: AddressService, private dataService: DataService,
              private carService: CarService, private addressesService: AddressService, private packageService: PackageService,
              private routeService: RouteService) { }

  ngOnInit(): void {
    var adresy = this.addressService.getAddresses();// TODO toto treba majk check
    adresy = adresy.concat(this.addressService.getAddressesFromOffer());

    if (this.car){
      if (this.car.itinerar){
        this.car.itinerar.forEach(addId => {
          this.carItinerarAddresses.push(adresy.find(oneAddress => oneAddress.id === addId));
        });
      }else{
        this.car = {...this.car, itinerar: []}
        this.carItinerarAddresses = [];
      }
    }
    // console.log(this.newRoute)
    this.newRouteCopy = JSON.parse(JSON.stringify(this.newRoute));
  }

  // kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      for (const [index, detailElement] of detail.townsArray.entries()) {
        var mestoNakladky = detail.townsArray[index];
        // +1 lebo pred to som hodil novy item
        if (mestoNakladky + 1 > current){ // ak je mesto kde nakladam vyzsie ako aktualny index vykladky
          mozemPresunut = false;
        }
      }
    }else{ // a tu ked nakladku
      for (const [indexNakBalika, detailElement] of detail.entries()) {
        for (const [indexMesta, oneDetail] of this.newDetails.entries()) {
          if (oneDetail.townsArray){
            for (const [index, oneBalik] of oneDetail.townsArray.entries()) {
              if (oneDetail.townsArray[index] === previous && oneDetail.detailArray[index] === indexNakBalika){
                if (indexMesta - 1 < current){
                  mozemPresunut = false;
                }
              }
            }
          }
        }
      }
    }
    return mozemPresunut;
  }

  // ked presuvam z ponuky do itinerara
  najdiCiMozemPresunutDoItinerara(detail, previous, current, itinerar){
    let mozemPresunut = true;
    for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
      if (!itinerar){
        if (this.newRouteCopy[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.newRouteCopy[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }else{
        if (this.carItinerarAddresses[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.carItinerarAddresses[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }


    }
    return mozemPresunut;
  }

  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];

  drop(event: CdkDragDrop<Address[]>) {
    var presuvaciDetail;
    if (this.carItinerarAddresses[event.previousIndex].packagesId){
    }
    if (event.previousContainer === event.container) {
      var mozemPresunut
      if (event.previousContainer.id === 'all'){
        presuvaciDetail = this.newDetails[event.previousIndex];
        // tu kontrolujem ked presuvam len medzi novymi adresami
        mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
      }else{
        presuvaciDetail = this.carItinerarAddresses[event.previousIndex].packagesId;
        mozemPresunut = this.najdiCiMozemPresunutDoItinerara(presuvaciDetail, event.previousIndex, event.currentIndex, true);
      }
      if (mozemPresunut){
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
    } else {
      presuvaciDetail = this.newRouteCopy[event.previousIndex].packagesId;
      mozemPresunut = this.najdiCiMozemPresunutDoItinerara(presuvaciDetail, event.previousIndex, event.currentIndex, false);
      if (mozemPresunut){
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }

    }
  }

  setCar(car: Cars){
    this.car = car;
    this.newRouteCopy = JSON.parse(JSON.stringify(this.newRoute));
    this.setAddresses();
  }

  setAddresses(){
      this.addressesService.address$.subscribe(allAddresses => {
        var adresy = allAddresses.filter(jednaAdresa => this.car.itinerar.includes(jednaAdresa.id));
        adresy = this.car.itinerar.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia
        // this.newRouteCopy = JSON.parse(JSON.stringify(adresy));
        // this.newRoute = JSON.parse(JSON.stringify(adresy));

        this.carItinerarAddresses = adresy
      })

  }

  /** Predicate function that only allows even numbers to be dropped into a list. */
  evenPredicate(item: CdkDrag<number>) {
    return item.data % 2 === 0;
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }

  najdiVykladkuTovaru(townId, detailId){
    for (const [idTown, oneDetail] of this.newDetails.entries()) {
      if (oneDetail.townsArray !== undefined){
        for (const [idDetail, onePackage] of oneDetail.townsArray.entries()) {
          if (oneDetail.townsArray[idDetail] == townId && oneDetail.detailArray[idDetail] == detailId){
            return {idTown: idTown, idDetail: idDetail}
          }
        }
      }
    }
  }


  // TODO tu je problem , uklada sa novy package do povodnej adresy, idtown je 0 a nova adresa napr na 4 pozicii, takze novy package je v 0
  async addToItinerar(){
    let addressesId = [];
    this.carItinerarAddresses.forEach(oneAddress => {
      addressesId.push(oneAddress.id);
      oneAddress.carId = this.car.id;
      this.addressService.updateAddress(oneAddress);
    });
    this.car.itinerar = addressesId;
    console.log(this.carItinerarAddresses);
    this.carService.updateCar(this.car, this.car.id);
    this.addressesId.emit();
    // vratit id novych adries a ulozit ich do routy + ulozit routu a je dokonane
  }

  moveAll(){
    this.carItinerarAddresses = [...this.carItinerarAddresses, ...this.newRouteCopy];
    this.newRouteCopy = [];
  }
}

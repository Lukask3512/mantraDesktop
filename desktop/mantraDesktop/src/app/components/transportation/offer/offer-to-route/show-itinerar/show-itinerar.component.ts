import {Component, Input, OnInit} from '@angular/core';
import {AddressService} from "../../../../../services/address.service";
import Cars from "../../../../../models/Cars";
import Address from "../../../../../models/Address";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-show-itinerar',
  templateUrl: './show-itinerar.component.html',
  styleUrls: ['./show-itinerar.component.scss']
})
export class ShowItinerarComponent implements OnInit {

  @Input() car: Cars;
  addresses: Address[];
  constructor(private addressesService: AddressService) { }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<Address[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  setCar(car){
    this.car = car;
    this.setItinerar();
  }

//   this.addressesService.offerAddresses$.subscribe(alAdd => {
//   var adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
//   adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia
//   this.address = adresy;
// })
  setItinerar(){
    this.addressesService.address$.subscribe(allAddresses => {
      var adresy = allAddresses.filter(jednaAdresa => this.car.itinerar.includes(jednaAdresa.id));
      adresy = this.car.itinerar.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia
      this.addresses = adresy;
    })
  }

}

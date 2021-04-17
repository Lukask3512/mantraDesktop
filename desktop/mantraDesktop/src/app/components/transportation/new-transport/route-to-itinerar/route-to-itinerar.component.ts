import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import Cars from "../../../../models/Cars";
import Address from "../../../../models/Address";
import {AddressService} from "../../../../services/address.service";
import {DataService} from "../../../../data/data.service";
import {CarService} from "../../../../services/car.service";

@Component({
  selector: 'app-route-to-itinerar',
  templateUrl: './route-to-itinerar.component.html',
  styleUrls: ['./route-to-itinerar.component.scss']
})
export class RouteToItinerarComponent implements OnInit {

  @Input() car: Cars;
  @Input() newRoute: Address[];
  @Output() addressesId = new EventEmitter<string[]>();
  @Output() offerInCar = new EventEmitter<Cars>();
  newRouteCopy: Address[];
  carItinerarAddresses: Address[] = [];
  constructor(private addressService: AddressService, private dataService: DataService,
              private carService: CarService, private addressesService: AddressService) { }

  ngOnInit(): void {
    var adresy = this.addressService.getAddresses();

    if (this.car){
      if (this.car.itinerar){
        this.car.itinerar.forEach(addId => {
          this.carItinerarAddresses.push(adresy.find(oneAddress => oneAddress.id == addId));
        })
      }else{
        this.car = {...this.car, itinerar: []}
        this.carItinerarAddresses = [];
      }
    }
    // console.log(this.newRoute)
    this.newRouteCopy = JSON.parse(JSON.stringify(this.newRoute));
  }

  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];

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

  async addToItinerar(){
    var addressesId: string[] = [];
    var newAddresses: string[] = [];
    console.log(this.carItinerarAddresses);
    for (const oneAddres of this.carItinerarAddresses){
      if (oneAddres.id){
        addressesId.push(oneAddres.id);
      }else{
        var createdBy = this.dataService.getMyIdOrMaster();
        oneAddres.createdBy = createdBy;
        oneAddres.carId = this.car.id;
        const idcko = await this.addressService.createAddressWithId({...oneAddres});
        addressesId.push(idcko);
        newAddresses.push(idcko);
      }
    }
    this.car.itinerar = addressesId;
    this.carService.updateCar(this.car, this.car.id);
    console.log(addressesId);
    console.log(newAddresses);
    this.addressesId.emit(newAddresses);
    this.offerInCar.emit(this.car);
    //vratit id novych adries a ulozit ich do routy + ulozit routu a je dokonane
  }

  moveAll(){
    this.carItinerarAddresses = [...this.carItinerarAddresses, ...this.newRouteCopy];
    this.newRouteCopy = [];
  }
}

import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import Address from '../../../models/Address';
import Cars from '../../../models/Cars';
import {ItinerarDaDComponent} from '../../cars/car-detail/itinerar-da-d/itinerar-da-d.component';
import {CarService} from '../../../services/car.service';
import {RouteStatusService} from '../../../data/route-status.service';
import {AddressService} from '../../../services/address.service';
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-car-just-info',
  templateUrl: './car-just-info.component.html',
  styleUrls: ['./car-just-info.component.scss']
})
export class CarJustInfoComponent implements OnInit {
  closer;
  myAddresses: Address[];
  car: Cars;
  @Output() carEmitter = new EventEmitter<Cars>();


  constructor(private carsSerevice: CarService, public statusService: RouteStatusService, private addressesService: AddressService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.setCarId();
  }

  closePopUp(){
    this.carEmitter.emit(null);
    this.closer.blur();
  }

  getAddresses(){
    this.addressesService.address$.subscribe(allAddresses => {
      this.addressesService.offerAddresses$.subscribe(allOffers => {
        const allAddress = allAddresses.concat(allOffers);
        this.findMyAdresses(allAddress);
      });
    });
  }

  findMyAdresses(allAddresses){
    this.myAddresses = [];
    this.car.itinerar.forEach(oneAddresId => {
      this.myAddresses.push(allAddresses.find(oneAddress => oneAddress.id === oneAddresId));
    });
  }

  setCarId(){
    const carId = this.dataService.getCarId();
    this.carsSerevice.cars$.subscribe(allCars => {
      this.car = allCars.find(allCarsDb => allCarsDb.id === carId);
      this.getAddresses();
    });
  }

  toDateLastUpdateOfCar(datum){
    const date = new Date(datum);
    return date.toDateString() + ' ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
  }

}

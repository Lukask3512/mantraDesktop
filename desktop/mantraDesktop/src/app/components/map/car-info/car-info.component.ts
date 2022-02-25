import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import Cars from '../../../models/Cars';
import {CarService} from '../../../services/car.service';
import {RouteStatusService} from '../../../data/route-status.service';
import {DragAndDropListComponent} from '../../transportation/drag-and-drop-list/drag-and-drop-list.component';
import {ItinerarDaDComponent} from '../../cars/car-detail/itinerar-da-d/itinerar-da-d.component';
import {AddressService} from '../../../services/address.service';
import Address from '../../../models/Address';

@Component({
  selector: 'app-car-info',
  templateUrl: './car-info.component.html',
  styleUrls: ['./car-info.component.scss']
})
export class CarInfoComponent implements OnInit {
  closer;
  myAddresses: Address[];
  car: Cars;
  @Output() carEmitter = new EventEmitter<Cars>();
  @ViewChild('dragDrop')
  private dragComponent: ItinerarDaDComponent;

  constructor(private carsSerevice: CarService, public statusService: RouteStatusService, private addressesService: AddressService) { }

  ngOnInit(): void {
    this.closer = document.getElementById('popup-closer');
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

  setCarId(carId){
    console.log('setol som car')
    this.carsSerevice.cars$.subscribe(allCars => {
      this.car = allCars.find(allCarsDb => allCarsDb.id === carId);
      this.getAddresses();
    });
  }

}

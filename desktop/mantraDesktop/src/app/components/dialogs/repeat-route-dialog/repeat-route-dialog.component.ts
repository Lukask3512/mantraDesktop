import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Address from '../../../models/Address';
import Route from '../../../models/Route';
import {AddressService} from '../../../services/address.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {RouteService} from '../../../services/route.service';

@Component({
  selector: 'app-repeat-route-dialog',
  templateUrl: './repeat-route-dialog.component.html',
  styleUrls: ['./repeat-route-dialog.component.scss']
})
export class RepeatRouteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<RepeatRouteDialogComponent>,
              private addressService: AddressService, private routeService: RouteService,) { }

  addresses: Address[] = [];
  route: Route;

  datumPrichodu;
  casPrichodu;

  lastOpenExpansionPanelIndex = 0;

  dateRange = new FormGroup({
    timeGroup: new FormControl('nerozhoduje', Validators.required),
    dateGroup: new FormControl('nerozhoduje', Validators.required),

    startDate: new FormControl(),
    endDate: new FormControl(),
    timeFrom: new FormControl(),
    timeTo: new FormControl(),

  });

  minDate;

  ngOnInit(): void {
    this.minDate = new Date();
    if (this.data){
      this.route = this.data.route;
      this.getAddresses();
    }
  }

  getDatum(datum){
    if (datum === '0'){
      return false;
    }else{
      return true;
    }
  }

  getAddresses(){
    const adresy = this.addressService.getAddresses();
    console.log(adresy);
    console.log(this.route);
    this.route.addresses.forEach(oneAddressId => {
      this.addresses.push(adresy.find(jednaAdresa => jednaAdresa.id === oneAddressId));
    });
  }


  catchOpen(value, index){
    this.setValues(this.lastOpenExpansionPanelIndex);
    this.dateRange.reset();
    this.resetToDefault();
    this.getValues(index);
    this.lastOpenExpansionPanelIndex = index;
    console.log(this.addresses);
  }

  resetToDefault(){
    this.dateRange = new FormGroup({
      timeGroup: new FormControl('nerozhoduje', Validators.required),
      dateGroup: new FormControl('nerozhoduje', Validators.required),

      startDate: new FormControl(),
      endDate: new FormControl(),
      timeFrom: new FormControl(),
      timeTo: new FormControl(),

    });
  }

  toNormalDate(date){
    return new Date(date).toLocaleDateString();
  }

  setValues(index){
    if (this.dateRange.get('timeFrom').value){
      console.log('mam time')
      console.log(this.dateRange.get('timeFrom').value)
    }else{
      console.log('nemam time');
      console.log(this.dateRange.get('timeFrom').value)

    }
    if (this.dateRange.get('timeGroup').value === 'rozhoduje' && this.dateRange.get('timeFrom').value && this.dateRange.get('timeTo').value){
      this.addresses[index].casPrijazdu = this.dateRange.get('timeFrom').value;
      this.addresses[index].casLastPrijazdu = this.dateRange.get('timeTo').value;
    }else{
      this.addresses[index].casPrijazdu = '0';
      this.addresses[index].casLastPrijazdu = '0';
    }
    if (this.dateRange.get('dateGroup').value === 'rozhoduje' && this.dateRange.get('startDate').value && this.dateRange.get('endDate').value){
      this.addresses[index].datumPrijazdu = this.dateRange.get('startDate').value;
      this.addresses[index].datumLastPrijazdy = this.dateRange.get('endDate').value;
    }else{
      this.addresses[index].datumPrijazdu = '0';
      this.addresses[index].datumLastPrijazdy = '0';
    }
  }

  getValues(index){
    if (this.addresses[index].casPrijazdu !== '0'){
      this.dateRange.controls.timeGroup.setValue('rozhoduje');
      this.dateRange.controls.timeFrom.setValue(this.addresses[index].casPrijazdu);
      this.dateRange.controls.timeTo.setValue(this.addresses[index].casLastPrijazdu);
    }
    if (this.addresses[index].datumPrijazdu !== '0'){
      this.dateRange.controls.dateGroup.setValue('rozhoduje');
      this.dateRange.controls.startDate.setValue(this.addresses[index].datumPrijazdu);
      this.dateRange.controls.endDate.setValue(this.addresses[index].datumLastPrijazdy);
    }
  }

  async createNewAddresses(){
    const addressesId = [];
    for (const [id, oneAddres] of this.addresses.entries()){
      oneAddres.id = null;
      oneAddres.estimatedTimeArrival = null;
      oneAddres.status = -1;
      oneAddres.carId = null;
      delete oneAddres.id;
      const idcko = await this.addressService.createAddressWithId({...oneAddres});
      addressesId.push(idcko);
    }
    this.route.addresses = addressesId;
  }

  createNewRoute(){
    this.createNewAddresses().then(() => {
      var route: Route;
      route = JSON.parse(JSON.stringify(this.route));
      route.createdAt = (new Date()).toString();
      delete route.id;
      route.carId = null;
      route.finished = false;
      route.forEveryone = false;
      route.offerFrom = [];
      route.priceFrom = [];
      route.takenBy = '';
      route.price = null;
      route.finishedAt = null;
      route.ponuknuteTo = '';
      route.offerInRoute = '';

      console.log(route);
      this.routeService.createRoute(route).then(resolve => {
        this.dialogRef.close();
      });
    });
  }

}

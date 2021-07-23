import {Component, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import Address from '../../../../models/Address';
import DeatilAboutAdresses from '../../../../models/DeatilAboutAdresses';
import {AdressesComponent} from '../../../google/adresses/adresses.component';
import {DetailFormComponent} from '../detail-form/detail-form.component';
import {DataService} from '../../../../data/data.service';


@Component({
  selector: 'app-new-form',
  templateUrl: './new-form.component.html',
  styleUrls: ['./new-form.component.scss']
})
export class NewFormComponent implements OnInit {
  address: Address = new Address();
  labelPosition: 'nakladka' | 'vykladka';

  casPrichodu: 'rozhoduje' | 'nerozhoduje' | '';
  datumPrichodu: 'rozhoduje' | 'nerozhoduje'| '';

  transportForm = this.fb.group({
    sizeD: ['', Validators.required],
    sizeV: ['', Validators.required],
    sizeS: ['', Validators.required],
    weight: ['', Validators.required],
    poziciaNakladania: ['nerozhoduje'], // 0 nerozhoduje, 1 rozhoduje
    vyskaHrany: ['nerozhoduje', Validators.required],
    vyskaHranySize: [''],
    stohovatelnost: ['nie', Validators.required],
    stohoSize: [0],

    zoZadu: false,
    zBoku: false,
    zVrchu: false,

    fromBackSide: [false],
    fromSide: [false],
    fromUpSide: [false],
  });

  detailsArray: DeatilAboutAdresses[] = [];

  dateRange = new FormGroup({
    startDate: new FormControl(Validators.required),
    endDate: new FormControl(Validators.required),
    timeFrom: new FormControl(Validators.required),
    timeTo: new FormControl(Validators.required),
    obsluznyCas: new FormControl(1, Validators.required),
  });

  specForm = this.fb.group({
    potrebnaTeplota: null,
    teplota: false,
    ruka: false,
    adr: false,
  });

  numberOfItems = 1;
  actualItemInForm = 0;
  infoAboutRoute = '';

  latFromGoogle;
  lonFromGoogle;
  routeFromGoogle;

  addressIndexUpdate: number;

  @ViewChild('childGoogle')
  private childGoogle: AdressesComponent;

  minDate;

  townIndex: number[] = [];
  detailIndex: number[] = [];
  actualTownIndex: number;
  actualDetailIndex: number;

  @Output() adressOut = new EventEmitter<Address>();
  @Output() detailOut = new EventEmitter<any>();
  @Output() detailPositionOut = new EventEmitter<any>();
  @Output() adressOutUpdate = new EventEmitter<any>();
  constructor(private fb: FormBuilder, private dataService: DataService) { }

  ngOnInit(): void {
    this.transportForm.disable();
    this.minDate = new Date();
  }

  upravBednu(){
    const x = this.transportForm.get('sizeS').value;
    const y = this.transportForm.get('sizeV').value;
    const z = this.transportForm.get('sizeD').value;
    // @ts-ignore
    document.getElementById('mojaABedna').setAttribute('scale', {x, y, z});
  }

  upravSipku(){
    const x = this.transportForm.get('weight').value / 5;
    const y = 1;
    const z = 1;
    // @ts-ignore
    document.getElementById('mojaSipka').object3D.scale.set(y, x, z);
    document.getElementById('vahaText').setAttribute('value', this.transportForm.get('weight').value + 't');
  }

  // ci mozem pridat dalsiu adresu
  checkIfCanAddNextAdress(update: boolean){
    if (this.addressIndexUpdate){
      if (!update) {
      return true;
      }
    }
    if (this.datumPrichodu !== 'rozhoduje' && this.datumPrichodu !== 'nerozhoduje'){
      return true;
    }
    if (this.casPrichodu !== 'rozhoduje' && this.casPrichodu !== 'nerozhoduje'){
      return true;
    }
    if (this.labelPosition == 'nakladka') {

      if (this.detailsArray != undefined) {
        if (this.transportForm.valid && this.detailsArray.length == this.numberOfItems && this.labelPosition) {
          return false;
        } else if (this.transportForm.valid && this.actualItemInForm + 1 == this.numberOfItems && this.labelPosition) { // ak som na poslednom
          return false;
        } else {
          return true;
        }
      } else if (this.transportForm.valid && this.numberOfItems == 1 && this.labelPosition) {
        return false;
      }else{
        return true;
      }

    }else if (this.labelPosition == 'vykladka'){
      if (this.detailsArray != undefined  && this.transportForm.get('sizeS').value > 0 &&
        (this.detailsArray.length == this.numberOfItems || this.actualItemInForm + 1 == this.numberOfItems)){
        return false;
      }
      else if (this.detailsArray == undefined && this.transportForm.get('sizeS').value > 0 && this.numberOfItems == 1){
        return false;
      }else{
        return true;
      }
    }

    else{
      return true;
    }

  }

  // odosielam index a adresu updatnutu
  updateAddress(){
    console.log(this.addressIndexUpdate - 1);
    this.adressOutUpdate.emit({...{adresa: this.address}, ...{index: this.addressIndexUpdate - 1}});
    this.addressIndexUpdate = undefined;
    this.resetFormToDefault(false);
  }

  formUpdate(){
    if (this.labelPosition == 'vykladka'){
      this.transportForm.disable();
    }else{
      this.transportForm.enable();
    }
  }

  getAdress(adress){
    // this.status.push(-1);
    // this.routesTowns.push(adress);
    this.routeFromGoogle = adress;
    this.addressIndexUpdate = undefined;
    this.detailsArray = [];

  }
  getLat(lat){
    // this.routesLat.push(lat);
    this.latFromGoogle = lat;
    this.resetFormToDefault(true);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getLon(lon){
    this.lonFromGoogle = lon;
    // this.routesLon.push(lon);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }





  // ci mozem pridat dalsiu adresu
  // checkIfCanAddNextAdress(){
  //   if (this.datumPrichodu !== 'rozhoduje' && this.datumPrichodu !== 'nerozhoduje'){
  //     return true
  //   }
  //   if (this.casPrichodu !== 'rozhoduje' && this.casPrichodu !== 'nerozhoduje'){
  //     return true;
  //   }
  //   if (this.labelPosition == 'nakladka') {
  //
  //     if (this.address.sizeS != undefined) {
  //       if (this.transportForm.valid && this.address.sizeS.length == this.numberOfItems && this.labelPosition) {
  //         return false;
  //       } else if (this.transportForm.valid && this.actualItemInForm + 1 == this.numberOfItems && this.labelPosition) { // ak som na poslednom
  //         return false;
  //       } else {
  //         return true;
  //       }
  //     } else if (this.transportForm.valid && this.numberOfItems == 1 && this.labelPosition) {
  //       return false;
  //     }else{
  //       return true;
  //     }
  //
  //   }else if (this.labelPosition == 'vykladka'){
  //     if (this.address.sizeS != undefined  && this.transportForm.get('sizeS').value > 0 &&
  //       (this.address.sizeS.length == this.numberOfItems || this.actualItemInForm +1 == this.numberOfItems)){
  //       return false;
  //     }
  //     else if (this.address.sizeS == undefined && this.transportForm.get('sizeS').value > 0 && this.numberOfItems == 1){
  //       return false;
  //     }else{
  //       return true;
  //     }
  //   }
  //
  //   else{
  //     return true;
  //   }
  //
  // }



  checkFinished(){
    return true;
  }

  add(){
    if (this.casPrichodu === 'nerozhoduje'){
      this.address.casPrijazdu = '0' ;
      this.address.casLastPrijazdu = '0';
    }else{
      this.address.casPrijazdu = this.dateRange.get('timeFrom').value;
      this.address.casLastPrijazdu = this.dateRange.get('timeTo').value;
    }

    if (this.datumPrichodu === 'nerozhoduje'){
      this.address.datumPrijazdu = '0';
      this.address.datumLastPrijazdy = '0';
    }else{
      this.address.datumPrijazdu = this.dateRange.get('startDate').value.toString();
      this.address.datumLastPrijazdy = this.dateRange.get('endDate').value.toString();
    }

    if (this.labelPosition === 'nakladka'){
      this.pushItemsToArray(0, this.actualItemInForm);
    }else{
      if (!this.detailIndex[this.actualTownIndex]){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);
      }else {
        this.townIndex[this.actualItemInForm] = this.actualTownIndex;
        this.detailIndex[this.actualItemInForm] = this.actualDetailIndex;
      }
    }




    this.address.obsluznyCas = this.dateRange.get('obsluznyCas').value.toString();
    if (this.specForm.get('teplota').value === true){
      this.address.teplota = this.specForm.get('potrebnaTeplota').value;
    }else{
      this.address.teplota = null;
    }

    this.address.adr = this.specForm.get('adr').value;
    this.address.ruka = this.specForm.get('ruka').value;


    this.address.nameOfTown = this.routeFromGoogle;
    this.address.coordinatesOfTownsLon = this.lonFromGoogle;
    this.address.coordinatesOfTownsLat = this.latFromGoogle;
    this.address.type = this.labelPosition;
    this.address.aboutRoute = this.infoAboutRoute;
    this.infoAboutRoute = '';
    this.address.status = -1;

    this.adressOut.emit(this.address);
    if (this.labelPosition == 'nakladka'){
      this.detailOut.emit(this.detailsArray);
      this.detailPositionOut.emit(null);
    }else{
      // this.detailPositionOut.emit({townsArray: this.townIndex, detailArray: this.detailIndex});
      this.detailOut.emit({townsArray: this.townIndex, detailArray: this.detailIndex});
    }

    console.log(this.address);
    this.address = new Address();
    this.detailsArray = [];
    this.townIndex = [];
    this.detailIndex = [];
    this.childGoogle.resetGoogle();
    this.labelPosition = undefined;


    // this.transportForm.reset();
    this.numberOfItems = 1;
    this.actualItemInForm = 0;
    this.resetFormToDefault(true);
    this.dateRange.reset();
    this.specForm.reset();


    this.routeFromGoogle = null;
    this.latFromGoogle = null;
    this.lonFromGoogle = null;

  }

  updateDetailOnTown(){
    if (this.address.type == 'nakladka'){
      this.labelPosition = 'nakladka';
    }else {
      this.labelPosition = 'vykladka';
    }
    if (this.address.datumPrijazdu != '0'){
      this.datumPrichodu = 'rozhoduje';

      this.dateRange.controls.startDate.setValue(new Date(this.address.datumPrijazdu));
      this.dateRange.controls.endDate.setValue(new Date(this.address.datumLastPrijazdy));
    }else{
      this.datumPrichodu = 'nerozhoduje';
    }

    if (this.address.casPrijazdu != '0'){
      this.casPrichodu = 'rozhoduje';
      this.dateRange.controls.timeFrom.setValue(this.address.casPrijazdu);
      this.dateRange.controls.timeTo.setValue(this.address.casLastPrijazdu);
    }else{
      this.casPrichodu = 'nerozhoduje';
    }

    this.dateRange.controls.obsluznyCas.setValue(this.address.obsluznyCas);





    // this.transportForm.updateValueAndValidity();
  }

  setActualDetailInTown(){
    this.dataService.setActualDetailsInAddress({town: this.townIndex, detail: this.detailIndex});
  }

  pushItemsToArray(indexOfAddresses, indexOfPackage){
    if (!this.detailsArray[indexOfPackage]){
      this.detailsArray.push(this.getDetail());
    }else {
      this.detailsArray[indexOfPackage] = this.getDetail();
    }
    console.log(this.detailsArray);
    console.log(indexOfPackage);
    // if (this.address.sizeV == undefined){
    //   this.address.sizeV = this.getDetail().sizeV;
    //   this.address.sizeD = this.getDetail().sizeD;
    //   this.address.sizeS = this.getDetail().sizeS;
    //   this.address.stohovatelnost = this.getDetail().stohovatelnost;
    //   this.address.vyskaNaklHrany = this.getDetail().vyskaNaklHrany;
    //   this.address.polohaNakladania = this.getDetail().polohaNakladania;
    //   this.address.weight = this.getDetail().weight;
    // }else{
    //   if (this.address.stohovatelnost[indexOfPackage] == undefined){
    //
    //     this.address.stohovatelnost.push(this.getDetail().stohovatelnost[0]);
    //     this.address.weight.push(this.getDetail().weight[0]);
    //     this.address.polohaNakladania.push(this.getDetail().polohaNakladania[0]);
    //     this.address.sizeD.push(this.getDetail().sizeD[0]);
    //     this.address.sizeS.push(this.getDetail().sizeS[0]);
    //     this.address.sizeV.push(this.getDetail().sizeV[0]);
    //     this.address.vyskaNaklHrany.push(this.getDetail().vyskaNaklHrany[0]);
    //   }else{
    //     this.address.stohovatelnost[indexOfPackage] = this.getDetail().stohovatelnost[0];
    //     this.address.weight[indexOfPackage] = this.getDetail().weight[0];
    //
    //     if (this.transportForm.get('poziciaNakladania').value == 'nerozhoduje') {
    //       this.transportForm.controls['fromBackSide'].setValue(undefined);
    //       this.transportForm.controls['fromSide'].setValue(undefined);
    //       this.transportForm.controls['fromUpSide'].setValue(undefined);
    //       this.address.polohaNakladania[indexOfPackage] = "000";
    //     }else{
    //       this.address.polohaNakladania[indexOfPackage] = this.getDetail().polohaNakladania[0];
    //     }
    //
    //     this.address.sizeD[indexOfPackage] = this.getDetail().sizeD[0];
    //     this.address.sizeS[indexOfPackage] = this.getDetail().sizeS[0];
    //     this.address.sizeV[indexOfPackage] = this.getDetail().sizeV[0];
    //     this.address.vyskaNaklHrany[indexOfPackage] = this.getDetail().vyskaNaklHrany[0];
    //   }
    //
    // }

  }

  getDetail(): DeatilAboutAdresses{
    let stohovatelnost = this.transportForm.get('stohovatelnost').value;
    if (stohovatelnost == 'nie'){
      stohovatelnost = 0;
    }else{
      stohovatelnost = this.transportForm.get('stohoSize').value;
    }
    let vyskaNakHrany;
    if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
      vyskaNakHrany = this.transportForm.get('vyskaHranySize').value;
    }else{
      vyskaNakHrany = -1;
    }


    let back = '0';
    let side = '0';
    let upside = '0';
    if (this.transportForm.get('fromBackSide').value){
      back = '1';
    }
    if (this.transportForm.get('fromSide').value){
      side = '1';
    }
    if (this.transportForm.get('fromUpSide').value){
      upside = '1';
    }

    let polohaNakladania =  back + side + upside;

    return{
      polohaNakladania,
      sizeD: this.transportForm.get('sizeD').value,
      sizeS: this.transportForm.get('sizeS').value,
      sizeV: this.transportForm.get('sizeV').value,
      // specRezim: this.transportForm.get(''),
      stohovatelnost,
      vyskaNaklHrany: vyskaNakHrany,
      weight: this.transportForm.get('weight').value

    };

  }

  nextItem(){
    if (this.labelPosition === 'nakladka'){

        if (this.detailsArray === undefined){
          this.pushItemsToArray(0, this.actualItemInForm);
          this.resetFormToDefault(false);

        }
        else if (this.detailsArray[this.actualItemInForm] == undefined){
          this.pushItemsToArray(0, this.actualItemInForm);

          // this.oneDetailAboutRoute.stohovatelnost.push()
          this.resetFormToDefault(false);
        }
        else if (this.actualItemInForm == this.detailsArray.length){
          this.pushItemsToArray(0, this.actualItemInForm);

          // this.oneDetailAboutRoute.stohovatelnost.push()
          this.resetFormToDefault(false);

        }

        else{
          this.pushItemsToArray(0, this.actualItemInForm);
          this.resetFormToDefault(false);
          this.assignToDetail(0, this.actualItemInForm + 1, null);
        }

    }else if (this.labelPosition == 'vykladka'){
      if (this.townIndex.length == this.actualItemInForm + 1){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);
        this.resetFormToDefault(false);

      }else if (this.townIndex[this.actualItemInForm] == undefined){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);

        // this.oneDetailAboutRoute.stohovatelnost.push()
        this.resetFormToDefault(false);
      }

      else{
        this.townIndex[this.actualItemInForm] = this.actualTownIndex;
        this.detailIndex[this.actualItemInForm] = this.actualDetailIndex;
        // tu by som mal dat daco ine asik
        console.log(this.townIndex[this.actualItemInForm + 1]);
        console.log(this.detailIndex[this.actualItemInForm + 1]);
        let detail = this.getDetailByIds(this.townIndex[this.actualItemInForm + 1], this.detailIndex[this.actualItemInForm + 1]);
        this.assignToDetail(0, this.actualItemInForm + 1, detail);
      }
    }

    this.actualTownIndex = this.townIndex[this.actualItemInForm + 1];
    this.actualDetailIndex = this.detailIndex[this.actualItemInForm + 1];
    this.actualItemInForm ++;
    this.setActualDetailInTown();

  }

  previousItem(){
    if (this.labelPosition == 'nakladka') {

      if (this.actualItemInForm == this.detailsArray.length) {
        this.pushItemsToArray(0, this.actualItemInForm);
        this.resetFormToDefault(false);
      } else {
        this.pushItemsToArray(0, this.actualItemInForm);
      }
      this.assignToDetail(0, this.actualItemInForm - 1, null);

    }else if (this.labelPosition == 'vykladka'){
      if (this.townIndex.length == this.actualItemInForm + 1){
        // this.townIndex.push(this.actualTownIndex);
        // this.detailIndex.push(this.actualDetailIndex);
        this.townIndex[this.actualItemInForm] = this.actualTownIndex; // musim si updatnut ked na nic nekliknem a chodim hore dole
        this.detailIndex[this.actualItemInForm] = this.actualDetailIndex;
      }else if (this.townIndex[this.actualItemInForm] == undefined){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);
      }
      else{
        this.townIndex[this.actualItemInForm] = this.actualTownIndex;
        this.detailIndex[this.actualItemInForm] = this.actualDetailIndex;
      }
      let detail = this.getDetailByIds(this.townIndex[this.actualItemInForm - 1], this.detailIndex[this.actualItemInForm - 1]);
      this.assignToDetail(0, this.actualItemInForm - 1, detail);

    }
    this.actualTownIndex = this.townIndex[this.actualItemInForm - 1];
    this.actualDetailIndex = this.detailIndex[this.actualItemInForm - 1];
    this.actualItemInForm--;
    this.setActualDetailInTown();

  }

  getDetailByIds(townId, detailId){
    console.log(this.dataService.getDetails()[townId][detailId]);
    return this.dataService.getDetails()[townId][detailId];
  }

  // ked sa nahodov zmensi pole, ale by som ho pohol opopovat
  sizeUpdate(){
    // if (this.address.sizeV != undefined){
    //   if (this.numberOfItems <= this.address.sizeV.length +1){
    //     this.actualItemInForm = this.numberOfItems -1;
    //     this.address.sizeV = this.address.sizeV.slice(0, this.numberOfItems -1);
    //     this.address.sizeS = this.address.sizeS.slice(0, this.numberOfItems -1)
    //     this.address.sizeD = this.address.sizeD.slice(0, this.numberOfItems -1)
    //     this.address.weight = this.address.weight.slice(0, this.numberOfItems -1)
    //     this.address.vyskaNaklHrany = this.address.vyskaNaklHrany.slice(0, this.numberOfItems -1)
    //     this.address.polohaNakladania = this.address.polohaNakladania.slice(0, this.numberOfItems -1)
    //     this.address.stohovatelnost = this.address.stohovatelnost.slice(0, this.numberOfItems -1)
    //
    //   }
    // }

  }

  updateFormPosition(){

    if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
      this.transportForm.get('fromBackSide').clearValidators();
    }else{
      if (!this.transportForm.get('fromBackSide').value || !this.transportForm.get('fromSide').value || !this.transportForm.get('fromUpSide').value) {
        this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
      }
    }
    this.transportForm.get('fromBackSide').updateValueAndValidity();
  }

  updateMatLabelForm(){
    if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
      if (!this.transportForm.get('fromBackSide').value && !this.transportForm.get('fromSide').value && !this.transportForm.get('fromUpSide').value){
        this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
      }else{
        this.transportForm.get('fromBackSide').clearValidators();
      }
    }else{
      this.transportForm.get('fromBackSide').clearValidators();

    }
    this.transportForm.get('fromBackSide').updateValueAndValidity();
  }

  updateValidFormHrana(){
    if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
      this.transportForm.get('vyskaHranySize').clearValidators();
    }else{
      this.transportForm.get('vyskaHranySize').setValidators([Validators.required]);
    }
    this.transportForm.get('vyskaHranySize').updateValueAndValidity();
  }

  updateFormStoho(){
    if (this.transportForm.get('stohovatelnost').value == 'ano'){
      this.transportForm.get('stohoSize').clearValidators();
    }else{
      this.transportForm.get('stohoSize').setValidators(Validators.required);
    }
    this.transportForm.get('stohoSize').updateValueAndValidity();
  }

  // ci mozem ist na dalsi detail
  checkIfCanSKipToNext(){
    if (this.labelPosition == 'nakladka') {
      if (this.transportForm.valid && this.actualItemInForm + 1  < this.numberOfItems){
        return false;
      }else{
        return true;
      }
    }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
      this.actualItemInForm + 1 < this.numberOfItems){
      return false;
    }
    else{
      return true;
    }
  }

  // ci mozem backnut na detail
  checkIfCanSKipToPrevious(){
    if (this.labelPosition == 'nakladka') {
      if (this.actualItemInForm + 1 > 1 && this.transportForm.valid) {
        return false;
      } else {
        return true;
      }
    }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
      this.actualItemInForm + 1 > 1){
      return false;
    }
    else{
      return true;
    }
  }

  resetFormToDefault(allForms){
    this.transportForm.reset();
    this.transportForm.controls.poziciaNakladania.setValue('nerozhoduje');
    this.transportForm.controls.vyskaHrany.setValue('nerozhoduje');
    this.transportForm.controls.stohovatelnost.setValue('nie');
    this.transportForm.controls.poziciaNakladania.setValue('nerozhoduje');
    this.transportForm.controls.fromBackSide.setValue(undefined);
    this.transportForm.controls.fromSide.setValue(undefined);
    this.transportForm.controls.fromUpSide.setValue(undefined);
    if (allForms){
      this.casPrichodu = '';
      this.datumPrichodu = '';
      this.dateRange.controls.obsluznyCas.setValue(1);
    }
  }

  assignToDetail(indexOfAddresses, indexOfPackage, myCustomDetail){
    // console.log(this.address);
    let detail: DeatilAboutAdresses;
    if (myCustomDetail){
      detail = myCustomDetail;
    }else{
      detail = this.detailsArray[indexOfPackage];
    }
    if (this.address === undefined){
      return;
    }
    // if (this.arrayOfDetailsAbRoute[indexOfAddresses] == undefined) {
    //   detail = this.detailAboutRoute;
    // }else{
    //   detail = this.arrayOfDetailsAbRoute[indexOfAddresses];
    // }
    this.transportForm.controls.sizeD.setValue(detail.sizeD);
    this.transportForm.controls.sizeV.setValue(detail.sizeV);
    this.transportForm.controls.sizeS.setValue(detail.sizeS);
    this.transportForm.controls.weight.setValue(detail.weight);
    if (detail.vyskaNaklHrany != undefined && detail.vyskaNaklHrany >= 0){
      this.transportForm.controls.vyskaHranySize.setValue(detail.vyskaNaklHrany);
      this.transportForm.controls.vyskaHrany.setValue('rozhoduje');
    }else{
      this.transportForm.controls.vyskaHrany.setValue('nerozhoduje');
    }


    if (detail.stohovatelnost != undefined && detail.stohovatelnost > 0){
      this.transportForm.controls.stohoSize.setValue(detail.stohovatelnost);
      this.transportForm.controls.stohovatelnost.setValue('ano');
    }else{
      this.transportForm.controls.stohovatelnost.setValue('nie');
    }

    if (detail.polohaNakladania != undefined){

      if (detail.polohaNakladania.charAt(0) == '1'){
        this.transportForm.controls.fromBackSide.setValue(true);
      }
      if (detail.polohaNakladania.charAt(1) == '1'){
        this.transportForm.controls.fromSide.setValue(true);
      }
      if (detail.polohaNakladania.charAt(2) == '1'){
        this.transportForm.controls.fromUpSide.setValue(true);
      }

      if (detail.polohaNakladania.charAt(0) == '1' ||
        detail.polohaNakladania.charAt(1) == '1' ||
        detail.polohaNakladania.charAt(2) == '1') {
        this.transportForm.controls.poziciaNakladania.setValue('rozhoduje');
      }else{
        this.transportForm.controls.poziciaNakladania.setValue('nerozhoduje');
      }
    }


  }

  setAddress(adress: Address, index){
    console.log(index);
    this.address = adress;
    // this.assignToDetail(0,0, null);
    this.updateDetailOnTown();
    this.addressIndexUpdate = index + 1 ;
  }

  setDetail(detail){
    console.log(detail);
    this.assignToDetail(0, 0, detail.detail);
    this.actualTownIndex = detail.indexMesta;
    this.actualDetailIndex = detail.indexBedne;
    // tu budem musiet niekde nastavit detailNakladky, odkail prislka a ten detail ulozim do vykladky
  }

}

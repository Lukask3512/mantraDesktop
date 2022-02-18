import {Component, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import Address from '../../../../models/Address';
import DeatilAboutAdresses from '../../../../models/DeatilAboutAdresses';
import {AdressesComponent} from '../../../google/adresses/adresses.component';
import {DetailFormComponent} from '../detail-form/detail-form.component';
import {DataService} from '../../../../data/data.service';
import {MatExpansionPanel} from '@angular/material/expansion';
import {MatVerticalStepper} from '@angular/material/stepper';


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

  lastAddedPackage: DeatilAboutAdresses

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
    startDate: new FormControl([null, Validators.required]),
    endDate: new FormControl([null, Validators.required]),
    timeFrom: new FormControl(['', Validators.required]),
    timeTo: new FormControl(['', Validators.required]),
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

  @ViewChild('mep')
  private expansionAll: MatExpansionPanel;

  @ViewChild('mepFirst')
  private expansionFirst: MatExpansionPanel;

  @ViewChild('stepper')
  private matVerticalStepper: MatVerticalStepper;


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
    this.minDate = new Date();
    this.dateRange.controls.timeFrom.setValue('06:00');
    this.dateRange.controls.timeTo.setValue('18:00');
    this.labelPosition = 'nakladka';
    this.transportForm.enable();
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
    // if (this.addressIndexUpdate){
    //   if (!update) {
    //   return true;
    //   }
    // }
    if (this.datumPrichodu !== 'rozhoduje' && this.datumPrichodu !== 'nerozhoduje'){
      return true;
    }
    if (this.datumPrichodu === 'rozhoduje'){
      if (Array.isArray(this.dateRange.get('startDate').value)){
        if (!this.dateRange.get('startDate').value[0]){
          return true;
        }
      }else if (Array.isArray(this.dateRange.get('endDate').value)){
        if (!this.dateRange.get('endDate').value[0]){
          return true;
        }
      }else{
        if (!this.dateRange.get('startDate').value || !this.dateRange.get('endDate').value){
          return true;
        }
      }
    }
    if (this.casPrichodu !== 'rozhoduje' && this.casPrichodu !== 'nerozhoduje'){
      return true;
    }
    if (this.casPrichodu === 'rozhoduje'){
      if (Array.isArray(this.dateRange.get('timeFrom').value)){
        if (!this.dateRange.get('timeFrom').value[0]){
          return true;
        }
      }else if (Array.isArray(this.dateRange.get('timeTo').value)){
        if (!this.dateRange.get('timeTo').value[0]){
          return true;
        }
      }else{
        if (!this.dateRange.get('timeFrom').value || !this.dateRange.get('timeTo').value){
          return true;
        }
      }
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
      this.deletePackages();
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

  checkFinished(){
    return true;
  }

  checkCompletedForDate(){
    if (this.routeFromGoogle && this.latFromGoogle){
      return true;
    }else{
      return false;
    }
  }

  // expansion panel
  closeAllAndOpenFirst(){
    // this.expansionAll.expanded = false;
    // this.expansionFirst.expanded = true;
    this.matVerticalStepper.selectedIndex = 0;
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
      if (this.detailIndex[this.actualTownIndex] === undefined || this.detailIndex[this.actualTownIndex] === null){
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

    if (this.labelPosition == 'nakladka'){
      this.detailOut.emit(this.detailsArray);
      this.detailPositionOut.emit(null);
    }else{
      // this.detailPositionOut.emit({townsArray: this.townIndex, detailArray: this.detailIndex});
      this.detailOut.emit({townsArray: this.townIndex, detailArray: this.detailIndex});
    }
    this.adressOut.emit(this.address);

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
    this.dateRange.controls.timeFrom.setValue('06:00');
    this.dateRange.controls.timeTo.setValue('18:00');

    this.routeFromGoogle = null;
    this.latFromGoogle = null;
    this.lonFromGoogle = null;
    this.dataService.setActualDetailsInAddress(null);
    this.closeAllAndOpenFirst();
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

    this.specForm.controls.adr.setValue(this.address.adr);
    this.specForm.controls.ruka.setValue(this.address.ruka);

    if (this.address.teplota){
      this.specForm.controls.teplota.setValue(true);
      this.specForm.controls.potrebnaTeplota.setValue(this.address.teplota);
    }



    // this.transportForm.updateValueAndValidity();
  }

  setActualDetailInTown(){
    this.dataService.setActualDetailsInAddress({town: this.townIndex, detail: this.detailIndex});
  }

  pushItemsToArray(indexOfAddresses, indexOfPackage) {
    if (!this.detailsArray[indexOfPackage]) {
      this.detailsArray.push(this.getDetail());
      this.setLastAddedItem();
    } else {
      this.detailsArray[indexOfPackage] = this.getDetail();
      this.setLastAddedItem();
    }
    console.log(this.detailsArray);
    console.log(indexOfPackage);
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
        else if (this.detailsArray[this.actualItemInForm] === undefined){
          this.pushItemsToArray(0, this.actualItemInForm);

          // this.oneDetailAboutRoute.stohovatelnost.push()
          this.resetFormToDefault(false);
        }
        else if (this.actualItemInForm === this.detailsArray.length){
          this.pushItemsToArray(0, this.actualItemInForm);

          // this.oneDetailAboutRoute.stohovatelnost.push()
          this.resetFormToDefault(false);

        }

        else{
          this.pushItemsToArray(0, this.actualItemInForm);
          this.resetFormToDefault(false);
          this.assignToDetail(0, this.actualItemInForm + 1, null);
        }

    }else if (this.labelPosition === 'vykladka'){
      if (this.townIndex[this.actualItemInForm] === undefined){
          this.townIndex.push(this.actualTownIndex);
          this.detailIndex.push(this.actualDetailIndex);
          this.resetFormToDefault(false);

      }
      else if (this.townIndex[this.actualItemInForm] === undefined){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);
        this.resetFormToDefault(false);
      }
      else if (this.actualItemInForm === this.townIndex.length){
        this.townIndex.push(this.actualTownIndex);
        this.detailIndex.push(this.actualDetailIndex);
        this.resetFormToDefault(false);

      }
      else{
          this.townIndex[this.actualItemInForm] = this.actualTownIndex;
          this.detailIndex[this.actualItemInForm] = this.actualDetailIndex;
        this.resetFormToDefault(false);
        if (this.townIndex[this.actualItemInForm + 1] != null || this.townIndex[this.actualItemInForm + 1] !== undefined){
          let detail = this.getDetailByIds(this.townIndex[this.actualItemInForm + 1], this.detailIndex[this.actualItemInForm + 1]);
          this.assignToDetail(0, this.actualItemInForm + 1, detail);
        }

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

  setLastAddedItem(){
    this.lastAddedPackage = new DeatilAboutAdresses();
    this.lastAddedPackage.sizeS = this.getDetail().sizeS;
    this.lastAddedPackage.sizeD = this.getDetail().sizeD;
    this.lastAddedPackage.sizeV = this.getDetail().sizeV;
    this.lastAddedPackage.weight = this.getDetail().weight;
    this.lastAddedPackage.polohaNakladania = this.getDetail().polohaNakladania;
    this.lastAddedPackage.vyskaNaklHrany = this.getDetail().vyskaNaklHrany;
    this.lastAddedPackage.stohovatelnost = this.getDetail().stohovatelnost;
  }

  getLastAddedItem(){
    if (this.lastAddedPackage){
      this.assignToDetail(null, null, this.lastAddedPackage);
    }
  }

  getDetailByIds(townId, detailId){
    console.log(this.dataService.getDetails()[townId][detailId]);
    console.log(this.dataService.getDetails());
    return this.dataService.getDetails()[townId][detailId];
  }

  sizeUpdate(){
    if (this.numberOfItems <= this.detailsArray.length){ // toto je pre nakaldky
      this.actualItemInForm = this.numberOfItems - 1;
      if (this.detailsArray.length > this.numberOfItems - 1){
        this.detailsArray = this.detailsArray.slice(0, this.actualItemInForm + 1);
        this.assignToDetail(0, this.actualItemInForm, null);

      }
    }else if (this.numberOfItems <= this.townIndex.length && this.labelPosition === 'vykladka'){ // pre vykladky
      this.actualItemInForm = this.numberOfItems - 1;
      this.townIndex = this.townIndex.slice(0, this.actualItemInForm + 1);
      this.detailIndex = this.detailIndex.slice(0, this.actualItemInForm + 1);
      let detail = this.getDetailByIds(this.townIndex[this.actualItemInForm], this.detailIndex[this.actualItemInForm]);
      this.assignToDetail(0, this.actualItemInForm, detail);
      this.actualTownIndex = this.townIndex[this.actualItemInForm];
      this.actualDetailIndex = this.detailIndex[this.actualItemInForm];
    }
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
    this.transportForm.controls.stohoSize.setValue(0);
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

    if (!detail){
      return;
    }

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
    if (adress.type === 'nakladka'){
      this.labelPosition = 'nakladka';
      this.actualItemInForm = 0;
    }else{
      this.labelPosition = 'vykladka';
    }
    this.formUpdate();

    this.address = adress;
    this.routeFromGoogle = this.address.nameOfTown;
    this.latFromGoogle = this.address.coordinatesOfTownsLat;
    this.lonFromGoogle = this.address.coordinatesOfTownsLon;
    this.updateDetailOnTown();
    this.addressIndexUpdate = index + 1 ;
    this.childGoogle.setNameOfTown(this.address.nameOfTown);

  }
  // tu ked upravuje mesto
  setDetail(detail){
    this.detailsArray = detail;
    if (this.address.type === 'nakladka'){
      this.assignToDetail(0, 0, detail[0]);
      this.numberOfItems = this.detailsArray.length;

    }else{
      // @ts-ignore
      this.actualTownIndex = this.detailsArray.townsArray[0];
      // @ts-ignore
      this.actualDetailIndex = this.detailsArray.detailArray[0];
      this.townIndex = detail.townsArray;
      this.detailIndex = detail.detailArray;

      let detail2 = this.getDetailByIds(this.townIndex[0],  this.detailIndex[0]);
      this.assignToDetail(0, this.actualItemInForm - 1, detail2);
      this.numberOfItems = this.townIndex.length;
    }

    // tu budem musiet niekde nastavit detailNakladky, odkail prislka a ten detail ulozim do vykladky
  }

  // tu ked kliknem na balik
  setDetailFromBaliky(detail){
    this.assignToDetail(0, 0, detail.detail);
    this.actualTownIndex = detail.indexMesta;
    this.actualDetailIndex = detail.indexBedne;
    // tu budem musiet niekde nastavit detailNakladky, odkail prislka a ten detail ulozim do vykladky
  }

  // ked zmazem nejaku nakladku, a v aktualnom meste vo vykladke mam nakliknuty nejaky balik z neho
  deletePackages(){
    this.detailsArray = [];
    this.townIndex = [];
    this.detailIndex = [];
    this.resetFormToDefault(false);
  }


}

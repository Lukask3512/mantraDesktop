import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import Address from "../../../../models/Address";
import DeatilAboutAdresses from "../../../../models/DeatilAboutAdresses";

@Component({
  selector: 'app-detail-form',
  templateUrl: './detail-form.component.html',
  styleUrls: ['./detail-form.component.scss']
})
export class DetailFormComponent implements OnInit, OnChanges {
  address: Address = new Address();
  allAddresses: Address[];

  // labelPosition;

  numberOfItems:number = 1;
  actualItemInForm: number = 0;

  transportForm = this.fb.group({
    sizeD: ['', Validators.required],
    sizeV: [ '',Validators.required],
    sizeS: ['', Validators.required],
    weight: ['', Validators.required],
    poziciaNakladania: ["nerozhoduje"], //0 nerozhoduje, 1 rozhoduje
    vyskaHrany: ["nerozhoduje", Validators.required],
    vyskaHranySize: [''],
    stohovatelnost: ["nie", Validators.required],
    stohoSize: [0],

    zoZadu: false,
    zBoku: false,
    zVrchu: false,

    fromBackSide: [false],
    fromSide:[false],
    fromUpSide:[false],

  });

  @Input() labelPosition;
  @ViewChild('detailForm') form: ElementRef;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }


  date(){

  }


  // //: OneDetailRoute toto tam bolo
  // getDetail(){
  //   var stohovatelnost = this.transportForm.get('stohovatelnost').value;
  //   if (stohovatelnost == 'nie'){
  //     stohovatelnost = 0;
  //   }else{
  //     stohovatelnost = this.transportForm.get('stohoSize').value;
  //   }
  //   var vyskaNakHrany;
  //   if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
  //     vyskaNakHrany = this.transportForm.get('vyskaHranySize').value;
  //   }else{
  //     vyskaNakHrany = -1;
  //   }
  //
  //
  //   var back = "0";
  //   var side = "0";
  //   var upside = "0";
  //   if (this.transportForm.get('fromBackSide').value){
  //     back = "1";
  //   }
  //   if (this.transportForm.get('fromSide').value){
  //     side = "1";
  //   }
  //   if (this.transportForm.get('fromUpSide').value){
  //     upside = "1";
  //   }
  //
  //   var polohaNakladania =  back + side + upside;
  //
  //   return{
  //     polohaNakladania: [polohaNakladania],
  //     sizeD: [this.transportForm.get('sizeD').value],
  //     sizeS: [this.transportForm.get('sizeS').value],
  //     sizeV: [this.transportForm.get('sizeV').value],
  //     // specRezim: this.transportForm.get(''),
  //     stohovatelnost: [stohovatelnost],
  //     vyskaNaklHrany: [vyskaNakHrany],
  //     weight: [this.transportForm.get('weight').value]
  //
  //   }
  //
  // }
  //
  // ifValifForm(){
  //   if (this.transportForm.valid){
  //     console.log(this.address);
  //   }else{
  //     console.log("nonValid");
  //   }
  // }
  //
  //
  // pushItemsToArray(indexOfAddresses, indexOfPackage){
  //   if (this.address.sizeV == undefined){
  //     this.address.sizeV = this.getDetail().sizeV;
  //     this.address.sizeD = this.getDetail().sizeD;
  //     this.address.sizeS = this.getDetail().sizeS;
  //     this.address.stohovatelnost = this.getDetail().stohovatelnost;
  //     this.address.vyskaNaklHrany = this.getDetail().vyskaNaklHrany;
  //     this.address.polohaNakladania = this.getDetail().polohaNakladania;
  //     this.address.weight = this.getDetail().weight;
  //   }else{
  //     if (this.address.stohovatelnost[indexOfPackage] == undefined){
  //
  //       this.address.stohovatelnost.push(this.getDetail().stohovatelnost[0]);
  //       this.address.weight.push(this.getDetail().weight[0]);
  //       this.address.polohaNakladania.push(this.getDetail().polohaNakladania[0]);
  //       this.address.sizeD.push(this.getDetail().sizeD[0]);
  //       this.address.sizeS.push(this.getDetail().sizeS[0]);
  //       this.address.sizeV.push(this.getDetail().sizeV[0]);
  //       this.address.vyskaNaklHrany.push(this.getDetail().vyskaNaklHrany[0]);
  //     }else{
  //       this.address.stohovatelnost[indexOfPackage] = this.getDetail().stohovatelnost[0];
  //       this.address.weight[indexOfPackage] = this.getDetail().weight[0];
  //
  //       if (this.transportForm.get('poziciaNakladania').value == 'nerozhoduje') {
  //         this.transportForm.controls['fromBackSide'].setValue(undefined);
  //         this.transportForm.controls['fromSide'].setValue(undefined);
  //         this.transportForm.controls['fromUpSide'].setValue(undefined);
  //         this.address.polohaNakladania[indexOfPackage] = "000";
  //       }else{
  //         this.address.polohaNakladania[indexOfPackage] = this.getDetail().polohaNakladania[0];
  //       }
  //
  //       this.address.sizeD[indexOfPackage] = this.getDetail().sizeD[0];
  //       this.address.sizeS[indexOfPackage] = this.getDetail().sizeS[0];
  //       this.address.sizeV[indexOfPackage] = this.getDetail().sizeV[0];
  //       this.address.vyskaNaklHrany[indexOfPackage] = this.getDetail().vyskaNaklHrany[0];
  //     }
  //
  //   }
  //
  // }

  // nextItem(){
  //   console.log(this.actualItemInForm )
  //
  //
  //     if (this.address == undefined){
  //       this.pushItemsToArray(0, this.actualItemInForm)
  //       this.resetFormToDefault(false);
  //
  //     }
  //     else if (this.address.sizeV == undefined){
  //       this.pushItemsToArray(0, this.actualItemInForm);
  //
  //       // this.oneDetailAboutRoute.stohovatelnost.push()
  //       this.resetFormToDefault(false);
  //     }
  //     else if (this.actualItemInForm == this.address.sizeV.length){
  //       this.pushItemsToArray(0, this.actualItemInForm);
  //
  //       // this.oneDetailAboutRoute.stohovatelnost.push()
  //       this.resetFormToDefault(false);
  //
  //     }
  //
  //     else{
  //       this.pushItemsToArray(0, this.actualItemInForm);
  //       this.resetFormToDefault(false);
  //       this.assignToDetail(0,this.actualItemInForm+1);
  //     }
  //   this.actualItemInForm ++;
  //
  //   console.log(this.address);
  //   console.log(this.actualItemInForm)
  // }
  //
  // previousItem(){
  //   if (this.actualItemInForm == this.address.sizeV.length){
  //     this.pushItemsToArray(0, this.actualItemInForm);
  //     this.resetFormToDefault(false);
  //   }else{
  //     this.pushItemsToArray(0, this.actualItemInForm);
  //   }
  //   this.actualItemInForm --;
  //   this.assignToDetail(0,this.actualItemInForm);
  // }
  //
  // //ked sa nahodov zmensi pole, ale by som ho pohol opopovat
  // sizeUpdate(){
  //   if (this.address.sizeV != undefined){
  //   if (this.numberOfItems <= this.address.sizeV.length +1){
  //     this.actualItemInForm = this.numberOfItems -1;
  //     this.address.sizeV = this.address.sizeV.slice(0, this.numberOfItems -1);
  //     this.address.sizeS = this.address.sizeS.slice(0, this.numberOfItems -1)
  //     this.address.sizeD = this.address.sizeD.slice(0, this.numberOfItems -1)
  //     this.address.weight = this.address.weight.slice(0, this.numberOfItems -1)
  //     this.address.vyskaNaklHrany = this.address.vyskaNaklHrany.slice(0, this.numberOfItems -1)
  //     this.address.polohaNakladania = this.address.polohaNakladania.slice(0, this.numberOfItems -1)
  //     this.address.stohovatelnost = this.address.stohovatelnost.slice(0, this.numberOfItems -1)
  //     // this.detailAboutRoute[0].specRezim.slice(0, this.numberOfItems)
  //   }
  //   }
  //
  // }
  //
  // updateFormPosition(){
  //
  //   if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
  //     this.transportForm.get('fromBackSide').clearValidators();
  //   }else{
  //     if (!this.transportForm.get('fromBackSide').value || !this.transportForm.get('fromSide').value || !this.transportForm.get('fromUpSide').value)
  //       this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
  //   }
  //   this.transportForm.get('fromBackSide').updateValueAndValidity();
  // }
  //
  // updateMatLabelForm(){
  //   if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
  //     if (!this.transportForm.get('fromBackSide').value && !this.transportForm.get('fromSide').value && !this.transportForm.get('fromUpSide').value){
  //       this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
  //     }else{
  //       this.transportForm.get('fromBackSide').clearValidators();
  //     }
  //   }else{
  //     this.transportForm.get('fromBackSide').clearValidators();
  //
  //   }
  //   this.transportForm.get('fromBackSide').updateValueAndValidity();
  // }
  //
  // updateValidFormHrana(){
  //   if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
  //     this.transportForm.get('vyskaHranySize').clearValidators();
  //   }else{
  //     this.transportForm.get('vyskaHranySize').setValidators([Validators.required]);
  //   }
  //   this.transportForm.get('vyskaHranySize').updateValueAndValidity();
  // }
  //
  // updateFormStoho(){
  //   if (this.transportForm.get('stohovatelnost').value == 'ano'){
  //     this.transportForm.get('stohoSize').clearValidators();
  //   }else{
  //     this.transportForm.get('stohoSize').setValidators(Validators.required);
  //   }
  //   this.transportForm.get('stohoSize').updateValueAndValidity();
  // }
  //
  // //ci mozem ist na dalsi detail
  // checkIfCanSKipToNext(){
  //   if (this.labelPosition == 'nakladka') {
  //     if (this.transportForm.valid && this.actualItemInForm+1  < this.numberOfItems){
  //       return false;
  //     }else{
  //       return true;
  //     }
  //   }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
  //     this.actualItemInForm +1 < this.numberOfItems){
  //     return false;
  //   }
  //   else{
  //     return true;
  //   }
  // }
  //
  // //ci mozem backnut na detail
  // checkIfCanSKipToPrevious(){
  //   if (this.labelPosition == 'nakladka') {
  //     if (this.actualItemInForm + 1 > 1 && this.transportForm.valid) {
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
  //     this.actualItemInForm +1 > 1){
  //     return false;
  //   }
  //   else{
  //     return true;
  //   }
  // }
  //
  // resetFormToDefault(allForms){
  //   this.transportForm.reset();
  //   this.transportForm.controls['poziciaNakladania'].setValue('nerozhoduje');
  //   this.transportForm.controls['vyskaHrany'].setValue('nerozhoduje');
  //   this.transportForm.controls['stohovatelnost'].setValue('nie');
  //   this.transportForm.controls['poziciaNakladania'].setValue('nerozhoduje');
  //   this.transportForm.controls['fromBackSide'].setValue(undefined);
  //   this.transportForm.controls['fromSide'].setValue(undefined);
  //   this.transportForm.controls['fromUpSide'].setValue(undefined);
  //   if (allForms){
  //     // this.casPrichodu = '';
  //     // this.datumPrichodu = '';
  //   }
  // }
  //
  // assignToDetail(indexOfAddresses, indexOfPackage){
  //   console.log(this.address);
  //   var detail: DeatilAboutAdresses = this.address;
  //   if (this.address == undefined){
  //     return;
  //   }
  //   // if (this.arrayOfDetailsAbRoute[indexOfAddresses] == undefined) {
  //   //   detail = this.detailAboutRoute;
  //   // }else{
  //   //   detail = this.arrayOfDetailsAbRoute[indexOfAddresses];
  //   // }
  //   this.transportForm.controls['sizeD'].setValue(detail.sizeD[indexOfPackage]);
  //   this.transportForm.controls['sizeV'].setValue(detail.sizeV[indexOfPackage]);
  //   this.transportForm.controls['sizeS'].setValue(detail.sizeS[indexOfPackage]);
  //   this.transportForm.controls['weight'].setValue(detail.weight[indexOfPackage]);
  //   if (detail.vyskaNaklHrany[indexOfPackage] != undefined && detail.vyskaNaklHrany[indexOfPackage] >= 0){
  //     this.transportForm.controls['vyskaHranySize'].setValue(detail.vyskaNaklHrany[indexOfPackage]);
  //     this.transportForm.controls['vyskaHrany'].setValue("rozhoduje");
  //   }else{
  //     this.transportForm.controls['vyskaHrany'].setValue("nerozhoduje");
  //   }
  //
  //
  //   if (detail.stohovatelnost[indexOfPackage] != undefined && detail.stohovatelnost[indexOfPackage] > 0){
  //     this.transportForm.controls['stohoSize'].setValue(detail.stohovatelnost[indexOfPackage]);
  //     this.transportForm.controls['stohovatelnost'].setValue("ano");
  //   }else{
  //     this.transportForm.controls['stohovatelnost'].setValue("nie");
  //   }
  //
  //   if (detail.polohaNakladania[indexOfPackage] != undefined){
  //
  //     if (detail.polohaNakladania[indexOfPackage].charAt(0) == '1'){
  //       this.transportForm.controls['fromBackSide'].setValue(true);
  //     }
  //     if (detail.polohaNakladania[indexOfPackage].charAt(1) == '1'){
  //       this.transportForm.controls['fromSide'].setValue(true);
  //     }
  //     if (detail.polohaNakladania[indexOfPackage].charAt(2) == '1'){
  //       this.transportForm.controls['fromUpSide'].setValue(true);
  //     }
  //
  //     if (detail.polohaNakladania[indexOfPackage].charAt(0) == "1" ||
  //       detail.polohaNakladania[indexOfPackage].charAt(1) == "1" ||
  //       detail.polohaNakladania[indexOfPackage].charAt(2) == "1") {
  //       this.transportForm.controls['poziciaNakladania'].setValue("rozhoduje");
  //     }else{
  //       this.transportForm.controls['poziciaNakladania'].setValue("nerozhoduje");
  //     }
  //   }
  //
  //
  //
  //   // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
  //   // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
  //   // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
  //
  // }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      const changedProp = changes[propName];
      const to = JSON.stringify(changedProp.currentValue);
      if (changedProp.isFirstChange()) {
        // log.push(`Initial value of ${propName} set to ${to}`);
        this.labelPosition = to;
        this.labelPosition = this.labelPosition.replace(/['"]+/g, '').toString();

      } else {
        const from = JSON.stringify(changedProp.previousValue);
        console.log(propName)
        this.labelPosition = to;
        this.labelPosition = this.labelPosition.replace(/['"]+/g, '').toString();
      }
    }
    // this.changeLog.push(log.join(', '));
  }

}

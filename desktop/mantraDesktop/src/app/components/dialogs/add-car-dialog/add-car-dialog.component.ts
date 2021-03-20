import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CarService} from "../../../services/car.service";
import Cars from "../../../models/Cars";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NewCarComponent} from "../../cars/new-car/new-car.component";
import {DataService} from "../../../data/data.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {take} from "rxjs/operators";

@Component({
  selector: 'app-add-car-dialog',
  templateUrl: './add-car-dialog.component.html',
  styleUrls: ['./add-car-dialog.component.scss']
})
export class AddCarDialogComponent implements OnInit {

  carForm = this.fb.group({
    ecv: ['', Validators.required],
    phone: ['', Validators.required],
    autoVyska: ['', Validators.required],
    autoDlzka: ['', Validators.required],
    autoSirka: ['', Validators.required],
    priestorVyska: ['', Validators.required],
    priestorDlzka: ['', Validators.required],
    priestorSirka: ['', Validators.required],
    vahaVozidlo: ['', Validators.required],
    nosnost: ['', Validators.required],

    vyskaHrany: [''],
    minHrana: [''],
    maxHrana: [''],

    zoZaduVyska: ['', Validators.required],
    zoZaduSirka: ['', Validators.required],
    zPravaVyska: [''],
    zPravaSirka: [''],
    zLavaVyska: [''],
    zLavaSirka: [''],
    zHoraVyska: [''],
    zHoraSirka: [''],

    pocetNaprav: ['', Validators.required],

    fromBack: true,
    fromRight: false,
    fromLeft: false,
    fromUp: false,
    pripojitNaves: false,
    pohyblivaNakHrana: false,


  });

  isLinear = false;

  constructor(private fb: FormBuilder, private carService: CarService, public dialogRef: MatDialogRef<NewCarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private dataServce: DataService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    console.log(this.data)
    if (this.data){
        this.carForm.controls['ecv'].setValue(this.data.ecv);
      this.carForm.controls['phone'].setValue(this.data.phoneNumber);
      this.carForm.controls['autoVyska'].setValue(this.data.carSize[0]);
      this.carForm.controls['autoDlzka'].setValue(this.data.carSize[2]);
      this.carForm.controls['autoSirka'].setValue(this.data.carSize[1]);
      this.carForm.controls['priestorVyska'].setValue(this.data.sizePriestoru[0]);
      this.carForm.controls['priestorDlzka'].setValue(this.data.sizePriestoru[2]);
      this.carForm.controls['priestorSirka'].setValue(this.data.sizePriestoru[1]);
      this.carForm.controls['vahaVozidlo'].setValue(this.data.vaha);
      this.carForm.controls['nosnost'].setValue(this.data.nosnost);
      this.carForm.controls['vyskaHrany'].setValue(this.data.nakladaciaHrana[0]);

      if (this.data.nakladaciaHrana.length > 1){
        this.carForm.controls['minHrana'].setValue(this.data.nakladaciaHrana[0]);
        this.carForm.controls['maxHrana'].setValue(this.data.nakladaciaHrana[1]);
        this.carForm.controls['pohyblivaNakHrana'].setValue(true);
      }

      this.carForm.controls['pocetNaprav'].setValue(this.data.pocetNaprav);


      this.carForm.controls['zoZaduVyska'].setValue(this.data.nakladaciPriestorZoZadu[0]);
      this.carForm.controls['zoZaduSirka'].setValue(this.data.nakladaciPriestorZoZadu[1]);
      this.carForm.controls['zPravaVyska'].setValue(this.data.nakladaciPriestorZPrava[0]);
      this.carForm.controls['zPravaSirka'].setValue(this.data.nakladaciPriestorZPrava[1]);
      this.carForm.controls['zLavaVyska'].setValue(this.data.nakladaciPriestorZLava[0]);
      this.carForm.controls['zLavaSirka'].setValue(this.data.nakladaciPriestorZLava[1]);
      this.carForm.controls['zHoraVyska'].setValue(this.data.nakladaciPriestorZVrchu[0]);
      this.carForm.controls['zHoraSirka'].setValue(this.data.nakladaciPriestorZVrchu[1]);


      if (this.data.nakladaciPriestorZLava[0] != ""){
        this.carForm.controls['fromLeft'].setValue(true);
      }
      if (this.data.nakladaciPriestorZPrava[0] != ""){
        this.carForm.controls['fromRight'].setValue(true);
      }
      if (this.data.nakladaciPriestorZoZadu[0] != ""){
        this.carForm.controls['fromBack'].setValue(true);
      }
      if (this.data.nakladaciPriestorZVrchu[0] != ""){
        this.carForm.controls['fromUp'].setValue(true);
      }

    }
  }

  updateFormNakHrana(){
    console.log(this.carForm.get('pohyblivaNakHrana').value)
    if (this.carForm.get('pohyblivaNakHrana').value == true){
      this.carForm.get('maxHrana').setValidators(Validators.required);
      this.carForm.get('minHrana').setValidators(Validators.required);
      this.carForm.get('vyskaHrany').clearValidators();

    }else{
      this.carForm.get('maxHrana').clearValidators();
      this.carForm.get('minHrana').clearValidators();
      this.carForm.get('vyskaHrany').setValidators(Validators.required);
    }
    this.carForm.get('vyskaHrany').updateValueAndValidity();
    this.carForm.get('maxHrana').updateValueAndValidity();
    this.carForm.get('minHrana').updateValueAndValidity();
  }

  updateFormFromBack(){
    console.log(this.carForm.get('fromBack').value)
    if (this.carForm.get('fromBack').value == true){
      this.carForm.get('zoZaduVyska').setValidators(Validators.required);
      this.carForm.get('zoZaduSirka').setValidators(Validators.required);

    }else{
      this.carForm.get('zoZaduVyska').clearValidators();
      this.carForm.get('zoZaduSirka').clearValidators();
    }
    this.carForm.get('zoZaduSirka').updateValueAndValidity();
    this.carForm.get('zoZaduVyska').updateValueAndValidity();
  }

  updateFormFromUp(){
    console.log(this.carForm.get('fromUp').value)
    if (this.carForm.get('fromUp').value == true){
      this.carForm.get('zHoraVyska').setValidators(Validators.required);
      this.carForm.get('zHoraSirka').setValidators(Validators.required);

    }else{
      this.carForm.get('zHoraVyska').clearValidators();
      this.carForm.get('zHoraSirka').clearValidators();
    }
    this.carForm.get('zHoraVyska').updateValueAndValidity();
    this.carForm.get('zHoraSirka').updateValueAndValidity();
  }

  updateFormFromLeft(){
    console.log(this.carForm.get('fromLeft').value)
    if (this.carForm.get('fromLeft').value == true){
      this.carForm.get('zLavaVyska').setValidators(Validators.required);
      this.carForm.get('zLavaSirka').setValidators(Validators.required);

    }else{
      this.carForm.get('zLavaVyska').clearValidators();
      this.carForm.get('zLavaSirka').clearValidators();
    }
    this.carForm.get('zLavaVyska').updateValueAndValidity();
    this.carForm.get('zLavaSirka').updateValueAndValidity();
  }

  updateFormFromRight(){
    console.log(this.carForm.get('fromRight').value)
    if (this.carForm.get('fromRight').value == true){
      this.carForm.get('zPravaVyska').setValidators(Validators.required);
      this.carForm.get('zPravaSirka').setValidators(Validators.required);

    }else{
      this.carForm.get('zPravaVyska').clearValidators();
      this.carForm.get('zPravaSirka').clearValidators();
    }
    this.carForm.get('zPravaVyska').updateValueAndValidity();
    this.carForm.get('zPravaSirka').updateValueAndValidity();
  }

  updateCar(){
    console.log(this.assignToCar());
    console.log(this.data.id)
    this.carService.updateCar(this.assignToCar(), this.data.id);
    this.dialogRef.close();
    return;
  }

  saveCar(){
    console.log(this.assignToCar());
    this.carService.getCarByEcv(this.assignToCar().ecv).pipe(take(1)).subscribe(car => {
      console.log(car)
      if (car.length == 0){
        this.carService.getCarByNumber(this.assignToCar().phoneNumber).pipe(take(1)).subscribe(carByNumber => {
          if (carByNumber.length > 0) {
            this.snackBar.open('Vložené tel. číslo sa už nachádza v databáze', 'Ok', {
              duration: 5000
            });
            return;
          }
          else{
            this.carService.createCar(this.assignToCar());
            this.dialogRef.close();
            return;

          }
        })


      }else{
        this.snackBar.open('Vložené ECV sa už nachádza v databáze', 'Ok', {
          duration: 5000
        });
        return;
      }

    })
    //
  }

  setCar(){

  }

  assignToCar(): Cars {
    var createdBy;

    if (this.dataServce.getDispecer().createdBy !== 'master'){
      createdBy = this.dataServce.getDispecer().createdBy;
    }
    else {
      createdBy = this.dataServce.getDispecer().id;
    }
    var rozmeryVozidla = [
      this.carForm.get('autoVyska').value ,
      this.carForm.get('autoSirka').value,
      this.carForm.get('autoDlzka').value];

    var rozmeryPriestoru= [
      this.carForm.get('priestorVyska').value ,
      this.carForm.get('priestorSirka').value,
      this.carForm.get('priestorDlzka').value];

    var rozmeryNaklZLava= [
      this.carForm.get('zLavaVyska').value ,
      this.carForm.get('zLavaSirka').value];

    var rozmeryNaklZPrava= [
      this.carForm.get('zPravaVyska').value ,
      this.carForm.get('zPravaSirka').value];

    var rozmeryNaklZVrchu= [
      this.carForm.get('zHoraVyska').value ,
      this.carForm.get('zHoraSirka').value];

    var rozmeryNaklZoZadu= [
      this.carForm.get('zoZaduVyska').value ,
      this.carForm.get('zoZaduSirka').value];

    var nakladaciaHrana;
    if (!this.carForm.get('pohyblivaNakHrana').value){
      console.log(this.carForm.get('vyskaHrany').value)
      // nakladaciaHrana.push(this.carForm.get('vyskaHrany').value)
      nakladaciaHrana = [this.carForm.get('vyskaHrany').value]

    }else{
      nakladaciaHrana = [this.carForm.get('minHrana').value , this.carForm.get('maxHrana').value ]
      // nakladaciaHrana.push()
      // nakladaciaHrana.push()
    }

    console.log(nakladaciaHrana);
    var privesy;
    if (this.data && this.data.navesis){
      privesy = this.data.navesis;
    }else{
      privesy = [];
    }

    return {
      ecv: this.carForm.get('ecv').value,
      phoneNumber: this.carForm.get('phone').value,
      createdBy: createdBy,
      carSize: rozmeryVozidla,
      status: -2,
      sizePriestoru: rozmeryPriestoru,

      pocetNaprav: this.carForm.get('pocetNaprav').value,

      nakladaciPriestorZLava: rozmeryNaklZLava,
      nakladaciPriestorZPrava: rozmeryNaklZPrava,
      nakladaciPriestorZVrchu: rozmeryNaklZVrchu,
      nakladaciPriestorZoZadu: rozmeryNaklZoZadu,
      vaha: this.carForm.get('vahaVozidlo').value,
      naves: this.carForm.get('pripojitNaves').value,
      navesis: privesy,
      nosnost: this.carForm.get('nosnost').value,
      nakladaciaHrana: nakladaciaHrana,
    };
  }

  checkBiggetSize(){
    if (this.carForm.get('autoVyska').value < this.carForm.get('priestorVyska').value ||
      this.carForm.get('autoSirka').value < this.carForm.get('priestorSirka').value ||
      this.carForm.get('autoDlzka').value <  this.carForm.get('priestorDlzka').value){
      return true
    }else{
      return false
    }
  }


}

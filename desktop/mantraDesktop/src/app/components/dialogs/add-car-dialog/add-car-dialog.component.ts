import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CarService} from '../../../services/car.service';
import Cars from '../../../models/Cars';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';
import {DataService} from '../../../data/data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {take} from 'rxjs/operators';
import Vodic from '../../../models/Vodic';
import {VodicService} from '../../../services/vodic.service';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

@Component({
  selector: 'app-add-car-dialog',
  templateUrl: './add-car-dialog.component.html',
  styleUrls: ['./add-car-dialog.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
  }]
})
export class AddCarDialogComponent implements OnInit {

  allVodici = false;
  myVodici: string[] = [];
  vodici: Vodic[] = [];
  displayedColumns: string[] = ['meno', 'priezisko', 'prava'];

  carForm = this.fb.group({
    ecv: ['', Validators.required],
    phone: [''],
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

    teplota: false,
    ruka: false,
    adr: false,

    minTeplota: 0,
    maxTeplota: 0,

    allVodici: false,
    vodici: [],

  });

  isLinear = false;

  constructor(private fb: FormBuilder, private carService: CarService, public dialogRef: MatDialogRef<NewCarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private dataServce: DataService, private snackBar: MatSnackBar,
              private vodiciService: VodicService) { }

  ngOnInit(): void {
    this.vodiciService.allVodici$.subscribe(allVodici => {
      this.vodici = allVodici;
    });
    if (this.data){
        this.carForm.controls.ecv.setValue(this.data.ecv);
        this.carForm.controls.phone.setValue(this.data.phoneNumber);
        this.carForm.controls.autoVyska.setValue(this.data.carSize[0]);
        this.carForm.controls.autoDlzka.setValue(this.data.carSize[2]);
        this.carForm.controls.autoSirka.setValue(this.data.carSize[1]);
        this.carForm.controls.priestorVyska.setValue(this.data.sizePriestoru[0]);
        this.carForm.controls.priestorDlzka.setValue(this.data.sizePriestoru[2]);
        this.carForm.controls.priestorSirka.setValue(this.data.sizePriestoru[1]);
        this.carForm.controls.vahaVozidlo.setValue(this.data.vaha);
        this.carForm.controls.nosnost.setValue(this.data.nosnost);
        this.carForm.controls.vyskaHrany.setValue(this.data.nakladaciaHrana[0]);

        if (this.data.nakladaciaHrana.length > 1){
        this.carForm.controls.minHrana.setValue(this.data.nakladaciaHrana[0]);
        this.carForm.controls.maxHrana.setValue(this.data.nakladaciaHrana[1]);
        this.carForm.controls.pohyblivaNakHrana.setValue(true);
      }

        this.carForm.controls.pocetNaprav.setValue(this.data.pocetNaprav);


        this.carForm.controls.zoZaduVyska.setValue(this.data.nakladaciPriestorZoZadu[0]);
        this.carForm.controls.zoZaduSirka.setValue(this.data.nakladaciPriestorZoZadu[1]);
        this.carForm.controls.zPravaVyska.setValue(this.data.nakladaciPriestorZPrava[0]);
        this.carForm.controls.zPravaSirka.setValue(this.data.nakladaciPriestorZPrava[1]);
        this.carForm.controls.zLavaVyska.setValue(this.data.nakladaciPriestorZLava[0]);
        this.carForm.controls.zLavaSirka.setValue(this.data.nakladaciPriestorZLava[1]);
        this.carForm.controls.zHoraVyska.setValue(this.data.nakladaciPriestorZVrchu[0]);
        this.carForm.controls.zHoraSirka.setValue(this.data.nakladaciPriestorZVrchu[1]);

        this.carForm.controls.allVodici.setValue(this.data.allVodici);
        this.carForm.controls.vodici.setValue(this.data.vodici);
        this.myVodici = this.data.vodici;


        this.carForm.controls.minTeplota.setValue(this.data.minTeplota);
        this.carForm.controls.maxTeplota.setValue(this.data.maxTeplota);
        if (this.data.minTeplota){
          this.carForm.controls.teplota.setValue(true);
        }
        this.carForm.controls.adr.setValue(this.data.adr);
        this.carForm.controls.ruka.setValue(this.data.ruka);

        if (this.data.nakladaciPriestorZLava[0] !== ''){
        this.carForm.controls.fromLeft.setValue(true);
      }
        if (this.data.nakladaciPriestorZPrava[0] !== ''){
        this.carForm.controls.fromRight.setValue(true);
      }
        if (this.data.nakladaciPriestorZoZadu[0] !== ''){
        this.carForm.controls.fromBack.setValue(true);
      }
        if (this.data.nakladaciPriestorZVrchu[0] !== ''){
        this.carForm.controls.fromUp.setValue(true);
      }

    }
  }

  updateFormNakHrana(){
    if (this.carForm.get('pohyblivaNakHrana').value === true){
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
    if (this.carForm.get('fromBack').value === true){
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
    if (this.carForm.get('fromUp').value === true){
      this.carForm.get('zHoraVyska').setValidators(Validators.required);
      this.carForm.get('zHoraSirka').setValidators(Validators.required);

    }else{
      this.carForm.get('zHoraVyska').clearValidators();
      this.carForm.get('zHoraSirka').clearValidators();
    }
    this.carForm.get('zHoraVyska').updateValueAndValidity();
    this.carForm.get('zHoraSirka').updateValueAndValidity();
  }


  // ak nema cislo ani auto ani vodic tak nemozem priradit vodica k autu
  checkForPhone(vodic: Vodic){
    if (vodic.allCars && (this.assignToCar().phoneNumber || vodic.phone)){
      return true;
    }
    if (!this.carForm.get('allVodici').value){
      if (this.assignToCar().phoneNumber || vodic.phone !== ''){
        return false;
      }else{
        this.myVodici = this.myVodici.filter(jedenVodic => jedenVodic !== vodic.id);
        return true;
      }
    }else{
      return true;
    }
  }

  catchChange(id){
    if (this.myVodici){
      var jeTam = this.myVodici.find(carsId => carsId === id);
      if (jeTam){
        this.myVodici = this.myVodici.filter(cars => cars !== id);
      }else{
        this.myVodici.push(id);
      }
    }else{
      // this.vodic = {...this.vodic, myCars: []};
      this.myVodici = [];
      this.myVodici.push(id);
    }
  }

  // ak ma vodic pristup ku vsetkym vozidlam
  textForVodici(vodic: Vodic){
    if (vodic.allCars && (this.assignToCar().phoneNumber || vodic.phone)){
      return true;
    }
  }

  checkBox(vodic: Vodic){
    // ked ma vodic pristup ku vsetkym vozidlam
    if (vodic.allCars && (this.assignToCar().phoneNumber || vodic.phone)){
      return true;
    }

    // ked zaskrtnem vsetky auta, aby sa zaskrtli vsetky
    if (this.carForm.get('allVodici').value && (vodic.phone !== '' || this.assignToCar().phoneNumber !== '')){
      return true;
    }

    if (vodic.myCars.includes(this.data.id)){
      return true;
    }

      if (!this.carForm.get('allVodici').value){
        var idcko = this.myVodici.find(oneCarId => oneCarId === vodic.id);
        if (idcko){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    // }else{
    //   return false;
    // }
  }

  // ak nema cislo ani auto ani vodic tak nemozem priradit vodica k autu
  checkForPhoneNoAllCars(vodic: Vodic){
    if (vodic.phone !== '' || this.assignToCar().phoneNumber !== ''){
      return false;
    }else{
      this.myVodici = this.myVodici.filter(oneId => oneId !== vodic.id);
      return true;
    }
  }

  updateFormStupneCelsia(){
    if (this.carForm.get('fromUp').value === true){
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
    if (this.carForm.get('fromLeft').value === true){
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
    if (this.carForm.get('fromRight').value === true){
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
    let auto: Cars = this.assignToCar();
    if (this.assignToCar().phoneNumber === '' || this.assignToCar().allVodici){
      auto.vodici = []; // ak nemam cislo tak auto priradim k vodicovi len
      this.datPravaVodicom(this.data.id);
    }
    this.carService.updateCar(auto, this.data.id);

    this.dialogRef.close();
    return;
  }

  // TODO ked vytvori auto nie master, tak nech sa mu idcko ulozi do databazy aby ho mohol ovladat rovno
  saveCar(){
    console.log(this.assignToCar());
    this.carService.getCarByEcv(this.assignToCar().ecv).pipe(take(1)).subscribe(car => {
      console.log(car);
      if (car.length === 0){
        // auto bez cisla
        if (this.assignToCar().phoneNumber !== ''){
          this.carService.getCarByNumber(this.assignToCar().phoneNumber).pipe(take(1)).subscribe(carByNumber => {
            if (carByNumber.length > 0) {
              this.snackBar.open('Vložené tel. číslo sa už nachádza v databáze', 'Ok', {
                duration: 5000
              });
              return;
            }
            else{
              let car: Cars = this.assignToCar();
              car.itinerar = [];
              this.carService.createCar(car);
              this.dialogRef.close();
              return;

            }
          });
        }else{
          let car: Cars = this.assignToCar();
          car.itinerar = [];
          car.vodici = [];
          const carId = this.carService.createCar(car);
            this.datPravaVodicom(carId);
          this.dialogRef.close();
          return;
        }

      }else{
        this.snackBar.open('Vložené ECV sa už nachádza v databáze', 'Ok', {
          duration: 5000
        });
        return;
      }

    });
    //
  }

  datPravaVodicom(idAuta){
    var auto: Cars = this.assignToCar();
    auto.vodici = [];
    this.vodiciService.allVodici$.pipe(take(1)).subscribe(allVodici => {
      allVodici.forEach(oneVodic => {
        oneVodic.myCars = oneVodic.myCars.filter(oneCar => oneCar !== idAuta); // tu najprv odstranim od vodicov auta
        if (auto.vodici.includes(oneVodic.id)){
          oneVodic.myCars.push(idAuta);                                         // a tu nasledne priradim auto
        }
        this.vodiciService.updateVodic(oneVodic);
    });
    });

  }

  assignToCar(): Cars {
    let createdBy;

    if (this.dataServce.getDispecer().createdBy !== 'master'){
      createdBy = this.dataServce.getDispecer().createdBy;
    }
    else {
      createdBy = this.dataServce.getDispecer().id;
    }
    let rozmeryVozidla = [
      this.carForm.get('autoVyska').value ,
      this.carForm.get('autoSirka').value,
      this.carForm.get('autoDlzka').value];

    let rozmeryPriestoru = [
      this.carForm.get('priestorVyska').value ,
      this.carForm.get('priestorSirka').value,
      this.carForm.get('priestorDlzka').value];

    let rozmeryNaklZLava = [
      this.carForm.get('zLavaVyska').value ,
      this.carForm.get('zLavaSirka').value];

    let rozmeryNaklZPrava = [
      this.carForm.get('zPravaVyska').value ,
      this.carForm.get('zPravaSirka').value];

    let rozmeryNaklZVrchu = [
      this.carForm.get('zHoraVyska').value ,
      this.carForm.get('zHoraSirka').value];

    let rozmeryNaklZoZadu = [
      this.carForm.get('zoZaduVyska').value ,
      this.carForm.get('zoZaduSirka').value];

    let nakladaciaHrana;
    if (!this.carForm.get('pohyblivaNakHrana').value){
      nakladaciaHrana = [this.carForm.get('vyskaHrany').value];

    }else{
      nakladaciaHrana = [this.carForm.get('minHrana').value , this.carForm.get('maxHrana').value ];
    }

    let privesy;
    if (this.data && this.data.navesis){
      privesy = this.data.navesis;
    }else{
      privesy = [];
    }

    let minTeplota;
    let maxTeplota;
    if (this.carForm.get('teplota').value){
      minTeplota =  this.carForm.get('minTeplota').value;
      maxTeplota =  this.carForm.get('maxTeplota').value;
    }else{
      minTeplota = null;
      maxTeplota = null;
    }


    return {
      ecv: this.carForm.get('ecv').value,
      phoneNumber: this.carForm.get('phone').value,
      createdBy,
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
      nakladaciaHrana,

      teplota: this.carForm.get('teplota').value,
      minTeplota,
      maxTeplota,

      ruka: this.carForm.get('ruka').value,
      adr: this.carForm.get('adr').value,
      vodici: this.myVodici,
      allVodici: this.carForm.get('allVodici').value,
      // vodici:
    };
  }

  checkBiggetSize(){
    if (this.carForm.get('autoVyska').value < this.carForm.get('priestorVyska').value ||
      this.carForm.get('autoSirka').value < this.carForm.get('priestorSirka').value ||
      this.carForm.get('autoDlzka').value <  this.carForm.get('priestorDlzka').value){
      return true;
    }else{
      return false;
    }
  }


}

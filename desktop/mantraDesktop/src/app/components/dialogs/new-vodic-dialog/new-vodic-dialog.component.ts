import {Component, Inject, OnInit} from '@angular/core';
import {DataService} from '../../../data/data.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {VodicService} from '../../../services/vodic.service';
import {FormBuilder, Validators} from '@angular/forms';
import {AccountService} from '../../../../login/_services/account.service';
import {CarService} from '../../../services/car.service';
import Vodic from '../../../models/Vodic';
import Cars from '../../../models/Cars';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-new-vodic-dialog',
  templateUrl: './new-vodic-dialog.component.html',
  styleUrls: ['./new-vodic-dialog.component.scss']
})
export class NewVodicDialogComponent implements OnInit {


  constructor(private dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any,
              private vodicService: VodicService,  private fb: FormBuilder,
              private accountService: AccountService, public dialogRef: MatDialogRef<NewVodicDialogComponent>,
              private carService: CarService) {
    dialogRef.disableClose = true;
  }
  displayedColumns: string[] = ['ecv', 'prava'];
  vodic: Vodic;
  cars: Cars[];
  allCars = false;

  myCars: string[] = [];

  dispecerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
    email: ['', [Validators.email]]
  });

  ngOnInit(): void {
    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
    });

    if (this.data){
      this.vodic = this.data.vodic;
      this.myCars = this.data.vodic.myCars;
      this.allCars = this.data.vodic.allCars;
      this.assignToForm();
    }else{
      this.vodic = new Vodic();
    }

  }

  close(){
    this.dialogRef.close();
  }

  getErrorMessage() {
    return this.dispecerForm.hasError('required') ? 'You must enter a value' :
      this.dispecerForm.get('email').hasError('email') ? 'Not a valid email' : '';
  }

  // ak nema cislo ani auto ani vodic tak nemozem priradit vodica k autu
  checkForPhone(car){
    if (car.allVodici && (car.phoneNumber || this.assignToDirector().phone)){
      return true;
    }
    if (!this.allCars){
      if (this.assignToDirector().phone || car.phoneNumber !== ''){
        return false;
      }else{
        this.myCars = this.myCars.filter(oneId => oneId !== car.id);
        return true;
      }
    }else{
      return true;
    }
  }

  // ak nema cislo ani auto ani vodic tak nemozem priradit vodica k autu
  checkForPhoneNoAllCars(car){
      if (this.assignToDirector().phone || car.phoneNumber !== ''){
        return false;
      }else{
        this.myCars = this.myCars.filter(oneId => oneId !== car.id);
        return true;
      }
  }

  catchChange(id){
    if (this.myCars){
      var jeTam = this.myCars.find(carsId => carsId === id);
      if (jeTam){
        this.myCars = this.myCars.filter(cars => cars !== id);
      }else{
        this.myCars.push(id);
      }
    }else{
      // this.vodic = {...this.vodic, myCars: []};
      this.myCars = [];
      this.myCars.push(id);
    }
  }

  vsetcviVodiciMessage(car: Cars){
    if (car.allVodici && (car.phoneNumber || this.assignToDirector().phone)){
      return true;
    }
  }

  //TODO upravit pridavanie / mazanie aut s cislom k dispecerovi s tel. cislom a naopak
  checkBox(car: Cars){
    if (car.allVodici && (car.phoneNumber || this.assignToDirector().phone)){
      return true;
    }

    if (car.vodici && this.vodic && car.vodici.includes(this.vodic.id)){
      return true;
    }

    // ked zaskrtnem vsetky auta, aby sa zaskrtli vsetky
    if (this.allCars && (car.phoneNumber !== '' || this.assignToDirector().phone !== '')){
      return true;
    }
    // ked ho najdem v mojich vozidlach, tak to zaskrtnem
    if (this.vodic){
      if (this.vodic.myCars){
        var idcko = this.vodic.myCars.find(oneCarId => oneCarId === car.id);
        if (idcko){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  updateCars(vodicId){
    let myCarsToUpdate: Cars[];
    myCarsToUpdate = this.carService.getAllCars().filter(oneCar => this.myCars.includes(oneCar.id));
    myCarsToUpdate.forEach(oneCar => {
      oneCar.vodici = oneCar.vodici.filter(oneVodic => oneVodic !== vodicId);
      oneCar.vodici.push(vodicId);
      this.carService.updateCar(oneCar, oneCar.id);
    });
  }

  updateVodic(){
    if (this.data){
      let vodic: Vodic = this.assignToDirector();
      vodic.id = this.data.vodic.id;
      if (!vodic.myCars){
        vodic.myCars = [];
      }
      this.vodicService.updateVodic(vodic);

      if (vodic.phone === ''){
        this.updateCars(vodic.id);
      }
      this.dialogRef.close();
    }
    else {
      var valuesForm: Vodic = this.assignToDirector();
      this.vodic.name = valuesForm.name;
      this.vodic.surname = valuesForm.surname;
      this.vodic.phone = valuesForm.phone;
      this.vodic.email = valuesForm.email;
      this.vodic.createdBy = valuesForm.createdBy;
      // this.vodic.createdAt = new Date().toString();
      this.vodic.myCars = this.myCars;
      if (this.dispecerForm.get('email').value){
      this.vodicService.getOneVodic(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(user => {
        if (user.length > 0){
          //tento pouzivatel uz je v databaze
          //TODO vypis ze pouzivatel sa uz nachadza v databaze
          return;
        }
        else {
          var vodic: Vodic;
          vodic = this.assignToDirector();
          vodic.createdAt = new Date().toString();
          const newIdVodica = this.vodicService.createVodic(vodic);
          if (vodic.phone === ''){
            this.updateCars(newIdVodica);
          }
          this.dispecerForm.reset();
          this.dialogRef.close();
        }
        // this.dispecerForm.reset();
        // this.dialogRef.close();
      });
      }else{ // bez emailu
        var vodic: Vodic;
        vodic = this.assignToDirector();
        vodic.createdAt = new Date().toString();
        this.vodicService.createVodic(vodic);
        this.dispecerForm.reset();
        this.dialogRef.close();
      }
    }
  }

  assignToForm(){
    this.dispecerForm.controls['firstName'].setValue(this.data.vodic.name);
    this.dispecerForm.controls['lastName'].setValue(this.data.vodic.surname);
    this.dispecerForm.controls['phoneNumber'].setValue(this.data.vodic.phone);
    this.dispecerForm.controls['email'].setValue(this.data.vodic.email);
  }

  assignToDirector(): Vodic{
    var createdBy;
    if (this.dataService.getDispecer().createdBy != 'master'){
      createdBy = this.dataService.getDispecer().createdBy;
    }else{
      createdBy = this.dataService.getDispecer().id;
    }
    return {
      name: this.dispecerForm.get('firstName').value,
      surname: this.dispecerForm.get('lastName').value,
      phone: this.dispecerForm.get('phoneNumber').value,
      email: this.dispecerForm.get('email').value,
      createdBy: createdBy.toString(),
      myCars: this.myCars,
      allCars: this.allCars
    };
  }
}

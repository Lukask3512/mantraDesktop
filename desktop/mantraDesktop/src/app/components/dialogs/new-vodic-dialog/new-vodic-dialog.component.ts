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
              private carService: CarService) { }
  displayedColumns: string[] = ['ecv', 'prava'];
  vodic: Vodic;
  cars: Cars[];
  allCars = false;

  dispecerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
    });

    if (this.data){
      this.vodic = this.data.vodic;
      this.assignToForm();
    }else{
      this.vodic = new Vodic();
    }

  }

  getErrorMessage() {
    return this.dispecerForm.hasError('required') ? 'You must enter a value' :
      this.dispecerForm.get('email').hasError('email') ? 'Not a valid email' : '';
  }

  catchChange(id){
    if (this.vodic.myCars){
      var jeTam = this.vodic.myCars.find(carsId => carsId === id);
      if (jeTam){
        this.vodic.myCars = this.vodic.myCars.filter(cars => cars !== id);
      }else{
        this.vodic.myCars.push(id);
      }
    }else{
      this.vodic = {...this.vodic, myCars: []};
      this.vodic.myCars.push(id);
    }
    console.log(this.vodic.myCars)
  }

  checkBox(id){
    if (this.vodic){
      if (this.vodic.myCars){
        var idcko = this.vodic.myCars.find(oneCarId => oneCarId === id);
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

  updateVodic(){
    if (this.data){
      this.vodicService.updateVodic(this.vodic);
    }
    else {
      var valuesForm: Vodic = this.assignToDirector();
      this.vodic.name = valuesForm.name;
      this.vodic.surname = valuesForm.surname;
      this.vodic.phone = valuesForm.phone;
      this.vodic.email = valuesForm.email;
      this.vodic.createdBy = valuesForm.createdBy;
      this.vodicService.getOneVodic(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(user => {
        if (user.length > 0){
          //tento pouzivatel uz je v databaze
          //TODO vypis ze pouzivatel sa uz nachadza v databaze
          return;
        }
        else {
          var vodic: Vodic;
          vodic = this.assignToDirector();
          this.accountService.signup(vodic.email, '123456');
          this.vodicService.createVodic(vodic);
          this.dispecerForm.reset();
          this.dialogRef.close();
        }
        this.dispecerForm.reset();
        this.dialogRef.close();
      });
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
      // console.log("master" + this.dataService.getDispecer())
      createdBy = this.dataService.getDispecer().createdBy;
    }else{
      // console.log("idecko" + this.dataService.getDispecer())

      createdBy = this.dataService.getDispecer().id;
    }
    return {
      name: this.dispecerForm.get('firstName').value,
      surname: this.dispecerForm.get('lastName').value,
      phone: this.dispecerForm.get('phoneNumber').value,
      email: this.dispecerForm.get('email').value,
      createdBy: createdBy.toString()
    };
  }
}

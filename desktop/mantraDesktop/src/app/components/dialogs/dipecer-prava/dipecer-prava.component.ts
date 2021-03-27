import {Component, Inject, OnInit} from '@angular/core';
import {CarService} from "../../../services/car.service";
import {PrivesService} from "../../../services/prives.service";
import Cars from "../../../models/Cars";
import Prives from "../../../models/Prives";
import {DataService} from "../../../data/data.service";
import Dispecer from "../../../models/Dispecer";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DispecerService} from "../../../services/dispecer.service";
import {FormBuilder, Validators} from "@angular/forms";
import {AccountService} from "../../../../login/_services/account.service";
import {take} from "rxjs/operators";
import {NewCarComponent} from "../../cars/new-car/new-car.component";

@Component({
  selector: 'app-dipecer-prava',
  templateUrl: './dipecer-prava.component.html',
  styleUrls: ['./dipecer-prava.component.scss']
})
export class DipecerPravaComponent implements OnInit {

  constructor(private carService: CarService, private privesService: PrivesService,
              private dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any,
              private dispecerService: DispecerService,  private fb: FormBuilder,
              private accountService: AccountService, public dialogRef: MatDialogRef<DipecerPravaComponent>) { }
  cars: Cars[];
  prives: Prives[];
  displayedColumns: string[] = ['ecv', 'prava'];
  dispecer: Dispecer;
  allCars = false;
  allPrives = false;

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
    this.privesService.prives$.subscribe(prives => {
      this.prives = prives;
    })
  if (this.data){
    this.dispecer = this.data.dispecer;
    this.assignToForm();
  }else{
    this.dispecer = new Dispecer();
  }

  }

  getErrorMessage() {
    return this.dispecerForm.hasError('required') ? 'You must enter a value' :
      this.dispecerForm.get('email').hasError('email') ? 'Not a valid email' : '';
  }

  catchChange(id){
    if (this.dispecer.myCars){
      var jeTam = this.dispecer.myCars.find(carsId => carsId == id);
      if (jeTam){
        this.dispecer.myCars = this.dispecer.myCars.filter(cars => cars !== id)
      }else{
        this.dispecer.myCars.push(id);
      }
    }else{
      this.dispecer = {...this.dispecer, myCars: []}
      this.dispecer.myCars.push(id);
    }
    console.log(this.dispecer.myCars)
  }

  checkBox(id){
    if (this.dispecer){
      if (this.dispecer.myCars){
        var idcko = this.dispecer.myCars.find(oneCarId => oneCarId == id);
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

  catchChangePrives(id){
    if (this.dispecer.myPrives){
      var jeTam = this.dispecer.myPrives.find(carsId => carsId == id);
      if (jeTam){
        this.dispecer.myPrives = this.dispecer.myPrives.filter(cars => cars !== id)
      }else{
        this.dispecer.myPrives.push(id);
      }
    }else{
      this.dispecer = {...this.dispecer, myPrives: []}
      this.dispecer.myPrives.push(id);
    }
    console.log(this.dispecer.myPrives)
  }

  checkBoxPrives(id){
    if (this.dispecer) {
      if (this.dispecer.myPrives) {
        var idcko = this.dispecer.myPrives.find(oneCarId => oneCarId == id);
        if (idcko) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }else {
      return false;
    }
  }

  updateDispecer(){
    if (this.data){
      this.dispecerService.updateDispecer(this.dispecer);
    }
    else {
      var valuesForm: Dispecer = this.assignToDirector();
      this.dispecer.name = valuesForm.name;
      this.dispecer.surname = valuesForm.surname;
      this.dispecer.phone = valuesForm.phone;
      this.dispecer.email = valuesForm.email;
      this.dispecer.createdBy = valuesForm.createdBy;
      console.log(this.dispecer)
      this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(user => {
        if (user.length > 0){
          //tento pouzivatel uz je v databaze
          //TODO vypis ze pouzivatel sa uz nachadza v databaze
          return;
        }
        else {
          this.dispecerService.createDispecer(this.assignToDirector());
          this.accountService.signup(this.dispecerForm.get('email').value, "123456");
          this.dispecerForm.reset();
          this.dialogRef.close();
        }
      })
    }
  }

  assignToForm(){
    this.dispecerForm.controls['firstName'].setValue(this.data.dispecer.name);
    this.dispecerForm.controls['lastName'].setValue(this.data.dispecer.surname);
    this.dispecerForm.controls['phoneNumber'].setValue(this.data.dispecer.phone);
    this.dispecerForm.controls['email'].setValue(this.data.dispecer.email);
  }

  assignToDirector(): Dispecer{
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
      status: false,
      createdBy: createdBy
    };
  }
}

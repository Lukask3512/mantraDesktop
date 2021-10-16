import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';
import {FormBuilder, Validators} from '@angular/forms';
import Cars from '../../../models/Cars';
import Company from '../../../models/Company';
import {CompanyService} from '../../../services/company.service';
import {DispecerService} from '../../../services/dispecer.service';
import Dispecer from '../../../models/Dispecer';
import {take} from 'rxjs/operators';
import {AccountService} from '../../../../login/_services/account.service';
import {EmailService} from '../../../services/email/email.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import Route from '../../../models/Route';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  companyForm = this.fb.group({
    name: ['', Validators.required],
    street: ['', Validators.required],
    town: ['', Validators.required],
    country: ['', Validators.required],
    ico: ['', Validators.required],
    dicIc: ['', Validators.required],
    poistenie: [''],
    licence: ['', Validators.required],

    poistkaToggle: false,
  });

  dispecerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  dispecer;
  company: Company;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AddCompanyComponent>,
              private fb: FormBuilder, private companyService: CompanyService, private dispecerService: DispecerService,
              private accountService: AccountService, private emailService: EmailService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    console.log(this.data);
    if (this.data){
      this.company = this.data;
      this.companyForm.controls.name.setValue(this.data.name);
      this.companyForm.controls.street.setValue(this.data.street);
      this.companyForm.controls.town.setValue(this.data.town);
      this.companyForm.controls.country.setValue(this.data.country);
      this.companyForm.controls.ico.setValue(this.data.ico);
      this.companyForm.controls.dicIc.setValue(this.data.dicIc);
      this.companyForm.controls.licence.setValue(this.data.licenceUntil);
      if (this.data.poistenie){
        this.companyForm.controls.poistenie.setValue(this.data.poistenie);
        this.companyForm.controls.poistkaToggle.setValue(true);
      }
      // this.dispecerForm.disable();
      // this.dispecerForm.set = true;
      this.dispecerForm.get('email').disable();
      this.getDispecer();
    }
  }

  getDispecer(){
   this.dispecerService.getMasterDispecerByCompany(this.data.id).subscribe(myDispecers => {
     this.dispecer = myDispecers[0];
     this.dispecerForm.controls.firstName.setValue(myDispecers[0].name);
     this.dispecerForm.controls.lastName.setValue(myDispecers[0].surname);
     this.dispecerForm.controls.phoneNumber.setValue(myDispecers[0].phone);
     this.dispecerForm.controls.email.setValue(myDispecers[0].email);
   });
  }

  openSnackBar(message: string, action) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 4000
    });
  }

  sendMailToRegisteredUser(){
    let email  = this.dispecerForm.get('email').value;
    let header  = 'Vitajte v aplikacii Mantra';
    let text  = 'Vase prihlasovacie meno:' + this.dispecerForm.get('email').value + ', vase heslo nebolo zmenene. Pokial si heslo nepamatate' +
      'mozete ho zmenit na stranke http://prototyp.mantra-online.eu. ' ;

    let reqObj = {
      email: email,
      header: header,
      text: text
    };
    this.emailService.sendMessage(reqObj).subscribe(data => {
      console.log(data);
    });
  }

  sendMail(password){

    let email  = this.dispecerForm.get('email').value;
    let header  = 'Vitajte v aplikacii Mantra';
    let text  = 'Vase prihlasovacie meno:' + this.dispecerForm.get('email').value + ', vase heslo: ' + password +
      ' http://prototyp.mantra-online.eu';

    let reqObj = {
      email: email,
      header: header,
      text: text
    }
    console.log(reqObj)
    this.emailService.sendMessage(reqObj).subscribe(data => {
      console.log(data);
    })
  }

  async saveCompany(){
    if (this.data){

    }else{
      this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(async user => {
        if (user.length > 0){
          // tento pouzivatel uz je v databaze
          // TODO vypis ze pouzivatel sa uz nachadza v databaze
          return;
        }
        else {
          this.checkCompanyForIco().then(res => {
            if (res){
              this.checkCompaniesForDico().then(async resDico => {
                if (resDico){
                  // var password = Math.random().toString(36).slice(-8);
                  var password = '123456';
                    await this.accountService.signup(this.dispecerForm.get('email').value, password).then((registrovany => {
                    if (registrovany){
                      this.sendMailToRegisteredUser();
                    }else{
                      this.sendMail(password);
                    }
                  }));

                  const idOfCompany = await this.companyService.createCompany(this.assignToCompany());

                  this.dispecerService.createDispecer(this.assignToDispecer(idOfCompany));

                  this.dispecerForm.reset();
                  this.dialogRef.close();

                }
              });
            }
          });


        }
      });
    }
  }

  checkFormsValid(){
    if (this.data){ // ked upravujem tak nekontrolujem ci je dispecer validny, lebo sa neda upravcovat
      return !this.companyForm.valid;
    }
    return !(this.dispecerForm.valid && this.companyForm.valid);
  }

  updatePoistenieForm(){
    if (this.companyForm.get('poistkaToggle').value === true){
      this.companyForm.get('poistenie').setValidators(Validators.required);
    }else{
      this.companyForm.get('poistenie').clearValidators();
    }
    this.companyForm.get('poistenie').updateValueAndValidity();
  }

  checkCompaniesForDico() {
      return new Promise((resolve, reject) => {
        if (!this.company || this.company.dicIc !== this.assignToCompany().dicIc){
          this.companyService.getCompanyByDico(this.assignToCompany().dicIc).pipe(take(1)).subscribe(companiesDic => {
          if (companiesDic.length > 0) {
            this.openSnackBar('Spolocnost s takym dic sa už nachádza v databáze', 'Ok');
            resolve(false);
            return;
          }else{
            resolve(true);
          }
        });
      }else{
        resolve(true);
      }
    });

  }

  checkCompanyForIco(){
    return new Promise((resolve, reject) => {
      if (!this.company || this.company.ico !== this.assignToCompany().ico){
        this.companyService.getCompanyByIco(this.assignToCompany().ico).pipe(take(1)).subscribe(companies => {
          if (companies.length > 0) {
            this.openSnackBar('Spolocnost s takym ico sa už nachádza v databáze', 'Ok');
            resolve(false);
            return;
          }else{
            resolve(true);
          }
        });
      }else{
        resolve(true);
      }
    });

  }

  updateCompany(){
    var dispecer = this.assignToDispecer(this.company.id);
    dispecer.id = this.dispecer.id;
    this.checkCompanyForIco().then(res => {
      if (res){
        this.checkCompaniesForDico().then(resDico => {
          if (resDico){
            this.dispecerService.updateDispecer(dispecer);
            this.companyService.updateCompany(this.assignToCompany(), this.company.id);
            this.dialogRef.close();
          }
        });
      }
    });
  }
  // this.carForm.get('nosnost').value,
  assignToCompany(): Company {
    let poistenie;
    if (this.companyForm.get('poistkaToggle').value) {
      poistenie = this.companyForm.get('poistenie').value;
    }else{
      poistenie = null;
    }

    return {
      name: this.companyForm.get('name').value,
      ico: this.companyForm.get('ico').value,
      dicIc: this.companyForm.get('dicIc').value,
      poistenie,
      street: this.companyForm.get('street').value,
      town: this.companyForm.get('town').value,
      country: this.companyForm.get('country').value,
      licenceUntil: this.companyForm.get('licence').value,
    };
  }

  assignToDispecer(idOfCompany): Dispecer {
    return {
      name: this.dispecerForm.get('firstName').value,
      surname: this.dispecerForm.get('lastName').value,
      phone: this.dispecerForm.get('phoneNumber').value,
      email: this.dispecerForm.get('email').value,
      status: false,
      createdBy: 'master',
      companyId: idOfCompany,
      allPrives: true,
      allCars: true
    };
  }


  getErrorMessage() {
    return this.dispecerForm.hasError('required') ? 'You must enter a value' :
      this.dispecerForm.get('email').hasError('email') ? 'Not a valid email' : '';
  }

}

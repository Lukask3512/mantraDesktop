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
import {TranslateService} from '@ngx-translate/core';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  companyForm = this.fb.group({
    psc: ['', Validators.required],
    name: ['', Validators.required],
    street: ['', Validators.required],
    town: ['', Validators.required],
    country: ['', Validators.required],
    ico: [''],
    dicIc: [''],
    iban: [''],
    poistenie: [''],
    licence: ['', Validators.required],

    poistkaToggle: false,

    infoAbout: ['']

  });

  numberOfAccessForm = this.fb.group({
    numberOfCars: [1, Validators.required],
    numberOfDrivers: [1, Validators.required],
    numberOfDispatchers: [1, Validators.required]
  });

  dispecerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  dispecer: Dispecer;
  company: Company;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AddCompanyComponent>,
              private fb: FormBuilder, private companyService: CompanyService, private dispecerService: DispecerService,
              private accountService: AccountService, private emailService: EmailService, private snackBar: MatSnackBar,
              private translate: TranslateService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    console.log(this.data);
    if (this.data){
      this.company = this.data;
      this.companyForm.controls.name.setValue(this.data.name);
      this.companyForm.controls.psc.setValue(this.data.psc);
      this.companyForm.controls.street.setValue(this.data.street);
      this.companyForm.controls.town.setValue(this.data.town);
      this.companyForm.controls.country.setValue(this.data.country);
      this.companyForm.controls.ico.setValue(this.data.ico);
      this.companyForm.controls.dicIc.setValue(this.data.dicIc);
      this.companyForm.controls.iban.setValue(this.data.iban);
      this.companyForm.controls.licence.setValue(this.data.licenceUntil);
      this.companyForm.controls.infoAbout.setValue(this.data.infoAbout);

      if (this.data.poistenie){
        this.companyForm.controls.poistenie.setValue(this.data.poistenie);
        this.companyForm.controls.poistkaToggle.setValue(true);
      }

      this.numberOfAccessForm.controls.numberOfCars.setValue(this.data.numberOfCars);
      this.numberOfAccessForm.controls.numberOfDrivers.setValue(this.data.numberOfDrivers);
      this.numberOfAccessForm.controls.numberOfDispatchers.setValue(this.data.numberOfDispetchers);

      // this.dispecerForm.get('email').disable();
      this.getDispecer();
    }
  }

  emailChanged(){
    if (this.dispecer && this.dispecer.email !== this.dispecerForm.get('email').value){
      return false;
    }else{
      return true;
    }
  }

  deleteOldDispecerAneChangeNew(){
    this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(oneDispecer => {
      if (oneDispecer[0] && oneDispecer[0].companyId !== this.company.id){
        console.log('tento email sa nachadza v inej spolocnosti');
        this.openSnackBar('Tento pouzivatel sa nachadza v inej spolocnosti', 'Ok');
        this.spinner.hide();
        return;
      } else if (oneDispecer[0]){
        let newDispecer: Dispecer = JSON.parse(JSON.stringify(oneDispecer[0]));
        newDispecer.id = this.dispecer.id;
        newDispecer.createdBy = 'master';
        newDispecer.allPrives = true;
        newDispecer.allCars = true;
        this.dispecerService.updateDispecer(newDispecer).then(() => {
          this.dispecerService.deleteDispecer(oneDispecer[0].id);
          this.spinner.hide();
          this.dialogRef.close();
        });
      }else{
        // tu ked pridavam taky email, aky este v db nie je
        let newDispecer = this.assignToDispecer(this.company.id);
        newDispecer.id = this.dispecer.id;
        this.dispecerService.updateDispecerWithOldIdAndNewDispecer(newDispecer, this.dispecer.id).then(() => {
          const password = Math.random().toString(36).slice(-8);
          this.sendMail(password);
          // this.sendMailToRegisteredUser();
          this.spinner.hide();
          this.dialogRef.close();
        });
      }
    });
  }

  getDispecer(){
   this.dispecerService.getMasterDispecerByCompany(this.data.id).subscribe(myDispecers => {
     this.dispecer = myDispecers[0];
     console.log(this.dispecer)
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
    const email  = this.dispecerForm.get('email').value;
    const header  = this.translate.instant('EMAIL.welcome');
    const text  = this.translate.instant('EMAIL.prihlasovacieMeno') + this.dispecerForm.get('email').value + ' ' +
      this.translate.instant('EMAIL.neboloZmenene') ;

    const reqObj = {
      email,
      header,
      text
    };
    this.emailService.sendMessage(reqObj).subscribe(data => {
      console.log(data);
    });
  }

  sendMail(password){

    const email  = this.dispecerForm.get('email').value;
    const header  = this.translate.instant('EMAIL.welcome');
    const text  = this.translate.instant('EMAIL.prihlasovacieMeno') + ' ' + this.dispecerForm.get('email').value + ' ' +
      this.translate.instant('EMAIL.heslo') + password + ' ' +
      'https://prototyp.mantra-online.eu' + ' ' + 'Pokial sa uz pouzivatel v aplikacii nachadza, heslo mu zmenene nebolo.';

    const reqObj = {
      email,
      header,
      text
    };
    console.log(reqObj);
    this.emailService.sendMessage(reqObj).subscribe(data => {
      console.log(data);
    });
  }

  async saveCompany(){
    this.spinner.show();
    if (this.data){
      this.spinner.hide();
    }else{
      this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).pipe(take(1)).subscribe(async user => {
        if (user.length > 0){
          this.openSnackBar(this.translate.instant('POPUPS.emailSaUzNachadza'), 'Ok');
          this.spinner.hide();
          return;
        }
        else {
          this.checkCompanyForName().then(resName => {
            if (resName){
            this.checkCompanyForIco().then(res => {
              if (res){
                this.checkCompaniesForDico().then(async resDico => {
                  if (resDico){
                    const password = Math.random().toString(36).slice(-8);
                    // password = '123456';
                    await this.accountService.signup(this.dispecerForm.get('email').value, password).then((registrovany => {
                      if (registrovany){
                        this.sendMailToRegisteredUser();
                      }else{
                        this.sendMail(password);
                      }
                    }));

                    const idOfCompany = await this.companyService.createCompany(this.assignToCompany());

                    this.dispecerService.createDispecer(this.assignToDispecer(idOfCompany));
                    this.spinner.hide();
                    this.dispecerForm.reset();
                    this.dialogRef.close();
                    this.openSnackBar(this.translate.instant('POPUPS.bolaVytvorena'), 'Ok');
                  }
                });
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
            this.openSnackBar(this.translate.instant('POPUPS.dicNachadza'), 'Ok');
            this.spinner.hide();
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
            this.openSnackBar(this.translate.instant('POPUPS.icoNachadza'), 'Ok');
            this.spinner.hide();
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

  checkCompanyForName(){
    return new Promise((resolve, reject) => {
      if (!this.company || this.company.name !== this.assignToCompany().name){
        this.companyService.getCompanyByName(this.assignToCompany().name).pipe(take(1)).subscribe(companies => {
          if (companies.length > 0) {
            this.openSnackBar(this.translate.instant('POPUPS.nazovNachadza'), 'Ok');
            this.spinner.hide();
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
    const dispecer = this.assignToDispecer(this.company.id);
    dispecer.id = this.dispecer.id;
    this.checkCompanyForIco().then(res => {
      if (res){
        this.checkCompaniesForDico().then(resDico => {
          if (resDico){
            if (this.dispecer.email === dispecer.email){
              this.dispecerService.updateDispecer(dispecer);
              this.companyService.updateCompany(this.assignToCompany(), this.company.id);
              this.spinner.hide();
              this.dialogRef.close();
            }else{
              this.companyService.updateCompany(this.assignToCompany(), this.company.id);
              this.deleteOldDispecerAneChangeNew();
            }
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
    let infoAboutCompany = '';
    if (this.companyForm.get('infoAbout').value){
      infoAboutCompany = this.companyForm.get('infoAbout').value
    }

    let companyIban = '';
    if (this.companyForm.get('iban').value){
      companyIban = this.companyForm.get('iban').value
    }


    return {
      name: this.companyForm.get('name').value,
      ico: this.companyForm.get('ico').value,
      dicIc: this.companyForm.get('dicIc').value,
      poistenie,
      psc: this.companyForm.get('psc').value,
      street: this.companyForm.get('street').value,
      town: this.companyForm.get('town').value,
      country: this.companyForm.get('country').value,
      licenceUntil: this.companyForm.get('licence').value,
      iban: companyIban,

      numberOfCars: this.numberOfAccessForm.get('numberOfCars').value,
      numberOfDispetchers: this.numberOfAccessForm.get('numberOfDispatchers').value,
      numberOfDrivers: this.numberOfAccessForm.get('numberOfDrivers').value,

      infoAbout: infoAboutCompany,
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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {take} from 'rxjs/operators';

import { AccountService } from 'src/login/_services/account.service';
import {DispecerService} from '../../app/services/dispecer.service';
import {DataService} from '../../app/data/data.service';
import Dispecer from '../../app/models/Dispecer';
import {GetOneCompanyService} from '../../app/services/companies/get-one-company.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EmailService} from '../../app/services/email/email.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  loading = false;
  submitted = false;
  // email: string;
  // password: string;

  isLinear = false;


  user: Dispecer;

  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],

  });


  // siteLanguage: string = 'English';
  // siteLocale: string;
  // languageList = [
  //   { code: 'en', label: 'English' },
  //   { code: 'fr', label: 'Français' },
  //   { code: 'de', label: 'Deutsch' }
  // ];
  lang;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public accountService: AccountService,
    private dispecerService: DispecerService,
    private dataService: DataService,
    private companyService: GetOneCompanyService,
    private _snackBar: MatSnackBar,
    private emailService: EmailService,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private cookieService: CookieService,
  ) { }

  ngOnInit() {
    this.lang = localStorage.getItem('lang') || 'en';
    this.deleteAllCookies();
  }

  deleteAllCookies() {
    this.cookieService.deleteAll();
    let cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      let eqPos = cookie.indexOf('=');
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  changeLang(lang){
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }


  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  loginOnEnter(event: Event){
    console.log('som v logine on enter');
    event.preventDefault();
    this.login();
  }

  login() {
    this.spinner.show();

    this.accountService.login(this.loginForm.get('email').value, this.loginForm.get('password').value).subscribe(user => {
      if (user){

      this.dispecerService.getOneDispecer(user.user.email).pipe(take(1)).subscribe(user => {
        // @ts-ignore
        this.user = user[0];
        if (this.user){
          this.companyService.getCompany(this.user.companyId).pipe(take(1)).subscribe(myCompany => {
            if (new Date(myCompany.licenceUntil) >= new Date()){
              this.dataService.setDispecer(this.user);
              if (user){
                this.router.navigate(['/view/cars']);
                this.spinner.hide();
              }
            }else{
              this.spinner.hide();
              this.openSnackBar('Licencia vyprsala.', 'Ok');
            }
          });
        }else{
          this.spinner.hide();
          this.openSnackBar('Pouzivatel nenajdeny', 'Ok');
        }
      });
      }else{
        this.spinner.hide();
      }

    });
    this.loginForm.controls.email.setValue('');
    this.loginForm.controls.password.setValue('');
  }


  resetPass(){
    this.accountService.passwordReset(this.loginForm.get('email').value);
    this.openSnackBar('Na emailovu adresu bol zaslany email', 'Ok');
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  logout() {
    this.accountService.logout();
  }
  }

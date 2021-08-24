import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {take} from 'rxjs/operators';

import { AccountService } from 'src/login/_services/account.service';
import {DispecerService} from "../../app/services/dispecer.service";
import {DataService} from "../../app/data/data.service";
import Dispecer from "../../app/models/Dispecer";
import {GetOneCompanyService} from '../../app/services/companies/get-one-company.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EmailService} from '../../app/services/email/email.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  // styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  email: string;
  password: string;

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  user: Dispecer;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public accountService: AccountService,
    private dispecerService: DispecerService,
    private dataService: DataService,
    private companyService: GetOneCompanyService,
    private _snackBar: MatSnackBar,
    private emailService: EmailService
  ) { }

  ngOnInit() {



    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });


    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit


    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
  }

  signup() {
    this.accountService.signup(this.email, this.password);
    this.email = this.password = '';
  }

  sendMail(){
    var password = Math.random().toString(36).slice(-8);

    let email  = 'maf3@azet.sk';
    let header  = 'Vitajte v aplikacii Mantra';
    let text  = 'Vase prihlasovacie meno: maf3@azet.sk, vase heslo: ' + password;

    let reqObj = {
      email: email,
      header: header,
      text: text
    }
    this.emailService.sendMessage(reqObj).subscribe(data => {
      console.log(data);
    })
  }
  login() {
    this.accountService.login(this.email, this.password).subscribe(user => {
      this.dispecerService.getOneDispecer(user.user.email).pipe(take(1)).subscribe(user => {
        // @ts-ignore
        this.user = user[0];
        if (this.user){
          this.companyService.getCompany(this.user.companyId).pipe(take(1)).subscribe(myCompany => {
            if (new Date(myCompany.licenceUntil) >= new Date()){
              this.dataService.setDispecer(this.user);
              if (user){
                this.router.navigate(['/view/cars']);
              }
            }else{
              this.openSnackBar('Licencia vyprsala.', 'Ok');
            }
          });
        }else{
          this.openSnackBar('Pouzivatel nenajdeny', 'Ok');
        }
      });

    });
    this.email = this.password = '';
  }

  resetPass(){
    this.accountService.passwordReset(this.email);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  logout() {
    this.accountService.logout();
  }
  }

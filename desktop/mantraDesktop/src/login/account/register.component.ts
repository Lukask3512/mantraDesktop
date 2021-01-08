import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from 'src/login/_services/account.service';
import {DispecerService} from "../../app/services/dispecer.service";
import {DataService} from "../../app/data/data.service";
import Dispecer from "../../app/models/Dispecer";




@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  email: string;
  password: string;

  user:{ photoUrl?: string; phone: number; createdBy?: string; name: string; id: string; email: string; status: boolean }[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public accountService: AccountService,
    private dispecerService: DispecerService,
    private dataService: DataService
  ) { }

  ngOnInit() {

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

  login() {
    this.accountService.login(this.email, this.password).subscribe(user => {
      console.log(user.user.email);
      this.dispecerService.getOneDispecer(user.user.email).subscribe(user => {
        // @ts-ignore
        this.user = user[0];
        this.dataService.setDispecer(this.user);
        if (user){
          this.router.navigate(['/view/cars']);
        }
      })

    });
    this.email = this.password = '';
  }

  logout() {
    this.accountService.logout();
  }
  }

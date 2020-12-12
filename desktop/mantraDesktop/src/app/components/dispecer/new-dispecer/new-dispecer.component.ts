import { Component, OnInit } from '@angular/core';
import {DispecerService} from "../../../services/dispecer.service";
import Dispecer from "../../../models/Dispecer";
import {FormBuilder, Validators} from "@angular/forms";
import {DataService} from "../../../data/data.service";
import {AccountService} from "../../../../login/_services/account.service";

@Component({
  selector: 'app-new-dispecer',
  templateUrl: './new-dispecer.component.html',
  styleUrls: ['./new-dispecer.component.scss']
})
export class NewDispecerComponent implements OnInit {
  dispecerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', Validators.required]
  });

  constructor(private accountService: AccountService, private dispecerService: DispecerService, private fb: FormBuilder, private dataService: DataService) { }

  ngOnInit(): void {

  }

  saveDispecer(){
    this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).subscribe(user => {
      if (user.length > 0){
        //tento pouzivatel uz je v databaze
        //TODO vypis ze pouzivatel sa uz nachadza v databaze
        return;
      }
      else {
        this.dispecerService.createDispecer(this.assignToDirector());
        this.accountService.signup(this.dispecerForm.get('email').value, "123456");
        this.dispecerForm.reset();

      }
    })

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

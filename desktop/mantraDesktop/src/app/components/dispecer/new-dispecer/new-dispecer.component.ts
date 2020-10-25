import { Component, OnInit } from '@angular/core';
import {DispecerService} from "../../../services/dispecer.service";
import Dispecer from "../../../models/Dispecer";
import {FormBuilder, Validators} from "@angular/forms";

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

  constructor(private dispecerService: DispecerService, private fb: FormBuilder) { }

  ngOnInit(): void {

  }

  saveDispecer(){
    this.dispecerService.createDispecer(this.assignToDirector());
    this.dispecerForm.reset();
  }

  assignToDirector(): Dispecer{
    return {
      name: this.dispecerForm.get('firstName').value,
      phone: this.dispecerForm.get('phoneNumber').value,
      email: this.dispecerForm.get('email').value,
      status: false
    };
  }

}

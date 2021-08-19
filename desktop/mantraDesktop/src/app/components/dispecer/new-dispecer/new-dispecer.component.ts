import { Component, OnInit } from '@angular/core';
import {DispecerService} from "../../../services/dispecer.service";
import Dispecer from "../../../models/Dispecer";
import {FormBuilder, Validators} from "@angular/forms";
import {DataService} from "../../../data/data.service";
import {AccountService} from "../../../../login/_services/account.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DipecerPravaComponent} from "../../dialogs/dipecer-prava/dipecer-prava.component";

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

  constructor(private dialog: MatDialog, private accountService: AccountService,
              private dispecerService: DispecerService, private fb: FormBuilder,
              private dataService: DataService) { }

  ngOnInit(): void {

  }

  // saveDispecer(){
  //   this.dispecerService.getOneDispecer(this.dispecerForm.get('email').value).subscribe(user => {
  //     if (user.length > 0){
  //       //tento pouzivatel uz je v databaze
  //       //TODO vypis ze pouzivatel sa uz nachadza v databaze
  //       return;
  //     }
  //     else {
  //       this.dispecerService.createDispecer(this.assignToDirector());
  //       this.accountService.signup(this.dispecerForm.get('email').value, "123456");
  //       this.dispecerForm.reset();
  //
  //     }
  //   })
  //
  // }


  openDialog(){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    // dialogConfig.data = {
    //   dispecer: this.dispecer
    // }
    const dialogRef = this.dialog.open(DipecerPravaComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

}

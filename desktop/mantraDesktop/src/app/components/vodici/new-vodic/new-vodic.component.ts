import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AccountService} from '../../../../login/_services/account.service';
import {DataService} from '../../../data/data.service';
import {VodicService} from '../../../services/vodic.service';
import Vodic from '../../../models/Vodic';
import {NewVodicDialogComponent} from '../../dialogs/new-vodic-dialog/new-vodic-dialog.component';

@Component({
  selector: 'app-new-vodic',
  templateUrl: './new-vodic.component.html',
  styleUrls: ['./new-vodic.component.scss']
})
export class NewVodicComponent implements OnInit {
  vodicForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', Validators.required]
  });

  constructor(private dialog: MatDialog, private accountService: AccountService, private vodicService: VodicService,
              private fb: FormBuilder, private dataService: DataService) {
  }

  ngOnInit(): void {

  }

  // saveDispecer() {
  //   this.vodicService.getOneVodic(this.vodicForm.get('email').value).subscribe(user => {
  //     if (user.length > 0) {
  //       //tento pouzivatel uz je v databaze
  //       //TODO vypis ze pouzivatel sa uz nachadza v databaze
  //       return;
  //     } else {
  //       this.vodicService.createVodic(this.assignToDirector());
  //       this.accountService.signup(this.vodicForm.get('email').value, "123456");
  //       this.vodicForm.reset();
  //
  //     }
  //   });
  //
  // }
  //
  // assignToDirector(): Vodic {
  //   var createdBy;
  //   if (this.dataService.getDispecer().createdBy != 'master') {
  //     // console.log("master" + this.dataService.getDispecer())
  //     createdBy = this.dataService.getDispecer().createdBy;
  //   } else {
  //     // console.log("idecko" + this.dataService.getDispecer())
  //
  //     createdBy = this.dataService.getDispecer().id;
  //   }
  //   return {
  //     name: this.vodicForm.get('firstName').value,
  //     surname: this.vodicForm.get('lastName').value,
  //     phone: this.vodicForm.get('phoneNumber').value,
  //     email: this.vodicForm.get('email').value,
  //     createdBy: createdBy.toString()
  //   };
  // }

  openDialog(){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    // dialogConfig.data = {
    //   dispecer: this.dispecer
    // }
    const dialogRef = this.dialog.open(NewVodicDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }
}

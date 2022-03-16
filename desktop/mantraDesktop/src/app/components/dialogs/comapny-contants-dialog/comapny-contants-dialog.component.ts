import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';
import Company from '../../../models/Company';
import {DispecerService} from '../../../services/dispecer.service';
import {take} from 'rxjs/operators';
import Dispecer from '../../../models/Dispecer';
import {MatTableDataSource} from '@angular/material/table';
import {NgxSpinnerService} from 'ngx-spinner';
import {DataService} from '../../../data/data.service';
import Route from '../../../models/Route';

@Component({
  selector: 'app-comapny-contants-dialog',
  templateUrl: './comapny-contants-dialog.component.html',
  styleUrls: ['./comapny-contants-dialog.component.scss']
})
export class ComapnyContantsDialogComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ['meno', 'priezvisko', 'cislo', 'email'];

  company: Company;
  dispecers: Dispecer[];
  route: Route;
  masterIdToSend;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ComapnyContantsDialogComponent>,
              private dispecerService: DispecerService, private spinner: NgxSpinnerService, private dataService: DataService) {
    this.route = this.data;
    if (this.route.createdBy === this.dataService.getMyIdOrMaster()){
      this.masterIdToSend = this.route.takenBy;
    }else{
      this.masterIdToSend = this.route.createdBy;
    }
  }


  ngOnInit(): void {
    this.spinner.show();
  }

  getDispecers(){
    this.dispecerService.getDispecersByCompany(this.company).pipe(take(1)).subscribe(allDispecers => {
      this.dispecers = allDispecers;
      this.dataSource = new MatTableDataSource(this.dispecers);
      console.log(this.dispecers);
      this.spinner.hide();
    });
  }

  getCompany(company: Company){
    this.company = company;
    this.getDispecers();
  }

  closeDialog(){
    this.dialogRef.close();
  }

}

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import Company from '../../../models/Company';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCompanyComponent} from '../../dialogs/add-company/add-company.component';

@Component({
  selector: 'app-one-company',
  templateUrl: './one-company.component.html',
  styleUrls: ['./one-company.component.scss']
})
export class OneCompanyComponent implements OnChanges {

  @Input() companies: Company[];
  dataSource;
  displayedColumns: string[] = ['nazov', 'ulica', 'mesto', 'stat', 'ico', 'dic',  'poistenie', 'licencia', 'update'];
  constructor(private dialog: MatDialog,) { }

  ngOnChanges(changes: SimpleChanges){
    if (changes.companies.currentValue) {
      this.dataSource = new MatTableDataSource(changes.companies.currentValue);
    }
  }

  updateCompany(company){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = company;
    const dialogRef = this.dialog.open(AddCompanyComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }
  deleteCompany(){

  }

  addCompany(){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(AddCompanyComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

}

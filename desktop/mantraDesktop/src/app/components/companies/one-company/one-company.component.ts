import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import Company from '../../../models/Company';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCompanyComponent} from '../../dialogs/add-company/add-company.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-one-company',
  templateUrl: './one-company.component.html',
  styleUrls: ['./one-company.component.scss']
})
export class OneCompanyComponent implements OnChanges, AfterViewInit {


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  @Input() companies: Company[];
  dataSource;
  displayedColumns: string[] = ['name', 'street', 'town', 'country', 'ico', 'dicIc',  'poistenie', 'licenceUntil', 'update'];
  constructor(private dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges){
    if (changes.companies.currentValue) {
      this.dataSource = new MatTableDataSource(changes.companies.currentValue);
      this.dataSource.paginator = this.paginator;
      setTimeout(() => {
        this.dataSource.sort = this.sort;
      }, 1000);
    }
  }

  ngAfterViewInit() {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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

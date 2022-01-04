import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DispecerService} from '../../../services/dispecer.service';
import Company from '../../../models/Company';
import Dispecer from '../../../models/Dispecer';
import {take} from 'rxjs/operators';
import {CarService} from '../../../services/car.service';
import Cars from '../../../models/Cars';
import {MatTableDataSource} from '@angular/material/table';
import {RouteStatusService} from '../../../data/route-status.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-company-detail-about',
  templateUrl: './company-detail-about.component.html',
  styleUrls: ['./company-detail-about.component.scss']
})
export class CompanyDetailAboutComponent implements OnInit {

  company: Company;
  dispecer: Dispecer;
  cars: Cars[];

  dataSource;
  displayedColumns: string[] = ['ecv', 'status', 'createdAt'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CompanyDetailAboutComponent>,
              private dispecerService: DispecerService, private carService: CarService,
              public routeStatusService: RouteStatusService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.company = this.data;
    this.getDispecer(this.company.id);
  }

  getDispecer(companyId){
    this.spinner.show();
    this.dispecerService.getMasterDispecerByCompany(companyId).pipe(take(1)).subscribe(myDispecers => {
      this.dispecer = myDispecers[0];
      this.getCars();
    });
  }

  getCars(){
    this.carService.getCars(this.dispecer.id).subscribe(allCarsForCompany => {
      this.cars = allCarsForCompany;
      this.dataSource = new MatTableDataSource(this.cars);
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();
    });
  }

  toLocalString(date){
    const datum = new Date(date);
    return datum.toLocaleString();
  }

}

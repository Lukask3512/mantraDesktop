import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../dialogs/add-car-dialog/add-car-dialog.component';
import {AddCompanyComponent} from '../../dialogs/add-company/add-company.component';
import {CompanyService} from '../../../services/company.service';
import Company from '../../../models/Company';

@Component({
  selector: 'app-companies-wrapper',
  templateUrl: './companies-wrapper.component.html',
  styleUrls: ['./companies-wrapper.component.scss']
})
export class CompaniesWrapperComponent implements OnInit {

  constructor(private dialog: MatDialog, private companyService: CompanyService) { }

  companies: Company[];
  ngOnInit(): void {
    this.companyService.companies$.subscribe(allCompanies => {
      this.companies = allCompanies;
    });
  }





}

import {Component, Input, OnInit} from '@angular/core';
import Company from '../../../models/Company';

@Component({
  selector: 'app-one-company',
  templateUrl: './one-company.component.html',
  styleUrls: ['./one-company.component.scss']
})
export class OneCompanyComponent implements OnInit {

  @Input() company: Company;
  constructor() { }

  ngOnInit(): void {
  }

}

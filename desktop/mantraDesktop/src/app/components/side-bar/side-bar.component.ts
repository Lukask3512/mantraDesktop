import { Component, OnInit } from '@angular/core';
import {DataService} from '../../data/data.service';
import Route from '../../models/Route';
import Company from '../../models/Company';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor(private dataService: DataService) { }

  company: Company;

  ngOnInit(): void {
    this.company = this.dataService.getLoggedInCompany();

  }

  getCompany(){
    if (this.dataService.getDispecer().email === 'mantra@mantra.sk' ||
      this.dataService.getDispecer().email === 'manage.transport.repeat@gmail.com'){
        return true;
    }else{
         return false;
    }
  }

  routeDetail(route: Route){
    this.dataService.changeRealRoute(route);
  }
}

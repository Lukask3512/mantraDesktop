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

  sideBarOpen = true;

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

  changeSideBar(){
    console.log(this.sideBarOpen)
    this.sideBarOpen = !this.sideBarOpen;
  }

  cutLongCompanyName(companyName){
    let shortCompany = companyName;
    if (this.sideBarOpen){
      if (companyName.length > 13) {
        shortCompany = companyName.substring(0, 10) + '...';
      }
    }else{
      if (companyName.length > 7) {
        shortCompany = companyName.substring(0, 5) + '...';
      }
    }
    return shortCompany;
  }
}

import { Component, OnInit } from '@angular/core';
import {DataService} from '../../data/data.service';
import Route from '../../models/Route';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  getCompany(){
    return this.dataService.getDispecer().email === 'mantra@mantra.sk';
  }

  routeDetail(route: Route){
    this.dataService.changeRealRoute(route);
  }
}

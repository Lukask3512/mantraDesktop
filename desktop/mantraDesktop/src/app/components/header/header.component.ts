import { Component, OnInit, ElementRef } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import {DataService} from "../../data/data.service";
import {AccountService} from "../../../login/_services/account.service";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public focus;
  public listTitles: any[];
  public location: Location;
  constructor(location: Location,  private element: ElementRef,
              private router: Router, private dataService: DataService,
              private accountService: AccountService
  ) {
    this.location = location;
  }

  ngOnInit() {
  }
  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
      titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
      if(this.listTitles[item].path === titlee){
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }
  logout(){
    this.dataService.setDispecer(null);
    this.accountService.logout();
  }

}

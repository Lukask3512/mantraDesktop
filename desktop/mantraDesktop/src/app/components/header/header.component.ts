import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
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
  @ViewChild('navbar') navBar: ElementRef;
  @ViewChild('navMenu') navMenu: ElementRef;

  public focus;
  public listTitles: any[];
  public location: Location;

  siteLanguage: string = 'English';
  siteLocale: string;
  languageList = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];

  constructor(location: Location,  private element: ElementRef,
              private router: Router, private dataService: DataService,
              private accountService: AccountService
  ) {
    this.location = location;
  }



  ngOnInit() {
    this.siteLocale = window.location.pathname.split('/')[1];
    this.siteLanguage = this.languageList.find(f => f.code === this.siteLocale).label;
  }

  getCompany(){
    return this.dataService.getDispecer().email === 'mantra@mantra.sk';
  }

  openHamMenu(){
      this.navMenu.nativeElement.classList.toggle('active');
      this.navBar.nativeElement.classList.toggle('active');
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
    this.router.navigate(['/']);
    this.dataService.setDispecer(null);
    this.accountService.logout();
    setTimeout(() => {
      location.reload();
    }, 400);
  }

}

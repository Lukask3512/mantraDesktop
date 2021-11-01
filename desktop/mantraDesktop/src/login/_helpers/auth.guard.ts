import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from 'src/login/_services/account.service';
import {DataService} from '../../app/data/data.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private dataService: DataService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let user = this.dataService.getDispecer();
    if (!user) {
      user = JSON.parse(localStorage.getItem('user'));
      const company = JSON.parse(localStorage.getItem('company'));
      if (user && company){
        this.dataService.setDispecer(user);
        this.dataService.setCompany(company);
        return true;
      }else{
        return false;
      }

    }
    if (user) {
      // authorised so return true
      return true;
    }
    else {
      this.router.navigate([''], { queryParams: { returnUrl: state.url }});
      return false;
    }

    // not logged in so redirect to login page with the return url
  }
}

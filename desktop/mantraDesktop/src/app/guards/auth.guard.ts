import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from 'src/login/_services/account.service';
import {DataService} from '../data/data.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private dataService: DataService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let user = this.dataService.getDispecer();
    if (!user) {
      user = JSON.parse(localStorage.getItem('user'));
      const company = JSON.parse(localStorage.getItem('company'));
      if (user && company){
        this.dataService.setDispecer(user);
        this.dataService.setCompany(company);
        setTimeout(() => {
            if (state.url === '/view/offerDetail' || state.url === '/view/newRoute' || state.url === '/view/companies'){
              const comapnyBool =  this.getCompany(state);
              if (comapnyBool === true || comapnyBool === false){
                return comapnyBool;
              }
              this.router.navigate(['/view/map']);
              return true;
            }
        }, 500);

      }else{
        return false;
      }

    }
    if (user) {
      const comapnyBool =  this.getCompany(state);
      if (comapnyBool === true || comapnyBool === false){
        return comapnyBool;
      }
      if (state.url === '/view/companies') {
        this.router.navigate(['/view/map']);
        return true;
      }else{
        return true;
      }
      // }, 100);
    }
    else {
      this.router.navigate([''], { queryParams: { returnUrl: state.url }});
      return false;
    }

    // not logged in so redirect to login page with the return url
  }

  getCompany(state: RouterStateSnapshot){

    if (this.dataService.getDispecer().email === 'mantra@mantra.sk' ||
      this.dataService.getDispecer().email === 'manage.transport.repeat@gmail.com' ||
      this.dataService.getDispecer().email === 'michal.rancak@truck-alliance.cz'){
        if (state.url === '/view/companies' || state.url === '/view/profile'){
          return true;
        }else{
          this.router.navigate(['/view/companies']);
          return true;
        }
    }

  }
}

import { Component } from '@angular/core';

import { AccountService } from 'src/login/_services/account.service';
import { User } from 'src/login/_models/user';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mantraDesktop';
  user: User;
  constructor(private accountService: AccountService, private translateService: TranslateService) {
    this.accountService.user.subscribe(x => this.user = x);
    this.translateService.setDefaultLang('en');
    this.translateService.use(localStorage.getItem('lang') || 'en');
  }

  logout() {
    this.accountService.logout();
  }
}

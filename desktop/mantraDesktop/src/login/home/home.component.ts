import { Component } from '@angular/core';

import { User } from 'src/login/_models/user';
import { AccountService } from 'src/login/_services/account.service';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  user: User;

  constructor(private accountService: AccountService) {
    this.user = this.accountService.userValue;
  }
}

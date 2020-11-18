import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from '../components/map/map.component';
import {DispecerComponent} from '../components/dispecer/dispecer-wrapper/dispecer.component';
import {CarsWrapperComponent} from '../components/cars/cars-wrapper/cars-wrapper.component';
import {CarDetailComponent} from '../components/cars/car-detail/car-detail.component';

import { HomeComponent } from 'src/login/home/home.component';
import { AuthGuard } from 'src/login/_helpers/auth.guard';
import {LoginComponent} from 'src/login/account/login.component';

const accountModule = () => import('src/login/account/account.module').then(x => x.AccountModule);
const usersModule = () => import('src/login/users/users.module').then(x => x.UsersModule);
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }

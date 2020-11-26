import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from '../components/map/map.component';
import {DispecerComponent} from '../components/dispecer/dispecer-wrapper/dispecer.component';
import {CarsWrapperComponent} from '../components/cars/cars-wrapper/cars-wrapper.component';
import {CarDetailComponent} from '../components/cars/car-detail/car-detail.component';

import { AuthGuard } from 'src/login/_helpers/auth.guard';



const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }

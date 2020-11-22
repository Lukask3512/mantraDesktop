import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from './components/map/map.component';
import {DispecerComponent} from './components/dispecer/dispecer-wrapper/dispecer.component';
import {CarsWrapperComponent} from './components/cars/cars-wrapper/cars-wrapper.component';
import {CarDetailComponent} from './components/cars/car-detail/car-detail.component';


import {ViewComponent} from "./components/view.component";
import {RegisterComponent} from "../login/account/register.component";



const routes: Routes = [
  { path: 'view', component: ViewComponent,
    children: [{
    path: 'cars',
      component: CarsWrapperComponent
    }]
  },
  { path: 'view', component: ViewComponent,
    children: [{
      path: 'map',
      component: MapComponent
    }]
  },
  { path: 'view', component: ViewComponent,
    children: [{
      path: 'cars/detail',
      component: CarDetailComponent
    }]
  },
  { path: 'view', component: ViewComponent,
    children: [{
      path: 'map',
      component: MapComponent
    }]
  },
  { path: 'view', component: ViewComponent,
    children: [{
      path: 'dispecer',
      component: DispecerComponent
    }]
  },


  { path: '', component: RegisterComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

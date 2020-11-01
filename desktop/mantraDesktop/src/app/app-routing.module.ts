import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from "./components/map/map.component";
import {DispecerComponent} from "./components/dispecer/dispecer-wrapper/dispecer.component";
import {CarsWrapperComponent} from "./components/cars/cars-wrapper/cars-wrapper.component";
import {CarDetailComponent} from "./components/cars/car-detail/car-detail.component";


const routes: Routes = [
  { path: 'map', component: MapComponent},
  { path: '', component: DispecerComponent},
  { path: 'cars', component: CarsWrapperComponent},
  { path: 'cars/detail', component: CarDetailComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

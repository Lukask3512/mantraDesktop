import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from "./components/map/map.component";
import {DispecerComponent} from "./components/dispecer/dispecer.component";


const routes: Routes = [
  { path: 'map', component: MapComponent},
  { path: '', component: DispecerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

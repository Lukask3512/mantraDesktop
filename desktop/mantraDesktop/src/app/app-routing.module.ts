import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from './components/map/map.component';
import {DispecerComponent} from './components/dispecer/dispecer-wrapper/dispecer.component';
import {CarsWrapperComponent} from './components/cars/cars-wrapper/cars-wrapper.component';
import {CarDetailComponent} from './components/cars/car-detail/car-detail.component';


import {ViewComponent} from './components/view.component';
import {RegisterComponent} from '../login/account/register.component';
import {AuthGuard} from './guards/auth.guard';
import {TransportationWrapperComponent} from './components/transportation/transportation-wrapper/transportation-wrapper.component';
import {NewTransportComponent} from './components/transportation/new-transport/new-transport.component';
import {WrapperComponent} from './components/transportation/offer/wrapper/wrapper.component';
import {DetailComponent} from './components/transportation/offer/detail/detail.component';
import {VodiciWrapperComponent} from './components/vodici/vodici-wrapper/vodici-wrapper.component';
import {CompaniesWrapperComponent} from './components/companies/companies-wrapper/companies-wrapper.component';
import {ProfileComponent} from './components/profile/profile.component';
import {MapWrapperComponent} from './components/map/map-wrapper/map-wrapper.component';
import {CarJustInfoComponent} from './components/map/car-just-info/car-just-info.component';
import {TransportWrapperComponent} from './components/map/transport-wrapper/transport-wrapper.component';
import {OfferDetailComponent} from './components/map/offer-detail/offer-detail.component';
import {MyOfferDetailComponent} from './components/map/my-offer-detail/my-offer-detail.component';
import {MyRouteDetailComponent} from './components/map/my-route-detail/my-route-detail.component';
import {CakarenWrapperComponent} from './components/map/cakaren-wrapper/cakaren-wrapper.component';
import {DetailAddressInfoComponent} from "./components/map/detail-address-info/detail-address-info.component";



const routes: Routes = [
  { path: 'view', component: ViewComponent,
    canActivate: [AuthGuard],
    children: [{
    path: 'cars',
      component: CarsWrapperComponent
    },
      {
        path: 'map',
        component: MapWrapperComponent,
        children: [{
            path: 'myCar',
            component: CarJustInfoComponent
        },
          {
            path: 'transport',
            component: TransportWrapperComponent
          },
          {
            path: 'offerDetail',
            component: OfferDetailComponent
          },
          {
            path: 'myOfferDetail',
            component: MyOfferDetailComponent
          },
          {
            path: 'myRouteDetail',
            component: MyRouteDetailComponent
          },
          {
            path: 'cakaren',
            component: CakarenWrapperComponent
          }
        ]
      },
      {
        path: 'vodici',
        component: VodiciWrapperComponent
      },
      {
        path: 'cars/detail',
        component: CarDetailComponent
      },
      {
        path: 'dispecer',
        component: DispecerComponent
      },
      {
        path: 'transport',
        component: TransportationWrapperComponent
      },
      {
        path: 'newRoute',
        component: NewTransportComponent
      },
      {
        path: 'offerRoute',
        component: WrapperComponent
      },
      {
        path: 'companies',
        component: CompaniesWrapperComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'offerDetail',
        component: DetailComponent
      }
    ]
  },
  { path: '', component: RegisterComponent },

  // otherwise redirect to home
  // { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewRoutingModule } from './view-routing.module';
import { OpenlayerComponent } from './google/map/openlayer/openlayer.component';
//import { RoutesComponent } from 'src/routes/routes.component';

import { DeleteCarDialogComponent } from './dialogs/delete-car-dialog/delete-car-dialog.component';
import { TheDispecerComponent } from './dispecer/the-dispecer/the-dispecer.component';
import { TransportationWrapperComponent } from './transportation/transportation-wrapper/transportation-wrapper.component';
import { NewTransportComponent } from './transportation/new-transport/new-transport.component';
import {AppModule} from "../app.module";
import {DragDropModule} from "@angular/cdk/drag-drop";
import { RouteToCarComponent } from './dialogs/route-to-car/route-to-car.component';
import {MatTableModule} from "@angular/material/table";
import { FindCarByIdComponent } from './cars/find-car-by-id/find-car-by-id.component';
import { FindRouteStatusComponent } from './transportation/find-route-status/find-route-status.component';
import { EditInfoComponent } from './dialogs/edit-info/edit-info.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { DeleteRouteComponent } from './dialogs/delete-route/delete-route.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { DeleteDispecerComponent } from './dialogs/delete-dispecer/delete-dispecer.component';
import { PrivesWrapperComponent } from './privesy/prives-wrapper/prives-wrapper.component';
import { AddPrivesDialogComponent } from './dialogs/add-prives-dialog/add-prives-dialog.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatStepperModule} from "@angular/material/stepper";
import { NewPrivesComponent } from './privesy/new-prives/new-prives.component';
import { AddPrivesToCarComponent } from './dialogs/add-prives-to-car/add-prives-to-car.component';
import { OffNavesDialogComponent } from './dialogs/off-naves-dialog/off-naves-dialog.component';
import { DragAndDropListComponent } from './transportation/drag-and-drop-list/drag-and-drop-list.component';
import { WrapperComponent } from './transportation/offer/wrapper/wrapper.component';
import { DetailComponent } from './transportation/offer/detail/detail.component';
import { OfferToRouteComponent } from './transportation/offer/offer-to-route/offer-to-route.component';
import { DragDropOfferComponent } from './transportation/offer/drag-drop-offer/drag-drop-offer.component';
import { FilterComponent } from './map/filter/filter.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { DetailImgComponent } from './transportation/detail-img/detail-img.component';
import { OfferPriceComponent } from './dialogs/offer-price/offer-price.component';
import { DipecerPravaComponent } from './dialogs/dipecer-prava/dipecer-prava.component';
// import { NewFormComponent } from './transportation/new-transport/new-form/new-form.component';
import {MatRadioModule} from "@angular/material/radio";
import {MatDatepickerModule} from "@angular/material/datepicker";
import { DetailFormComponent } from './transportation/new-transport/detail-form/detail-form.component';
import { RouteToItinerarComponent } from './transportation/new-transport/route-to-itinerar/route-to-itinerar.component';
import { OneAddressInfoComponent } from './transportation/transportation-wrapper/one-address-info/one-address-info.component';
import { ChoosCarToMoveComponent } from './transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import { ShowItinerarComponent } from './transportation/offer/offer-to-route/show-itinerar/show-itinerar.component';
import { ShowDetailComponent } from './transportation/new-transport/show-detail/show-detail.component';
import { CarItiDetailComponent } from './map/car-iti-detail/car-iti-detail.component';
import { SizeOfBoxComponent } from './aframe/size-of-box/size-of-box.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


@NgModule({
    declarations: [OpenlayerComponent, DeleteCarDialogComponent,
      TheDispecerComponent, TransportationWrapperComponent,
      RouteToCarComponent, FindCarByIdComponent,
      FindRouteStatusComponent, EditInfoComponent,
      DeleteRouteComponent, DeleteDispecerComponent,
      PrivesWrapperComponent, AddPrivesDialogComponent,
      NewPrivesComponent, AddPrivesToCarComponent,
      OffNavesDialogComponent, DragAndDropListComponent,
      WrapperComponent, DetailComponent, OfferToRouteComponent,
      DragDropOfferComponent, FilterComponent, DetailImgComponent,
      OfferPriceComponent, DipecerPravaComponent,DetailFormComponent, RouteToItinerarComponent, OneAddressInfoComponent, ChoosCarToMoveComponent, ShowItinerarComponent, ShowDetailComponent, CarItiDetailComponent, SizeOfBoxComponent
    ],
    exports: [
        OpenlayerComponent,
        TheDispecerComponent,
        FindCarByIdComponent,
        NewPrivesComponent,
        PrivesWrapperComponent,
        DragAndDropListComponent,
        FilterComponent,
        DetailImgComponent,
        DetailFormComponent,
        ShowDetailComponent,
        ChoosCarToMoveComponent,
        CarItiDetailComponent,
        SizeOfBoxComponent,

    ],
  imports: [
    CommonModule,
    ViewRoutingModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatStepperModule,
    DragDropModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewModule { }

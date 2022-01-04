import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewRoutingModule } from './view-routing.module';
import { OpenlayerComponent } from './google/map/openlayer/openlayer.component';

import { DeleteCarDialogComponent } from './dialogs/delete-car-dialog/delete-car-dialog.component';
import { TheDispecerComponent } from './dispecer/the-dispecer/the-dispecer.component';
import { TransportationWrapperComponent } from './transportation/transportation-wrapper/transportation-wrapper.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { RouteToCarComponent } from './dialogs/route-to-car/route-to-car.component';
import {MatTableModule} from '@angular/material/table';
import { FindCarByIdComponent } from './cars/find-car-by-id/find-car-by-id.component';
import { FindRouteStatusComponent } from './transportation/find-route-status/find-route-status.component';
import { EditInfoComponent } from './dialogs/edit-info/edit-info.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { DeleteRouteComponent } from './dialogs/delete-route/delete-route.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DeleteDispecerComponent } from './dialogs/delete-dispecer/delete-dispecer.component';
import { PrivesWrapperComponent } from './privesy/prives-wrapper/prives-wrapper.component';
import { AddPrivesDialogComponent } from './dialogs/add-prives-dialog/add-prives-dialog.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import { NewPrivesComponent } from './privesy/new-prives/new-prives.component';
import { AddPrivesToCarComponent } from './dialogs/add-prives-to-car/add-prives-to-car.component';
import { OffNavesDialogComponent } from './dialogs/off-naves-dialog/off-naves-dialog.component';
import { DragAndDropListComponent } from './transportation/drag-and-drop-list/drag-and-drop-list.component';
import { WrapperComponent } from './transportation/offer/wrapper/wrapper.component';
import { DetailComponent } from './transportation/offer/detail/detail.component';
import { OfferToRouteComponent } from './transportation/offer/offer-to-route/offer-to-route.component';
import { DragDropOfferComponent } from './transportation/offer/drag-drop-offer/drag-drop-offer.component';
import { FilterComponent } from './map/filter/filter.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { DetailImgComponent } from './transportation/detail-img/detail-img.component';
import { OfferPriceComponent } from './dialogs/offer-price/offer-price.component';
import { DipecerPravaComponent } from './dialogs/dipecer-prava/dipecer-prava.component';
// import { NewFormComponent } from './transportation/new-transport/new-form/new-form.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DetailFormComponent } from './transportation/new-transport/detail-form/detail-form.component';
import { RouteToItinerarComponent } from './transportation/new-transport/route-to-itinerar/route-to-itinerar.component';
import { OneAddressInfoComponent } from './transportation/transportation-wrapper/one-address-info/one-address-info.component';
import { ChoosCarToMoveComponent } from './transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import { ShowItinerarComponent } from './transportation/offer/offer-to-route/show-itinerar/show-itinerar.component';
import { ShowDetailComponent } from './transportation/new-transport/show-detail/show-detail.component';
import { CarItiDetailComponent } from './map/car-iti-detail/car-iti-detail.component';
import { SizeOfBoxComponent } from './aframe/size-of-box/size-of-box.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { PosliPonukuComponent } from './transportation/offer/detail/posli-ponuku/posli-ponuku.component';
import { UlozeniePonukyComponent } from './transportation/ulozenie-ponuky/ulozenie-ponuky.component';
import { DeleteFromItiComponent } from './dialogs/delete-from-iti/delete-from-iti.component';
import { ItinerarDaDComponent } from './cars/car-detail/itinerar-da-d/itinerar-da-d.component';
import { CarNakladComponent } from './cars/car-detail/car-naklad/car-naklad.component';
import { VodiciWrapperComponent } from './vodici/vodici-wrapper/vodici-wrapper.component';
import { TheVodicComponent } from './vodici/the-vodic/the-vodic.component';
import { NewVodicComponent } from './vodici/new-vodic/new-vodic.component';
import { NewVodicDialogComponent } from './dialogs/new-vodic-dialog/new-vodic-dialog.component';
import { LogDialogComponent } from './dialogs/log-dialog/log-dialog.component';
import { CompaniesWrapperComponent } from './companies/companies-wrapper/companies-wrapper.component';
import { AddCompanyComponent } from './dialogs/add-company/add-company.component';
import { OneCompanyComponent } from './companies/one-company/one-company.component';
import { GetInfoAboutCompanyComponent } from './companies/get-info-about-company/get-info-about-company.component';
import { ShowDetailDialogComponent } from './dialogs/show-detail-dialog/show-detail-dialog.component';
import { GetNameOfDriverComponent } from './vodici/get-name-of-driver/get-name-of-driver.component';
import { UpdateOfferPriceComponent } from './dialogs/update-offer-price/update-offer-price.component';
import {MatSortModule} from '@angular/material/sort';
import { AllDetailAboutRouteDialogComponent } from './dialogs/all-detail-about-route-dialog/all-detail-about-route-dialog.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {NewDispecerComponent} from './dispecer/new-dispecer/new-dispecer.component';
import { RepeatRouteDialogComponent } from './dialogs/repeat-route-dialog/repeat-route-dialog.component';
import { CancelRouteFromCarDialogComponent } from './dialogs/cancel-route-from-car-dialog/cancel-route-from-car-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { ProfileComponent } from './profile/profile.component';
import {MatIconModule} from '@angular/material/icon';
import { TimeProblemDialogComponent } from './dialogs/time-problem-dialog/time-problem-dialog.component';
import {TranslateModule} from '@ngx-translate/core';
import { GetNameOfComapnyByMasterIdComponent } from './companies/get-name-of-comapny-by-master-id/get-name-of-comapny-by-master-id.component';
import { CarsPopUpComponent } from './map/cars-pop-up/cars-pop-up.component';
import { OffersPopUpComponent } from './map/offers-pop-up/offers-pop-up.component';
import { ChooseCarToMapComponent } from './map/filter/choose-car-to-map/choose-car-to-map.component';
import { MainDetailAboutComponent } from './transportation/main-detail-about/main-detail-about.component';
import { CompanyDetailComponent } from './dialogs/company-detail/company-detail.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {NgxSpinnerModule} from 'ngx-spinner';
import { CompanyDetailAboutComponent } from './dialogs/company-detail-about/company-detail-about.component';


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
      OfferPriceComponent, DipecerPravaComponent, DetailFormComponent,
      RouteToItinerarComponent, OneAddressInfoComponent, ChoosCarToMoveComponent,
      ShowItinerarComponent, ShowDetailComponent, CarItiDetailComponent, SizeOfBoxComponent,
      PosliPonukuComponent, UlozeniePonukyComponent, DeleteFromItiComponent,
      ItinerarDaDComponent, CarNakladComponent, VodiciWrapperComponent,
      TheVodicComponent, NewVodicComponent, NewVodicDialogComponent, LogDialogComponent, CompaniesWrapperComponent,
      AddCompanyComponent, OneCompanyComponent, GetInfoAboutCompanyComponent,
      ShowDetailDialogComponent, GetNameOfDriverComponent, UpdateOfferPriceComponent,
      AllDetailAboutRouteDialogComponent, NewDispecerComponent, RepeatRouteDialogComponent,
      CancelRouteFromCarDialogComponent, ProfileComponent, TimeProblemDialogComponent,
      GetNameOfComapnyByMasterIdComponent, CarsPopUpComponent, OffersPopUpComponent, ChooseCarToMapComponent,
      MainDetailAboutComponent, CompanyDetailComponent, CompanyDetailAboutComponent
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
        ItinerarDaDComponent,
        CarNakladComponent,
        GetNameOfDriverComponent,
        AllDetailAboutRouteDialogComponent,
        PosliPonukuComponent,
        CarsPopUpComponent,
        OffersPopUpComponent,
        MainDetailAboutComponent
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
        MatSortModule,
        MatExpansionModule,
        CommonModule,
        MatDialogModule,
        MatIconModule,
        TranslateModule,
        MatPaginatorModule,
        NgxSpinnerModule
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewModule { }

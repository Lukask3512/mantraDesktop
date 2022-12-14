import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { MapComponent } from './components/map/map.component';
import { DispecerComponent } from './components/dispecer/dispecer-wrapper/dispecer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { AngularFireStorageModule } from '@angular/fire/storage';
import 'firebase/storage';

import {MatDialogModule} from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewCarComponent } from './components/cars/new-car/new-car.component';
import { CarsWrapperComponent } from './components/cars/cars-wrapper/cars-wrapper.component';
import { AddCarDialogComponent } from './components/dialogs/add-car-dialog/add-car-dialog.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatListModule} from '@angular/material/list';
import { CarDetailComponent } from './components/cars/car-detail/car-detail.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { AdressesComponent } from './components/google/adresses/adresses.component';
import { AgmCoreModule } from '@agm/core';
import {MatInputModule} from '@angular/material/input';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';


import { ViewComponent } from './components/view.component';
import { RegisterComponent} from '../login/account/register.component';
import {ViewModule} from './components/view.module';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatButtonModule} from '@angular/material/button';
import {NewTransportComponent} from './components/transportation/new-transport/new-transport.component';
import {MatRadioModule} from '@angular/material/radio';
import {RouteLogComponent} from './components/transportation/route-log/route-log.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { NewFormComponent } from './components/transportation/new-transport/new-form/new-form.component';
import {MatIconModule} from '@angular/material/icon';
import { NgxSpinnerModule } from 'ngx-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {MatSidenavModule} from '@angular/material/sidenav';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {CustomRouteReuseStrategy} from './services/customRouteStrategy/custom-route-reuse-strategy';
import {RouteReuseStrategy} from '@angular/router';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SideBarComponent,
    MapComponent,
    DispecerComponent,
    NewCarComponent,
    RegisterComponent,
    CarsWrapperComponent,
    AddCarDialogComponent,
    CarDetailComponent,
    AdressesComponent,
    AppComponent,
    ViewComponent,
    NewTransportComponent,
    RouteLogComponent,
    NewFormComponent,

  ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        AppRoutingModule,
        MatDialogModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireStorageModule,
        AngularFireDatabaseModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatNativeDateModule,
        MatListModule,
        MatSortModule,
        MatSnackBarModule,
        DragDropModule,
        FormsModule,
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgxMaterialTimepickerModule,
        AppRoutingModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyA9VpVbePUEGyvZrxcxfJSunQB5w8dmTV8',
            libraries: ['places']
        }),
        ViewModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatRadioModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatStepperModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatIconModule,
        NgxSpinnerModule,
        MatExpansionModule,
        MatMenuModule,
        MatSidenavModule
    ],
    exports: [
        MatFormFieldModule,
        MatInputModule,
        AdressesComponent,
      NewFormComponent

    ],
  providers: [
    HttpClient,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }

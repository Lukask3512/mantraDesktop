import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { MapComponent } from './components/map/map.component';
import { DispecerComponent } from './components/dispecer/dispecer-wrapper/dispecer.component';
import { NewDispecerComponent } from './components/dispecer/new-dispecer/new-dispecer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';

import { AngularFireStorageModule } from '@angular/fire/storage';
import 'firebase/storage';

import {MatDialogModule} from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NewCarComponent } from './components/cars/new-car/new-car.component';
import { CarsWrapperComponent } from './components/cars/cars-wrapper/cars-wrapper.component';
import { AddCarDialogComponent } from './components/dialogs/add-car-dialog/add-car-dialog.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTableModule} from "@angular/material/table";
import {MatListModule} from "@angular/material/list";
import { CarDetailComponent } from './components/cars/car-detail/car-detail.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { AdressesComponent } from './components/google/adresses/adresses.component';
import { AgmCoreModule } from '@agm/core';
import {MatInputModule} from "@angular/material/input";
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// used to create fake backend
import { fakeBackendProvider } from 'src/login/_helpers/fake-backend';
import { JwtInterceptor } from 'src/login/_helpers/jwt.interceptor';
import { ErrorInterceptor } from 'src/login/_helpers/error.interceptor';
import { ViewComponent } from './components/view.component';
import { RegisterComponent} from "../login/account/register.component";
import {ViewModule} from "./components/view.module";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatButtonModule} from "@angular/material/button";
import {NewTransportComponent} from "./components/transportation/new-transport/new-transport.component";
import {MatRadioModule} from "@angular/material/radio";
import {RouteLogComponent} from "./components/transportation/route-log/route-log.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatStepperModule} from '@angular/material/stepper';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SideBarComponent,
        MapComponent,
        DispecerComponent,
        NewDispecerComponent,
        NewCarComponent,
        RegisterComponent,
        CarsWrapperComponent,
        AddCarDialogComponent,
        CarDetailComponent,
        AdressesComponent,
        AppComponent,
        ViewComponent,
        NewTransportComponent,
        RouteLogComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
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
        MatDatepickerModule
    ],
    exports: [
        MatFormFieldModule,
        MatInputModule,
        AdressesComponent,

    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

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

import {MatDialogModule} from '@angular/material/dialog';

import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import {ReactiveFormsModule} from "@angular/forms";
import { NewCarComponent } from './components/cars/new-car/new-car.component';
import { CarsWrapperComponent } from './components/cars/cars-wrapper/cars-wrapper.component';
import { AddCarDialogComponent } from './components/dialogs/add-car-dialog/add-car-dialog.component';
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SideBarComponent,
    MapComponent,
    DispecerComponent,
    NewDispecerComponent,
    NewCarComponent,
    CarsWrapperComponent,
    AddCarDialogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

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
    AddCarDialogComponent,
    CarDetailComponent,
    AdressesComponent
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
    MatInputModule,
    MatTableModule,
    MatListModule,
    DragDropModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA9VpVbePUEGyvZrxcxfJSunQB5w8dmTV8',
      libraries: ['places']
    })
  ],
  exports : [
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

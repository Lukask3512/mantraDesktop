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


@NgModule({
    declarations: [OpenlayerComponent, DeleteCarDialogComponent,
      TheDispecerComponent, TransportationWrapperComponent, RouteToCarComponent, FindCarByIdComponent, FindRouteStatusComponent, EditInfoComponent, DeleteRouteComponent, DeleteDispecerComponent
    ],
    exports: [
        OpenlayerComponent,
        TheDispecerComponent,
        FindCarByIdComponent
    ],
    imports: [
        CommonModule,
        ViewRoutingModule,
        MatTableModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule
    ]
})
export class ViewModule { }

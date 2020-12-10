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


@NgModule({
    declarations: [OpenlayerComponent, DeleteCarDialogComponent,
      TheDispecerComponent, TransportationWrapperComponent, RouteToCarComponent
    ],
    exports: [
        OpenlayerComponent,
        TheDispecerComponent
    ],
    imports: [
        CommonModule,
        ViewRoutingModule,
        MatTableModule
    ]
})
export class ViewModule { }

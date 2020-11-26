import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewRoutingModule } from './view-routing.module';
import { OpenlayerComponent } from './google/map/openlayer/openlayer.component';
import { RoutesComponent } from './routes/routes.component';
import { DeleteCarDialogComponent } from './dialogs/delete-car-dialog/delete-car-dialog.component';


@NgModule({
    declarations: [OpenlayerComponent, RoutesComponent, DeleteCarDialogComponent],
    exports: [
        OpenlayerComponent
    ],
    imports: [
        CommonModule,
        ViewRoutingModule
    ]
})
export class ViewModule { }

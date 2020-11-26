import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewRoutingModule } from './view-routing.module';
import { OpenlayerComponent } from './google/map/openlayer/openlayer.component';


@NgModule({
    declarations: [OpenlayerComponent],
    exports: [
        OpenlayerComponent
    ],
    imports: [
        CommonModule,
        ViewRoutingModule
    ]
})
export class ViewModule { }

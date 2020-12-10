import { Component, OnInit } from '@angular/core';
import {RouteService} from "../../../services/route.service";
import {CarService} from "../../../services/car.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {RouteToCarComponent} from "../../dialogs/route-to-car/route-to-car.component";
import Route from "../../../models/Route";

@Component({
  selector: 'app-transportation-wrapper',
  templateUrl: './transportation-wrapper.component.html',
  styleUrls: ['./transportation-wrapper.component.scss']
})
export class TransportationWrapperComponent implements OnInit {
  allActiveRoutes;
  allFinishedRoutes;
  displayedColumns: string[] = ['naklady', 'vykladky'];
  constructor(private routeService: RouteService, private carServise: CarService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.routeService.getAllRoutes().subscribe(routes => {
      this.allActiveRoutes = routes;
    })
    this.routeService.getAllFinishedRoutes().subscribe(routes => {
      this.allFinishedRoutes = routes;
      console.log(routes);
    })
  }

  addRouteToCar(route){
    console.log(route);
  }

  timestamptToDate(timestamp){
    var date = new Date(timestamp * 1000)
    return date.toDateString();
  }

  carIdToName(carId){
   this.carServise.getCar(carId).subscribe(car => {
     console.log(car)
   });
  }

  getStatus(){

  }

  openAddDialog(route: Route) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      routesTowns: route.nameOfTowns,
      routesLat: route.coordinatesOfTownsLat,
      routesLon: route.coordinatesOfTownsLon,
      routesType: route.type
    };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value)
      if (value === undefined){
        return;
      }else{
        return;
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import {RouteService} from "../../../services/route.service";

@Component({
  selector: 'app-transportation-wrapper',
  templateUrl: './transportation-wrapper.component.html',
  styleUrls: ['./transportation-wrapper.component.scss']
})
export class TransportationWrapperComponent implements OnInit {
  allActiveRoutes;
  allFinishedRoutes;
  displayedColumns: string[] = ['naklady', 'vykladky'];
  constructor(private routeService: RouteService) { }

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

}

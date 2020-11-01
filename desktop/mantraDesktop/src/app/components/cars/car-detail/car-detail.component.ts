import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormBuilder} from "@angular/forms";
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent implements OnInit {
  routes;
  routesTowns = [];
car;
  addTownForm;
  constructor(private formBuilder: FormBuilder, private routeService: RouteService, private dataService: DataService) {
    this.addTownForm = this.formBuilder.group({
      name: '',
    });
  }

  ngOnInit(): void {
    this.dataService.currentCar.subscribe(car => {
      this.car = car;
      console.log(car.id)
      this.routeService.getRoutes(car.id).subscribe(routes => {
        console.log(this.car.ecv);
        console.log(routes);
        this.routes = routes[0];
        this.routesTowns = this.routes.nameOfTowns;
        console.log(this.routes);
      });
    });


  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
  }
  addTown(){
    console.log(this.addTownForm.get('name').value);
    this.routes.push(this.addTownForm.get('name').value);
    this.addTownForm.reset();
  }

  sendToDriver(){
    const route: Route = {
      carId: this.car.id,
      nameOfTowns: this.routesTowns,
      coordinatesOfTowns: ['sksuak', 'skuska2'],
      id: this.routes.id
    };
    console.log(this.routes.id);
    if (this.routes.id === undefined){
      this.routeService.createRoute(route);
    }else{

      this.routeService.updateRoute(route);
    }
  }
}

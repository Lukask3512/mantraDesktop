import {Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../../../data/data.service";
import {take} from "rxjs/operators";
import Route from "../../../../models/Route";
import {OpenlayerComponent} from "../../../google/map/openlayer/openlayer.component";
import {OfferRouteService} from "../../../../services/offer-route.service";
import {CarService} from "../../../../services/car.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(private dataService: DataService, private offerService: OfferRouteService, private carService: CarService) { }
  route: Route;
  price: number;
  offer: number;


  @ViewChild('child')
  private child: OpenlayerComponent;
  ngOnInit(): void {

    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      this.route = route;
      this.offerService.routes$.subscribe(routes => {
        this.route = routes.find(oneRoute => oneRoute.id == route.id);
        this.route.offerFrom.forEach((offer, index) => {
          if (offer == this.getDispecerId()){
            this.offer = this.route.priceFrom[index];
            console.log(this.getDispecerId());
            console.log(this.route)
          }
        })
      });
      setTimeout(() =>
        {

          this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon, null, undefined)
        },
        800);
    })
    }

    createdBy(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        idCreated = this.dataService.getDispecer().id
      }else{
        idCreated = this.dataService.getDispecer().createdBy
      }
      console.log()
      if (this.route.createdBy !=  idCreated){
        return false;
      }else{
        return true;
      }
    }

    getDispecerId(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        return this.dataService.getDispecer().id
      }else{
        return this.dataService.getDispecer().createdBy
      }
    }

  changeRouteOnMap(route: Route){
    var carId = route.carId;
    var car;
    this.carService.cars$.pipe(take(1)).subscribe(cars => {
      car = cars.find(car => car.id == carId);
    })
    setTimeout(() =>
      {
        this.child.notifyMe(route.coordinatesOfTownsLat, route.coordinatesOfTownsLon, car, route)
      },
      800);
  }

    addPrice(){
      var idCreated;
      if (this.dataService.getDispecer().createdBy == 'master'){
        idCreated = this.dataService.getDispecer().id
      }else{
        idCreated = this.dataService.getDispecer().createdBy
      }
       this.route.offerFrom.push(idCreated);
      this.route.priceFrom.push(this.price);
      this.price = undefined;
      this.offerService.updateRoute(this.route);
    }

  confirm(){
    this.route.takenBy = this.getDispecerId();
    this.route.price = this.offer;
    this.route.forEveryone = false;
    this.offerService.updateRoute(this.route);
  }

  cancelOffer(){
    this.route.forEveryone = true
    this.route.price = 0;
    this.route.ponuknuteTo = '';
    this.route.takenBy = '';
    this.offerService.updateRoute(this.route);
  }

  chooseCompany(id){
    console.log(id);
    this.route.ponuknuteTo = id;
    this.offerService.updateRoute(this.route);
  }


}

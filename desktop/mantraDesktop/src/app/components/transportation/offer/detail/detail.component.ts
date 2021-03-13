import {Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../../../data/data.service";
import {take} from "rxjs/operators";
import Route from "../../../../models/Route";
import {OpenlayerComponent} from "../../../google/map/openlayer/openlayer.component";
import {OfferRouteService} from "../../../../services/offer-route.service";
import {CarService} from "../../../../services/car.service";
import DeatilAboutAdresses from "../../../../models/DeatilAboutAdresses";
import {DetailAboutRouteService} from "../../../../services/detail-about-route.service";
import {DragAndDropListComponent} from "../../drag-and-drop-list/drag-and-drop-list.component";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(private dataService: DataService, private offerService: OfferRouteService, private carService: CarService,
              private detailService: DetailAboutRouteService) { }
  route: Route;
  fakeRoute: Route;
  price: number;
  offer: number;
  arrayOfDetailsAbRoute: any[] =  [];

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;

  ngOnInit(): void {

    this.dataService.currentRoute.subscribe(route => {
      console.log(route)
      this.route = route;
      this.fakeRoute = JSON.parse(JSON.stringify(this.route));
      this.offerService.routes$.subscribe(routes => {
        this.route = routes.find(oneRoute => oneRoute.id == route.id);
        if (this.route == undefined){
          this.route = this.fakeRoute;
        }
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
          if (this.childDropList){
            this.getDetails();
          }
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

  async getDetails(){
    this.detailService.offerDetails$.subscribe(res => {
      console.log(res)
    })
    for (const route of this.route.detailsAboutAdresses){
      this.detailService.offerDetails$.subscribe(res => {
       var detail =  res.find(offerDetail => offerDetail.id == route)
        console.log(detail)

        // @ts-ignore
        var detailAboutAdd: DeatilAboutAdresses = detail;

        console.log(detailAboutAdd)
        this.arrayOfDetailsAbRoute.push(detailAboutAdd);
        if (this.arrayOfDetailsAbRoute.length == this.route.detailsAboutAdresses.length){
          this.childDropList.setDetails(this.arrayOfDetailsAbRoute);
          console.log(this.arrayOfDetailsAbRoute)
        }
      })


    }
  }

  vymazatPonuku(){
    this.offerService.deleteRoute(this.route.id);
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

      this.route.offerFrom.forEach((offer, index) => {
        if (offer == this.getDispecerId()){
          this.route.offerFrom.splice(index, 1);
          this.route.priceFrom.splice(index, 1);
        }
      });
      console.log(this.route.offerFrom);
       this.route.offerFrom.push(idCreated);
      this.route.priceFrom.push(this.price);
      this.price = undefined;
      this.offerService.updateRoute(this.route);
    }

  deleteMyPriceOffer(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      idCreated = this.dataService.getDispecer().id
    }else{
      idCreated = this.dataService.getDispecer().createdBy
    }

    this.route.offerFrom.forEach((offer, index) => {
      if (offer == this.getDispecerId()){
        this.route.offerFrom.splice(index, 1);
        this.route.priceFrom.splice(index, 1);
      }
    });
    this.price = undefined;
    this.offer = undefined;
    this.offerService.updateRoute(this.route);
  }

  confirm(){
    this.route.takenBy = this.getDispecerId();
    this.route.price = this.offer;
    this.route.forEveryone = false;
    this.offerService.updateRoute(this.route);
    this.fakeRoute = JSON.parse(JSON.stringify(this.route));
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

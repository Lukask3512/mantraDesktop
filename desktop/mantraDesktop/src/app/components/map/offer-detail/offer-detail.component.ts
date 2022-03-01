import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DragAndDropListComponent} from '../../transportation/drag-and-drop-list/drag-and-drop-list.component';
import {getLength} from 'ol/sphere';
import LineString from 'ol/geom/LineString';
import {CarItiDetailComponent} from '../car-iti-detail/car-iti-detail.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {LogDialogComponent} from '../../dialogs/log-dialog/log-dialog.component';
import {RouteService} from '../../../services/route.service';
import {OfferRouteService} from '../../../services/offer-route.service';
import Address from '../../../models/Address';
import DeatilAboutAdresses from '../../../models/DeatilAboutAdresses';
import {PackageService} from '../../../services/package.service';
import {AddressService} from '../../../services/address.service';
import {ChoosCarToMoveComponent} from '../../transportation/offer/offer-to-route/choos-car-to-move/choos-car-to-move.component';
import {PosliPonukuComponent} from '../../transportation/offer/detail/posli-ponuku/posli-ponuku.component';
import {CarService} from '../../../services/car.service';
import {CountOffersService} from '../count-offers.service';
import Predpoklad from '../../../models/Predpoklad';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {

  offersToShow;
  distanceOfOffer;

  maxPrekrocenieRozmerov;

  @ViewChild(DragAndDropListComponent)
  private dragComponent: DragAndDropListComponent;

  @ViewChild(CarItiDetailComponent)
  private carIti: CarItiDetailComponent;

  @ViewChild(ChoosCarToMoveComponent)
  private chooseCar: ChoosCarToMoveComponent;

  @ViewChild(PosliPonukuComponent)
  private posliPonuku: PosliPonukuComponent;

  @Output() uspesnePriradenie = new EventEmitter<any>();

  constructor(private routeService: RouteService, private offerService: OfferRouteService, private packageService: PackageService,
              private addressesService: AddressService, private carService: CarService, private countOfferService: CountOffersService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  closeInfo(){

  }

  setOffer(countedOffer, feature, maxPrekrocenieVahy, maxPrekrocenieRozmerov){
    this.maxPrekrocenieRozmerov = maxPrekrocenieRozmerov;

    this.offersToShow = countedOffer;
    if (feature){
        this.distanceOfOffer = Math.round(((getLength(feature.getGeometry()) / 100) / 1000) * 100);
      }
    if (this.distanceOfOffer === 0){
        const poleKadePojdem = [];
        this.offersToShow.adresyVPonuke.forEach(jednaAdresa => {
          poleKadePojdem.push([jednaAdresa.coordinatesOfTownsLon, jednaAdresa.coordinatesOfTownsLat]);
        });
        const myItiString = new LineString(poleKadePojdem).transform('EPSG:4326', 'EPSG:3857');
        this.distanceOfOffer = Math.round(((getLength(myItiString) / 100) / 1000) * 100);
      }
    setTimeout(() => {
        this.chooseCar.setFarby(this.offersToShow);
        this.posliPonuku.setOfferId(this.offersToShow.id);
        this.carIti.setPonuka(this.offersToShow);
        this.carIti.setPrekrocenieVelkosti(this.maxPrekrocenieRozmerov);
      }, 100);

      // this.dragComponent.setAddresses(this.routesToShow);




  }

  offerConfirm(confirmId: string){
    this.offersToShow.takenBy = confirmId;
    this.carIti.setPonuka(this.offersToShow);
  }

  reDrawOffersNoDelay(){

  }

  openAllDetailDialog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      addresses: this.offersToShow.adresyVPonuke,
      route: this.offersToShow,
    };
    dialogConfig.width = '70%';


    const dialogRef = this.dialog.open(LogDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }

  // ked kliknem na ponuku a potom na auto, tak odoslem auto s itinerarnom do componentu carIti
  choosenCar(car){
    let newCar = true;
    this.carService.cars$.subscribe(allCars => {
      const clickedOnCar = allCars.find(oneCar => oneCar.id === car.id);
      if (newCar){ // ak mi pride nove auto tak to vzdy poslem do dalsieho komponentu
        const carWithIti = this.countOfferService.getCarWithIti(car);
        this.carIti.setCar(carWithIti);
        newCar = false;
        // ak mam rovnake auto ale novy itinerar, tak to poslem
      } else if (JSON.stringify(car.itinerar) !== JSON.stringify(clickedOnCar.itinerar)){
        const carToCompute = JSON.parse(JSON.stringify(clickedOnCar));
        const carWithIti = this.countOfferService.getCarWithIti(carToCompute);
        this.carIti.setCar(carWithIti);
      }
    });

  }

  public reDrawOffers(carsId){
    // if (carsId){
    //   this.carsToDisplay = carsId;
    // }else{
    //   this.carsToDisplay = this.carsFromDatabase.map(oneCar => oneCar.id);
    // }
    // // setTimeout(() => {
    // this.drawOffers(this.offersFromDatabase, true);
    // this.pocetAut = 0; // ked auto, ktore nema ziadnu adresu dostane prepravu, aby sa mu nacitala trasa
    // }, 2500);
  }

  otvorAuto(car){
    this.uspesnePriradenie.emit(true);
  }



  getPredpoklad(predpoklad: Predpoklad){
    const car = this.carService.getCarByEcv(predpoklad.ecv);
    this.carIti.spracujPredpoklad(predpoklad, car);
  }

}

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {getDistance} from 'ol/sphere';
import {PosliPonukuComponent} from '../../transportation/offer/detail/posli-ponuku/posli-ponuku.component';
import {PredpokladaneUlozenieService} from '../../../services/predpokladane-ulozenie.service';
import Predpoklad from '../../../models/Predpoklad';
import {DataService} from '../../../data/data.service';
import {UlozeniePonukyComponent} from '../../transportation/ulozenie-ponuky/ulozenie-ponuky.component';
import {CarService} from '../../../services/car.service';
import Cars from '../../../models/Cars';
import {OfferRouteService} from '../../../services/offer-route.service';
import Route from '../../../models/Route';
import {AddressService} from '../../../services/address.service';
import Address from '../../../models/Address';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {RouteToCarComponent} from '../../dialogs/route-to-car/route-to-car.component';
import {AllDetailAboutRouteDialogComponent} from '../../dialogs/all-detail-about-route-dialog/all-detail-about-route-dialog.component';
import {MapComponent} from '../map.component';

@Component({
  selector: 'app-car-iti-detail',
  templateUrl: './car-iti-detail.component.html',
  styleUrls: ['./car-iti-detail.component.scss']
})
export class CarItiDetailComponent implements OnInit {
  car;
  offer;
  realOffer;
  kdeSaVopcha; // pole v ktorom su ulozene indexi miest kde sa vopcha nakladka
  distanceOfIti: number;
  prekrocenieVelkosti = 1;
  prekrocenieVahy = 1;

  @Output() sendCarToPredpokad = new EventEmitter<Predpoklad>();

  @ViewChild(PosliPonukuComponent)
  private posliPonukuComponent: PosliPonukuComponent;

  @ViewChild(UlozeniePonukyComponent)
  private ulozeniePonukyComponent: UlozeniePonukyComponent;

  @Output() uspecnePriradenie = new EventEmitter<any>();

  ciSaVopcha;
  ciStihnePrijst;
  ciSaVopchaCezOtvor = true;
  volnaVahaPreAuto;

  casyPreAuto;
  predpokladaneEsty;
  constructor(private countService: CountFreeSpaceService, private predpokladService: PredpokladaneUlozenieService,
              public dataService: DataService, private carService: CarService, private offerService: OfferRouteService,
              private addressService: AddressService,  private _snackBar: MatSnackBar, private dialog: MatDialog,
              private matComponent: MapComponent) { }

  ngOnInit(): void {
  }

  setCar(car){
    console.log(car);
    this.car = JSON.parse(JSON.stringify(car));
    this.offer = JSON.parse(JSON.stringify(this.realOffer));
    this.countDistanceOfItinerarWithou();
    this.putFirstAddressFromOffer();
    this.checkEstiAndLastTime();
    this.ciSaVopchaCezOtvor = this.ciSaVopchaCezOtvory();
  }

  setPonuka(offer) {
    if (this.offer && this.offer.id === offer.id) {
      var offerAdresy = JSON.parse(JSON.stringify(offer)); // toto robim aby sa mi pri update nanovo nenacitali adresy v drag and drop
      offerAdresy.detailVPonuke = this.offer.detailVPonuke;
      offerAdresy.addresses = this.offer.addresses;
      offerAdresy.adresyVPonuke = this.offer.adresyVPonuke;
      this.offer = JSON.parse(JSON.stringify(offerAdresy));
    } else {
      this.offer = JSON.parse(JSON.stringify(offer));
    }

    this.realOffer = JSON.parse(JSON.stringify(offer));
    if (this.posliPonukuComponent) {
      this.posliPonukuComponent.setOfferId(this.offer.id);
    }
    if (this.ulozeniePonukyComponent) {
      this.ulozeniePonukyComponent.setPredpokladane(this.offer.id);
    }
    this.checkEstiAndLastTime();
    this.car = undefined;
    this.ciSaVopchaCezOtvor = true;

  }

  skontrolujVahu(){
    const itinerarAutaPocetPalietVMeste = this.countService.vypocitajPocetPalietVKazomMeste(this.car);
    const pocetTonVIti = this.countService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
    const volnaVahaPreAutovIti = this.countService.volnaVahaPreAutoVMeste(this.car, pocetTonVIti, 1);
    this.volnaVahaPreAuto = volnaVahaPreAutovIti;
    console.log(volnaVahaPreAutovIti);
  }

  ciSaVopchaCezOtvory(){
    return this.countService.ciSaVopchaTovarCezNakladaciPriestor(this.car, this.offer.detailVPonuke);
  }

  checkRukaAdrTeplota(offer){
    let adr = false;
    let ruka = false;
    let teplota = [];
    offer.adresyVPonuke.forEach(oneAdresa => {
      if (oneAdresa.adr){
        adr = true;
      }
      if (oneAdresa.ruka){
        ruka = true;
      }
      if (oneAdresa.teplota){
        teplota.push(oneAdresa.teplota);
      }
    });
    return {teplota, ruka, adr};
  }
  // na presunutie prvkov v poli
  arraymove(arr, fromIndex, toIndex) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  setPrekrocenieVelkosti(prekrocenie){
    this.prekrocenieVelkosti = prekrocenie;
  }

  setPrekrocenieVahy(prekrocenie){
    this.prekrocenieVahy = prekrocenie;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      let mozemPresunut;
      if (event.previousContainer.id === 'all'){
        const presuvaciDetail = this.offer.detailVPonuke[event.previousIndex];
        mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex, false);
      }else{
        const presuvaciDetail = this.car.detailIti[event.previousIndex];
        mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex, true);
      }
      if (mozemPresunut){
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        if (event.previousContainer.id === 'all'){
          this.arraymove(this.offer.addresses, event.previousIndex, event.currentIndex);
          this.arraymove(this.offer.detailVPonuke, event.previousIndex, event.currentIndex);
        }else{
          this.arraymove(this.car.itinerar, event.previousIndex, event.currentIndex);
          this.arraymove(this.car.detailIti, event.previousIndex, event.currentIndex);
        }
      }
    } else {
      if (event.previousContainer.id === 'all'){

        // tu budem musiet dat ocekovanie ci sa nahodou package nakladky nenachadza za vykladkou
      const presuvaciDetail = this.offer.detailVPonuke[event.previousIndex];
      const mozemPresunutDoItinerara = this.najdiCiMozemPresunutDoItinerara(presuvaciDetail, event.previousIndex, event.currentIndex);
      if (mozemPresunutDoItinerara){



      // ked presuvam do auta

        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);

        const idAdresyZPonuky = this.offer.addresses[event.previousIndex];
        const detailZPonuky = this.offer.detailVPonuke[event.previousIndex];

        this.car.itinerar.splice(event.currentIndex, 0, idAdresyZPonuky);
        this.car.detailIti.splice(event.currentIndex, 0, detailZPonuky);

        this.offer.addresses.splice(event.previousIndex, 1); // odstranujem id adresy po presunuti
        this.offer.detailVPonuke.splice(event.previousIndex, 1); // odstranujem detail po presunuti
      }else { // ked presuvam z auta do ponuky
        return;
        const idAdresyZAuta = this.car.itinerar[event.previousIndex];
        const detailZAuta = this.car.detailIti[event.previousIndex];

        this.offer.addresses.splice(event.currentIndex, 0, idAdresyZAuta); // odstranujem id adresy po presunuti
        this.offer.detailVPonuke.splice(event.currentIndex, 0, detailZAuta); // odstranujem detail po presunuti

        this.car.itinerar.splice(event.previousIndex, 1);
        this.car.detailIti.splice(event.previousIndex, 1);


      }
      }else{
        return;
      }

    }

    // this.countService.countFreeSpace(this.car, this.offer, this.prekrocenieVelkosti);
    // pri drrag and drop prepocitam volne miesta
    const volneMiesta = this.volneMiesta();
    this.checkEstiAndLastTime();
    let prepravaIndex = this.offer.zelenePrepravy.findIndex(oneOffer => oneOffer.id === this.car.id);
    if (prepravaIndex > -1){
      this.offer.zelenePrepravy[prepravaIndex].vopchaSa = volneMiesta;
    }
    else if (this.offer.zltePrepravy.findIndex(oneOffer => oneOffer.id === this.car.id) !== -1){
      prepravaIndex = this.offer.zltePrepravy.findIndex(oneOffer => oneOffer.id === this.car.id);
      this.offer.zltePrepravy[prepravaIndex].vopchaSa = volneMiesta;
    }
    console.log(this.offer);
    console.log(this.car);
  }

  // kontroluje to vzdy len pre 1. adresu v ponuke
  putFirstAddressFromOffer(){
    let prvaAdresaSDetailom = JSON.parse(JSON.stringify(this.offer));
    prvaAdresaSDetailom.adresyVPonuke = [prvaAdresaSDetailom.adresyVPonuke[0]];
    prvaAdresaSDetailom.detailVPonuke = [prvaAdresaSDetailom.detailVPonuke[0]];
    this.ciSaVopcha = this.countService.countFreeSpace(this.car, prvaAdresaSDetailom, this.prekrocenieVelkosti);
    this.skontrolujVahu();
    return this.kontrolaCiSaVopcha;
  }

  // kontroluje to vzdy len pre 1. adresu v ponuke
  volneMiesta(){
    let prvaAdresaSDetailom = JSON.parse(JSON.stringify(this.offer));
    prvaAdresaSDetailom.adresyVPonuke = [prvaAdresaSDetailom.adresyVPonuke[0]];
    prvaAdresaSDetailom.detailVPonuke = [prvaAdresaSDetailom.detailVPonuke[0]];
    this.ciSaVopcha = this.countService.countFreeSpace(this.car, prvaAdresaSDetailom, this.prekrocenieVelkosti);
    return this.ciSaVopcha;
  }


  kontrolaCiSaVopcha(indexAdresy){
    const poleKdeSaVopcha = this.countService.countFreeSpace(this.car, [], this.prekrocenieVelkosti);
    const najdiIndex = poleKdeSaVopcha.poleMiestKdeSaVopcha.find(oneOffer => oneOffer === indexAdresy);
    if (poleKdeSaVopcha && najdiIndex > -1){
      return true;
    }else{
      return false;
    }
  }

  // ked presuvam z ponuky do itinerara
  najdiCiMozemPresunutDoItinerara(detail, previous, current){
    let mozemPresunut = true;
    for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
      if (this.offer.adresyVPonuke[previous].type === 'vykladka') { // ked presuvam vykladku
        for (const [index, detailElement] of this.car.detailIti.entries()) {
          for (const [indexBalika, oneBalik] of detailElement.entries()) {
            if (oneBalik.id === detailPresuvany.id && current <= index) {
              mozemPresunut = false;
            }
          }
        }
      } else if (this.offer.adresyVPonuke[previous].type === 'nakladka') { // ked presuvam nakladku
        for (const [index, detailElement] of this.car.detailIti.entries()) {
          for (const [indexBalika, oneBalik] of detailElement.entries()) {
            if (oneBalik.id === detailPresuvany.id && current >= index) {
              mozemPresunut = false;
            }
          }
        }
      }
    }
    return mozemPresunut;
  }

  // kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current, itinerar){
    let mozemPresunut = true;
    // ked presuvam len v ponuke
    if (!itinerar) {
      for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
        if (this.offer.adresyVPonuke[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.offer.detailVPonuke.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.entries()) {
              if (index !== previous && oneBalik.id === detailPresuvany.id && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.offer.adresyVPonuke[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.offer.detailVPonuke.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.entries()) {
              if (index !== previous && oneBalik.id === detailPresuvany.id && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }
    }else{ // ked presuvam len v itinerari
      for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
        if (this.car.itiAdresy[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.car.detailIti.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.entries()) {
              if (index !== previous && oneBalik.id === detailPresuvany.id && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.car.itiAdresy[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.car.detailIti.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.entries()) {
              if (index !== previous && oneBalik.id === detailPresuvany.id && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }
    }
    return mozemPresunut;
  }


  najdiIndexNakladky(){
    let maxIndexNakladky = -1;
    if (this.offer.adresyVPonuke[0] && this.offer.adresyVPonuke[0].type === 'vykladka'){
      // kontrolujem baliky vykladky v ponuke[0]
      for (const [indexOffer, detailOffer] of this.offer.detailVPonuke[0].entries()) {
        // kontrolujem itinerar auta
        for (const [indexAddressIti, detailElement] of this.car.detailIti.entries()) {
          // kontrolujem baliky v 1 adrese
          for (const [indexBalika, oneBalik] of detailElement.entries()) {
            if (detailOffer.id === oneBalik.id) {
              maxIndexNakladky = indexAddressIti; // ukladam si index nakladky
            }
          }
        }
      }
    }
    return maxIndexNakladky;
  }
// pre 1.adresu v ponuke
  checkEstiAndLastTime(){
    if (this.car){
      this.skontrolujEstiALastTime();
      this.ciStihnePrijst = this.dataService.checkEstimatedAndLastTime(this.car.itiAdresy, this.offer.adresyVPonuke[0]);
      console.log(this.ciStihnePrijst)
    }
  }

  checkTime(townIndex){
    if (this.casyPreAuto && this.casyPreAuto[townIndex]){
      if (this.casyPreAuto[townIndex].pocetHodin == null){
        return false;
      }
      if (this.casyPreAuto[townIndex].pocetHodin < 1){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  // pre vsetky adresy
  skontrolujEstiALastTime(){
    const estiAdresy = this.dataService.vypocitajEstimatedPreVsetkyAdresy(this.car.itiAdresy, this.car);
    this.predpokladaneEsty = estiAdresy;
    const ciVychadzajuCasy = this.dataService.porovnajEstiALastTime(estiAdresy, this.car.itiAdresy);
    this.casyPreAuto = ciVychadzajuCasy;
    console.log(ciVychadzajuCasy)
  }

  getColorForTown(indexOfAddress){
    if (this.ciSaVopcha){
      const indexMesta = this.ciSaVopcha.poleMiestKdeSaVopcha.findIndex(oneId => oneId === indexOfAddress);
      if (indexMesta > -1){
        if (this.ciSaVopcha.prekrocenieOPercenta[indexMesta] && this.najdiIndexNakladky() <= indexOfAddress){
          return 'yellow';
        }else if (!this.ciSaVopcha.prekrocenieOPercenta[indexMesta] && this.najdiIndexNakladky() <= indexOfAddress){
          return 'green';
        }else{
          return;
        }
      }
    }

    let preprava = this.offer.zelenePrepravy.find(oneOffer => oneOffer.id === this.car.id);
    let indexVPoli;
    let prekrocenie;
    if (preprava){
      indexVPoli = preprava.vopchaSa.poleMiestKdeSaVopcha.findIndex(oneIndex => oneIndex === indexOfAddress);
      prekrocenie = preprava.vopchaSa.prekrocenieOPercenta[indexVPoli];
      const indexCiSaNachadza = preprava.vopchaSa.poleMiestKdeSaVopcha.find(oneIndex => oneIndex === indexOfAddress);
      if (indexCiSaNachadza > -1){

        if (prekrocenie === false && this.najdiIndexNakladky() <= indexOfAddress){
          return 'green';
        }else if (prekrocenie === true && this.najdiIndexNakladky() <= indexOfAddress){
          return 'yellow';
        }
      }
    }else if (this.offer.zltePrepravy.find(oneOffer => oneOffer.id === this.car.id)){
      preprava = this.offer.zltePrepravy.find(oneOffer => oneOffer.id === this.car.id);
      indexVPoli = preprava.vopchaSa.poleMiestKdeSaVopcha.findIndex(oneIndex => oneIndex === indexOfAddress);
      prekrocenie = preprava.vopchaSa.prekrocenieOPercenta[indexVPoli];

      // if (preprava){
      const indexCiSaNachadza = preprava.vopchaSa.poleMiestKdeSaVopcha.find(oneIndex => oneIndex === indexOfAddress);
      if (indexCiSaNachadza > -1){
          if (prekrocenie === false && this.najdiIndexNakladky() <= indexOfAddress){
            return 'green';
          }else if (prekrocenie === true && this.najdiIndexNakladky() <= indexOfAddress){
            return 'yellow';
          }
        }
      // }
    }else{
      const volneMiesta = this.ciSaVopcha;
      indexVPoli = volneMiesta.poleMiestKdeSaVopcha.findIndex(oneIndex => oneIndex === indexOfAddress);
      prekrocenie = volneMiesta.prekrocenieOPercenta[indexVPoli];
      const indexCiSaNachadza = volneMiesta.poleMiestKdeSaVopcha.find(oneIndex => oneIndex === indexOfAddress);
      if (indexCiSaNachadza > -1){
        if (prekrocenie === false && this.najdiIndexNakladky() <= indexOfAddress){
          return 'green';
        }else if (prekrocenie === true && this.najdiIndexNakladky() <= indexOfAddress){
          return 'yellow';
        }
      }
    }
  }

  countDistancePoints(index){
    const from = [this.car.itiAdresy[index].coordinatesOfTownsLon, this.car.itiAdresy[index].coordinatesOfTownsLat];
    const to = [this.car.itiAdresy[index + 1].coordinatesOfTownsLon, this.car.itiAdresy[index + 1].coordinatesOfTownsLat];
    const distance = getDistance(from, to);
    return Math.round(distance / 1000);
  }

  countDistanceOfItinerarWithou(){
    let allDistance = 0;
    this.car.itiAdresy.forEach((oneAddress, index) => {
      if (this.car.itiAdresy.length - 1 !== index){
        const from = [oneAddress.coordinatesOfTownsLon, oneAddress.coordinatesOfTownsLat];
        const to = [this.car.itiAdresy[index + 1].coordinatesOfTownsLon, this.car.itiAdresy[index + 1].coordinatesOfTownsLat];
        const distance = getDistance(from, to);
        allDistance += distance;
      }

    });
    this.distanceOfIti = Math.round(allDistance / 1000);
  }

  countDistanceOfItinerarWithOffer(){
    let allDistance = 0;
    this.car.itiAdresy.forEach((oneAddress, index) => {
      if (this.car.itiAdresy.length - 1 !== index){
        const from = [oneAddress.coordinatesOfTownsLon, oneAddress.coordinatesOfTownsLat];
        const to = [this.car.itiAdresy[index + 1].coordinatesOfTownsLon, this.car.itiAdresy[index + 1].coordinatesOfTownsLat];
        const distance = getDistance(from, to);
        allDistance += distance;
      }

    });
    return Math.round(allDistance / 1000);
  }

  checkIndex(indexOfElement){
    return indexOfElement !== 0;
}

  ulozPredbezneUlozenie(){
    const predpoklad: Predpoklad = {
      ecv: this.car.ecv,
      itinerar: this.car.itinerar,
      creatorId: this.dataService.getMyIdOrMaster(),
      ponukaId: this.offer.id
    };
    this.predpokladService.createPredpoklad(predpoklad);
  }

  sendCarToPredpoklad(predpoklad: Predpoklad){
    this.sendCarToPredpokad.emit(predpoklad);
    this.putFirstAddressFromOffer();
  }

  openSnackBar(message: string, action: string) {
    const snackBarRef = this._snackBar.open(message, action, {
      duration: 5000
    });

  }

  // ked kliknem na auto dostanem ulozeny predpoklad a snazim sa ho spracovat ak auto medzi tym ukoncilo nejaku prepravu
  // a zobrazit v itinerari, ak sa mi to nepodari, vypisem o tom spravu a zobrazim osobitne itinerar a ponuku
  spracujPredpoklad(predpoklad: Predpoklad, carFromMap){
    // tu musim natiahnut auto do this.car

    let car = JSON.parse(JSON.stringify(carFromMap));

    let neviemUlozit = false;
    // najprv kontrolujem ci sme do itinerara auta pridali nieco nove
    car.itinerar.forEach(oneId => {
      if (!predpoklad.itinerar.includes(oneId)){
        neviemUlozit = true;
        this.openSnackBar('V aute sa zmenili adresy ponuku musite uloziy nanovo', 'Ok');
      }
    });
    // tu konrolujem ci auto medzicasom nahodou nieco nedokoncilo
    predpoklad.itinerar.forEach(oneId => {
      if (!car.itinerar.includes(oneId) && !this.offer.addresses.includes(oneId)){
        neviemUlozit = true;
        this.openSnackBar('V aute sa zmenili adresy ponuku musite uloziy nanovo', 'Ok');
      }
    });

    if (neviemUlozit){
      return;
    }

    var order = {};
    // tu uz iba ulov sicko do this.car ....
    car.itiAdresy = car.itiAdresy.concat(this.offer.adresyVPonuke);
    car.itinerar = car.itinerar.concat(this.offer.addresses);
    car.detailIti = car.detailIti.concat(this.offer.detailVPonuke);
    predpoklad.itinerar.forEach(function (a, i) { order[a] = i; });
    car.itiAdresy.sort(function (a, b) {
      return order[a.id] - order[b.id];
    });

    // TODO tieto 2 ulozenia podla predulozenej sracky nefunguju
    car.itinerar.sort(function (a, b) {
      return order[a.id] - order[b.id];
    });
    car.detailIti.sort(function (a, b) {
      return order[a.id] - order[b.id];
    });
    this.car = car;

    // docasne riesenie
    this.car.itinerar = predpoklad.itinerar;


    this.offer.adresyVPonuke = [];
    this.offer.addresses = [];
    this.offer.detailVPonuke = [];
  }

  priraditVozidlu(){
    let car = this.carService.getAllCars().find(oneCar => oneCar.id === this.car.id);
    car.itinerar = this.car.itinerar;
    this.carService.updateCar(car, car.id);
    var offer: Route = this.offerService.getRoutesNoSub().find(oneOffer => oneOffer.id === this.offer.id);
    offer.offerInRoute = this.car.id;
    offer.carId = this.car.id
    const ponuka = this.offerService.getRoutesNoSub().find(oneRoute => oneRoute.id === this.offer.id);
    let adresy: Address[] = this.addressService.getAddressesFromOffer().filter(oneAdresa => ponuka.addresses.includes(oneAdresa.id));
    adresy.forEach(oneAdresa => {
      oneAdresa.carId = this.car.id;
      this.addressService.updateAddress(oneAdresa);
    });
    this.offerService.updateRoute(offer);
    this.uspecnePriradenie.emit(this.car);
    this.matComponent.reDrawOffers();
  }

  chooseColor(type){
    if (this.car){
      if (type === 'adr'){
        if (this.car.adr){
          return 'green';
        }else{
          return 'red';
        }
      }

      if (type === 'ruka'){
        if (this.car.ruka){
          return 'green';
        }else{
          return 'red';
        }
      }
    }

  }

  getMinMaxTeplotaFromOffer(teplota){
    if (this.car){
      if (teplota >= this.car.minTeplota && teplota <= this.car.maxTeplota){
        return 'green';
      }else{
        return 'red';
      }
    }
  }

  openAllDetailDialog(){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
        addresses: this.realOffer.adresyVPonuke,
        detail: this.realOffer.detailVPonuke
      };
    const dialogRef = this.dialog.open(AllDetailAboutRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }

  moveAll(){
    this.car.itiAdresy = this.car.itiAdresy.concat(this.offer.adresyVPonuke);
    this.car.itinerar = this.car.itinerar.concat(this.offer.addresses);
    this.car.detailIti = this.car.detailIti.concat(this.offer.detailVPonuke);
    this.offer.adresyVPonuke = [];
    this.offer.addresses = [];
    this.offer.detailVPonuke = [];
    this.putFirstAddressFromOffer();
    this.checkEstiAndLastTime();
  }

  getCountOfPackages(townIndex){
    return this.offer.detailVPonuke[townIndex].length;
  }

  // pre nakladky
  getBednaIndex(townIndex, detailIndex){
    let indexBedne = 0;
    for (let i = 0; i < townIndex; i++) {
      if (!this.offer.detailVPonuke[i].townsArray){ // len nakladky pocitam
        indexBedne += this.getCountOfPackages(i);
      }
    }
    indexBedne += detailIndex + 1;
    return indexBedne;
  }

  getCountOfPackagesAuto(townIndex){
    return this.car.detailIti[townIndex].length;
  }

  // pre nakladky
  getBednaIndexAuto(townIndex, detailIndex){
    let indexBedne = 0;
    for (let i = 0; i < townIndex; i++) {
      if (!this.car.detailIti[i].townsArray){ // len nakladky pocitam
        indexBedne += this.getCountOfPackagesAuto(i);
      }
    }
    indexBedne += detailIndex + 1;
    return indexBedne;
  }



}

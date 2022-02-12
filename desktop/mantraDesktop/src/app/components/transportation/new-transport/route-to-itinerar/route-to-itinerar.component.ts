import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import Cars from "../../../../models/Cars";
import Address from "../../../../models/Address";
import {AddressService} from "../../../../services/address.service";
import {DataService} from "../../../../data/data.service";
import {CarService} from "../../../../services/car.service";
import {PackageService} from "../../../../services/package.service";
import {RouteService} from '../../../../services/route.service';
import DeatilAboutAdresses from '../../../../models/DeatilAboutAdresses';
import {CountFreeSpaceService} from '../../../../data/count-free-space.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-route-to-itinerar',
  templateUrl: './route-to-itinerar.component.html',
  styleUrls: ['./route-to-itinerar.component.scss']
})
export class RouteToItinerarComponent implements OnInit {

  @Input() car: Cars;
  myCarWithEverything;
  myNewRouteWithEverything;
  myNewRouteWithEverythingCopy;
  @Input() newRoute: Address[];
  @Input() newDetails;
  @Output() carId = new EventEmitter<string>();
  @Output() offerInCar = new EventEmitter<Cars>();
  newRouteCopy: Address[];
  carItinerarAddresses: Address[] = [];
  poleMiestKdeSaVopcha;
  ciSaVopchaCezOtvor = true;
  volnaVahaPreAuto;
  casyPreAuto;
  predpokladaneEsty;
  vyskaNaklHrany;
  constructor(private addressService: AddressService, private dataService: DataService,
              private carService: CarService, private addressesService: AddressService, private packageService: PackageService,
              private countFreeSpaceService: CountFreeSpaceService, private translation: TranslateService) { }

  ngOnInit(): void {
    var adresy = this.addressService.getAddresses();// TODO toto treba majk check
    adresy = adresy.concat(this.addressService.getAddressesFromOffer());

    if (this.car){
      if (this.car.itinerar){
        this.car.itinerar.forEach(addId => {
          this.carItinerarAddresses.push(adresy.find(oneAddress => oneAddress.id === addId));
        });
        this.naplnAutoDetailomAAdresami();
      }else{
        this.car = {...this.car, itinerar: []}
        this.carItinerarAddresses = [];
      }
    }
    this.newRouteCopy = JSON.parse(JSON.stringify(this.newRoute));
    this.naplnNovuRoutuDetailom();
    this.skontrolujVolneMiesto();

  }

  roundDecimal(sameNumber){
    if (!sameNumber){
      return 'Nezname';
    }
    let numberToRound;
    if (typeof sameNumber === 'string'){
      numberToRound = parseFloat(sameNumber);
    }else{
      numberToRound = sameNumber;
    }
    return parseFloat((numberToRound).toFixed(5)); // ==> 1.005
  }

  najdiIndexNakladky(){
    let maxIndexNakladky = -1;
    if (this.myNewRouteWithEverything.adresyVPonuke[0] && this.myNewRouteWithEverything.adresyVPonuke[0].type === 'vykladka'){
      // kontrolujem baliky vykladky v ponuke[0]
      for (const [indexOffer, detailOffer] of this.myNewRouteWithEverything.detailVPonuke[0].entries()) {
        // kontrolujem itinerar auta
        for (const [indexAddressIti, detailElement] of this.myCarWithEverything.detailIti.entries()) {
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

  skontrolujVolneMiesto(){
    const itinerarAutaPocetPalietVMeste = this.countFreeSpaceService.vypocitajPocetPalietVKazomMeste(this.myCarWithEverything);
    const pocetTonVIti = this.countFreeSpaceService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
    const volnaVahaPreAutovIti = this.countFreeSpaceService.volnaVahaPreAutoVMeste(this.myCarWithEverything, pocetTonVIti, 1);
    const volnaVahaPreAutovItiSPrekrocenim = this.countFreeSpaceService.volnaVahaPreAutoVMeste(this.myCarWithEverything, pocetTonVIti, 1);
    const vopchaSa = this.countFreeSpaceService.countFreeSpace(this.myCarWithEverything, this.myNewRouteWithEverything, 1);
    this.poleMiestKdeSaVopcha = vopchaSa;
    this.skontrolujVahu();
    this.skontrolujEstiALastTime();
    this.checkVyskaHrany();
  }

  skontrolujEstiALastTime(){
    if (this.myCarWithEverything.itiAdresy){
      const estiAdresy = this.dataService.vypocitajEstimatedPreVsetkyAdresy(this.myCarWithEverything.itiAdresy, this.car);
      this.predpokladaneEsty = estiAdresy;
      const ciVychadzajuCasy = this.dataService.porovnajEstiALastTime(estiAdresy, this.myCarWithEverything.itiAdresy);
      this.casyPreAuto = ciVychadzajuCasy;
    }

  }

  timeToLocal(dateUtc, oClock){
    var date = (new Date(dateUtc));
    if (oClock !== '0'){
      date.setHours(oClock.substring(0, 2), oClock.substring(3, 5));
    }
    if (dateUtc == null || dateUtc === '0'){
      return this.translation.instant('OFTEN.nerozhoduje');
    }
    return date.toLocaleString();
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return this.translation.instant('OFTEN.nerozhoduje');
    }
    return date.toLocaleString();
  }

  checkVyskaHrany(){
    const vyskaHrany = this.countFreeSpaceService.checkMaxMinNaklHrana(this.myNewRouteWithEverythingCopy.detailVPonuke);
    this.vyskaNaklHrany = vyskaHrany;
  }


  najdiDetaildries(adresy: Address[]){
    var detailVPonuke = [];
    adresy.forEach((address, indexAdresa)  => {
      const packageVPoradiPreAdresu: DeatilAboutAdresses[] = [];
      if (address){
        address.packagesId.forEach(onePackageId => {
          let balik: DeatilAboutAdresses = this.packageService.getOnePackage(onePackageId);
          if (balik){
            balik.id = onePackageId;
          }else{
            // setTimeout( () => {
            balik = this.packageService.getOnePackage(onePackageId);
            if (balik){
              balik.id = onePackageId;
            }
            // }, 700 );
          }
          packageVPoradiPreAdresu.push(balik);
        });
      }
      detailVPonuke.push(packageVPoradiPreAdresu);
    });
    return detailVPonuke;
  }

  naplnAutoDetailomAAdresami(){
    // carsWithIti.push({...oneCar, itiAdresy: itinerarAuta, detailIti: detailAuta});
    const detailVPonuke = this.najdiDetaildries(this.carItinerarAddresses);

    this.myCarWithEverything = {...this.car, itiAdresy: this.carItinerarAddresses, detailIti: detailVPonuke};
  }

  naplnNovuRoutuDetailom(){
    let prepravasDetailom;
    let maxVaha = 0;
    let sumVaha = 0;
    let detailVPonuke = this.najdiDetaildries(this.newRouteCopy);
    detailVPonuke.forEach((oneDetail, indexTown ) => { // detailom a zistujem max vahu
      oneDetail.forEach((onePackage, indexPackage) => {
        if (onePackage){
          if (this.newRouteCopy[indexTown].type === 'nakladka'){
            sumVaha += onePackage.weight;
            if (sumVaha > maxVaha){
              maxVaha = sumVaha;
            }
          }else{
            sumVaha -= onePackage.weight;
          }
        }
      });
    });
    const prvaAdresa = [this.newRouteCopy[0]];
    detailVPonuke = [detailVPonuke[0]];
    this.myNewRouteWithEverything = {adresyVPonuke: prvaAdresa , maxVaha, detailVPonuke};
    if (!this.myNewRouteWithEverythingCopy){
      this.myNewRouteWithEverythingCopy = JSON.parse(JSON.stringify(this.myNewRouteWithEverything));
      this.ciSaVopchaCezOtvor = this.ciSaVopchaCezOtvory();
    }
  }

  skontrolujVahu(){
    const itinerarAutaPocetPalietVMeste = this.countFreeSpaceService.vypocitajPocetPalietVKazomMeste(this.myCarWithEverything);
    const pocetTonVIti = this.countFreeSpaceService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
    const volnaVahaPreAutovIti = this.countFreeSpaceService.volnaVahaPreAutoVMeste(this.myCarWithEverything, pocetTonVIti, 1);
    this.volnaVahaPreAuto = volnaVahaPreAutovIti;
  }

  kontrolaCiSaVopcha(indexAdresy){
    const najdiIndex = this.poleMiestKdeSaVopcha.poleMiestKdeSaVopcha.find(oneOffer => oneOffer === indexAdresy);
    if (najdiIndex > -1){
      return true;
    }else{
      return false;
    }
  }

  ciSaVopchaCezOtvory(){
    return this.countFreeSpaceService.ciSaVopchaTovarCezNakladaciPriestor(this.car, this.myNewRouteWithEverythingCopy.detailVPonuke);
  }

  // kontrola ci mozem prehodit mesta - podla detailu
  najdiCiMozemPresunut(detail, previous, current){
    var mozemPresunut = true;
    if (detail.townsArray){ // ked sa snazim presunut vykladku
      for (const [index, detailElement] of detail.townsArray.entries()) {
        var mestoNakladky = detail.townsArray[index];
        // +1 lebo pred to som hodil novy item
        if (mestoNakladky + 1 > current){ // ak je mesto kde nakladam vyzsie ako aktualny index vykladky
          mozemPresunut = false;
        }
      }
    }else{ // a tu ked nakladku
      for (const [indexNakBalika, detailElement] of detail.entries()) {
        for (const [indexMesta, oneDetail] of this.newDetails.entries()) {
          if (oneDetail.townsArray){
            for (const [index, oneBalik] of oneDetail.townsArray.entries()) {
              if (oneDetail.townsArray[index] === previous && oneDetail.detailArray[index] === indexNakBalika){
                if (indexMesta - 1 < current){
                  mozemPresunut = false;
                }
              }
            }
          }
        }
      }
    }
    return mozemPresunut;
  }

  // ked presuvam z ponuky do itinerara
  najdiCiMozemPresunutDoItinerara(detail, previous, current, itinerar){
    let mozemPresunut = true;
    for (const [indexPresuvacieho, detailPresuvany] of detail.entries()) {
      if (!itinerar){
        if (this.newRouteCopy[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (oneBalik === detailPresuvany && current <= index) {   // index !== previous &&
                mozemPresunut = false;
              }
            }
          }
        } else if (this.newRouteCopy[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }else{
        if (this.carItinerarAddresses[previous].type === 'vykladka') { // ked presuvam vykladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current <= index) {
                mozemPresunut = false;
              }
            }
          }
        } else if (this.carItinerarAddresses[previous].type === 'nakladka') { // ked presuvam nakladku
          for (const [index, detailElement] of this.carItinerarAddresses.entries()) {
            for (const [indexBalika, oneBalik] of detailElement.packagesId.entries()) {
              if (index !== previous && oneBalik === detailPresuvany && current >= index) {
                mozemPresunut = false;
              }
            }
          }
        }
      }


    }
    return mozemPresunut;
  }

  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];

  drop(event: CdkDragDrop<Address[]>) {
    var presuvaciDetail;
    // if (this.carItinerarAddresses[event.previousIndex].packagesId){
    // }
    if (event.previousContainer === event.container) {
      var mozemPresunut
      if (event.previousContainer.id === 'all'){
        presuvaciDetail = this.newDetails[event.previousIndex];
        // tu kontrolujem ked presuvam len medzi novymi adresami
        mozemPresunut = this.najdiCiMozemPresunut(presuvaciDetail, event.previousIndex, event.currentIndex);
      }else{
        presuvaciDetail = this.carItinerarAddresses[event.previousIndex].packagesId;
        mozemPresunut = this.najdiCiMozemPresunutDoItinerara(presuvaciDetail, event.previousIndex, event.currentIndex, true);
      }
      if (mozemPresunut){
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.naplnNovuRoutuDetailom();
        this.naplnAutoDetailomAAdresami();
        this.skontrolujVolneMiesto();
      }
    } else {
      presuvaciDetail = this.newRouteCopy[event.previousIndex].packagesId;
      mozemPresunut = this.najdiCiMozemPresunutDoItinerara(presuvaciDetail, event.previousIndex, event.currentIndex, false);
      if (mozemPresunut){
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
      this.naplnNovuRoutuDetailom();
      this.naplnAutoDetailomAAdresami();
      this.skontrolujVolneMiesto();

    }
  }

  setCar(car: Cars){
    this.car = car;
    this.newRouteCopy = JSON.parse(JSON.stringify(this.newRoute));
    this.naplnNovuRoutuDetailom();
    this.setAddresses();
  }

  setAddresses(){
    var allAddresses = this.addressService.getAddresses();// TODO toto treba majk check
    allAddresses = allAddresses.concat(this.addressService.getAddressesFromOffer());

    var adresy = allAddresses.filter(jednaAdresa => this.car.itinerar.includes(jednaAdresa.id));
    adresy = this.car.itinerar.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia

    this.carItinerarAddresses = adresy;
    this.naplnAutoDetailomAAdresami();
    this.naplnNovuRoutuDetailom();
    this.skontrolujVolneMiesto();

  }

  najdiVykladkuTovaru(townId, detailId){
    for (const [idTown, oneDetail] of this.newDetails.entries()) {
      if (oneDetail.townsArray !== undefined){
        for (const [idDetail, onePackage] of oneDetail.townsArray.entries()) {
          if (oneDetail.townsArray[idDetail] == townId && oneDetail.detailArray[idDetail] == detailId){
            return {idTown: idTown, idDetail: idDetail}
          }
        }
      }
    }
  }

  checkIndex(indexOfElement){
    return indexOfElement !== 0;
  }

  // TODO tu je problem , uklada sa novy package do povodnej adresy, idtown je 0 a nova adresa napr na 4 pozicii, takze novy package je v 0
  async addToItinerar(){
    // if (this.newRouteCopy.)
    let addressesId = [];
    this.carItinerarAddresses.forEach(oneAddress => {
      addressesId.push(oneAddress.id);
      oneAddress.carId = this.car.id;
      this.addressService.updateAddress(oneAddress);
    });
    this.car.itinerar = addressesId;
    this.carService.updateCar(this.car, this.car.id);

    this.carId.emit(this.car.id);
    // vratit id novych adries a ulozit ich do routy + ulozit routu a je dokonane
  }

  moveAll(){
    this.carItinerarAddresses = [...this.carItinerarAddresses, ...this.newRouteCopy];
    this.newRouteCopy = [];
    this.naplnNovuRoutuDetailom();
    this.naplnAutoDetailomAAdresami();
    this.skontrolujVolneMiesto();
  }

  getClass(address: Address, indexAdresy){
    if (!address || !this.newRoute){
      return;
    }
    let classString = '';
    const isNew = this.newRoute.find(oneAddress => oneAddress.id === address.id);
    let indexMesta;

    if (this.poleMiestKdeSaVopcha){
      indexMesta = this.poleMiestKdeSaVopcha.poleMiestKdeSaVopcha.find(townIndex => townIndex === indexAdresy);
    }
    if (isNew){
      classString = 'newAddress ';
    }
    if (indexMesta > -1 && this.najdiIndexNakladky() <= indexAdresy && this.volnaVahaPreAuto[indexAdresy] >= 0){
      classString = classString + 'greenBack';
    }else{
      classString = classString + 'redBack';
    }
    return classString;
  }

  getClassForNaklHrana(){
    if (this.vyskaNaklHrany && this.vyskaNaklHrany.maxVyska > -1){
      var carMin = this.car.nakladaciaHrana[0];
      var carMax = this.car.nakladaciaHrana[1];
      if (carMax){
        if (this.vyskaNaklHrany.maxVyska <= carMax && this.vyskaNaklHrany.minVyska >= carMin){
          return 'greenBack';
        }else{
          return 'redBack';
        }
      }else{
            if (this.vyskaNaklHrany.maxVyska <= carMin && this.vyskaNaklHrany.minVyska >= carMin){
              return 'greenBack';
            }else{
              return 'redBack';
            }
          }
    }
  }

  getCountOfPackages(townIndex, newRoute){
    if (newRoute){
      return this.newRouteCopy[townIndex].packagesId.length;
    }else{
      return this.carItinerarAddresses[townIndex].packagesId.length;
    }
  }
  // pre nakladky
  getBednaIndex(townIndex, detailIndex, newRoute){
    if (!newRoute){ // ked to kontrolujem v itinerari
      let indexBedne = 0;
      for (let i = 0; i < townIndex; i++) {
        indexBedne += this.getCountOfPackages(i, false);
      }
      indexBedne += detailIndex + 1;
      return indexBedne;
    }else{
      let indexBedne = 0;
      for (let i = 0; i < townIndex; i++) {
        indexBedne += this.getCountOfPackages(i, true);
      }
      indexBedne += detailIndex + 1;
      return indexBedne;
    }
  }

  getBednaIndexVykladka(packageIdFrom, newRoute){
    if (newRoute){
      const townId = this.newRouteCopy.findIndex(oneAddress => oneAddress.packagesId.includes(packageIdFrom));
      if (townId !== -1){
        const packageId = this.newRouteCopy[townId].packagesId.findIndex(onePackage => onePackage === packageIdFrom);
        return this.getBednaIndex(townId, packageId, newRoute);
      }
    }else{
      const townId = this.carItinerarAddresses.findIndex(oneAddress => oneAddress.packagesId.includes(packageIdFrom));
      if (townId !== -1){
        const packageId = this.carItinerarAddresses[townId].packagesId.findIndex(onePackage => onePackage === packageIdFrom);
        return this.getBednaIndex(townId, packageId, newRoute);
      }
    }
  }
}

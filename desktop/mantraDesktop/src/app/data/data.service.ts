import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import Dispecer from '../models/Dispecer';
import {RouteService} from '../services/route.service';
import Route from '../models/Route';
import {PrivesService} from '../services/prives.service';
import {CarService} from '../services/car.service';
import Cars from '../models/Cars';
import DeatilAboutAdresses from '../models/DeatilAboutAdresses';
import Address from '../models/Address';
import {getDistance} from 'ol/sphere';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private carSource = new BehaviorSubject<string>('empty');
  currentCar = this.carSource.asObservable();

  private vylozeneSource = new BehaviorSubject<boolean>(false);
  vsetkoVylozene$ = this.vylozeneSource.asObservable();
  vsetkoVylozeneGet;

  private routeSource = new BehaviorSubject<any>(null);
  currentRoute = this.routeSource.asObservable();

  sizesS = [];
  sizesD = [];
  sizesV = [];
  weight = [];
  stohovatelnost = [];

  cars;
  routes;

  private dispecerSource = new BehaviorSubject<string>('empty');
  private loggedDispecer: Dispecer;

  // detaily v route
  private detailSource = new BehaviorSubject<any>(null);
  allCurrentDetail = this.detailSource.asObservable();
  private currentDetails;

  // detail v aktualnej adrese ktoru vytvaram
  private actualDetailSource = new BehaviorSubject<any>(null);
  actualDetail = this.actualDetailSource.asObservable();

  setDetailSource(detail){
    this.detailSource.next(detail);
    this.currentDetails = detail;
  }

  getDetails(){
    return this.currentDetails;
  }

  setActualDetailsInAddress(details){
    this.actualDetailSource.next(details);
  }

  setVylozene(vylozene){
    this.vsetkoVylozeneGet = vylozene;
    this.vylozeneSource.next(vylozene);
  }



  constructor() { }

  changRoute(car: any) {
    // console.log(message)
    this.carSource.next(car);
  }

  changeRealRoute(route: any) {
    // console.log(message)
    this.routeSource.next(route);
  }

  setDispecer(dispecer){
    this.loggedDispecer = dispecer;
  }

  getDispecer(){
    return this.loggedDispecer;
  }

  getAllCars(){
    return this.cars;
  }

  setCars(cars){
    this.cars = cars;
  }

  getOneCarById(id){
    return this.cars.find(car => car.id === id);
  }

  setRoutes(routes){
    this.routes = routes;
  }
  getRoutes(){
    return this.routes;
  }

  getMyIdOrMaster(){
    let idCreated;
    if (this.getDispecer().createdBy === 'master'){
      idCreated = this.getDispecer().id;
    }else{
      idCreated = this.getDispecer().createdBy;
    }
    return idCreated;
  }

  checkAddressesTime(addresses: Address[]){
    const indexAdries = [];
    // Get 1 day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;


    for (let i = 0; i < addresses.length; i++) {
      for (let j = i + 1; j < addresses.length; j++) {
        if (addresses[i].datumLastPrijazdy !== '0' && addresses[j].datumLastPrijazdy !== '0'){
          const datumPrvejAdresy = new Date(addresses[i].datumLastPrijazdy);
          if (addresses[i].casLastPrijazdu !== '0'){
            datumPrvejAdresy.setHours(Number(addresses[i].casLastPrijazdu.substring(0, 2)), Number(addresses[i].casLastPrijazdu.substring(3, 5)));
          }
          const datumDruhejAdresy = new Date(addresses[j].datumLastPrijazdy);
          if (addresses[j].casLastPrijazdu !== '0'){
            datumDruhejAdresy.setHours(Number(addresses[j].casLastPrijazdu.substring(0, 2)), Number(addresses[j].casLastPrijazdu.substring(3, 5)));
          }
          const date = datumDruhejAdresy.getTime() - datumPrvejAdresy.getTime();
          const pocetDni = Math.round(date / oneDay);
          const pocetHodin =  (date / (1000 * 60 * 60)).toFixed(1);
          if (pocetDni <= 0){
            indexAdries.push({adresa1: i, adresa2: j, pocetDni, pocetHodin});
          }
        }
      }
    }
    return indexAdries;
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  timeToLocal(dateUtc, oClock){
    var date = (new Date(dateUtc));
    if (oClock !== '0'){
      date.setHours(oClock.substring(0, 2), oClock.substring(3, 5));
    }
    if (dateUtc == null || dateUtc === '0'){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  checkEstimatedAndLastTime(addresses: Address[], newAddress: Address){
    let poleSHodinami = [];
    if (newAddress && newAddress.datumLastPrijazdy){
    const datumNovej = new Date(newAddress.datumLastPrijazdy);
    if (newAddress.casLastPrijazdu !== '0'){
      datumNovej.setHours(Number(newAddress.casLastPrijazdu.substring(0, 2)), Number(newAddress.casLastPrijazdu.substring(3, 5)));
    }
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].estimatedTimeArrival){
        const datumPrvejAdresy = new Date(addresses[i].estimatedTimeArrival);
        const rozdielVMili = datumNovej.getTime() - datumPrvejAdresy.getTime();
        const pocetHodin =  (rozdielVMili / (1000 * 60 * 60)).toFixed(1);
        poleSHodinami.push(Number(pocetHodin));
      }else{
        poleSHodinami.push(null);
      }
    }
    }

    return poleSHodinami;
  }

  vypocitajEstimatedPreVsetkyAdresy(address: Address[], car: Cars){
    const casPrichodovPreAdresy = [];
    let nemenilSomEsti = true;
    for (let i = 0; i < address.length; i++) {
      if (address[i] && !address[i].estimatedTimeArrival || !nemenilSomEsti){
        nemenilSomEsti = false;
        let from;
        if (i === 0){ // ak pre 1. adresu nemam esti
          if (car.lattitude === undefined){
            return [];
          }
          from = [car.longtitude , car.lattitude];
          const to = [address[i].coordinatesOfTownsLon , address[i].coordinatesOfTownsLat]; // *1.2, lebo to nieje vzdusna...
          const vzdialenostOdAutaKAdrese = (this.countDistancePoints(from, to) / 1000) * 1.2; // chcem to v km, preto / 1000
          const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
          var hrs = parseInt(String(Number(casOdAutaKAdrese.toString(10))));
          var min = Math.round((Number(casOdAutaKAdrese) - hrs) * 60);
          var clocktime = hrs+':'+min;
          console.log(clocktime)
          var casPrichoduAuta = new Date();
          casPrichoduAuta.setHours(casPrichoduAuta.getHours() + hrs, casPrichoduAuta.getMinutes() + min);
          casPrichodovPreAdresy.push(casPrichoduAuta.toISOString());
        }else{
          from = [address[i - 1].coordinatesOfTownsLon , address[i - 1].coordinatesOfTownsLat];
          const to = [address[i].coordinatesOfTownsLon , address[i].coordinatesOfTownsLat];
          const vzdialenostOdAutaKAdrese = (this.countDistancePoints(from, to) / 1000) * 1.2; // chcem to v km, preto / 1000
          const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
          var hrs = parseInt(String(Number(casOdAutaKAdrese.toString(10))));
          var min = Math.round((Number(casOdAutaKAdrese) - hrs) * 60);

          var casPrichoduAuta = new Date(casPrichodovPreAdresy[i - 1]); // zoberiem datum predchadzajuceho prijazdu
          casPrichoduAuta.setHours(casPrichoduAuta.getHours() + hrs + Number(address[i - 1].obsluznyCas), casPrichoduAuta.getMinutes() + min); // a k nemu pripocitam cas potrebny pre jazdu do dalsej
          casPrichodovPreAdresy.push(casPrichoduAuta.toISOString());
        }
      }else{
        casPrichodovPreAdresy.push(address[i].estimatedTimeArrival);
      }
    }
    if (address.length === 0){
      casPrichodovPreAdresy.push(new Date().toISOString());
    }
    return casPrichodovPreAdresy;
  }

  porovnajEstiALastTime(estimateds: any[], addresses: Address[]){
    const zostavajuciCas = [];
    // TODO toto kuknut ked nemam ziadne adresy vo vozidle...
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].datumLastPrijazdy !== '0'){
        const esti = new Date(estimateds[i]);
        const lastTime = new Date(addresses[i].datumLastPrijazdy);
        let maxHours;
        let maxMinutes;
        let minHours;
        let minMinutes;
        if (addresses[i].casLastPrijazdu !== '0'){
          lastTime.setHours(Number(addresses[i].casLastPrijazdu.substring(0, 2)), Number(addresses[i].casLastPrijazdu.substring(3, 5)));
          maxHours = addresses[i].casLastPrijazdu.substring(0, 2);
          maxMinutes = addresses[i].casLastPrijazdu.substring(3, 5);
          minHours = addresses[i].casPrijazdu.substring(0, 2);
          minMinutes = addresses[i].casPrijazdu.substring(3, 5);
        }
        // pre 1 den, datum nezalezi
        let rozdielVHodinach;
        let sediCas;
        if (maxHours){

          const dnesSCasomFirst = new Date();
          dnesSCasomFirst.setHours(minHours, minMinutes);


          const dnesSCasomLast = new Date();
          dnesSCasomLast.setHours(maxHours, maxMinutes);

          const dnesSCasomEsti = new Date();
          dnesSCasomEsti.setHours(esti.getHours(), esti.getMinutes());

          rozdielVHodinach = Number(dnesSCasomLast.getTime() - dnesSCasomEsti.getTime());

          if (dnesSCasomEsti.getHours() >= dnesSCasomFirst.getHours() && dnesSCasomEsti.getHours() < dnesSCasomLast.getHours()){
            sediCas = true;
          }else{
            sediCas = false;
          }
          rozdielVHodinach =  Number((rozdielVHodinach / (1000 * 60 * 60)).toFixed(1));
        }
        const rozdielVMili = lastTime.getTime() - esti.getTime();
        const pocetHodin =  Number((rozdielVMili / (1000 * 60 * 60)).toFixed(1));
        zostavajuciCas.push({pocetHodin, rozdielVHodinach, sediCas});
    }else if (addresses[i].casLastPrijazdu !== '0'){ // TODO dokoncit toto
        const esti = new Date(estimateds[i]);
        const lastTime = new Date();
        let maxHours;
        let maxMinutes;
        let minHours;
        let minMinutes;
        let rozdielVHodinach;
        lastTime.setHours(Number(addresses[i].casLastPrijazdu.substring(0, 2)), Number(addresses[i].casLastPrijazdu.substring(3, 5)));
        maxHours = addresses[i].casLastPrijazdu.substring(0, 2);
        maxMinutes = addresses[i].casLastPrijazdu.substring(3, 5);
        minHours = addresses[i].casPrijazdu.substring(0, 2);
        minMinutes = addresses[i].casPrijazdu.substring(3, 5);
        if (maxHours){
          let sediCas;
          const dnesSCasomLast = new Date();
          dnesSCasomLast.setHours(maxHours, maxMinutes);
          const dnesSCasomFirst = new Date();
          dnesSCasomFirst.setHours(minHours, minMinutes);

          const dnesSCasomEsti = new Date();
          dnesSCasomEsti.setHours(esti.getHours(), esti.getMinutes());
          rozdielVHodinach = dnesSCasomLast.getTime() - dnesSCasomEsti.getTime();
          if (dnesSCasomEsti.getHours() >= dnesSCasomFirst.getHours() && dnesSCasomEsti.getHours() < dnesSCasomLast.getHours()){
            sediCas = true;
          }else{
            sediCas = false;
          }


          zostavajuciCas.push({pocetHodin: null, rozdielVHodinach: Number(rozdielVHodinach), sediCas: sediCas});
        }else{
          zostavajuciCas.push({pocetHodin: null, rozdielVHodinach: null, sediCas: null});
        }
      }
      else{
        zostavajuciCas.push({pocetHodin: null, rozdielVHodinach: null, sediCas: null});
      }

  }
    if (addresses.length === 0){
      zostavajuciCas.push({pocetHodin: null, rozdielVHodinach: null, sediCas: null});
    }
    return zostavajuciCas;
  }

  najdiNajskorsiLastTimeArrival(offer: Address[], itiAddresses: Address[], car: Cars){
    console.log(itiAddresses.length);
    let najskorsiLastTimeArrival;
    let indexMesta; // s najmensim last time arrival z ponuky
    offer.forEach((oneAddress, indexM) => {
      if (oneAddress.datumLastPrijazdy && oneAddress.datumLastPrijazdy !== '0'){
        let date = new Date(oneAddress.datumLastPrijazdy);
        if (!najskorsiLastTimeArrival){
          najskorsiLastTimeArrival = date;
          indexMesta = indexM;
        }else{
          if (najskorsiLastTimeArrival.getTime() > date.getTime()){
            najskorsiLastTimeArrival = date;
            indexMesta = indexM;
          }
        }
      }
    });
    const najmensiaPonuka = offer[indexMesta];
    let najvacsiIndex = -1;

    if (najmensiaPonuka){
      for (let id = 0; id < itiAddresses.length + 1; id++) {
        const address: Address[] = JSON.parse(JSON.stringify(itiAddresses));
        address.splice(id, 0, najmensiaPonuka);
        const adresySNajmensim = address;
        const esti = this.vypocitajEstimatedPreVsetkyAdresy(adresySNajmensim, car);
        const ciSedia = this.porovnajEstiALastTime(esti, adresySNajmensim);
        let sedia = true;
        ciSedia.forEach(onePrvok => {
          if (onePrvok.pocetHodin !== null && onePrvok.pocetHodin <= 0){
            sedia = false;
          }
        });
        if (sedia){
          najvacsiIndex = id;
        }
      }
    }else{
      najvacsiIndex = null;
    }


    if (najvacsiIndex === undefined){
      najvacsiIndex = null;
    }
    return najvacsiIndex;
  }

  // hodim lat lon od do a vrati mi dlzku v metroch
  countDistancePoints(from, to){
    const distance = getDistance(from, to);
    return distance;
  }


}

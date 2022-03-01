import { Injectable } from '@angular/core';
import Route from '../../models/Route';
import Address from '../../models/Address';
import DeatilAboutAdresses from '../../models/DeatilAboutAdresses';
import {PackageService} from '../../services/package.service';
import {AddressService} from '../../services/address.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {CountFreeSpaceService} from '../../data/count-free-space.service';
import {DataService} from '../../data/data.service';
import LineString from 'ol/geom/LineString';
import {getDistance} from 'ol/sphere';
import {getLength} from 'ol/sphere';
import {toLonLat} from 'ol/proj';
import Cars from '../../models/Cars';

@Injectable({
  providedIn: 'root'
})
export class CountOffersService {
  emitFromFilter;
  maxPrekrocenieRozmerov;

  adressesFromDatabase;

  carsWithItinerar;

  snackBarIsOpen = false;


  constructor(private packageService: PackageService, private addressesService: AddressService, private _snackBar: MatSnackBar,
              private translation: TranslateService, private countFreeSpaceService: CountFreeSpaceService,
              private dataService: DataService) { }


    offersUpdate(emitFromFilter, carsWithEvery){
    return new Promise(resolve => {

    this.carsWithItinerar = carsWithEvery;
    this.adressesFromDatabase = this.addressesService.addressesOfferGet.concat(this.addressesService.addressesGet);
      if (emitFromFilter == null){

      }else if (emitFromFilter != null){
        this.emitFromFilter = emitFromFilter.offers;
        const offers: Route[] = emitFromFilter.offers;
        const minVzdialenost = emitFromFilter.minDistance;
        const maxVzdialenost = emitFromFilter.maxDistance;
        const maxPrekrocenieVahy = emitFromFilter.weight;
        const maxPrekrocenieRozmerov = emitFromFilter.size;
        const typeOfDistance = emitFromFilter.typeDistance;
        const fitnutPonuky = emitFromFilter.ukazat;
        this.maxPrekrocenieRozmerov = maxPrekrocenieRozmerov;

        // setTimeout( () => {
        const poleSMinVzdialenostamiOdAdries = [];
        for (let i = 0; i < offers.length; i++) {
          const oneRouteOffer = offers[i];

          // }
          // offers.forEach((oneRouteOffer, indexOffer) => { // prechaedzam ponukami

          const adresyVPonuke: Address[] = [];
          const detailVPonuke: any[] = [];

          oneRouteOffer.addresses.forEach((addId, indexAdresa) => {
            const adresa: Address = this.adressesFromDatabase.find(oneAdd => oneAdd.id === addId);
            adresyVPonuke.push(adresa);

            const packageVPoradiPreAdresu: DeatilAboutAdresses[] = [];
            if (adresa) {
              adresa.packagesId.forEach(onePackageId => {
                let balik: DeatilAboutAdresses = this.packageService.getOnePackage(onePackageId);
                if (balik) {
                  balik.id = onePackageId;
                } else {
                  setTimeout(() => {
                    balik = this.packageService.getOnePackage(onePackageId);
                    if (balik) {
                      balik.id = onePackageId;
                    }
                  }, 700);
                }
                packageVPoradiPreAdresu.push(balik);
              });
            }

            detailVPonuke.push(packageVPoradiPreAdresu);
          });
          // tot si priradujem detail a maxVahu ponuky
          const detailArray = [];
          let prepravasDetailom;
          let maxVaha = 0;
          let sumVaha = 0;

          detailVPonuke.forEach((oneDetail, indexTown) => { // detailom a zistujem max vahu
            oneDetail.forEach((onePackage, indexPackage) => {
              if (onePackage) {
                if (adresyVPonuke[indexTown].type === 'nakladka') {
                  sumVaha += onePackage.weight;
                  if (sumVaha > maxVaha) {
                    maxVaha = sumVaha;
                  }
                } else {
                  sumVaha -= onePackage.weight;
                }
              }
            });
          });

          const myPromise = new Promise((resolve, reject) => {
            for (let j = 0; j < detailVPonuke.length; j++) {
              const oneAdressDetail = detailVPonuke[j];
              if (!oneAdressDetail) {
                setTimeout(() => {
                  this.openSnackBar(this.translation.instant('POPUPS.ponukySaNacitavaju'), 'Ok');
                  // this.offersUpdate(emitFromFilter);
                  return;
                }, 2000);
              }
              for (let k = 0; k < oneAdressDetail.length; k++) {
                const oneDetail = oneAdressDetail[k];
                if (!oneDetail) {
                  setTimeout(() => {
                    this.openSnackBar(this.translation.instant('POPUPS.ponukySaNacitavaju'), 'Ok');
                    // this.offersUpdate(emitFromFilter);
                    return;
                  }, 2000);
                }
                else if (k === oneAdressDetail.length - 1 && j === detailVPonuke.length - 1){
                  setTimeout(() => {
                    resolve();
                  }, 500);
                }
              }
            }
          });


          myPromise.then(value => {
            // console.log(offers.length)


            prepravasDetailom = {...oneRouteOffer, adresyVPonuke, maxVaha, detailVPonuke};
            if (prepravasDetailom.detailVPonuke[0]) {
              const ponukaPreMesta = this.countFreeSpaceService.vypocitajPocetPalietVPonuke(prepravasDetailom);
              const pocetTonVPonuke = this.countFreeSpaceService.pocetTonVKazdomMeste(ponukaPreMesta);
            }else{
            }

            // tu konci priradovanie detialov a max vah


            const jednaPonuka = {
              ...prepravasDetailom, minVzdialenost: 10000000000, maxVzdialenost: 0,
              flag: 0, zelenePrepravy: [], zltePrepravy: [], zeleneAuta: [], zlteAuta: []
            }; // 0 cervena, 1 zlta, 2 greeeen
            if ((oneRouteOffer.takenBy === '' && oneRouteOffer.createdBy !== this.dataService.getMyIdOrMaster()) ||
              (oneRouteOffer.takenBy === this.dataService.getMyIdOrMaster() &&
              oneRouteOffer.offerInRoute === '' && oneRouteOffer.createdBy !== this.dataService.getMyIdOrMaster())) {
              let zltePrepravy = [];
              let zelenePrepravy = [];


              this.carsWithItinerar.forEach((car, carIndex) => { // prechadzam autami
                const itinerarAutaPocetPalietVMeste = this.countFreeSpaceService.vypocitajPocetPalietVKazomMeste(car);
                const pocetTonVIti = this.countFreeSpaceService.pocetTonVKazdomMeste(itinerarAutaPocetPalietVMeste);
                const volnaVahaPreAutovIti = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, 1);
                const volnaVahaPreAutovItiSPrekrocenim = this.countFreeSpaceService.volnaVahaPreAutoVMeste(car, pocetTonVIti, maxPrekrocenieVahy);
                const vopchaSa = this.countFreeSpaceService.countFreeSpace(car, jednaPonuka, maxPrekrocenieRozmerov);



                let sediVaha = false;
                let sediVahaYellow = false;
                // @ts-ignore
                //  var vopchaSa = this.countFreeSpaceService.countFreeSpace(ca maxPrekrocenieRozmerov, oneRouteOffer);

                const adresaMinVzialenost = 100000000;
                const adresaMaxVzdialenost = 0;

                let maxVzdialenostOdCelehoItinerara;
                car.itiAdresy.forEach((route, indexLon) => { // prechadzam itinerarom auta

                  // vaha
                  if (volnaVahaPreAutovIti[indexLon] >= jednaPonuka.maxVaha) {
                    sediVaha = true;
                  } else { // @ts-ignore
                    if (volnaVahaPreAutovItiSPrekrocenim[indexLon] >= jednaPonuka.maxVaha) {
                      sediVahaYellow = true;
                    }
                  }

                  let routeStringBetweenAdresses;

                  if (car.itiAdresy.length > indexLon + 1) {
                    routeStringBetweenAdresses = new LineString([[
                      car.itiAdresy[indexLon].coordinatesOfTownsLon,
                      car.itiAdresy[indexLon].coordinatesOfTownsLat],
                      [car.itiAdresy[indexLon + 1].coordinatesOfTownsLon,
                        car.itiAdresy[indexLon + 1].coordinatesOfTownsLat]]);

                  } else {
                    routeStringBetweenAdresses = new LineString([[
                      car.itiAdresy[indexLon].coordinatesOfTownsLon,
                      car.itiAdresy[indexLon].coordinatesOfTownsLat],
                      [car.itiAdresy[indexLon].coordinatesOfTownsLon,
                        car.itiAdresy[indexLon].coordinatesOfTownsLat]]);
                  }

                  let adr = true;
                  let ruka = true;
                  let teplotnaSpec = true;
                  // tu si zistim maximalne vzdialenosti od itinerara pre vsetky adresy v ponuke...
                  if (indexLon === 0) {
                    maxVzdialenostOdCelehoItinerara = 0;
                    if (typeOfDistance === 'maxAll') { // ked hladam maximalnu vzdialenost vsetkych adriest
                      // tu si poskladam vlastnu cestu z itinerara
                      const poleKadePojdem = [];
                      // tu by som si mal na zaciatok pushnut poziciu auta
                      poleKadePojdem.push([car.longtitude, car.lattitude]);
                      car.itiAdresy.forEach(jednaAdresa => {
                        poleKadePojdem.push([jednaAdresa.coordinatesOfTownsLon, jednaAdresa.coordinatesOfTownsLat]);
                      });
                      const myItiString = new LineString(poleKadePojdem);


                      prepravasDetailom.adresyVPonuke.forEach((jednaAdPonuka, indexAd) => {
                        const vzdialenostOdTrasy = this.countClosesPoint(myItiString,
                          [jednaAdPonuka.coordinatesOfTownsLon,
                            jednaAdPonuka.coordinatesOfTownsLat]);

                        if (vzdialenostOdTrasy > maxVzdialenostOdCelehoItinerara) {
                          maxVzdialenostOdCelehoItinerara = vzdialenostOdTrasy;
                        }
                      });
                    } else { // ak hladam len max vzdialenost 1. adresy
                      const from = [car.longtitude, car.lattitude];
                      const to = [prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLon,
                        prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLat];
                      maxVzdialenostOdCelehoItinerara = this.countDistancePoints(from, to);
                    }
                  }

                  const vyskaHrany = this.countFreeSpaceService.checkMaxMinNaklHrana(prepravasDetailom.detailVPonuke);
                  const vyhodujeVyskaHrany = this.checkNaklHrana(car, vyskaHrany);

                  let poslednyIndexStihacky = this.dataService.najdiNajskorsiLastTimeArrival(prepravasDetailom.adresyVPonuke, car.itiAdresy, car);

                  if (poslednyIndexStihacky === null) {
                    poslednyIndexStihacky = 1000;
                  }
                  // tu si ulozim najvacsiu vzdialenost od mesta v itinerari
                  const maximalnaVzialenostOdMesta = 0;
                  let stihnemPrijst = true;

                  prepravasDetailom.adresyVPonuke.forEach((offerLat, offerLatIndex) => { // prechadzam miestami v ponuke
                    // tu by som si mal skontrolovat estimatedCasy prijazdov,  a ci stihnem vylozit poslednu vykladku z ponuky
                    if (offerLat.datumLastPrijazdy !== '0') {
                      const dateLast = (new Date(offerLat.datumLastPrijazdy));
                      if (offerLat.casLastPrijazdu !== '0') {
                        dateLast.setHours(offerLat.casLastPrijazdu.substring(0, 2), offerLat.casLastPrijazdu.substring(3, 5));
                      }
                      const dateEsti = (new Date(route.estimatedTimeArrival));
                      const from = [car.longtitude, car.lattitude];
                      const to = [offerLat.coordinatesOfTownsLon, offerLat.coordinatesOfTownsLat];
                      // od auta k adrese z ponuky
                      const vzdialenostOdAutaKAdrese = this.countDistancePoints(from, to) / 1000; // chcem to v km, preto / 1000
                      const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
                      const casPrichoduAuta = new Date();
                      casPrichoduAuta.setHours(casPrichoduAuta.getHours() + casOdAutaKAdrese);
                      const rozdielVMili = dateLast.getTime() - casPrichoduAuta.getTime(); // tu mam ulozeny rozdiel v case mezdi last a esti
                      if (rozdielVMili < 0) { // tu kontrolujem ci stihe auto prijst do vsetkych bodov v ponuke
                        stihnemPrijst = false;
                      }

                    }

                    // tu si kontrolujem abs ruku a teplotu
                    if (offerLat.ruka && !car.ruka) {
                      ruka = false;
                    }
                    if (offerLat.adr && !car.adr) {
                      adr = false;
                    }
                    if (offerLat.teplota && (car.minTeplota >= offerLat.teplota ||
                      car.maxTeplota <= offerLat.teplota)) {
                      teplotnaSpec = false;
                    }
                    if (!car.minTeplota && offerLat.teplota) {
                      teplotnaSpec = false;
                    }


                    // tu davam flagy - ak je vzdialenost mensia vacsia - taku davam flagu
                    // ked som na konci skontrulujem ci sedi vzdialenost
                    if (offerLatIndex === oneRouteOffer.addresses.length - 1 && ruka && adr && teplotnaSpec && stihnemPrijst) {
                      const vopchasaCezOtvory = this.countFreeSpaceService.ciSaVopchaTovarCezNakladaciPriestor(car, prepravasDetailom.detailVPonuke);
                      if (vopchasaCezOtvory && vyhodujeVyskaHrany) {

                        let flags = 0;

                        if (car.minTeplota <= teplotnaSpec && car.maxTeplota >= teplotnaSpec) {

                        }

                        const indexVPoli = vopchaSa.poleMiestKdeSaVopcha.indexOf(indexLon); // ci do mesta vopcha
                        const prekrocil = vopchaSa.prekrocenieOPercenta[indexVPoli]; // ak false vopcha, ak true tak sa vopcha
                        // o uzivatelom definove % - yellow

                        if (indexLon <= poslednyIndexStihacky && sediVaha && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                          maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil) {
                          flags = 3;
                          zelenePrepravy.push({...car, vopchaSa});
                        } else if (indexLon <= poslednyIndexStihacky && sediVaha && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId == indexLon) &&
                          maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil) {
                          flags = 2;
                          zltePrepravy.push({...car, vopchaSa});
                        } else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha
                            .find(oneId => oneId === indexLon) &&
                          maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil && indexLon <= poslednyIndexStihacky) {
                          flags = 2;
                          zltePrepravy.push({...car, vopchaSa});
                        } else if ((sediVahaYellow && !sediVaha) && indexLon === vopchaSa.poleMiestKdeSaVopcha.find(oneId => oneId === indexLon) &&
                          maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil && indexLon <= poslednyIndexStihacky) {
                          flags = 2;
                          zltePrepravy.push({...car, vopchaSa});
                        }
                        if (flags > jednaPonuka.flag) {
                          jednaPonuka.flag = flags;
                        }
                      }
                    }
                  });

                });
                // pre auta ktore maju prazdy itinerar
                if (car.itiAdresy.length === 0) {
                  let adr = true;
                  let ruka = true;
                  let teplotnaSpec = true;


                  const vyskaHrany = this.countFreeSpaceService.checkMaxMinNaklHrana(prepravasDetailom.detailVPonuke);
                  const vyhodujeVyskaHrany = this.checkNaklHrana(car, vyskaHrany);

                  let poslednyIndexStihacky = this.dataService.najdiNajskorsiLastTimeArrival(prepravasDetailom.adresyVPonuke, car.itiAdresy, car);
                  let stihnemPrijst = true;
                  if (poslednyIndexStihacky === null) {
                    poslednyIndexStihacky = 1000;
                  }


                  const poleKadePojdem = [];
                  // vaha
                  if (volnaVahaPreAutovIti[0] >= jednaPonuka.maxVaha) {
                    sediVaha = true;
                  } else { // @ts-ignore
                    if (volnaVahaPreAutovItiSPrekrocenim[0] >= jednaPonuka.maxVaha) {
                      sediVahaYellow = true;
                    }
                  }
                  if (typeOfDistance === 'maxAll') { // ked hladam maximalnu vzdialenost vsetkych adriest
                    // tu by som si mal na zaciatok pushnut poziciu auta
                    poleKadePojdem.push([car.longtitude, car.lattitude]);
                    poleKadePojdem.push([car.longtitude, car.lattitude]);

                    const myItiString = new LineString(poleKadePojdem);

                    maxVzdialenostOdCelehoItinerara = 0;
                    prepravasDetailom.adresyVPonuke.forEach((jednaAdPonuka, indexAd) => {
                      if (jednaAdPonuka.datumLastPrijazdy !== '0') {
                        const dateLast = (new Date(jednaAdPonuka.datumLastPrijazdy));
                        if (jednaAdPonuka.casLastPrijazdu !== '0') {
                          dateLast.setHours(jednaAdPonuka.casLastPrijazdu.substring(0, 2), jednaAdPonuka.casLastPrijazdu.substring(3, 5));
                        }
                        const dateEsti = (new Date(jednaAdPonuka.estimatedTimeArrival));
                        const from = [car.longtitude, car.lattitude];
                        const to = [jednaAdPonuka.coordinatesOfTownsLon, jednaAdPonuka.coordinatesOfTownsLat];
                        // od auta k adrese z ponuky
                        const vzdialenostOdAutaKAdrese = this.countDistancePoints(from, to) / 1000; // chcem to v km, preto / 1000
                        const casOdAutaKAdrese = vzdialenostOdAutaKAdrese / 90; // 90 je max rychlost kamionu
                        const casPrichoduAuta = new Date();
                        casPrichoduAuta.setHours(casPrichoduAuta.getHours() + casOdAutaKAdrese);
                        const rozdielVMili = dateLast.getTime() - casPrichoduAuta.getTime(); // tu mam ulozeny rozdiel v case mezdi last a esti
                        if (rozdielVMili < 0) { // tu kontrolujem ci stihe auto prijst do vsetkych bodov v ponuke
                          stihnemPrijst = false;
                        }

                      }
                      // tu si kontrolujem abs ruku a teplotu
                      if (jednaAdPonuka.ruka && !car.ruka) {
                        ruka = false;
                      }
                      if (jednaAdPonuka.adr && !car.adr) {
                        adr = false;
                      }
                      if (jednaAdPonuka.teplota && (car.minTeplota >= jednaAdPonuka.teplota ||
                        car.maxTeplota <= jednaAdPonuka.teplota)) {
                        teplotnaSpec = false;
                      }
                      if (!car.minTeplota && jednaAdPonuka.teplota) {
                        teplotnaSpec = false;
                      }

                      const vzdialenostOdTrasy = this.countClosesPoint(myItiString,
                        [jednaAdPonuka.coordinatesOfTownsLon,
                          jednaAdPonuka.coordinatesOfTownsLat]);

                      if (vzdialenostOdTrasy > maxVzdialenostOdCelehoItinerara) {
                        maxVzdialenostOdCelehoItinerara = vzdialenostOdTrasy;
                      }
                    });
                  } else { // ak hladam len max vzdialenost 1. adresy
                    const from = [car.longtitude, car.lattitude];
                    const to = [prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLon,
                      prepravasDetailom.adresyVPonuke[0].coordinatesOfTownsLat];
                    maxVzdialenostOdCelehoItinerara = this.countDistancePoints(from, to);
                  }

                  const prekrocil = vopchaSa.prekrocenieOPercenta[0];
                  const vopchasaCezOtvory = this.countFreeSpaceService.ciSaVopchaTovarCezNakladaciPriestor(car, prepravasDetailom.detailVPonuke);

                  if (ruka && adr && teplotnaSpec && stihnemPrijst && vopchasaCezOtvory && vyhodujeVyskaHrany) {


                    if (sediVaha && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                      maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil) {
                      zelenePrepravy.push({...car, vopchaSa});
                      jednaPonuka.flag = 3;
                    } else if (sediVaha && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                      maxVzdialenostOdCelehoItinerara < maxVzdialenost && prekrocil) {
                      zltePrepravy.push({...car, vopchaSa});
                      jednaPonuka.flag = 2;
                    } else if ((sediVahaYellow && !sediVaha) && vopchaSa.poleMiestKdeSaVopcha.length > 0 &&
                      maxVzdialenostOdCelehoItinerara < maxVzdialenost && !prekrocil) {
                      zltePrepravy.push({...car, vopchaSa});
                      jednaPonuka.flag = 2;
                    }
                  }
                }

                zltePrepravy = zltePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
                zelenePrepravy = zelenePrepravy.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

                zelenePrepravy = zelenePrepravy.filter(({id: id1}) => !zltePrepravy.some(({id: id2}) => id2 === id1));
                jednaPonuka.zelenePrepravy = zelenePrepravy;
                jednaPonuka.zltePrepravy = zltePrepravy;
                if (this.carsWithItinerar.length - 1 === carIndex) {
                  poleSMinVzdialenostamiOdAdries.push(jednaPonuka);
                }

              });

            }
            if (i === offers.length - 1){
              resolve(poleSMinVzdialenostamiOdAdries);
            }
            // this.offersFromDatabase = poleSMinVzdialenostamiOdAdries;
            // this.drawOffers(poleSMinVzdialenostamiOdAdries, fitnutPonuky);
            // console.log(poleSMinVzdialenostamiOdAdries);
          });

        }
        // return poleSMinVzdialenostamiOdAdries;

        // setTimeout( () => {

        // }, 500 );
        // }, 500 );
      }
    });

    }

  countClosesPoint(routeString, lonLatMy){
    let closesPoint;
    for (let i = 0; i < 21; i++) {
      const coordinateOfNajblizsiBod = routeString.getCoordinateAt(0.05 * i);
      // var lonlat = transform(coordinateOfNajblizsiBod, 'EPSG:3857', 'EPSG:4326');
      const vzdialenost = this.countDistancePoints(coordinateOfNajblizsiBod, lonLatMy);
      if (!closesPoint) {
        closesPoint = vzdialenost;
      } else if (closesPoint > vzdialenost) {
        closesPoint = vzdialenost;
      }
    }
    return closesPoint;
  }

  // hodim lat lon od do a vrati mi dlzku v metroch
  countDistancePoints(from, to){
    const distance = getDistance(from, to);
    return distance;
  }

  // skontroluj ci sedi nakl hrana pre auto
  checkNaklHrana(car: Cars, vyskaNaklHrany){
    if (vyskaNaklHrany && vyskaNaklHrany.maxVyska > -1){
      const carMin = car.nakladaciaHrana[0];
      const carMax = car.nakladaciaHrana[1];
      if (carMax){
        if (vyskaNaklHrany.maxVyska <= carMax && vyskaNaklHrany.minVyska >= carMin){
          return true;
        }else{
          return false;
        }
      }else{
        if (vyskaNaklHrany.maxVyska <= carMin && vyskaNaklHrany.minVyska >= carMin){
          return true;
        }else{
          return false;
        }
      }
    }else{
      return true;
    }
  }

  openSnackBar(message: string, action: string) {
    if (!this.snackBarIsOpen){
      this.snackBarIsOpen = true;
      const snackBarRef = this._snackBar.open(message, action, {
        duration: 6000
      });
      snackBarRef.afterDismissed().subscribe(info => {
        this.snackBarIsOpen = false;
      });
    }
  }

  getCarWithIti(oneCar: Cars){
    if (oneCar.itinerar) {
      const itinerarAuta: Address[] = [];
      const detailAuta: any[] = [];
      oneCar.itinerar.forEach(addId => {
        const detailVMeste = [];
        const vsetkyAdresy = this.addressesService.getAddresses().concat(this.addressesService.getAddressesFromOffer());
        const oneAdd = vsetkyAdresy.find(oneAddress => oneAddress.id === addId);
        if (oneAdd) {
          if (itinerarAuta.find(oneIti => oneIti.id === oneAdd.id)) { // hladam duplikat
            const indexAdresy = itinerarAuta.findIndex(oneIti => oneIti.id === oneAdd.id);
            itinerarAuta[indexAdresy] = oneAdd;
          } else {
            itinerarAuta.push(oneAdd);
          }
          const allPackages = this.packageService.getAllPackages().concat(this.packageService.getAllOfferPackages());
          oneAdd.packagesId.forEach(onePackId => {
            const balik = allPackages.find(onePackage => onePackage.id === onePackId);
            detailVMeste.push(balik);
            if (!balik){
              // mamVsetkyBaliky = false;
            }
          });
        }

        detailAuta.push(detailVMeste);
      });
      return {...oneCar, itiAdresy: itinerarAuta, detailIti: detailAuta};
    }
  }

  getRouteWithEverything(route: Route){
    const detail = [];
    let allAddresses: Address[] = this.addressesService.addressesGet.concat(this.addressesService.addressesOfferGet);
    allAddresses.filter(allAddressess => route.addresses.includes(allAddressess.id));
    allAddresses = route.addresses.map((i) => allAddresses.find((j) => j.id === i)); // ukladam ich do poradia
    const myPackages = [];
    const detailAr = {detailArray: [], townsArray: [], packageId: []};
    allAddresses.forEach(oneAddress => {
      oneAddress.packagesId.forEach( oneId => {
        if (oneAddress.type === 'nakladka'){
          const balik = this.packageService.getOnePackage(oneId);
          myPackages.push(balik);
        }else{
          // tu by som mal vlozit len indexy do vykladky
          detail.forEach((oneDetail, townId) => {
            if (oneDetail.townsArray === undefined){
              oneDetail.forEach((oneDetailId, packageId) => {
                if (oneDetailId && oneDetailId.id === oneId){
                  detailAr.detailArray.push(packageId);
                  detailAr.townsArray.push(townId);
                  detailAr.packageId.push(oneDetailId.id);
                }
              });
            }
          });
        }
      });
      if (myPackages.length !== 0){
        detail.push(myPackages);
      }else{
        detail.push(detailAr);
      }
    });
    const routeToDetail = {
      route,
      adresyVPonuke: allAddresses,
      detailVPonuke: detail
    };
    return routeToDetail;
  }

}

import { Injectable } from '@angular/core';
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";
import Cars from "../models/Cars";
import {CarService} from "../services/car.service";
import Route from "../models/Route";
import {PackageService} from '../services/package.service';
import {PrivesService} from '../services/prives.service';
import Prives from '../models/Prives';

@Injectable({
  providedIn: 'root'
})
export class CountFreeSpaceService {
  sizesS = [];
  sizesD = [];
  sizesV = [];
  weight = [];
  stohovatelnost = [];
  prives: Prives;
  constructor(private carService: CarService, private packageService: PackageService, private privesService: PrivesService) { }

  // vratim index miest kde sa dana preprava vopcha
  countFreeSpace(oneCar: Cars, offer, prekrocenie){
   var nalozenievMestach = this.vypocitajPocetPalietVKazomMeste(oneCar);
   if (oneCar.naves){
     this.prives = this.privesService.allPrives.find(onePrives => oneCar.navesis.includes(onePrives.id));
   }else{
     this.prives = new Prives();
     this.prives.sizePriestoru = [0, 0, 0];
   }

    var poleMiestKdeSaVopcha = [];
    var prekrocenieOPercenta = [];


    // if (newDetail != null && offer != null)
    var nalozenieVPonuke = this.vypocitajPocetPalietVPonuke(offer);

    //pre kazme mesto osobitne pocitam ci sa votka
    nalozenievMestach.forEach((oneNalozenie, indexMesicka) => {


    this.sizesS = oneNalozenie.sizeS;
    this.sizesD = oneNalozenie.sizeD;
    this.sizesV = oneNalozenie.sizeV;
    this.weight = oneNalozenie.weight;
    this.stohovatelnost = oneNalozenie.stohovatelnost


      var vaha = JSON.parse(JSON.stringify(this.weight));
    var sizeS = JSON.parse(JSON.stringify(this.sizesS));
    var sizeV = JSON.parse(JSON.stringify(this.sizesV));
    var sizeD = JSON.parse(JSON.stringify(this.sizesD));
    var stohovatelnost = JSON.parse(JSON.stringify(this.stohovatelnost));


      var vopchaSaDoMesta = 0;
    // if (newDetail != null){


    nalozenieVPonuke.forEach(jednoNalozenie => {
      if (jednoNalozenie){

        this.weight = jednoNalozenie.weight.concat(vaha);
        this.sizesS = jednoNalozenie.sizeS.concat(sizeS);
        this.sizesD = jednoNalozenie.sizeD.concat(sizeD);
        this.sizesV = jednoNalozenie.sizeV.concat(sizeV);
        this.stohovatelnost = jednoNalozenie.stohovatelnost.concat(stohovatelnost);
      }else{
        this.weight = vaha;
        this.sizesS = sizeS;
        this.sizesD = sizeD;
        this.sizesV = sizeV;
        this.stohovatelnost = stohovatelnost;
      }


      this.prejdiPaletyaUlozIch(oneCar);
      if (oneCar.naves && this.prives){
        this.prejdiPaletyaUlozIchVNavese(this.prives);
      }

      let maxVyska;
      let maxSirka;
      if (this.sizesS.length > 0){
        maxVyska = Math.max( ...this.sizesV);
        maxSirka = Math.max( ...this.sizesS);
      }else{
        maxVyska = 0;
        maxSirka = 0;
      }

      if (oneCar.naves){
        this.prives = this.privesService.allPrives.find(onePrives => oneCar.navesis.includes(onePrives.id));
      }else{
        this.prives = new Prives();
        this.prives.sizePriestoru = [0, 0, 0];
      }
      if (!this.prives){
        this.prives = new Prives();
        this.prives.sizePriestoru = [0, 0, 0];
      }

        // final kontrola ci sa mi veci z pola vopchaju do autiska
        var dlzka = 0; // dlzka preto lebo zvysok kontrolujem na vysku/sirku..
        this.sizesD.forEach(jednaDlzka => {
          dlzka += jednaDlzka;
        });
        if (vopchaSaDoMesta !== -1 && vopchaSaDoMesta !== 2 && dlzka <= (oneCar.sizePriestoru[2] + this.prives.sizePriestoru[2]) && maxVyska <= (oneCar.sizePriestoru[0] || this.prives.sizePriestoru[0]) && maxSirka <= (oneCar.sizePriestoru[1] || this.prives.sizePriestoru[1])){
          vopchaSaDoMesta = 1;
        }else if (dlzka <= ((oneCar.sizePriestoru[2] + this.prives.sizePriestoru[2]) * prekrocenie) && vopchaSaDoMesta !== -1 && maxVyska <= (oneCar.sizePriestoru[0] * prekrocenie || this.prives.sizePriestoru[0] * prekrocenie) && maxSirka <= (oneCar.sizePriestoru[1] * prekrocenie || this.prives.sizePriestoru[1] * prekrocenie)){
          vopchaSaDoMesta = 2;
          }else{
          vopchaSaDoMesta = -1;
        }

      // if (vopchaSaDoMesta !== -1 && vopchaSaDoMesta !== 2 && dlzka <= oneCar.sizePriestoru[2] && maxVyska <= oneCar.sizePriestoru[0] && maxSirka <= oneCar.sizePriestoru[1]){
      //   vopchaSaDoMesta = 1;
      // }else if (dlzka <= (oneCar.sizePriestoru[2] * prekrocenie) && vopchaSaDoMesta !== -1 && maxVyska <= (oneCar.sizePriestoru[0] * prekrocenie) && maxSirka <= (oneCar.sizePriestoru[1] * prekrocenie)){
      //   vopchaSaDoMesta = 2;
      // }else{
      //   vopchaSaDoMesta = -1;
      // }

      });


      if (vopchaSaDoMesta === 1){
        poleMiestKdeSaVopcha.push(indexMesicka);
        prekrocenieOPercenta.push(false);
      }else if (vopchaSaDoMesta === 2){
        poleMiestKdeSaVopcha.push(indexMesicka);
        prekrocenieOPercenta.push(true);
      }
    });
   return {poleMiestKdeSaVopcha, prekrocenieOPercenta};
  }

  // pocitam si v ktorom meste sa toho kolko nachadza
  vypocitajPocetPalietVKazomMeste(auto){
    var poleKsPalietPreKazduAdresu = [];
    var allpackages;
    var allpackagesOffer;
    var allTogether = [];

    // dorobeny aktualny naklad, treba majk check
    if (auto.aktualnyNaklad && auto.aktualnyNaklad.length > 0){
      var oneAdress = {
        sizeS: [],
        sizeD: [],
        sizeV: [],
        weight: [],
        stohovatelnost: [],
        id: []
      };

      allpackages =  this.packageService.getAllPackages();
      allpackages = allpackages.filter(onePackage =>
        auto.aktualnyNaklad.includes(onePackage.id));

      allpackagesOffer =  this.packageService.getAllOfferPackages();
      allpackagesOffer = allpackagesOffer.filter(onePackage =>
        auto.aktualnyNaklad.includes(onePackage.id));
      allTogether = allpackages.concat(allpackagesOffer);
      allTogether.forEach(oneZAuta => {
        oneAdress.sizeS.push(oneZAuta.sizeS);
        oneAdress.sizeD.push(oneZAuta.sizeD);
        oneAdress.sizeV.push(oneZAuta.sizeV);
        oneAdress.weight.push(oneZAuta.weight);
        oneAdress.stohovatelnost.push(oneZAuta.stohovatelnost);
        oneAdress.id.push(oneZAuta.id);
      });
      poleKsPalietPreKazduAdresu.push(oneAdress);

    }


    auto.detailIti.forEach((oneDetail, index) => {
      var oneAdress = {
        sizeS: [],
        sizeD: [],
        sizeV: [],
        weight: [],
        stohovatelnost: [],
        id: []
      }


      if (!auto.itiAdresy[index] || auto.itiAdresy[index].type == undefined || !oneDetail[0]){
        return;
      }
      if (auto.itiAdresy[index].type == 'nakladka'){ //pri nakladke prikladam palety
        if (poleKsPalietPreKazduAdresu.length -1 >= 0) {
          var lastVeci = JSON.parse(JSON.stringify(poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length - 1]));
          oneAdress = lastVeci;
        }
        oneDetail.forEach(jedenPackage => {
          if (jedenPackage){
            oneAdress.sizeS.push(jedenPackage.sizeS);
            oneAdress.sizeD.push(jedenPackage.sizeD);
            oneAdress.sizeV.push(jedenPackage.sizeV);
            oneAdress.weight.push(jedenPackage.weight);
            oneAdress.stohovatelnost.push(jedenPackage.stohovatelnost);
            oneAdress.id.push(jedenPackage.id);
          }
        });
        poleKsPalietPreKazduAdresu.push(oneAdress);
      }else{ // tu sa snazim odsranit veci kedze je vykladka
        if (poleKsPalietPreKazduAdresu.length > 0){
        var lastVeci = JSON.parse(JSON.stringify(poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length -1]));
        oneDetail.forEach((oneSize, indexSize) => {
          for (var i =0; i < lastVeci.sizeS.length; i++){
            if (lastVeci.id[i] == oneDetail[indexSize].id) // ked najdem paletu z nakladky
              {
                  lastVeci.sizeS.splice(i, 1); // tu to musim nejak osetrit aby nevymazalo viacero tych istch paliet
                  lastVeci.sizeD.splice(i, 1);
                   lastVeci.sizeV.splice(i, 1);
                   lastVeci.weight.splice(i, 1);
                   lastVeci.stohovatelnost.splice(i, 1);
                   lastVeci.id.splice(i,1);
            }
          }
        });
        poleKsPalietPreKazduAdresu.push(lastVeci);
        }
      }

    });
    if (poleKsPalietPreKazduAdresu.length === 0){
      const oneAdress = {
        sizeS: [0],
        sizeD: [0],
        sizeV: [0],
        weight: [0],
        stohovatelnost: [0],
        id: [0]
      };
      poleKsPalietPreKazduAdresu.push(oneAdress);
    }
    // aktualny naklad... a to nie je mesto preto to rusim
    if (allTogether.length > 0){
      poleKsPalietPreKazduAdresu.splice(0, 1);
    }
    return poleKsPalietPreKazduAdresu;
  }

  vypocitajPocetPalietVPonuke(offer){
    if (!offer.detailVPonuke || !offer.detailVPonuke[0]){
      return [undefined];
    }
    var poleKsPalietPreKazduAdresu = [];
    offer.detailVPonuke.forEach((oneDetail, index) => {
      var oneAdress = {
        sizeS: [],
        sizeD: [],
        sizeV: [],
        weight: [],
        stohovatelnost: [],
        id: []
      }


      if (offer.adresyVPonuke[index].type == 'nakladka'){ // pri nakladke prikladam palety
        if (poleKsPalietPreKazduAdresu.length -1 >= 0) {
          var lastVeci = JSON.parse(JSON.stringify(poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length - 1]));
          oneAdress = lastVeci;
        }
        oneDetail.forEach(jedenPackage => {
          oneAdress.sizeS.push(jedenPackage.sizeS);
          oneAdress.sizeD.push(jedenPackage.sizeD);
          oneAdress.sizeV.push(jedenPackage.sizeV);
          oneAdress.weight.push(jedenPackage.weight);
          oneAdress.stohovatelnost.push(jedenPackage.stohovatelnost);
          oneAdress.id.push(jedenPackage.id);
        });
        poleKsPalietPreKazduAdresu.push(oneAdress);
      }else{ // tu sa snazim odsranit veci kedze je vykladka
        if (poleKsPalietPreKazduAdresu.length - 1 >= 0 && poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length - 1]){
          var lastVeci = JSON.parse(JSON.stringify(poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length -1]));
          oneDetail.forEach((oneSize, indexSize) => {
            for (var i =0; i < lastVeci.sizeS.length; i++){
              if (lastVeci.id[i] == oneDetail[indexSize].id) // ked najdem paletu z nakladky
              {
                lastVeci.sizeS.splice(i, 1); // tu to musim nejak osetrit aby nevymazalo viacero tych istch paliet
                lastVeci.sizeD.splice(i, 1);
                lastVeci.sizeV.splice(i, 1);
                lastVeci.weight.splice(i, 1);
                lastVeci.stohovatelnost.splice(i, 1);
                lastVeci.id.splice(i, 1);
              }
            }
          });

        }
        poleKsPalietPreKazduAdresu.push(lastVeci);
      }

    });
    return poleKsPalietPreKazduAdresu;
  }

  // vahaVKazdomMeste(mesta){
  //   mesta.forEach()
  // }

  odstraneniePalety(index){
    this.sizesV.splice(index, 1);
    this.sizesD.splice(index, 1);
    this.sizesS.splice(index, 1);
    this.stohovatelnost.splice(index, 1);
    this.weight.splice(index, 1);
  }

  prejdiPaletyaUlozIch(car){
    for (var i = 0; i < this.sizesS.length; i++) {
      //ak neni stohovatelne, skusim najst paletu na ktoru to moyem polozit
      if (this.stohovatelnost[i] == 0) {
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
        let maxSirka = 0;
        for (var j = 0; j < this.sizesS.length; j++) { // skontrolujem od zaciatku vsetky stohovatelne palety
          if (i != j) {
            if (this.stohovatelnost[j] >= this.weight[i] && (this.sizesS[i] <= car.sizePriestoru[1] || this.sizesD[i] <= car.sizePriestoru[1]) &&
              (this.sizesV[i] + this.sizesV[j] <= car.sizePriestoru[0])) { // ak najdem paletu na ktoru to mozem polozit,
              if (maxVahaKtoruUlozim == undefined) { //1. stohovatelna paleta
                indexPaletyNaKtoruToUlozim = j;
                maxVahaKtoruUlozim = this.stohovatelnost[j];
              } else if (maxVahaKtoruUlozim > this.stohovatelnost[j]) { // ak ma dalsia paleta nizsiu stohovatelnost, ulzim ju tam
                indexPaletyNaKtoruToUlozim = j;
                maxVahaKtoruUlozim = this.stohovatelnost[j]
              }
            } else if (this.sizesS[i] + this.sizesS[j] <= car.sizePriestoru[1]) {
              if (this.sizesS[i] + this.sizesS[j] > maxSirka){
                maxSirka = this.sizesS[i] + this.sizesS[j];
                indexPaletyNaSirku = j;
              }
            }
          }
        }
        //ked skonci for a nasiel som paletu na ktoru to mozem polozit
        if (indexPaletyNaKtoruToUlozim != -1){
          if (this.sizesS[indexPaletyNaKtoruToUlozim] > this.sizesS[i]) { // ak je paleta na ktoru to ulozim sirsia...
            this.sizesS[i] = this.sizesS[indexPaletyNaKtoruToUlozim];
          }
          if (this.sizesD[indexPaletyNaKtoruToUlozim] > this.sizesD[i]) { // ak je paleta na ktoru to ulozim dlhsia...
            this.sizesD[i] = this.sizesD[indexPaletyNaKtoruToUlozim];
          }
          this.stohovatelnost[i] = 0;
          this.weight[i] += this.weight[j];
          this.sizesV[i] += this.sizesV[indexPaletyNaKtoruToUlozim]; //vyska paleta 1 + 2
          this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
        }else if (indexPaletyNaSirku != -1){ // ked som nasiel paletu ktoru mozem ulozit vedla
          this.sizesS[i] +=this.sizesS[indexPaletyNaSirku];
          if (this.sizesV[i] < this.sizesV[indexPaletyNaSirku]){
            this.sizesV[i] = this.sizesV[indexPaletyNaSirku];
          }
          if (this.sizesD[i] < this.sizesD[indexPaletyNaSirku]){
            this.sizesD[i] = this.sizesD[indexPaletyNaSirku];
            //tu dakte by som si mal ulozit volny priestor co mi ostal
            this.odstraneniePalety(indexPaletyNaSirku);
          }
        }
      }else{ // ked na tovar mozem nieco polozit
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
        var maxVahaStohoPalety;
        var indexStohoPalety = -1;
        for (var j = 0; j < this.sizesS.length; j++){ // skontrolujem od zaciatku vsetky nestoho palety
          if (this.stohovatelnost[j] == 0 && (this.sizesS[i] <= car.sizePriestoru[1] || this.sizesD[i] <= car.sizePriestoru[1]) &&
            ((this.sizesV[i] + this.sizesV[j]) <= car.sizePriestoru[0]) && this.weight[i] <= this.stohovatelnost[j]){ // ak najdem paletu na ktoru to mozem polozit,
            if (maxVahaKtoruUlozim == undefined){ //1. stohovatelna paleta
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j];
            }else if (maxVahaKtoruUlozim < this.stohovatelnost[j]){ // ak ma dalsia paleta vacsiu vahu, ulzim ju tam
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j]
            }
          }else if ((this.sizesS[i] + this.sizesS[j]) <= car.sizePriestoru[1]){ // mozem ulozit vedla
            indexPaletyNaSirku = j;
          }else if (this.weight[i] < this.stohovatelnost[j]){ //mozem polozit stoho na stoho
            if (maxVahaStohoPalety == undefined){
              maxVahaStohoPalety = this.weight[j];
              indexStohoPalety = j;
            }
            else if (maxVahaStohoPalety < this.weight[j]){
              maxVahaStohoPalety = this.weight[j];
              indexStohoPalety = j;
            }
          }
        }
        //ked skonci for a nasiel som paletu na ktoru to mozem polozit
        if (indexPaletyNaKtoruToUlozim != -1){
          if (this.sizesS[indexPaletyNaKtoruToUlozim] > this.sizesS[i]) { // ak je paleta na ktoru to ulozim sirsia...
            this.sizesS[i] = this.sizesS[indexPaletyNaKtoruToUlozim];
          }
          if (this.sizesD[indexPaletyNaKtoruToUlozim] > this.sizesD[i]) { // ak je paleta na ktoru to ulozim dlhsia...
            this.sizesD[i] = this.sizesD[indexPaletyNaKtoruToUlozim];
          }
          this.stohovatelnost[i] = 0;
          this.weight[i] += this.weight[j];
          this.sizesV[i] += this.sizesV[indexPaletyNaKtoruToUlozim]; //vyska paleta 1 + 2
          this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
        }else if (indexPaletyNaSirku != -1){ // ked som nasiel paletu ktoru mozem ulozit vedla
          this.sizesS[i] +=this.sizesS[indexPaletyNaSirku];
          if (this.sizesV[i] < this.sizesV[indexPaletyNaSirku]){
            this.sizesV[i] = this.sizesV[indexPaletyNaSirku];
          }
          if (this.sizesD[i] < this.sizesD[indexPaletyNaSirku]){
            this.sizesD[i] = this.sizesD[indexPaletyNaSirku];
            this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
            //tu dakte by som si mal ulozit volny priestor co mi ostal
          }
        }else if (indexStohoPalety != -1){ // ked mozem polozit stoho paletu na stoho paletu
          this.sizesV[i] += this.sizesV[indexStohoPalety];
          if (this.sizesS[i] < this.sizesS[indexStohoPalety]){
            this.sizesS[i] = this.sizesS[indexStohoPalety];
          }
          if (this.sizesD[i] < this.sizesD[indexStohoPalety]){
            this.sizesD[i] = this.sizesD[indexStohoPalety];
          }
          this.weight[i] += this.weight[indexStohoPalety];
          this.stohovatelnost[i] -= this.weight[indexStohoPalety];
          if (this.stohovatelnost[indexStohoPalety] < this.stohovatelnost[i]){
            this.stohovatelnost[i] = this.stohovatelnost[indexStohoPalety];
          }
          this.odstraneniePalety(indexStohoPalety);
        }
      }
    }
  }

  prejdiPaletyaUlozIchVNavese(naves: Prives){
    for (var i = 0; i < this.sizesS.length; i++) {
      //ak neni stohovatelne, skusim najst paletu na ktoru to moyem polozit
      if (this.stohovatelnost[i] == 0) {
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
        let maxSirka = 0;
        for (var j = 0; j < this.sizesS.length; j++) { // skontrolujem od zaciatku vsetky stohovatelne palety
          if (i != j) {
            if (this.stohovatelnost[j] >= this.weight[i] && (this.sizesS[i] <= naves.sizePriestoru[1] || this.sizesD[i] <= naves.sizePriestoru[1]) &&
              (this.sizesV[i] + this.sizesV[j] <= naves.sizePriestoru[0])) { // ak najdem paletu na ktoru to mozem polozit,
              if (maxVahaKtoruUlozim == undefined) { //1. stohovatelna paleta
                indexPaletyNaKtoruToUlozim = j;
                maxVahaKtoruUlozim = this.stohovatelnost[j];
              } else if (maxVahaKtoruUlozim > this.stohovatelnost[j]) { // ak ma dalsia paleta nizsiu stohovatelnost, ulzim ju tam
                indexPaletyNaKtoruToUlozim = j;
                maxVahaKtoruUlozim = this.stohovatelnost[j]
              }
            } else if (this.sizesS[i] + this.sizesS[j] <= naves.sizePriestoru[1]) {
              if (this.sizesS[i] + this.sizesS[j] > maxSirka){
                maxSirka = this.sizesS[i] + this.sizesS[j];
                indexPaletyNaSirku = j;
              }
            }
          }
        }
        //ked skonci for a nasiel som paletu na ktoru to mozem polozit
        if (indexPaletyNaKtoruToUlozim != -1){
          if (this.sizesS[indexPaletyNaKtoruToUlozim] > this.sizesS[i]) { // ak je paleta na ktoru to ulozim sirsia...
            this.sizesS[i] = this.sizesS[indexPaletyNaKtoruToUlozim];
          }
          if (this.sizesD[indexPaletyNaKtoruToUlozim] > this.sizesD[i]) { // ak je paleta na ktoru to ulozim dlhsia...
            this.sizesD[i] = this.sizesD[indexPaletyNaKtoruToUlozim];
          }
          this.stohovatelnost[i] = 0;
          this.weight[i] += this.weight[j];
          this.sizesV[i] += this.sizesV[indexPaletyNaKtoruToUlozim]; //vyska paleta 1 + 2
          this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
        }else if (indexPaletyNaSirku != -1){ // ked som nasiel paletu ktoru mozem ulozit vedla
          this.sizesS[i] +=this.sizesS[indexPaletyNaSirku];
          if (this.sizesV[i] < this.sizesV[indexPaletyNaSirku]){
            this.sizesV[i] = this.sizesV[indexPaletyNaSirku];
          }
          if (this.sizesD[i] < this.sizesD[indexPaletyNaSirku]){
            this.sizesD[i] = this.sizesD[indexPaletyNaSirku];
            //tu dakte by som si mal ulozit volny priestor co mi ostal
            this.odstraneniePalety(indexPaletyNaSirku);
          }
        }
      }else{ // ked na tovar mozem nieco polozit
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
        var maxVahaStohoPalety;
        var indexStohoPalety = -1;
        for (var j = 0; j < this.sizesS.length; j++){ // skontrolujem od zaciatku vsetky nestoho palety
          if (this.stohovatelnost[j] == 0 && (this.sizesS[i] <= naves.sizePriestoru[1] || this.sizesD[i] <= naves.sizePriestoru[1]) &&
            ((this.sizesV[i] + this.sizesV[j]) <= naves.sizePriestoru[0]) && this.weight[i] <= this.stohovatelnost[j]){ // ak najdem paletu na ktoru to mozem polozit,
            if (maxVahaKtoruUlozim == undefined){ //1. stohovatelna paleta
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j];
            }else if (maxVahaKtoruUlozim < this.stohovatelnost[j]){ // ak ma dalsia paleta vacsiu vahu, ulzim ju tam
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j]
            }
          }else if ((this.sizesS[i] + this.sizesS[j]) <= naves.sizePriestoru[1]){ // mozem ulozit vedla
            indexPaletyNaSirku = j;
          }else if (this.weight[i] < this.stohovatelnost[j]){ //mozem polozit stoho na stoho
            if (maxVahaStohoPalety == undefined){
              maxVahaStohoPalety = this.weight[j];
              indexStohoPalety = j;
            }
            else if (maxVahaStohoPalety < this.weight[j]){
              maxVahaStohoPalety = this.weight[j];
              indexStohoPalety = j;
            }
          }
        }
        //ked skonci for a nasiel som paletu na ktoru to mozem polozit
        if (indexPaletyNaKtoruToUlozim != -1){
          if (this.sizesS[indexPaletyNaKtoruToUlozim] > this.sizesS[i]) { // ak je paleta na ktoru to ulozim sirsia...
            this.sizesS[i] = this.sizesS[indexPaletyNaKtoruToUlozim];
          }
          if (this.sizesD[indexPaletyNaKtoruToUlozim] > this.sizesD[i]) { // ak je paleta na ktoru to ulozim dlhsia...
            this.sizesD[i] = this.sizesD[indexPaletyNaKtoruToUlozim];
          }
          this.stohovatelnost[i] = 0;
          this.weight[i] += this.weight[j];
          this.sizesV[i] += this.sizesV[indexPaletyNaKtoruToUlozim]; //vyska paleta 1 + 2
          this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
        }else if (indexPaletyNaSirku != -1){ // ked som nasiel paletu ktoru mozem ulozit vedla
          this.sizesS[i] +=this.sizesS[indexPaletyNaSirku];
          if (this.sizesV[i] < this.sizesV[indexPaletyNaSirku]){
            this.sizesV[i] = this.sizesV[indexPaletyNaSirku];
          }
          if (this.sizesD[i] < this.sizesD[indexPaletyNaSirku]){
            this.sizesD[i] = this.sizesD[indexPaletyNaSirku];
            this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
            //tu dakte by som si mal ulozit volny priestor co mi ostal
          }
        }else if (indexStohoPalety != -1){ // ked mozem polozit stoho paletu na stoho paletu
          this.sizesV[i] += this.sizesV[indexStohoPalety];
          if (this.sizesS[i] < this.sizesS[indexStohoPalety]){
            this.sizesS[i] = this.sizesS[indexStohoPalety];
          }
          if (this.sizesD[i] < this.sizesD[indexStohoPalety]){
            this.sizesD[i] = this.sizesD[indexStohoPalety];
          }
          this.weight[i] += this.weight[indexStohoPalety];
          this.stohovatelnost[i] -= this.weight[indexStohoPalety];
          if (this.stohovatelnost[indexStohoPalety] < this.stohovatelnost[i]){
            this.stohovatelnost[i] = this.stohovatelnost[indexStohoPalety];
          }
          this.odstraneniePalety(indexStohoPalety);
        }
      }
    }
  }

  pocetTonVKazdomMeste(poleMiest){
    let vahaVMestach = [];
    poleMiest.forEach(oneMesto => {
      let vahaVJednomMeste = 0;
      if (oneMesto){
      oneMesto.weight.forEach(oneVaha => {
        vahaVJednomMeste += oneVaha;
      });
      vahaVMestach.push(vahaVJednomMeste);
      }
    });
    return vahaVMestach;
  }

  // prekrocenie - 1 znamena ziadne, viac ako 1 ...
  volnaVahaPreAutoVMeste(car: Cars, vahaVJednotlicychMestach, prekrocenie){
    let volnaVaha = 0;
    if (car.naves){
      const prives: Prives = this.privesService.allPrives.find(onePrives => car.navesis.includes(onePrives.id));
      volnaVaha = (car.nosnost + prives.nosnost) * prekrocenie;
    }else{
      volnaVaha = (car.nosnost) * prekrocenie;
    }
    let vahaVMestach = [];
    vahaVJednotlicychMestach.forEach(jednaVaha => {
      vahaVMestach.push((volnaVaha) - jednaVaha);
    });
    return vahaVMestach;
  }

  // prejdem detailami, a skontrolujem ci sa vopchaju cez nakladaci priestor
  ciSaVopchaTovarCezNakladaciPriestor(car: Cars, detail){
    let vopchaSaDoPrivesu;
    if (car.naves){
      const prives = this.privesService.getPrivesById(car.navesis[0]);
      if (prives){
        vopchaSaDoPrivesu = this.ciSaVopchaTovarCezNakladaciPriestorNaves(prives, detail);
      }
    }
    let carZoZaduS;
    let carZoZaduV;

    let carZLavaS;
    let carZLavaV;

    let carZPravaS;
    let carZPravaV;

    let carZVrchuS;
    let carZVrchuV;

    if (car.nakladaciPriestorZoZadu[1]){
      carZoZaduS = car.nakladaciPriestorZoZadu[1];
      carZoZaduV = car.nakladaciPriestorZoZadu[0];
    }

    if (car.nakladaciPriestorZLava[1]){
      carZLavaS = car.nakladaciPriestorZLava[1];
      carZLavaV = car.nakladaciPriestorZLava[0];
    }

    if (car.nakladaciPriestorZPrava[1]){
      carZPravaS = car.nakladaciPriestorZPrava[1];
      carZPravaV = car.nakladaciPriestorZPrava[0];
    }

    if (car.nakladaciPriestorZVrchu[1]){
      carZVrchuS = car.nakladaciPriestorZVrchu[1];
      carZVrchuV = car.nakladaciPriestorZVrchu[0];
    }


    let vopchaSa = true;
    if (detail){

    detail.forEach(oneDetails => {
      if (oneDetails){

      oneDetails.forEach(oneDetail => {

      const balikS = oneDetail.sizeS;
      const balikV = oneDetail.sizeV;
      const balikD = oneDetail.sizeD;
      let dadeSaVopcha = false;
      if (carZoZaduS && oneDetail.polohaNakladania.charAt(0) === '1'){
       if (balikS > carZoZaduS || balikV > carZoZaduV) {
         if (balikD > carZoZaduS || balikV > carZoZaduV) {
         }else{
           dadeSaVopcha = true;
         }
       }else{
         dadeSaVopcha = true;
       }
     }
      if (carZLavaS && oneDetail.polohaNakladania.charAt(1) === '1'){
        if (balikS > carZLavaS || balikV > carZLavaV) {
          if (balikD > carZLavaS || balikV > carZLavaV) {
          }else{
            dadeSaVopcha = true;
          }
        }else{
          dadeSaVopcha = true;
        }
      }
      if (carZPravaS && oneDetail.polohaNakladania.charAt(1) === '1'){
        if (balikS > carZPravaS || balikV > carZPravaV) {
          if (balikD > carZPravaS || balikV > carZPravaV) {
          }else{
            dadeSaVopcha = true;
          }
        }else{
          dadeSaVopcha = true;
        }
      }

      if (carZVrchuS && oneDetail.polohaNakladania.charAt(2) === '1'){
        if (balikS > carZVrchuS || balikV > carZVrchuV) {
          if (balikD > carZVrchuS || balikV > carZVrchuV) {
          }else{
            dadeSaVopcha = true;
          }
        }else{
          dadeSaVopcha = true;
        }
      }

      if (oneDetail.polohaNakladania.charAt(0) === '0' && oneDetail.polohaNakladania.charAt(1) === '0' && oneDetail.polohaNakladania.charAt(2) === '0'){
        if (carZVrchuS){
          if (balikS > carZVrchuS || balikV > carZVrchuV) {
            if (balikD > carZVrchuS || balikV > carZVrchuV) {
            }else{
              dadeSaVopcha = true;
            }
          }else{
            dadeSaVopcha = true;
          }
        }
        if (carZLavaS){
          if (balikS > carZLavaS || balikV > carZLavaV) {
            if (balikD > carZLavaS || balikV > carZLavaV) {
            }else{
              dadeSaVopcha = true;
            }
          }else{
            dadeSaVopcha = true;
          }
        }
        if (carZPravaS){
          if (balikS > carZPravaS || balikV > carZPravaV) {
            if (balikD > carZPravaS || balikV > carZPravaV) {
            }else{
              dadeSaVopcha = true;
            }
          }else{
            dadeSaVopcha = true;
          }
        }
        if (carZoZaduS){
          if (balikS > carZoZaduS || balikV > carZoZaduV) {
            if (balikD > carZoZaduS || balikV > carZoZaduV) {
            }else{
              dadeSaVopcha = true;
            }
          }else{
            dadeSaVopcha = true;
          }
        }
      }

      if (!dadeSaVopcha){ // ak sa balik nevopchal nikde, tak proste false pre celu ponuku
        vopchaSa = false;
      }
      });
      }

    });
    }

    if (vopchaSaDoPrivesu){
      return true;
    }
    return vopchaSa;
  }
  // prejdem detailami, a skontrolujem ci sa vopchaju cez nakladaci priestor
  ciSaVopchaTovarCezNakladaciPriestorNaves(car: Prives, detail){
    let carZoZaduS;
    let carZoZaduV;

    let carZLavaS;
    let carZLavaV;

    let carZPravaS;
    let carZPravaV;

    let carZVrchuS;
    let carZVrchuV;

    if (car.nakladaciPriestorZoZadu[1]){
      carZoZaduS = car.nakladaciPriestorZoZadu[1];
      carZoZaduV = car.nakladaciPriestorZoZadu[0];
    }

    if (car.nakladaciPriestorZLava[1]){
      carZLavaS = car.nakladaciPriestorZLava[1];
      carZLavaV = car.nakladaciPriestorZLava[0];
    }

    if (car.nakladaciPriestorZPrava[1]){
      carZPravaS = car.nakladaciPriestorZPrava[1];
      carZPravaV = car.nakladaciPriestorZPrava[0];
    }

    if (car.nakladaciPriestorZVrchu[1]){
      carZVrchuS = car.nakladaciPriestorZVrchu[1];
      carZVrchuV = car.nakladaciPriestorZVrchu[0];
    }


    let vopchaSa = true;
    if (detail){

      detail.forEach(oneDetails => {
        if (oneDetails){

          oneDetails.forEach(oneDetail => {

            const balikS = oneDetail.sizeS;
            const balikV = oneDetail.sizeV;
            const balikD = oneDetail.sizeD;
            let dadeSaVopcha = false;
            if (carZoZaduS && oneDetail.polohaNakladania.charAt(0) === '1'){
              if (balikS > carZoZaduS || balikV > carZoZaduV) {
                if (balikD > carZoZaduS || balikV > carZoZaduV) {
                }else{
                  dadeSaVopcha = true;
                }
              }else{
                dadeSaVopcha = true;
              }
            }
            if (carZLavaS && oneDetail.polohaNakladania.charAt(1) === '1'){
              if (balikS > carZLavaS || balikV > carZLavaV) {
                if (balikD > carZLavaS || balikV > carZLavaV) {
                }else{
                  dadeSaVopcha = true;
                }
              }else{
                dadeSaVopcha = true;
              }
            }
            if (carZPravaS && oneDetail.polohaNakladania.charAt(1) === '1'){
              if (balikS > carZPravaS || balikV > carZPravaV) {
                if (balikD > carZPravaS || balikV > carZPravaV) {
                }else{
                  dadeSaVopcha = true;
                }
              }else{
                dadeSaVopcha = true;
              }
            }

            if (carZVrchuS && oneDetail.polohaNakladania.charAt(2) === '1'){
              if (balikS > carZVrchuS || balikV > carZVrchuV) {
                if (balikD > carZVrchuS || balikV > carZVrchuV) {
                }else{
                  dadeSaVopcha = true;
                }
              }else{
                dadeSaVopcha = true;
              }
            }

            if (oneDetail.polohaNakladania.charAt(0) === '0' && oneDetail.polohaNakladania.charAt(1) === '0' && oneDetail.polohaNakladania.charAt(2) === '0'){
              if (carZVrchuS){
                if (balikS > carZVrchuS || balikV > carZVrchuV) {
                  if (balikD > carZVrchuS || balikV > carZVrchuV) {
                  }else{
                    dadeSaVopcha = true;
                  }
                }else{
                  dadeSaVopcha = true;
                }
              }
              if (carZLavaS){
                if (balikS > carZLavaS || balikV > carZLavaV) {
                  if (balikD > carZLavaS || balikV > carZLavaV) {
                  }else{
                    dadeSaVopcha = true;
                  }
                }else{
                  dadeSaVopcha = true;
                }
              }
              if (carZPravaS){
                if (balikS > carZPravaS || balikV > carZPravaV) {
                  if (balikD > carZPravaS || balikV > carZPravaV) {
                  }else{
                    dadeSaVopcha = true;
                  }
                }else{
                  dadeSaVopcha = true;
                }
              }
              if (carZoZaduS){
                if (balikS > carZoZaduS || balikV > carZoZaduV) {
                  if (balikD > carZoZaduS || balikV > carZoZaduV) {
                  }else{
                    dadeSaVopcha = true;
                  }
                }else{
                  dadeSaVopcha = true;
                }
              }
            }

            if (!dadeSaVopcha){ // ak sa balik nevopchal nikde, tak proste false pre celu ponuku
              vopchaSa = false;
            }
          });
        }

      });
    }

    return vopchaSa;
  }

  checkMaxMinNaklHrana(detail){
    let maxVyska = -1;
    let minVyska;
    detail.forEach(oneMesto => {
      if (oneMesto){
        oneMesto.forEach(oneDetail => {
          if (oneDetail.vyskaNaklHrany !== -1){
            if (oneDetail.vyskaNaklHrany > maxVyska){
              maxVyska = oneDetail.vyskaNaklHrany;
            }
            if (minVyska === undefined){
              minVyska = oneDetail.vyskaNaklHrany;
            }
            if (oneDetail.vyskaNaklHrany < minVyska){
              minVyska = oneDetail.vyskaNaklHrany;
            }
          }
        });
      }
    });
    if (maxVyska === -1){
      minVyska = -1;
    }
    return {maxVyska, minVyska};
  }

  celkovaVahaNakladov(route){
    let maxVaha = 0;
    route.adresyVPonuke.forEach((oneAddress, adresaIndex) => {
      if (oneAddress.type === 'nakladka'){
        route.detailVPonuke[adresaIndex].forEach(oneDetail => {
          maxVaha += oneDetail.weight;
        });
        // maxVaha += detail
      }
    });
    return maxVaha;
  }

  celkovaObjemBalikov(route){
    let objem = 0;
    route.adresyVPonuke.forEach((oneAddress, adresaIndex) => {
      if (oneAddress.type === 'nakladka'){
        route.detailVPonuke[adresaIndex].forEach(oneDetail => {
          objem += (oneDetail.sizeS * oneDetail.sizeD * oneDetail.sizeV);
        });
      }
    });
    return objem;
  }

  najvacsiBalik(route){
    let najvacsiS = 0;
    let najvacsiD = 0;
    let najvacsiV = 0;
    route.adresyVPonuke.forEach((oneAddress, adresaIndex) => {
      if (oneAddress.type === 'nakladka'){
        route.detailVPonuke[adresaIndex].forEach(oneDetail => {
          if (oneDetail.sizeS > najvacsiS || oneDetail.sizeS > najvacsiD || oneDetail.sizeS > najvacsiV){
            najvacsiS = oneDetail.sizeS;
            najvacsiD = oneDetail.sizeD;
            najvacsiV = oneDetail.sizeV;
          }
          if (oneDetail.sizeD > najvacsiS || oneDetail.sizeS > najvacsiD || oneDetail.sizeS > najvacsiV){
            najvacsiS = oneDetail.sizeS;
            najvacsiD = oneDetail.sizeD;
            najvacsiV = oneDetail.sizeV;
          }
          if (oneDetail.sizeV > najvacsiS || oneDetail.sizeS > najvacsiD || oneDetail.sizeS > najvacsiV){
            najvacsiS = oneDetail.sizeS;
            najvacsiD = oneDetail.sizeD;
            najvacsiV = oneDetail.sizeV;
          }
        });
      }
    });
    return {sizeS: najvacsiS, sizeD: najvacsiD, sizeV: najvacsiV};
  }
}

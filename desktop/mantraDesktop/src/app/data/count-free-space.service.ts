import { Injectable } from '@angular/core';
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";
import Cars from "../models/Cars";
import {CarService} from "../services/car.service";
import Route from "../models/Route";

@Injectable({
  providedIn: 'root'
})
export class CountFreeSpaceService {
  sizesS = [];
  sizesD = [];
  sizesV = [];
  weight = [];
  stohovatelnost = [];
  constructor(private carService: CarService) { }

  // vratim index miest kde sa dana preprava vopcha
  countFreeSpace(oneCar, offer, prekrocenie){
   var nalozenievMestach = this.vypocitajPocetPalietVKazomMeste(oneCar);
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

    // final kontrola ci sa mi veci z pola vopchaju do autiska
    var dlzka = 0; // dlzka preto lebo zvysok kontrolujem na vysku/sirku..
    this.sizesD.forEach(jednaDlzka => {
      dlzka += jednaDlzka;
    });
    if (vopchaSaDoMesta != -1 && vopchaSaDoMesta != 2 && dlzka <= oneCar.sizePriestoru[2]){
      vopchaSaDoMesta = 1;
    }else if (dlzka <= (oneCar.sizePriestoru[2] * prekrocenie) && vopchaSaDoMesta != -1){
      vopchaSaDoMesta = 2
      }else{
      vopchaSaDoMesta = -1;
    }

      });


      if (vopchaSaDoMesta == 1){
        poleMiestKdeSaVopcha.push(indexMesicka);
        prekrocenieOPercenta.push(false);
      }else if (vopchaSaDoMesta == 2){
        poleMiestKdeSaVopcha.push(indexMesicka);
        prekrocenieOPercenta.push(true);
      }
    //   }else{ // ked nemam offer ale len 1 ponuka
    //       this.prejdiPaletyaUlozIch(car);
    //   //final kontrola ci sa mi veci z pola vopchaju do autiska
    //   var dlzka = 0; // dlzka preto lebo zvysok kontrolujem na vysku/sirku..
    //   var maxVyska = 0;
    //   var maxSirka = 0;
    //   this.sizesD.forEach((jednaDlzka, index) => {
    //     dlzka += jednaDlzka;
    //     if (this.sizesV[index] > maxVyska){
    //       maxVyska = this.sizesV[index];
    //     }
    //     if (this.sizesV[index] > maxSirka){
    //       maxSirka = this.sizesS[index];
    //     }
    //   });
    //   if (dlzka <= car.sizePriestoru[2] && maxVyska <= car.sizePriestoru[0] && maxSirka <= car.sizePriestoru[1]){
    //     poleMiestKdeSaVopcha.push(indexMesicka);
    //     prekrocenieOPercenta.push(false);
    //   }else if (dlzka <= (car.sizePriestoru[2] * prekrocenie) && maxVyska <= car.sizePriestoru[0] && maxSirka <= car.sizePriestoru[1]){
    //     poleMiestKdeSaVopcha.push(indexMesicka);
    //     prekrocenieOPercenta.push(true);
    //   }
    //   else if (dlzka <= car.sizePriestoru[2] && maxVyska <= (car.sizePriestoru[0] * prekrocenie) && maxSirka <= car.sizePriestoru[1]){
    //     poleMiestKdeSaVopcha.push(indexMesicka);
    //     prekrocenieOPercenta.push(true);
    //   }
    //   else if (dlzka <= car.sizePriestoru[2] && maxVyska <= car.sizePriestoru[0] && maxSirka <= (car.sizePriestoru[1] * prekrocenie)){
    //     poleMiestKdeSaVopcha.push(indexMesicka);
    //     prekrocenieOPercenta.push(true);
    //   }
    // }
    });
   return {poleMiestKdeSaVopcha, prekrocenieOPercenta};
  }

  // pocitam si v ktorom meste sa toho kolko nachadza
  vypocitajPocetPalietVKazomMeste(auto){
    var poleKsPalietPreKazduAdresu = [];
    auto.detailIti.forEach((oneDetail, index) => {
      var oneAdress = {
        sizeS: [],
        sizeD: [],
        sizeV: [],
        weight: [],
        stohovatelnost: [],
        id: []
      }


      if (auto.itiAdresy[index].type == undefined){
        return;
      }
      if (auto.itiAdresy[index].type == 'nakladka'){ //pri nakladke prikladam palety
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
      }else{ //tu sa snazim odsranit veci kedze je vykladka
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
    return poleKsPalietPreKazduAdresu;
  }

  vypocitajPocetPalietVPonuke(offer){
    if (!offer.detailVPonuke){
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
        if (poleKsPalietPreKazduAdresu.length - 1 >= 0){
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
      oneMesto.weight.forEach(oneVaha => {
        vahaVJednomMeste += oneVaha;
      });
      vahaVMestach.push(vahaVJednomMeste);
    });
    return vahaVMestach;
  }

  // prekrocenie - 1 znamena ziadne, viac ako 1 ...
  volnaVahaPreAutoVMeste(car: Cars, vahaVJednotlicychMestach, prekrocenie){
    let vahaVMestach = [];
    vahaVJednotlicychMestach.forEach(jednaVaha => {
      vahaVMestach.push((car.nosnost * prekrocenie) - jednaVaha);
    });
    return vahaVMestach;
  }
}

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

  countFreeSpace(oldDetail: DeatilAboutAdresses[], newDetail: DeatilAboutAdresses[], carId, route){
   var nalozenievMestach = this.vypocitajPocetPalietVKazomMeste(oldDetail, route);
    var poleMiestKdeSaVopcha = [];

    var car: Cars; //0 vyska , 1 sirka, 2 dlzka
    car = this.carService.getAllCars().find(oneCar => oneCar.id == "LhMQxklO6AdvZDB7jyWw");

    nalozenievMestach.forEach((oneNalozenie, indexMesicka) => {


    this.sizesS = oneNalozenie.sizeS;
    this.sizesD = oneNalozenie.sizeD;
    this.sizesV = oneNalozenie.sizeV;
    this.weight = oneNalozenie.weight;
    this.stohovatelnost = oneNalozenie.stohovatelnost

      console.log(this.sizesS);

    //priradim si velkosti, vahy, stohovatelnost do []
    // oldDetail.forEach(oneDetail => {
    //   oneDetail.sizeD.forEach((oneSizeD, index) => {
    //     this.sizesS.push(oneDetail.sizeS[index]);
    //     this.sizesD.push(oneDetail.sizeD[index]);
    //     this.sizesV.push(oneDetail.sizeV[index]);
    //     this.weight.push(oneDetail.weight[index]);
    //     this.stohovatelnost.push(oneDetail.stohovatelnost[index]);
    //   });
    // });

    if (newDetail != null){
    newDetail.forEach(oneDetail => {
      oneDetail.sizeD.forEach((oneSizeD, index) => {
        this.sizesS.push(oneDetail.sizeS[index]);
        this.sizesD.push(oneDetail.sizeD[index]);
        this.sizesV.push(oneDetail.sizeV[index]);
        this. weight.push(oneDetail.weight[index]);
        this.stohovatelnost.push(oneDetail.stohovatelnost[index]);
      });
    });
    }

    //
    for (var i = 0; i < this.sizesS.length; i++) {
      //ak neni stohovatelne, skusim najst paletu na ktoru to moyem polozit
      if (this.stohovatelnost[i] == 0) {
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
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
              indexPaletyNaSirku = j;
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
            this.odstraneniePalety(indexPaletyNaKtoruToUlozim);
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
    //final kontrola ci sa mi veci z pola vopchaju do autiska
    var dlzka = 0; // dlzka preto lebo zvysok kontrolujem na vysku/sirku..
    this.sizesD.forEach(jednaDlzka => {
      dlzka += jednaDlzka;
    });
    if (dlzka <= car.sizePriestoru[2]){
      poleMiestKdeSaVopcha.push(indexMesicka);
    }
    })
  return poleMiestKdeSaVopcha;
  }

  //pocitam si v ktorom meste sa toho kolko nachadza
  vypocitajPocetPalietVKazomMeste(detail: DeatilAboutAdresses[], route: Route){
    var poleKsPalietPreKazduAdresu = [];
    detail.forEach((oneDetail, index) => {
      var oneAdress = {
        sizeS: [],
        sizeD: [],
        sizeV: [],
        weight: [],
        stohovatelnost: []
      }
      if (route.type[index] == 'nakladka'){ //pri nakladke prikladam palety
        oneDetail.sizeS.forEach((oneSize, indexSize) => {
          oneAdress.sizeS.push(oneDetail.sizeS[indexSize]);
          oneAdress.sizeD.push(oneDetail.sizeD[indexSize]);
          oneAdress.sizeV.push(oneDetail.sizeV[indexSize]);
          oneAdress.weight.push(oneDetail.weight[indexSize]);
          oneAdress.stohovatelnost.push(oneDetail.stohovatelnost[indexSize]);
        });
        poleKsPalietPreKazduAdresu.push(oneAdress);
      }else{ //tu sa snazim odsranit veci kedze je vykladka
        var lastVeci = JSON.parse(JSON.stringify(poleKsPalietPreKazduAdresu[poleKsPalietPreKazduAdresu.length -1]));
        oneDetail.sizeS.forEach((oneSize, indexSize) => {
          for (var i =0; i < lastVeci.sizeS.length; i++){
            if (lastVeci.sizeS[i] == oneDetail.sizeS[indexSize] && // ked najdem paletu z nakladky
                lastVeci.sizeD[i] == oneDetail.sizeD[indexSize] &&
                lastVeci.sizeV[i] == oneDetail.sizeV[indexSize] &&
                lastVeci.weight[i] == oneDetail.weight[indexSize] &&
                lastVeci.stohovatelnost[i] == oneDetail.stohovatelnost[indexSize]){

                  lastVeci.sizeS.splice(i, 1); // tu to musim nejak osetrit aby nevymazalo viacero tych istch paliet
                  lastVeci.sizeD.splice(i, 1);
                   lastVeci.sizeV.splice(i, 1);
                   lastVeci.weight.splice(i, 1);
                   lastVeci.stohovatelnost.splice(i, 1);
            }
          }
        });
        poleKsPalietPreKazduAdresu.push(lastVeci);
      }
    });
    return poleKsPalietPreKazduAdresu;
  }

//   oneDetail.sizeS.forEach((oneSize, indexSize) => {
//   poleKsPalietPreKazduAdresu.forEach((jednaAdresa, indexVPoli) => {
//   for (let indexVelkosti = 0; indexVelkosti < jednaAdresa.sizeS.length; indexVelkosti++){
//   if (jednaAdresa.sizeS[indexVelkosti] == oneDetail.sizeS[indexSize] // ked najdem paletu z nakladky
// && jednaAdresa.sizeD[indexVelkosti] == oneDetail.sizeD[indexSize] &&
//   jednaAdresa.sizeV[indexVelkosti] == oneDetail.sizeV[indexSize] &&
//   jednaAdresa.weight[indexVelkosti] == oneDetail.weight[indexSize] &&
//   jednaAdresa.stohovatelnost[indexVelkosti] == oneDetail.stohovatelnost[indexSize]){
//
//   // poleKsPalietPreKazduAdresu[indexVPoli].sizeV.splice(indexVelkosti, 1); // tu to musim nejak osetrit aby nevymazalo viacero tych istch paliet
//   // poleKsPalietPreKazduAdresu[indexVPoli].sizeD.splice(indexVelkosti, 1);
//   // poleKsPalietPreKazduAdresu[indexVPoli].sizeS.splice(indexVelkosti, 1);
//   // poleKsPalietPreKazduAdresu[indexVPoli].weight.splice(indexVelkosti, 1);
//   // poleKsPalietPreKazduAdresu[indexVPoli].stohovatelnost.splice(indexVelkosti, 1);
//   break;
// }
// }
// })
// });

  odstraneniePalety(index){
    this.sizesV.splice(index, 1);
    this.sizesD.splice(index, 1);
    this.sizesS.splice(index, 1);
    this.stohovatelnost.splice(index, 1);
    this.weight.splice(index, 1);
  }
}

import { Injectable } from '@angular/core';
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";
import Cars from "../models/Cars";
import {CarService} from "../services/car.service";

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

  countFreeSpace(oldDetail: DeatilAboutAdresses[], newDetail: DeatilAboutAdresses[], carId){
    var car: Cars; //0 vyska , 1 sirka, 2 dlzka
    car = this.carService.getAllCars().find(oneCar => oneCar.id == carId);
    this.sizesS = [];
    this.sizesD = [];
    this.sizesV = [];
    this.weight = []
    this.stohovatelnost = []

    //priradim si velkosti, vahy, stohovatelnost do []
    oldDetail.forEach(oneDetail => {
      oneDetail.sizeD.forEach((oneSizeD, index) => {
        this.sizesS.push(oneDetail.sizeS[index]);
        this.sizesD.push(oneDetail.sizeD[index]);
        this.sizesV.push(oneDetail.sizeV[index]);
        this.weight.push(oneDetail.weight[index]);
        this.stohovatelnost.push(oneDetail.stohovatelnost[index]);
      });
    });

    newDetail.forEach(oneDetail => {
      oneDetail.sizeD.forEach((oneSizeD, index) => {
        this.sizesS.push(oneDetail.sizeS[index]);
        this.sizesD.push(oneDetail.sizeD[index]);
        this.sizesV.push(oneDetail.sizeV[index]);
        this. weight.push(oneDetail.weight[index]);
        this.stohovatelnost.push(oneDetail.stohovatelnost[index]);
      });
    });

    //
    for (var i = 0; i < this.sizesS.length; i++) {
      //ak neni stohovatelne, skusim najst paletu na ktoru to moyem polozit
      if (this.stohovatelnost[i] == 0) {
        var indexPaletyNaKtoruToUlozim =  -1;
        var indexPaletyNaSirku =  -1;
        var maxVahaKtoruUlozim;
        for (var j = 0; j < this.sizesS.length; j++){ // skontrolujem od zaciatku vsetky stohovatelne palety
          if (this.stohovatelnost[j] >= this.weight[i] && (this.sizesS[i] <= car.sizePriestoru[1] || this.sizesD[i] <= car.sizePriestoru[1]) &&
            (this.sizesV[i] + this.sizesV[j] <= car.sizePriestoru[0])){ // ak najdem paletu na ktoru to mozem polozit,
            if (maxVahaKtoruUlozim == undefined){ //1. stohovatelna paleta
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j];
            }else if (maxVahaKtoruUlozim > this.stohovatelnost[j]){ // ak ma dalsia paleta nizsiu stohovatelnost, ulzim ju tam
              indexPaletyNaKtoruToUlozim = j;
              maxVahaKtoruUlozim = this.stohovatelnost[j]
            }
          }else if (this.sizesS[i] + this.sizesS[j] <= car.sizePriestoru[1]){
            indexPaletyNaSirku = j;
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
      return true
    }else{
      return false;
    }
  }

  odstraneniePalety(index){
    this.sizesV.splice(index, 1);
    this.sizesD.splice(index, 1);
    this.sizesS.splice(index, 1);
    this.stohovatelnost.splice(index, 1);
    this.weight.splice(index, 1);
  }
}

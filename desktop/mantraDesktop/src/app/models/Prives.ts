export default class Prives {
  id?: string;
  ecv: string;

  createdBy: string;


  //rozmery vozidla
  carSize?: number[]; //vyska , sirka, dlzka
  //rozmery nakaladacieho priesoru
  sizePriestoru: number[];

  vaha: number;
  nosnost: number;

  nakladaciPriestorZoZadu: number[];
  nakladaciPriestorZLava: number[];
  nakladaciPriestorZPrava: number[];
  nakladaciPriestorZVrchu: number[];


  nakladaciaHrana: number[];


}

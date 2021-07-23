export default class Cars {
  id?: string;
  ecv: string;
  phoneNumber: number;
  status: number;
  lattitude?: string;
  longtitude?: string;
  createdBy: string;
  routes? : string[];
  aktualnyNaklad?: string [];
  pocetNaprav: number;

  //rozmery vozidla
  carSize?: number[]; //vyska , sirka, dlzka
  //rozmery nakaladacieho priesoru
  sizePriestoru: number[];

  vaha: number;
  nosnost: number;
  naves: boolean; // moznost pripojit naves
  navesis: string[];
  nakladaciPriestorZoZadu: number[]; // vyska sirka
  nakladaciPriestorZLava: number[];
  nakladaciPriestorZPrava: number[];
  nakladaciPriestorZVrchu: number[];

  teplota: boolean;
  ruka: boolean;
  adr: boolean;

  minTeplota: number;
  maxTeplota: number;


  nakladaciaHrana: number[];

  itinerar?: string[];


}

export default class Cars {
  id?: string;
  ecv: string;
  phoneNumber: number;
  status: number;
  lattitude?: string;
  longtitude?: string;
  createdBy: string;
  routes? : string[];

  //rozmery vozidla
  outsideSizeV?: number;
  outsideSizeS?: number;
  outsideSizeD?: number;
  //rozmery nakaladacieho priesoru
  sizeD: number;
  sizeS: number;
  sizeV: number;

  nosnost: number;
  naves: boolean; // moznost pripojit naves
  nakladaciPriestorZoZadu: boolean;
  nakladaciPriestorZBoku: boolean;
  nakladaciPriestorZVrchu: boolean;

  vyskaNaklHrany: number;

  pohyblivaHrana: boolean;
  pohyblivaOd?: number;
  pohyblivaDo?: number;


}

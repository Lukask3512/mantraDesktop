export default class Address {
  id?: string;
  carId?: string;
  createdBy?: string;
  nameOfTown: string; // nazov mesta
  coordinatesOfTownsLat: string;
  coordinatesOfTownsLon: string;
  type: string; // nakladka vykladka V/N
  status: number;
  aboutRoute: string;

  datumPrijazdu?: string;
  datumLastPrijazdy?: string;
  casPrijazdu?: string;
  casLastPrijazdu?: string;
  estimatedTimeArrival?: string;

  // detail
  packagesId: string[] = [];
  // sizeV: number[];
  // sizeS: number[];
  // sizeD: number[];
  // weight: number[];
  // stohovatelnost: number[]; //ak ano kolko unesie
  // vyskaNaklHrany: number[];
  // polohaNakladania: string[];
  // specRezim?: number[];

}

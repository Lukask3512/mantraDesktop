export default class Address {
  id?: string;
  carId?: string;
  createdBy?: string;
  nameOfTown: string; // nazov mesta
  nameOfCompany: string; // nazov mesta
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

  obsluznyCas: string;

  // detail
  packagesId: string[] = [];

  ruka: boolean;
  adr: boolean;
  teplota: number;

}

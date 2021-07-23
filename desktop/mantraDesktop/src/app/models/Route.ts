export default class Route {
  id?: string;
  createdBy: string
  carId?: string;
  // aboutRoute?: string[];
  // nameOfTowns: any[];
  // coordinatesOfTownsLat: string[];
  // coordinatesOfTownsLon: string[];
  // type: string[];  //N / V
  // status: number[]; //na ceste/nakladam/problem atd...
  // datumPrijazdu?: string[];
  // datumLastPrijazdy?: string[];
  // casPrijazdu?: string[];
  // casLastPrijazdu?: string[];

  addresses: string[] = [];


  finished: boolean;
  createdAt: string; // timestamps
  finishedAt?: string;
  estimatedTimeArrival?: string;
  // detailsAboutAdresses: string[]; // tu pojdu informacie - velkost, vaha, stohovatelnost, atd...model DetailedTransport

  //info ked sa vytvara ponuka
  price?: number;
  priceFrom?: number[];
  offerFrom? :string[];
  forEveryone?: boolean;

  takenBy?: string;
  ponuknuteTo?: string;
  offerInRoute?: string;

}

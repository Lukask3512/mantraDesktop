export default class Route {
  id?: string;
  createdBy: string
  carId?: string;
  aboutRoute?: string[];
  nameOfTowns: any[];
  coordinatesOfTownsLat: string[];
  coordinatesOfTownsLon: string[];
  type: string[];  //true nakladka , false vykladka
  status: number[]; //na ceste/nakladam/problem atd...
  finished: boolean;
  createdAt: number; //timestamps
  finishedAt?: number;
  estimatedTimeArrival?: string;
  detailsAboutAdresses: string[]; // tu pojdu informacie - velkost, vaha, stohovatelnost, atd...model DetailedTransport

  //info ked sa vytvara ponuka
  price?: number;
  priceFrom?: number[];
  offerFrom? :string[];
  forEveryone?: boolean;

  takenBy: string;


}

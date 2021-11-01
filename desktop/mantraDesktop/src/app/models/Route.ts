export default class Route {
  id?: string;
  createdBy: string;
  carId?: string;

  addresses: string[] = [];

  finished: boolean;
  createdAt: string; // timestamps
  finishedAt?: string;
  estimatedTimeArrival?: string;
  // detailsAboutAdresses: string[]; // tu pojdu informacie - velkost, vaha, stohovatelnost, atd...model DetailedTransport

  // info ked sa vytvara ponuka
  price?: number;
  priceFrom?: number[];
  offerFrom?: string[];
  forEveryone?: boolean;

  takenBy?: string;
  ponuknuteTo?: string;
  offerInRoute?: string;
  cancelByCreator?: boolean;
  cancelByDriver?: boolean;

  // info do logu
  finalAcceptDate?: string;
  offerAddedToCarDate?: string;
  carAtPositionLat?: string;
  carAtPositionLon?: string;


}

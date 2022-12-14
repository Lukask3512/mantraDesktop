export default class Route {
  id?: string;
  createdBy: string;
  carId?: string;

  addresses: string[] = [];

  finished: boolean;
  createdAt: string; // timestamps
  finishedAt?: number;
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
  cancelByCreatorDate?: string;
  cancelByCreatorLat?: string;
  cancelByCreatorLon?: string;

  cancelByDriver?: boolean;
  cancelByDriverDate?: string;
  cancelByDriverLat?: string;
  cancelByDriverLon?: string;

  dontWannaCancel?: boolean;

  // info do logu
  finalAcceptDate?: string;
  offerAddedToCarDate?: string;
  carAtPositionLat?: string;
  carAtPositionLon?: string;


}

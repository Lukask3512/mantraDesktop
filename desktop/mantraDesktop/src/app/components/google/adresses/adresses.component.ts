import {Component, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter} from '@angular/core';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-adresses',
  templateUrl: './adresses.component.html',
  styleUrls: ['./adresses.component.scss']
})
export class AdressesComponent implements OnInit {

  latitude: number;
  longitude: number;
  address: string;
  aboutRoute: string = '';

  private geoCoder;
  addressToDispetcer: string;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  labelPosition: 'Nakladka' | 'Vykladka';

  @Output() placeName: EventEmitter<any> = new EventEmitter();
  @Output() placeLat: EventEmitter<any> = new EventEmitter();
  @Output() placeLon: EventEmitter<any> = new EventEmitter();
  @Output() type: EventEmitter<any> = new EventEmitter();
  @Output() aboutRouteEmitter: EventEmitter<any> = new EventEmitter();

  addTaskValue: string = "";
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) { }


  ngOnInit() {
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();

          this.addressToDispetcer = place.formatted_address;

          this.placeName.emit(this.addressToDispetcer);
          this.placeLat.emit(this.latitude);
          this.placeLon.emit(this.longitude);


        });
      });
    });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  resetGoogle(){

    // this.placeName.emit(this.addressToDispetcer);
    // this.placeLat.emit(this.latitude);
    // this.placeLon.emit(this.longitude);
    // this.type.emit(this.labelPosition);
    // this.aboutRouteEmitter.emit(this.aboutRoute);

    this.aboutRoute = "";
    this.addTaskValue = "";
    this.addressToDispetcer = undefined;
    this.labelPosition = undefined;
  }


  markerDragEnd($event: MouseEvent) {
    console.log($event);
   // this.latitude = $event.coords.lat;
   // this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

}


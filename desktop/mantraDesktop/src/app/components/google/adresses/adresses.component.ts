import {Component, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter} from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';

@Component({
  selector: 'app-adresses',
  templateUrl: './adresses.component.html',
  styleUrls: ['./adresses.component.scss']
})
export class AdressesComponent implements OnInit {
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  addressToDispetcer: string;
  @ViewChild('search')
  public searchElementRef: ElementRef;

  @Output() placeName: EventEmitter<any> = new EventEmitter();
  @Output() placeLat: EventEmitter<any> = new EventEmitter();
  @Output() placeLon: EventEmitter<any> = new EventEmitter();
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
          this.zoom = 12;
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
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  add(){
    this.placeName.emit(this.addressToDispetcer);
    this.placeLat.emit(this.latitude);
    this.placeLon.emit(this.longitude);
    this.addTaskValue = "";
  }


  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
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

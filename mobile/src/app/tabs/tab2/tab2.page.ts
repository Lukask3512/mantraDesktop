import {Component, OnInit} from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  constructor() {
  }

  ngOnInit(): void {
    var map = tt.map({
      key: 'VAcYqzUukEzcUP08AT26zVID4AJvUvKH',
      container: 'map',
      style: 'tomtom://vector/1/basic-main'
    });
    map.addControl(new tt.NavigationControl());
  }

}

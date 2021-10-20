import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-main-detail-about',
  templateUrl: './main-detail-about.component.html',
  styleUrls: ['./main-detail-about.component.scss']
})
export class MainDetailAboutComponent implements OnInit {

  @Input() route: any;
  constructor() { }

  ngOnInit(): void {
    console.log(this.route);
  }

}

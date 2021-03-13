import {Component, Input, OnInit} from '@angular/core';
import DeatilAboutAdresses from "../../../models/DeatilAboutAdresses";

@Component({
  selector: 'app-detail-img',
  templateUrl: './detail-img.component.html',
  styleUrls: ['./detail-img.component.scss']
})
export class DetailImgComponent implements OnInit {

  @Input() detailArray: DeatilAboutAdresses;
  constructor() { }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit} from '@angular/core';
import DeatilAboutAdresses from "../../../models/DeatilAboutAdresses";
import Address from "../../../models/Address";

@Component({
  selector: 'app-detail-img',
  templateUrl: './detail-img.component.html',
  styleUrls: ['./detail-img.component.scss']
})
export class DetailImgComponent implements OnInit {

  @Input() address: Address;
  constructor() { }

  ngOnInit(): void {
  }

}

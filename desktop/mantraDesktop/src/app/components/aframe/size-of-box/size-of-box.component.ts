import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-size-of-box',
  templateUrl: './size-of-box.component.html',
  styleUrls: ['./size-of-box.component.scss']
})
export class SizeOfBoxComponent implements OnInit {

  constructor(private translation: TranslateService) { }

  ngOnInit(): void {
  }
  getName(){
    return 'pro'
  }


}

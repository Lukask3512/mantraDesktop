import { Component, OnInit } from '@angular/core';
import {DispecerService} from '../../../services/dispecer.service';
import {DataService} from '../../../data/data.service';
import {VodicService} from '../../../services/vodic.service';

@Component({
  selector: 'app-vodici-wrapper',
  templateUrl: './vodici-wrapper.component.html',
  styleUrls: ['./vodici-wrapper.component.scss']
})
export class VodiciWrapperComponent implements OnInit {

  allVodici;
  constructor(private vodiciService: VodicService, public dataService: DataService) {
    this.vodiciService.allVodici$.subscribe(data => {
      this.allVodici = data;
    });
  }

  getDispecer(){
    const dispecer = this.dataService.getDispecer();
    if (dispecer.createdBy === 'master' || dispecer.allCars){
      return false;
    }else{
      return true;
    }
  }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';

@Component({
  selector: 'app-main-detail-about',
  templateUrl: './main-detail-about.component.html',
  styleUrls: ['./main-detail-about.component.scss']
})
export class MainDetailAboutComponent implements OnInit {

  @Input() route: any;
  constructor(private countFreeSpace: CountFreeSpaceService) { }

  ngOnInit(): void {
    console.log(this.route);
  }

  timeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleDateString();
  }

  maxVaha(){
    return this.countFreeSpace.celkovaVahaNakladov(this.route);
  }

  objemBalikov() {
    return this.countFreeSpace.celkovaObjemBalikov(this.route);
  }

  najvacsiBalik() {
    return this.countFreeSpace.najvacsiBalik(this.route);
  }

}

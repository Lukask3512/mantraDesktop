import {Component, Input, OnInit} from '@angular/core';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-main-detail-about',
  templateUrl: './main-detail-about.component.html',
  styleUrls: ['./main-detail-about.component.scss']
})
export class MainDetailAboutComponent implements OnInit {

  @Input() route: any;



  constructor(private countFreeSpace: CountFreeSpaceService, private translation: TranslateService) { }

  ngOnInit(): void {
    console.log(this.route);
  }

  setRoute(route){
    this.route = route;
  }

  timeToLocal(dateUtc){
    const date = (new Date(dateUtc));
    if (!dateUtc || dateUtc === '0'){
      return (this.translation.instant('OFTEN.nerozhoduje')).toString();
    }
    return date.toLocaleDateString();
  }

  maxVaha(){
    return this.roundDecimal(this.countFreeSpace.celkovaVahaNakladov(this.route));
  }

  roundDecimal(sameNumber){
    if (!sameNumber){
      return 'Nezname';
    }
    let numberToRound;
    if (typeof sameNumber === 'string'){
      numberToRound = parseFloat(sameNumber);
    }else{
      numberToRound = sameNumber;
    }
    return parseFloat((numberToRound).toFixed(5)); // ==> 1.005
  }

  objemBalikov() {
    return this.countFreeSpace.celkovaObjemBalikov(this.route).toFixed(2);
  }

  najvacsiBalik() {
    return this.countFreeSpace.najvacsiBalik(this.route);
  }

}

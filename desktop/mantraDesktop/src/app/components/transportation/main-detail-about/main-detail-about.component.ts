import {Component, Input, OnInit} from '@angular/core';
import {CountFreeSpaceService} from '../../../data/count-free-space.service';
import {TranslateService} from '@ngx-translate/core';
import {PackageService} from '../../../services/package.service';

@Component({
  selector: 'app-main-detail-about',
  templateUrl: './main-detail-about.component.html',
  styleUrls: ['./main-detail-about.component.scss']
})
export class MainDetailAboutComponent implements OnInit {

  @Input() route: any;



  constructor(private countFreeSpace: CountFreeSpaceService, private translation: TranslateService,
              private packageService: PackageService) { }

  ngOnInit(): void {
    console.log(this.route);
  }

  setRoute(route){
    if (route.detailVPonuke[0][0]){
      this.route = route;
    }else{
      const detail = [];
      route.adresyVPonuke.forEach(oneAddress => {
        let myPackages = [];
        let detailAr = {detailArray: [], townsArray: [], packageId: []};
        if (oneAddress){
          oneAddress.packagesId.forEach(oneId => {
            if (oneAddress.type === 'nakladka') {
              let balik = this.packageService.getOnePackage(oneId);
              if (!balik){
                setTimeout(() => {
                  this.setRoute(route);
                }, 1000);
              }
              myPackages.push(balik);
            } else {
              // tu by som mal vlozit len indexy do vykladky
              detail.forEach((oneDetail, townId) => {
                if (oneDetail.townsArray === undefined) {
                  oneDetail.forEach((oneDetailId, packageId) => {
                    if (oneDetailId && oneDetailId.id === oneId) {
                      detailAr.detailArray.push(packageId);
                      detailAr.townsArray.push(townId);
                      detailAr.packageId.push(oneDetailId.id);
                    }
                  });
                }
              });

            }
          });
        }

        if (myPackages.length !== 0) {
          detail.push(myPackages);
        } else {
          detail.push(detailAr);
        }
      });
      this.route = route;
      this.route.detailVPonuke = detail;
    }

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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import DeatilAboutAdresses from "../../../../models/DeatilAboutAdresses";
import Address from "../../../../models/Address";
import {DataService} from "../../../../data/data.service";

@Component({
  selector: 'app-show-detail',
  templateUrl: './show-detail.component.html',
  styleUrls: ['./show-detail.component.scss']
})
export class ShowDetailComponent implements OnInit {

  @Input() labelPosition;
  @Input() detailsArray;
  @Output() detailOut = new EventEmitter<any>();
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  setDetails(detailArray){
    this.detailsArray = detailArray;
    console.log(detailArray);
  }

  clickedOn(oneDetail: DeatilAboutAdresses, indexMesta, indexBedne){
    console.log({detail: oneDetail, indexMesta: indexMesta, indexBedne: indexBedne})
    this.detailOut.emit({detail: oneDetail, indexMesta: indexMesta, indexBedne: indexBedne});
  }

  isArray(details){
    if (Array.isArray(details)){
      return true;
    }else{
      return false;
    }
  }

  actualNovyDetail(){

  }

  vylozene(mesto, pozicia){
    var nasiel = false;

    this.dataService.actualDetail.subscribe(actualDetails => {
      if (actualDetails){
        actualDetails.town.forEach((oneTown, index) => {
          if (actualDetails.town[index] == mesto && pozicia == actualDetails.detail[index]){
            nasiel =  true;
          }
        })
      }

      if (!nasiel){
        this.detailsArray.forEach((oneDetail, index) => {
          if (oneDetail.townsArray !== undefined){
            oneDetail.townsArray.forEach((balik, indexBalika) => {
              if (oneDetail.townsArray[indexBalika] == mesto && pozicia == oneDetail.detailArray[indexBalika]){
                nasiel =  true;
              }
            })
          }
        })
      }

    })

    return nasiel;
  }

}

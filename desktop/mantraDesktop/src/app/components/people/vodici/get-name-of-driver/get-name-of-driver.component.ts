import {Component, Input, OnInit} from '@angular/core';
import Cars from '../../../../models/Cars';
import {CarService} from '../../../../services/car.service';
import {VodicService} from '../../../../services/vodic.service';
import Vodic from '../../../../models/Vodic';

@Component({
  selector: 'app-get-name-of-driver',
  templateUrl: './get-name-of-driver.component.html',
  styleUrls: ['./get-name-of-driver.component.scss']
})
export class GetNameOfDriverComponent implements OnInit {

  @Input() car: Cars;
  vodic: Vodic;
  constructor(private carService: CarService, private vodicService: VodicService) { }

  ngOnInit(): void {
    if (this.car.driverInside){
      this.vodicService.allVodici$.subscribe(allVodici => {
        if (allVodici){
          this.vodic = allVodici.find(jedenVodic => jedenVodic.id === this.car.driverInside);
        }
      });
    }
  }
  setCar(car){
    this.car = car;
  }

}

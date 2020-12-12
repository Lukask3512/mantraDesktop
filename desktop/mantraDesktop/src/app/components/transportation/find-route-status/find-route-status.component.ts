import {Component, Input, OnInit} from '@angular/core';
import {RouteStatusService} from "../../../data/route-status.service";

@Component({
  selector: 'app-find-route-status',
  templateUrl: './find-route-status.component.html',
  styleUrls: ['./find-route-status.component.scss']
})
export class FindRouteStatusComponent implements OnInit {

  @Input() route;
  constructor(private routeStatusService: RouteStatusService) { }

  ngOnInit(): void {

  }

  findStatus(){
    for(let i = this.route.status.length-1 ; i >= 0; i--){
      if (this.route.status[i] != -1){
        return this.routeStatusService.getStatus(this.route.status[i]);
      }
    }
  }


}

import {Component, Input, OnInit} from '@angular/core';
import {RouteLogService} from "../../../services/route-log.service";
import {MatTableDataSource} from "@angular/material/table";
import {RouteStatusService} from "../../../data/route-status.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-route-log',
  templateUrl: './route-log.component.html',
  styleUrls: ['./route-log.component.scss']
})
export class RouteLogComponent implements OnInit {

  constructor(private routeLogService: RouteLogService, public routeStatusService: RouteStatusService) { }
  dataSource;
  displayedColumns: string[] = ['town', 'status', 'time'];

  @Input() routeId: Subject<any>;
  routeLog;
  ngOnInit(): void {

    this.routeId.subscribe(routeId => {
      console.log("som dostal routeid" + routeId)
      this.routeLogService.getLogFromRoute(routeId).subscribe(data =>{
        console.log(data);
        this.routeLog = data[0];
        console.log(this.routeLog);
        // this.dataSource = new MatTableDataSource(this.routeLog);
        // this.dataSource.paginator = this.paginator;
      });
    })

  }

  toDate(timestamp){
    var date = new Date(parseInt(timestamp));
    return date.toDateString() + " " + date.getHours()+" : " + date.getMinutes();
  }

  ngOnDestroy() {
    // needed if child gets re-created (eg on some model changes)
    // note that subsequent subscriptions on the same subject will fail
    // so the parent has to re-create parentSubject on changes
    this.routeId.unsubscribe();
  }

}

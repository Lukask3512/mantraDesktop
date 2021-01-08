import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {RouteLogService} from "../../../services/route-log.service";
import {MatTableDataSource} from "@angular/material/table";
import {RouteStatusService} from "../../../data/route-status.service";
import {Subject} from "rxjs";
import {jsPDF} from "jspdf";

@Component({
  selector: 'app-route-log',
  templateUrl: './route-log.component.html',
  styleUrls: ['./route-log.component.scss']
})
export class RouteLogComponent implements OnInit {

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
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

  downloadAsPDF(){
    // const DATA = this.pdfTable.nativeElement;

    const doc: jsPDF = new jsPDF("l", "pt", 'letter');
    var data2 = document.getElementById("routeLog")
    data2.style.fontSize = '10px'
    doc.setFontSize(7);
    console.log(data2)
    doc.html(data2, {
      callback: (doc) => {
        doc.output("dataurlnewwindow");
      }
    });
  }

}

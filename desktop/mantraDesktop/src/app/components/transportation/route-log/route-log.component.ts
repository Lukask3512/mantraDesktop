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
      this.routeLogService.getLogFromRoute(routeId).subscribe(data =>{
        this.routeLog = data[0];
      });
    })

  }

  toDate(timestamp){
    var date = new Date(parseInt(timestamp));
    return date.toDateString() + " " + date.getHours()+" : " + date.getMinutes();
  }

  ngOnDestroy() {
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

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
    return date.toDateString() + " " + date.getHours()+":" + date.getMinutes();
  }

  ngOnDestroy() {
    this.routeId.unsubscribe();
  }

  deleteSpecialChar(word){
    const chars = [...word]
    for(let i = 0; i < word.length; i++){
      if(word[i] == "š")
        chars[i] = 's';
      if(word[i] == "Š")
        chars[i] = 's';
      if(word[i] == "č")
        chars[i] = 'c';
      if(word[i] == "Č")
        chars[i] = 'C';
      if(word[i] == "ť")
        chars[i] = 't';
      if(word[i] == "Ť")
        chars[i] = 't';
      if(word[i] == "ž")
        chars[i] = 'z';
      if(word[i] == "Ž")
        chars[i] = 'Z';
      if(word[i] == "ä")
        chars[i] = 'a';
      if(word[i] == "ô")
        chars[i] = 'o';
      if(word[i] == "ň")
        chars[i] = 'n';
      if(word[i] == "Ň")
        chars[i] = 'N';
    }
    let skusam = chars.join("")
    return skusam;
  }

  downloadAsPDF(){
    // const DATA = this.pdfTable.nativeElement;

    const doc: jsPDF = new jsPDF("l", "pt", 'letter');
    var data2 = document.getElementById("routeLog")
    data2.style.fontSize = '9px'
    data2.style.padding = '2px'
    doc.setFontSize(7);
    // console.log(data2)
    doc.html(data2, {
      callback: (doc) => {
        doc.output("dataurlnewwindow");
        data2.style.fontSize = '16px'
        data2.style.padding = '8px'

      }
    });
  }

}

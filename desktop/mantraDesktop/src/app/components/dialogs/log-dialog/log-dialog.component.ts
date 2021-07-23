import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {RouteLogService} from '../../../services/route-log.service';
import {RouteStatusService} from '../../../data/route-status.service';
import Address from '../../../models/Address';
import RouteLog from '../../../models/RouteLog';
import {jsPDF} from 'jspdf';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Route from '../../../models/Route';

@Component({
  selector: 'app-log-dialog',
  templateUrl: './log-dialog.component.html',
  styleUrls: ['./log-dialog.component.scss']
})
export class LogDialogComponent implements OnInit {

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private routeLogService: RouteLogService, public routeStatusService: RouteStatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LogDialogComponent>) { }
  dataSource;
  displayedColumns: string[] = ['town', 'status', 'time'];

  @Input() addresses: Address[];
  route: Route;
  routeLog: RouteLog[] = [];
  ngOnInit(): void {
    if (this.data){
      this.addresses = this.data.addresses;
      this.getLog();
      this.route = this.data.route;
    }
  }

  getLog(){
    this.routeLog = [];
    this.addresses.forEach(oneAddress => {
      this.routeLogService.getLogFromRoute(oneAddress.id).subscribe(myLog => {
        if (myLog[0]){
          this.routeLog.push(myLog[0] as RouteLog);
        }
        if (this.routeLog) {
          this.routeLog.sort((a, b) => {
            return new Date(a.timestamp[0]).valueOf() - new Date(b.timestamp[0]).valueOf();
          });
        }
      });
    });
  }

  toDate(datum){
    var date = new Date(datum);
    return date.toDateString() + " " + date.getHours()+":" + date.getMinutes();
  }

  // ngOnDestroy() {
  //   this.routeId.unsubscribe();
  // }

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
      if(word[i] == "á")
        chars[i] = 'a';
      if(word[i] == 'é')
        chars[i] = 'e';
    }
    let skusam = chars.join("")
    return skusam;
  }

  downloadAsPDF(){
    // const DATA = this.pdfTable.nativeElement;

    const doc: jsPDF = new jsPDF("l", "pt", 'letter');
    var data2 = document.getElementById("allWrapper")
    // data2.style.fontSize = '9px'
    // data2.style.padding = '2px'
    data2.style.width = '800px';
    doc.setFontSize(7);
    // console.log(data2)
    doc.html(data2, {
      callback: (doc) => {
        doc.output("dataurlnewwindow");
        setTimeout(function(){
          data2.style.fontSize = '16px'
          data2.style.padding = '8px' }, 3000);
        data2.style.width = '100%';

      }
    });
  }

}

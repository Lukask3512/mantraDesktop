import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {RouteLogService} from '../../../services/route-log.service';
import {RouteStatusService} from '../../../data/route-status.service';
import Address from '../../../models/Address';
import RouteLog from '../../../models/RouteLog';
import {jsPDF} from 'jspdf';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Route from '../../../models/Route';
import '../../../../assets/fonts/arial/ARIALUNI-normal';
import Company from '../../../models/Company';
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
  companyZadavatel: Company;
  companyPrepravca: Company;
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
    const date = new Date(datum);
    return date.toDateString() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  downloadAsPDF(){


    const doc: jsPDF = new jsPDF('l', 'pt', 'letter');
    doc.setFont('ARIALUNI', 'normal');
    const data2 = document.getElementById('allWrapper');
    data2.style.fontSize = '9px';
    data2.style.padding = '2px';
    data2.style.width = '800px';
    doc.setFontSize(7);

    doc.html(data2, {
      callback: (doc) => {
        doc.output('dataurlnewwindow');
        setTimeout(() => {
          data2.style.fontSize = '16px';
          data2.style.padding = '8px'; }, 3000);
        data2.style.width = '100%';

      }
    });
  }

  getCompanyPrepravca(company: Company){
    this.companyPrepravca = company;
  }

  getCompanyZadavatel(company: Company){
    this.companyZadavatel = company;
  }

}



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
import html2canvas from 'html2canvas';
import {PackageService} from '../../../services/package.service';
@Component({
  selector: 'app-log-dialog',
  templateUrl: './log-dialog.component.html',
  styleUrls: ['./log-dialog.component.scss']
})
export class LogDialogComponent implements OnInit {

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private routeLogService: RouteLogService, public routeStatusService: RouteStatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LogDialogComponent>,
              private packageService: PackageService) { }
  dataSource;
  displayedColumns: string[] = ['town', 'status', 'time'];

  @Input() addresses: Address[];
  route: Route;
  routeLog: RouteLog[] = [];
  companyZadavatel: Company;
  companyPrepravca: Company;
  detail = [];
  ngOnInit(): void {
    if (this.data){
      this.addresses = this.data.addresses;
      this.getLog();
      this.route = this.data.route;
      console.log(this.route)
      this.getDetail();

    }
  }

  thoursLocal(time){
    if (time == null || time === '0'){
      return 'Neuverejneny';
    }else{
      return time;
    }
  }

  timeToLocal(dateUtc){

    var date = (new Date(dateUtc));

    if (dateUtc == null || dateUtc === '0'){
      return 'Neuverejneny';
    }
    return date.toLocaleString();
  }

  getDetail(){
    this.addresses.forEach(oneAddress => {
      var myPackages = [];
      var detailAr = {detailArray: [], townsArray: [], packageId: []};
      oneAddress.packagesId.forEach( oneId => {
          var balik = this.packageService.getOnePackage(oneId);
          myPackages.push(balik);
      });

      this.detail = myPackages;
      console.log(this.detail);

    });
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


    const doc: jsPDF = new jsPDF('p', 'pt', 'a4');
    doc.setFont('ARIALUNI', 'normal');
    const data2 = document.getElementById('allWrapperToDownload');
    // data2.style.display = 'initial';

    doc.html(data2, {
      callback: (docCal) => {
        docCal.output('dataurlnewwindow');
        setTimeout(() => {
          // data2.style.display = 'none';
          }, 2000);
      }
    });
  }

  // downloadAsPDFImg(){
  //   // html2
  //   const data2 = document.getElementById('allWrapperToDownload');
  //
  //   // data2.style.display = 'initial';
  //   // data2.style.width = '200px';
  //
  //
  //   let data = document.getElementById('allWrapper');
  //   html2canvas(data).then(canvas => {
  //     const contentDataURL = canvas.toDataURL('image/jpg')
  //     const pdf = new jsPDF('l', 'cm', 'a4'); //Generates PDF in landscape mode
  //     // let pdf = new jspdf('p', 'cm', 'a4'); Generates PDF in portrait mode
  //     pdf.addImage(contentDataURL, 'JPG', 0, 0, 29.7, 21.0);
  //     pdf.save('Filename.pdf');
  //   });
  // }

  getCompanyPrepravca(company: Company){
    this.companyPrepravca = company;
  }

  getCompanyZadavatel(company: Company){
    this.companyZadavatel = company;
  }

}



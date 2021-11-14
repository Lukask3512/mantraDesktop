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
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-log-dialog',
  templateUrl: './log-dialog.component.html',
  styleUrls: ['./log-dialog.component.scss']
})
export class LogDialogComponent implements OnInit {

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private routeLogService: RouteLogService, public routeStatusService: RouteStatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LogDialogComponent>,
              private packageService: PackageService, private translation: TranslateService) { }
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
      this.getDetail();

    }
  }

  thoursLocal(time){
    if (time == null || time === '0'){
      return this.translation.instant('LOG.nezverejneny');
    }else{
      return time;
    }
  }

  timeToLocal(dateUtc){

    var date = (new Date(dateUtc));

    if (dateUtc == null || dateUtc === '0'){
      return this.translation.instant('LOG.nezverejneny');
    }
    return date.toLocaleString();
  }

  getDetail(){
    var myPackages = [];
    this.addresses.forEach(oneAddress => {
      if (oneAddress.type === 'nakladka'){
        var detailAr = {detailArray: [], townsArray: [], packageId: []};
        oneAddress.packagesId.forEach( oneId => {
            var balik = this.packageService.getOnePackage(oneId);
            myPackages.push(balik);
        });
        this.detail = myPackages;
      }
    });
  }

  getIndexAdresy(balikId){
    return this.addresses.findIndex(oneAddress => oneAddress.packagesId.includes(balikId.id)) + 1;
  }

  getIndexAdresyVykladka(balik){
    for (let i = this.addresses.length - 1; i >= 0 ; i--) {
      if (this.addresses[i].packagesId.find(oneId => oneId === balik.id)){
        return i + 1;
      }
    }
  }

  roundDecimal(sameNumber){
    let numberToRound;
    if (typeof sameNumber === 'string'){
      numberToRound = parseFloat(sameNumber);
    }else{
      numberToRound = sameNumber;
    }
    return parseFloat((numberToRound).toFixed(5)); // ==> 1.005
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
    data2.style.visibility = 'visible';

    doc.html(data2, {
      callback: (docCal) => {
        docCal.output('dataurlnewwindow');
        setTimeout(() => {
          data2.style.visibility = 'hidden';
          }, 2000);
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



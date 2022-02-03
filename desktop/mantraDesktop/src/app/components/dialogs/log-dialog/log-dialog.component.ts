import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {RouteLogService} from '../../../services/route-log.service';
import {RouteStatusService} from '../../../data/route-status.service';
import Address from '../../../models/Address';
import RouteLog from '../../../models/RouteLog';
import {jsPDF} from 'jspdf';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import Route from '../../../models/Route';
import Company from '../../../models/Company';
import {PackageService} from '../../../services/package.service';
import {TranslateService} from '@ngx-translate/core';
import {ShowCoorOnMapComponent} from '../show-coor-on-map/show-coor-on-map.component';
import {take} from 'rxjs/operators';
import '../../../../assets/fonts/arial/ARIALUNI-normal';


@Component({
  selector: 'app-log-dialog',
  templateUrl: './log-dialog.component.html',
  styleUrls: ['./log-dialog.component.scss']
})
export class LogDialogComponent implements OnInit {

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private routeLogService: RouteLogService, public routeStatusService: RouteStatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<LogDialogComponent>,
              private packageService: PackageService, private translation: TranslateService,
              private dialog: MatDialog) { }
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

    const date = (new Date(dateUtc));

    if (dateUtc == null || dateUtc === '0'){
      return this.translation.instant('LOG.nezverejneny');
    }
    return date.toDateString();
  }

  getDetail(){
    const myPackages = [];
    this.addresses.forEach(oneAddress => {
      if (oneAddress.type === 'nakladka'){
        oneAddress.packagesId.forEach( oneId => {
            const balik = this.packageService.getOnePackage(oneId);
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
    if (!sameNumber){
      return 'Nezname';
    }
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
      this.routeLogService.getLogFromRoute(oneAddress.id).pipe(take(1)).subscribe(myLog => {
        // @ts-ignore
        const logsId: RouteLog = myLog[0];
        if (oneAddress && oneAddress.id){
          logsId.id = oneAddress.id;
        }

        // logsId = {... {id: oneAddress.id}};
        console.log(logsId);
        if (myLog[0]){
          if (!this.routeLog.find(oneLog => oneLog.id === logsId.id)){
            this.routeLog.push(logsId);
          }
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
    return date.toDateString() + ' ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
  }

  downloadAsPDF(){


    const doc: jsPDF = new jsPDF('p', 'pt', 'a4');
    console.log(doc.getFontList());
    // doc.setFont('HelveticaWorld-Regular', 'normal');
    const data2 = document.getElementById('allWrapperToDownload');
    data2.style.visibility = 'visible';


    console.log(doc.getFontList());


    doc.setFont('ARIALUNI', 'normal');

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

  showOnMap(townIndex, indexOfCoor){
    console.log(this.routeLog[townIndex].lattitude[indexOfCoor]);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      lat: this.routeLog[townIndex].lattitude[indexOfCoor],
      lon: this.routeLog[townIndex].longtitude[indexOfCoor]
    };
    dialogConfig.width = '70%';
    // dialogConfig.height = 'auto';
    dialogConfig.height = '600px';
    const dialogRef = this.dialog.open(ShowCoorOnMapComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
        if (value === undefined){
          return;
        }else {

        }
      });

  }

  getFirstCompany(first: boolean){
    const firmaKtoraPonukla = {
      spolocnost: this.companyZadavatel.name,
      datum: new Date(this.route.cancelByCreatorDate),
      lat: this.route.cancelByCreatorLat,
      lon: this.route.cancelByCreatorLon
    };
    const firmaKtoraPrijala = {
      spolocnost: this.companyPrepravca.name,
      datum: new Date(this.route.cancelByDriverDate),
      lat: this.route.cancelByDriverLat,
      lon: this.route.cancelByDriverLon
    };


    if (first === true) { // vraciam spolocnost ktora prva odmietla
      if (firmaKtoraPonukla.datum.getTime() >= firmaKtoraPrijala.datum.getTime()){
        return firmaKtoraPrijala;
      }else{
        return firmaKtoraPonukla;
      }
    }else{
      if (firmaKtoraPonukla.datum.getTime() >= firmaKtoraPrijala.datum.getTime()){
        return firmaKtoraPonukla;
      }else{
        return firmaKtoraPrijala;
      }
    }
  }

  getOneCompanyCancel(first: boolean){
    if (this.companyPrepravca){
      const firmaKtoraPonukla = {
        spolocnost: this.companyZadavatel.name,
        datum: new Date(this.route.cancelByCreatorDate),
        lat: this.route.cancelByCreatorLat,
        lon: this.route.cancelByCreatorLon
      };
      const firmaKtoraPrijala = {
        spolocnost: this.companyPrepravca.name,
        datum: new Date(this.route.cancelByDriverDate),
        lat: this.route.cancelByDriverLat,
        lon: this.route.cancelByDriverLon
      };


      if (first === true){ // vraciam spolocnost ktora prva odmietla
        if (firmaKtoraPonukla.datum.getTime() >= firmaKtoraPrijala.datum.getTime()){
          return firmaKtoraPrijala;
        }else{
          return firmaKtoraPonukla;
        }
      }else{
        if (firmaKtoraPonukla.datum.getTime() >= firmaKtoraPrijala.datum.getTime()) {
          return firmaKtoraPonukla;
        }else{
          return firmaKtoraPrijala;
        }
      }
    }

  }

}




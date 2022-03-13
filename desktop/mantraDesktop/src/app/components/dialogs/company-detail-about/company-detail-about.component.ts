import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DispecerService} from '../../../services/dispecer.service';
import Company from '../../../models/Company';
import Dispecer from '../../../models/Dispecer';
import {concatMapTo, take} from 'rxjs/operators';
import {CarService} from '../../../services/car.service';
import Cars from '../../../models/Cars';
import {MatTableDataSource} from '@angular/material/table';
import {RouteStatusService} from '../../../data/route-status.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatPaginator} from '@angular/material/paginator';
import {DeleteCarDialogComponent} from '../delete-car-dialog/delete-car-dialog.component';
import {ZmenVyskuPoistkyUAutaComponent} from '../zmen-vysku-poistky-uauta/zmen-vysku-poistky-uauta.component';
import Vodic from '../../../models/Vodic';
import {DeleteDispecerComponent} from '../delete-dispecer/delete-dispecer.component';
import {DeleteVodicComponent} from '../delete-vodic/delete-vodic.component';
import {VodicService} from '../../../services/vodic.service';

@Component({
  selector: 'app-company-detail-about',
  templateUrl: './company-detail-about.component.html',
  styleUrls: ['./company-detail-about.component.scss']
})
export class CompanyDetailAboutComponent implements OnInit {

  company: Company;
  dispecer: Dispecer;

  cars: Cars[];
  drivers: Vodic[];
  dispecers: Dispecer[];

  dataSource;
  displayedColumns: string[] = ['ecv', 'status', 'createdAt', 'poistka', 'delete'];

  displayedColumnsForDrivers: string[] = ['meno', 'priezvisko', 'createdAt', 'delete'];

  // displayedColumns: string[] = ['ecv', 'status', 'createdAt', 'poistka', 'delete'];

  showCarsOr = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CompanyDetailAboutComponent>,
              private dispecerService: DispecerService, private carService: CarService,
              public routeStatusService: RouteStatusService, private spinner: NgxSpinnerService,
              private dialog: MatDialog, private vodiciService: VodicService) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.company = this.data;
    this.getDispecer(this.company.id);
  }

  closeDialog(){
    this.dialogRef.close();
  }

  getDispecer(companyId){
    this.spinner.show();
    this.dispecerService.getMasterDispecerByCompany(companyId).pipe(take(1)).subscribe(myDispecers => {
      this.dispecer = myDispecers[0];
      this.getCars();
    });
  }

  getCars(){
    this.carService.getCars(this.dispecer.id).subscribe(allCarsForCompany => {
      this.cars = allCarsForCompany;
      this.dataSource = new MatTableDataSource(this.cars);
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();
    });
  }

  getDrivers(){
    this.vodiciService.getVodiciById(this.dispecer.id).subscribe(allCarsForCompany => {
      this.drivers = allCarsForCompany;
      this.dataSource = new MatTableDataSource(this.drivers);
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();
    });
  }

  getDispecers(){
    this.dispecerService.getDispecersByMasterId(this.dispecer.id).subscribe(allCarsForCompany => {
      this.dispecers = allCarsForCompany;
      this.dataSource = new MatTableDataSource(this.dispecers);
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();
    });
  }

  toLocalString(date){
    const datum = new Date(date);
    return datum.toLocaleString();
  }

  deleteCar(car){
        const dialogRef = this.dialog.open(DeleteCarDialogComponent, {
          data: {car, route: false}
        });
        dialogRef.afterClosed().subscribe(value => {
          if (value === undefined) {
            return;
          } else {

          }
        });
    }

  deleteDispecer(dispecer){
    const dialogRef = this.dialog.open(DeleteDispecerComponent, {
      data: {dispecer, route: false}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined) {
        return;
      } else {
      this.dispecerService.deleteDispecer(dispecer.id);
      }
    });
  }

  deleteDriver(driver){
    const dialogRef = this.dialog.open(DeleteVodicComponent, {
      data: {dispecer: driver, route: false}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined) {
        return;
      } else {
        this.vodiciService.deleteVodic(driver.id);
      }
    });
  }

  changePoistka(poistka: number, car){
      const dialogRef = this.dialog.open(ZmenVyskuPoistkyUAutaComponent, {
        data: {poistka, car},
      });
      dialogRef.afterClosed().subscribe(value => {
          if (value === undefined) {
          return;
        } else {
            const vyskaPoistky = value.vyskaPoistky;
            const carToUpdate = this.cars.find(oneCar => oneCar.id === car.id);
            carToUpdate.poistka = vyskaPoistky;
            this.carService.updateCar(carToUpdate, carToUpdate.id);
        }
    });
  }

  activateCars(){
    this.showCarsOr = 1;
    if (!this.cars){
      this.getCars();
    }else{
      this.dataSource = new MatTableDataSource(this.cars);
      this.dataSource.paginator = this.paginator;
    }
  }

  activateDrivers(){
    this.showCarsOr = 3;
    if (!this.drivers){
      this.getDrivers();
    }else{
      this.dataSource = new MatTableDataSource(this.drivers);
      this.dataSource.paginator = this.paginator;
    }
  }

  activateDispecers(){
    this.showCarsOr = 2;
    if (!this.dispecers){
      this.getDispecers();
    }else{
      this.dataSource = new MatTableDataSource(this.dispecers);
      this.dataSource.paginator = this.paginator;
    }
  }

  getClass(type){
    if (this.showCarsOr === 1 && type === 1){
      return 'green';
    }
    if (this.showCarsOr === 2 && type === 2){
      return 'green';
    }
    if (this.showCarsOr === 3 && type === 3){
      return 'green';
    }
  }

}

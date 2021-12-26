import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import Dispecer from '../../../models/Dispecer';
import {DispecerService} from '../../../services/dispecer.service';
import {FormBuilder} from '@angular/forms';
import {DataService} from '../../../data/data.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DeleteDispecerComponent} from '../../dialogs/delete-dispecer/delete-dispecer.component';
import {DipecerPravaComponent} from '../../dialogs/dipecer-prava/dipecer-prava.component';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-the-dispecer',
  templateUrl: './the-dispecer.component.html',
  styleUrls: ['./the-dispecer.component.scss']
})
export class TheDispecerComponent implements OnInit, OnChanges {

  @Input() dispecer: Dispecer[];
  masterDispecer: Dispecer[];
  dispecerovForm: any;

  dataSource;
  dataSourceMaster;
  displayedColumns: string[] = ['meno', 'priezvisko', 'cislo', 'email', 'update', 'delete'];
  constructor(private dispecerService: DispecerService, private field: FormBuilder, public dataService: DataService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
  this.dataSourceMaster = new MatTableDataSource([this.dispecerService.getMasterAcc()]);
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes.dispecer.currentValue) {
      this.dataSource = new MatTableDataSource(changes.dispecer.currentValue);
    }
  }

  getDispecer(){
    const dispecer = this.dataService.getDispecer();
    if (dispecer.createdBy === 'master' || dispecer.allCars){
      return false;
    }else{
      return true;
    }
  }

  deleteDispecer(dispecer){
    if (!this.getDispecer()) {
      const dialogRef = this.dialog.open(DeleteDispecerComponent, {
        data: {dispecer: this.dispecer}
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value === undefined) {
          return;
        } else {
          this.dispecerService.deleteDispecer(dispecer.id);
        }
      });
    }
  }

  updatePrava(dispecer){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    dialogConfig.data = {
      dispecer
    };
    const dialogRef = this.dialog.open(DipecerPravaComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

}

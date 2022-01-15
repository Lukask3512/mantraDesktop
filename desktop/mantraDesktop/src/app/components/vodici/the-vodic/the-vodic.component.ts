import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {DataService} from '../../../data/data.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import Vodic from '../../../models/Vodic';
import {VodicService} from '../../../services/vodic.service';
import {NewVodicDialogComponent} from '../../dialogs/new-vodic-dialog/new-vodic-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {DeleteVodicComponent} from '../../dialogs/delete-vodic/delete-vodic.component';

@Component({
  selector: 'app-the-vodic',
  templateUrl: './the-vodic.component.html',
  styleUrls: ['./the-vodic.component.scss']
})
export class TheVodicComponent implements OnInit, OnChanges {
  @Input() vodici: Vodic[];
  vodicForm: any;

  dataSource;
  displayedColumns: string[] = ['meno', 'priezvisko', 'cislo', 'email', 'update', 'delete'];

  constructor(private vodicService: VodicService, private field: FormBuilder, public dataService: DataService,
              private dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges){
    if (changes.vodici.currentValue) {
      this.dataSource = new MatTableDataSource(changes.vodici.currentValue);
    }
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.vodici);
  }

  deleteVodic(vodic){
    if (!this.getDispecer()){
    const dialogRef = this.dialog.open(DeleteVodicComponent, {
      data: {dispecer: vodic}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.vodicService.deleteVodic(vodic.id);
      }
    });
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

  updateVodic(vodic){
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    dialogConfig.data = {
      vodic: vodic
    };
    const dialogRef = this.dialog.open(NewVodicDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }
}

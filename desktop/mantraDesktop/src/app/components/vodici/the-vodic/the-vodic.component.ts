import {Component, Input, OnInit} from '@angular/core';
import Dispecer from '../../../models/Dispecer';
import {DispecerService} from '../../../services/dispecer.service';
import {FormBuilder} from '@angular/forms';
import {DataService} from '../../../data/data.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DeleteDispecerComponent} from '../../dialogs/delete-dispecer/delete-dispecer.component';
import {DipecerPravaComponent} from '../../dialogs/dipecer-prava/dipecer-prava.component';
import Vodic from '../../../models/Vodic';
import {VodicService} from '../../../services/vodic.service';

@Component({
  selector: 'app-the-vodic',
  templateUrl: './the-vodic.component.html',
  styleUrls: ['./the-vodic.component.scss']
})
export class TheVodicComponent implements OnInit {
  @Input() vodic: Vodic;
  vodicForm: any;

  constructor(private vodicService: VodicService, private field: FormBuilder, public dataService: DataService,
              private dialog: MatDialog) { }

  ngOnInit(): void {

  }

  deleteVodic(){
    const dialogRef = this.dialog.open(DeleteDispecerComponent, {
      data: {dispecer: this.vodic}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.vodicService.deleteVodic(this.vodic.id);
      }
    });
  }
}

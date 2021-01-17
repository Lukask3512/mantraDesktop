import {Component, Input, OnInit} from '@angular/core';
import Dispecer from "../../../models/Dispecer";
import {DispecerService} from "../../../services/dispecer.service";
import {FormBuilder} from "@angular/forms";
import {DataService} from "../../../data/data.service";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {DeleteDispecerComponent} from "../../dialogs/delete-dispecer/delete-dispecer.component";

@Component({
  selector: 'app-the-dispecer',
  templateUrl: './the-dispecer.component.html',
  styleUrls: ['./the-dispecer.component.scss']
})
export class TheDispecerComponent implements OnInit {

  @Input() dispecer: Dispecer;
  dispecerovForm: any;

  constructor(private dispecerService: DispecerService, private field: FormBuilder, public dataService: DataService,
     private dialog: MatDialog) { }

  ngOnInit(): void {

  }

  deleteDispecer(){
    const dialogRef = this.dialog.open(DeleteDispecerComponent, {
      data: {dispecer: this.dispecer}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.dispecerService.deleteDispecer(this.dispecer.id);
      }
    });
  }

}

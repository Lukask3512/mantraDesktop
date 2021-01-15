import {Component, Input, OnInit} from '@angular/core';
import Dispecer from "../../../models/Dispecer";
import {DispecerService} from "../../../services/dispecer.service";
import {FormBuilder} from "@angular/forms";
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-the-dispecer',
  templateUrl: './the-dispecer.component.html',
  styleUrls: ['./the-dispecer.component.scss']
})
export class TheDispecerComponent implements OnInit {

  @Input() dispecer: Dispecer;
  dispecerovForm: any;

  constructor(private dispecerService: DispecerService, private field: FormBuilder, public dataService: DataService) { }

  ngOnInit(): void {

  }

  deleteDispecer(){
    this.dispecerService.deleteDispecer(this.dispecer.id);
  }

}

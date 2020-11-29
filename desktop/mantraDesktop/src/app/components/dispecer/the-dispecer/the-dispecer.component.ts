import {Component, Input, OnInit} from '@angular/core';
import Dispecer from "../../../models/Dispecer";
import {DispecerService} from "../../../services/dispecer.service";

@Component({
  selector: 'app-the-dispecer',
  templateUrl: './the-dispecer.component.html',
  styleUrls: ['./the-dispecer.component.scss']
})
export class TheDispecerComponent implements OnInit {

  @Input() dispecer: Dispecer;
  constructor(private dispecerService: DispecerService) { }

  ngOnInit(): void {
    console.log(this.dispecer);
  }

  deleteDispecer(){
    this.dispecerService.deleteDispecer(this.dispecer.id);
  }

}

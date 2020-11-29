import { Component, OnInit } from '@angular/core';
import {DispecerService} from "../../../services/dispecer.service";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dispecer',
  templateUrl: './dispecer.component.html',
  styleUrls: ['./dispecer.component.scss']
})
export class DispecerComponent implements OnInit {

  allDispeces;
  constructor(private dispecerService: DispecerService) {
    this.dispecerService.getDispecers().subscribe(data =>{
      this.allDispeces = data;
    })
  }

  ngOnInit(): void {
  }

}

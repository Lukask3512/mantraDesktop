import { Component, OnInit } from '@angular/core';
import {DispecerService} from '../../../services/dispecer.service';
import {DataService} from '../../../data/data.service';

@Component({
  selector: 'app-dispecer',
  templateUrl: './dispecer.component.html',
  styleUrls: ['./dispecer.component.scss']
})
export class DispecerComponent implements OnInit {

  allDispeces;
  constructor(private dispecerService: DispecerService, public dataService: DataService) {

  }

  ngOnInit(): void {
    this.dispecerService.mozemStiahnutDispecerov();
    this.dispecerService.getDispecers().subscribe(data => {
      this.allDispeces = data;
    });
  }

}

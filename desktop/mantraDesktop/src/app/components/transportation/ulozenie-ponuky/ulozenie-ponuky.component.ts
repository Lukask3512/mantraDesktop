import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PredpokladaneUlozenieService} from '../../../services/predpokladane-ulozenie.service';
import Predpoklad from '../../../models/Predpoklad';

@Component({
  selector: 'app-ulozenie-ponuky',
  templateUrl: './ulozenie-ponuky.component.html',
  styleUrls: ['./ulozenie-ponuky.component.scss']
})
export class UlozeniePonukyComponent implements OnInit {

  predUlozenie: Predpoklad[];
  @Input() idPonuky: string;
  @Output() itiOutput = new EventEmitter<Predpoklad>();

  constructor(private predkUlozenieService: PredpokladaneUlozenieService) { }

  ngOnInit(): void {
    if (this.idPonuky){
      this.setPredpokladane(this.idPonuky);
    }
  }

  setPredpokladane(idPonuky){
    this.predkUlozenieService.getPonukaById(idPonuky).subscribe(mojeUlozenia => {
      // @ts-ignore
      this.predUlozenie = mojeUlozenia;
    });
  }

  // odosli ulozeny itinerar do zobrazovaca itinerara
  sendIti(predpoklad: Predpoklad){
    this.itiOutput.emit(predpoklad);
  }
}

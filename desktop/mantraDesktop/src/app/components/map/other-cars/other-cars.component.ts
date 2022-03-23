import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {DataService} from '../../../data/data.service';
import Cars from '../../../models/Cars';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-other-cars',
  templateUrl: './other-cars.component.html',
  styleUrls: ['./other-cars.component.scss']
})
export class OtherCarsComponent implements OnInit {
  checked = false;

  constructor(private afs: AngularFirestore, private dataService: DataService) { }

  private otherCars;

  @Output() otherCarsToShow = new EventEmitter<any[]>();

  ngOnInit(): void {

  }

  showCars(){
    if (this.checked){
      if (!this.otherCars){
        this.getOtherCars().pipe(take(1)).subscribe(allCars => {
          this.otherCars = allCars;
          console.log(this.otherCars);
          this.otherCarsToShow.emit(this.otherCars);
        });
      }else{
        this.otherCarsToShow.emit(this.otherCars);
      }
    }else{
      this.otherCarsToShow.emit(null);

    }

  }

  getOtherCars(){
    return this.afs.collection('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('createdBy', '!=', this.getDispecer()).limit(100);
      return query;
    }).valueChanges();
  }

  getDispecer(){
    return this.dataService.getMyIdOrMaster();
  }

}

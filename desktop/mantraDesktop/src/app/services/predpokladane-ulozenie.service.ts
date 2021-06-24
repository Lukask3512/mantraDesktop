import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Dispecer from '../models/Dispecer';
import {Observable} from 'rxjs';
import Prives from '../models/Prives';
import Predpoklad from '../models/Predpoklad';
import {DataService} from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class PredpokladaneUlozenieService {

  private predpokladCollection: AngularFirestoreCollection<Dispecer>;
  private predpoklad: Observable<Dispecer[]>;
  predpokladCollectionRef: AngularFirestoreCollection<Dispecer>;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.predpokladCollection = this.afs.collection<any>('predpokladaneul');
  }

  createPredpoklad(predpoklad: Predpoklad){
    return this.afs.collection('predpokladaneul').add(predpoklad);
  }

  getPonukaById(ponukaId){
    return this.afs.collection('predpokladaneul', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('ponukaId', '==', ponukaId).where('creatorId', '==', this.dataService.getMyIdOrMaster());
      return query;
    }).valueChanges();
  }
}

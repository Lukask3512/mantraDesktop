import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataService} from '../data/data.service';
import {map} from 'rxjs/operators';
import Vodic from '../models/Vodic';

@Injectable({
  providedIn: 'root'
})
export class VodicService {
  private vodicCollection: AngularFirestoreCollection<Vodic>;
  private vodici: Observable<Vodic[]>;
  vodicCollectionRef: AngularFirestoreCollection<Vodic>;
  todo$: Observable<Vodic[]>;

  private allVodicource = new BehaviorSubject<any>(null);
  allVodici$ = this.allVodicource.asObservable();

  justGetVodici: Vodic[];

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.vodicCollection = this.afs.collection<any>('vodici');
    this.getVodici().subscribe(allVodici => {
      this.allVodicource.next(allVodici);
      this.justGetVodici = allVodici;
    });
  }

  getNoSub(): Vodic[]{
    return this.justGetVodici;
  }

  // taketo query sa pouzivaju ked chces dostat aj idcko..ked s tym budes dalej manipulovat updatovat atd..
  getVodici() {
    var createdBy;
    if (this.dataService.getDispecer().createdBy !== 'master') {
      createdBy = this.dataService.getDispecer().createdBy;
    } else {
      createdBy = this.dataService.getDispecer().id;
    }
    return this.afs.collection<Vodic>('vodici', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdBy);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc['id'];
          return {id, ...data};
        });
      })
    );
  }

  // taketo query sa pouzivaju hlavne na zobrazovanie dat, ked to nechces updatovat atd...bez idcka
  // getDispecers2(){
  //   return this.afs.collection<Dispecer>('dispecer').valueChanges();
  // }

  getOneVodic(email) {
    return this.afs.collection<Vodic>('vodici', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('email', '==', email);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc['id'];
          return {id, ...data};
        });
      })
    );

  }

  createVodic(vodic: Vodic) {
    const id = this.afs.createId();
    this.vodicCollection.doc(id).set(vodic);
    return id;
  }

  deleteVodic(vodicId) {
    return this.vodicCollection.doc(vodicId).delete();
  }

  updateVodic(vodic: Vodic) {
    return this.vodicCollection.doc(vodic.id).update(vodic);
  }
}

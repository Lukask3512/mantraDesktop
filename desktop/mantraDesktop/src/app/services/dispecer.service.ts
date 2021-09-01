import { Injectable } from '@angular/core';
import Dispecer from "../models/Dispecer";

import {BehaviorSubject, Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {map} from "rxjs/operators";
import {DataService} from "../data/data.service";

@Injectable({
  providedIn: 'root'
})
export class DispecerService {
  private dispecerCollection: AngularFirestoreCollection<Dispecer>;
  private dispecers: Dispecer[];

  dispecerCollectionRef: AngularFirestoreCollection<Dispecer>;
  todo$: Observable<Dispecer[]>;

  private allDispecersSource = new BehaviorSubject<Dispecer[]>(null);
  allDispecers = this.allDispecersSource.asObservable();

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.dispecerCollection = this.afs.collection<any>('dispecers');

  }

  mozemStiahnutDispecerov(){
    this.getDispecersFire().subscribe(allDispecers => {
      this.allDispecersSource.next(allDispecers);
      this.dispecers = allDispecers;
    });
  }

  getDispecers(){
    return this.allDispecers;
  }

  // taketo query sa pouzivaju ked chces dostat aj idcko..ked s tym budes dalej manipulovat updatovat atd..
  getDispecersFire(): Observable<Dispecer[]>{
    var createdBy;
    if (this.dataService.getDispecer().createdBy !== 'master'){
        createdBy = this.dataService.getDispecer().createdBy;
    }else{
      createdBy = this.dataService.getDispecer().id;
    }
    return this.afs.collection<Dispecer>('dispecers', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdBy);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc['id']
          return {id, ...data};
        });
      })
    );
  }

  // taketo query sa pouzivaju hlavne na zobrazovanie dat, ked to nechces updatovat atd...bez idcka
  // getDispecers2(){
  //   return this.afs.collection<Dispecer>('dispecer').valueChanges();
  // }

  getOneDispecer(email){
      return this.afs.collection<Dispecer>('dispecers', ref => {
        let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('email', '==', email);
        return query;
      }).snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc['id']
            return {id, ...data};
          });
        })
      );
  }

   getMasterDispecerByCompany(companyId){
      return this.afs.collection<Dispecer>('dispecers', ref => {
        let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('companyId', '==', companyId)
          .where('createdBy', '==', 'master');
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

  getDispecerById(id) {
    return this.dispecerCollection.doc(id).valueChanges();
  }

  createDispecer(dispecer: Dispecer){
    return this.dispecerCollection.add(dispecer);
  }

  deleteDispecer(dispecerID){
    return this.dispecerCollection.doc(dispecerID).delete();
  }

  updateDispecer(dispecer: Dispecer){
    return this.dispecerCollection.doc(dispecer.id).update(dispecer);
  }

}

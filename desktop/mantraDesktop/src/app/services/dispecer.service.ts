import { Injectable } from '@angular/core';
import Dispecer from '../models/Dispecer';

import {BehaviorSubject, Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {map, take} from 'rxjs/operators';
import {DataService} from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class DispecerService {
  private dispecerCollection: AngularFirestoreCollection<Dispecer>;
  private dispecers: Dispecer[];

  private allDispecersSource = new BehaviorSubject<Dispecer[]>(null);
  allDispecers = this.allDispecersSource.asObservable();

  dispecerFromOtherCompanies: Dispecer[] = [];
  masterDispecer: Dispecer;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.dispecerCollection = this.afs.collection<any>('dispecers');

  }

  mozemStiahnutDispecerov(){
    this.getDispecersFire().subscribe(allDispecers => {
      this.allDispecersSource.next(allDispecers);
      this.dispecers = allDispecers;
    });
  }

  setDispecersFromAnotherompanies(dispecer: Dispecer){
    if (!this.dispecerFromOtherCompanies.find(dispec => dispec.id === dispecer.id)){
      this.dispecerFromOtherCompanies.push(dispecer);
    }
  }

  getDispecerFromAnotherCompanies(dispecerID){
    return this.dispecerFromOtherCompanies.find(dispec => dispec.id === dispecerID);
  }

  getDispecers(){
    return this.allDispecers;
  }

  getNoSub(): Dispecer[]{
    return this.dispecers;
  }

  getMasterAcc(){
    return this.masterDispecer;
  }


  getDispecersFire(): Observable<Dispecer[]>{
    let createdBy;
    if (this.dataService.getDispecer().createdBy !== 'master'){
        createdBy = this.dataService.getDispecer().createdBy;
        this.getDispecerById(createdBy).pipe(take(1)).subscribe(masterDispecer => {
          this.masterDispecer = masterDispecer;
        });
    }else{
      createdBy = this.dataService.getDispecer().id;
      this.masterDispecer = this.dataService.getDispecer();
    }
    return this.afs.collection<Dispecer>('dispecers', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdBy);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, ...data};
        });
      })
    );
  }

  getDispecersByMasterId(masterId){
    return this.afs.collection<Dispecer>('dispecers', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', masterId);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, ...data};
        });
      })
    );
  }

  getOneDispecer(email){
      return this.afs.collection<Dispecer>('dispecers', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('email', '==', email);
        return query;
      }).snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          });
        })
      );
  }

   getMasterDispecerByCompany(companyId){
      return this.afs.collection<Dispecer>('dispecers', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('companyId', '==', companyId)
          .where('createdBy', '==', 'master');
        return query;
      }).snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          });
        })
      );
  }


  getAllDispecersWithNoShowRoute(routeId){
    return this.afs.collection<Dispecer>('dispecers', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('nezobrazovatPonuky', 'array-contains', routeId);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, ...data};
        });
      })
    );
  }


  getDispecerById(id) {
    return this.dispecerCollection.doc(id).valueChanges();
  }

  createDispecer(dispecer: Dispecer){
    return this.dispecerCollection.add({...dispecer});
  }

  deleteDispecer(dispecerID){
    return this.dispecerCollection.doc(dispecerID).delete();
  }

  updateDispecer(dispecer: Dispecer){
    return this.dispecerCollection.doc(dispecer.id).update(dispecer);
  }

  updateDispecerWithOldIdAndNewDispecer(dispecer: Dispecer, id){
    return this.dispecerCollection.doc(id).update(dispecer);
  }

}

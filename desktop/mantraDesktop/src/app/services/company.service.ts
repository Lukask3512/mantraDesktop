import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Dispecer from '../models/Dispecer';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataService} from '../data/data.service';
import {map} from 'rxjs/operators';
import Cars from '../models/Cars';
import Company from '../models/Company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companiesCollection: AngularFirestoreCollection<Company>;
  private companies: Observable<Company[]>;
  companiesCollectionRef: AngularFirestoreCollection<Dispecer>;
  allCompanies;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.companiesCollection = this.afs.collection<any>('companies');

    this.getCompanies().subscribe(res => {
      const dispecer: Dispecer = this.dataService.getDispecer();
      // tu kontrolujem ci mam povolenie k adrese podla aut ktore mam pridelene
      let vyfiltrovanerRouty = res;
      if (dispecer.createdBy !== 'master') {
        vyfiltrovanerRouty = res.filter(oneCar =>
          dispecer.myCars.includes(oneCar.id));
      }
      this._companies.next(vyfiltrovanerRouty);
      this.allCompanies = vyfiltrovanerRouty;
    });

  }

  private _companies = new BehaviorSubject<any>([]);
  readonly companies$ = this._companies.asObservable();

  getCompanies() {
    return this.afs.collection<Dispecer>('companies', ref => {
      const query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
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

  getAllCars() {
    return this.allCompanies;
  }

  createCompany(company: Company) {
    const id = this.afs.createId();
    this.companiesCollection.doc(id).set(company);
    return new Promise(resolve => {
      resolve(id);
    });
  }

  deleteCompany(companyId) {
    return this.companiesCollection.doc(companyId).delete();
  }

  getCompany(companyId) {
    return this.companiesCollection.doc(companyId).valueChanges();
  }

  getCompanyByIco(ico){
    return this.afs.collection('companies', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('ico', '==', ico);
      return query;
    }).valueChanges();
  }

  getCompanyByName(name){
    return this.afs.collection('companies', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('name', '==', name);
      return query;
    }).valueChanges();
  }

  getCompanyByDico(dicIc){
    return this.afs.collection('companies', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('dicIc', '==', dicIc);
      return query;
    }).valueChanges();
  }

  updateCompany(updateCompany, id) {
    return this.companiesCollection.doc(id).update(updateCompany);
  }
}

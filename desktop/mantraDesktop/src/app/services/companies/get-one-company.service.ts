import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Company from '../../models/Company';

@Injectable({
  providedIn: 'root'
})
export class GetOneCompanyService {
  private companiesCollection: AngularFirestoreCollection<Company>;

  savedCompanies: Company[];

  constructor(private afs: AngularFirestore) {
    this.companiesCollection = this.afs.collection<any>('companies');
  }

  getCompany(companyId) {
    return this.companiesCollection.doc(companyId).valueChanges();
  }
  setSavedCompanies(){

  }

}

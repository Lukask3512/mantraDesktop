import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Company from '../../models/Company';
import Dispecer from '../../models/Dispecer';
import {take} from 'rxjs/operators';
import {DispecerService} from '../dispecer.service';
import {CompanyService} from '../company.service';
import {promise} from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class GetOneCompanyService {
  private companiesCollection: AngularFirestoreCollection<Company>;

  savedCompanies: Company[];

  constructor(private afs: AngularFirestore, private dispecerService: DispecerService,
              private companyService: CompanyService) {
    this.companiesCollection = this.afs.collection<any>('companies');
  }

  getCompany(companyId) {
    return this.companiesCollection.doc(companyId).valueChanges();
  }

  getCompanyName(masterId): Promise<Company>{
    return new Promise((resolve, reject) => {
    if (masterId){
        const dispecerFromApp: Dispecer = this.dispecerService.getDispecerFromAnotherCompanies(masterId);
        if (!dispecerFromApp){ // ked dispecera nemam
          this.dispecerService.getDispecerById(masterId).pipe(take(1)).subscribe(dispecer => {
            if (dispecer){
              dispecer.id = masterId;
              this.dispecerService.setDispecersFromAnotherompanies(dispecer);
              this.companyService.getCompany(dispecer.companyId).pipe(take(1)).subscribe(myCompany => {
                const company = myCompany;
                company.id = dispecer.companyId;
                this.companyService.setAnotherCompany(company);
                resolve(company);
              });
            }else{
              reject();
            }
          });
        }else{
          const companyFromAPp: Company = this.companyService.getAnotherCompanies(dispecerFromApp.companyId);
          if (!companyFromAPp){
            this.companyService.getCompany(dispecerFromApp.companyId).pipe(take(1)).subscribe(myCompany => {
              const company = myCompany;
              company.id = dispecerFromApp.companyId;
              this.companyService.setAnotherCompany(company);
              resolve(company);
            });
          }else{
            resolve(companyFromAPp);
          }
        }
        }else{
        reject();
      }
    });
  }

}

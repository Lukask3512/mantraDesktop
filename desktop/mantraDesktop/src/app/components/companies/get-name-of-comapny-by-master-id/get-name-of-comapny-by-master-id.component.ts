import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Company from '../../../models/Company';
import {DispecerService} from '../../../services/dispecer.service';
import {CompanyService} from '../../../services/company.service';
import {take} from 'rxjs/operators';
import Dispecer from '../../../models/Dispecer';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-get-name-of-comapny-by-master-id',
  templateUrl: './get-name-of-comapny-by-master-id.component.html',
  styleUrls: ['./get-name-of-comapny-by-master-id.component.scss']
})
export class GetNameOfComapnyByMasterIdComponent implements OnInit {

  @Input() masterId: string;
  @Input() companyId: string;
  @Input() zadavatel: boolean;
  company: Company;
  @Output() sendCompanyToParent = new EventEmitter<Company>();
  constructor(private dispecerService: DispecerService, private companyService: CompanyService,
              private translation: TranslateService) { }

  ngOnInit(): void {
    if (this.masterId){
      const dispecerFromApp: Dispecer = this.dispecerService.getDispecerFromAnotherCompanies(this.masterId);
      // console.log(this.dispecerService.dispecerFromOtherCompanies);
      if (!dispecerFromApp){ // ked dispecera nemam
        this.dispecerService.getDispecerById(this.masterId).pipe(take(1)).subscribe(dispecer => {
          if (dispecer){
            dispecer.id = this.masterId;
            this.dispecerService.setDispecersFromAnotherompanies(dispecer);
            this.companyService.getCompany(dispecer.companyId).pipe(take(1)).subscribe(myCompany => {
              this.company = myCompany;
              this.company.id = dispecer.companyId;
              this.companyService.setAnotherCompany(this.company);
              this.sendCompanyToParent.emit(this.company);
            });
          }
        });
      }else{
        const companyFromAPp: Company = this.companyService.getAnotherCompanies(dispecerFromApp.companyId);
        if (!companyFromAPp){
          this.companyService.getCompany(dispecerFromApp.companyId).pipe(take(1)).subscribe(myCompany => {
            this.company = myCompany;
            this.company.id = dispecerFromApp.companyId;
            this.companyService.setAnotherCompany(this.company);
            this.sendCompanyToParent.emit(this.company);
          });
        }else{
          this.company = companyFromAPp;
          this.sendCompanyToParent.emit(this.company);
        }
      }

    }
  }

  getZadavatelOr(){
    if (this.zadavatel){
      return this.translation.instant('OFFER.zadavatel') + ': ';
    }else{
      return this.translation.instant('OFFER.prepravca') + ': ';
    }
  }

}

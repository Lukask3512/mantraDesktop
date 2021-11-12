import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Company from '../../../models/Company';
import {DispecerService} from '../../../services/dispecer.service';
import {CompanyService} from '../../../services/company.service';
import {take} from 'rxjs/operators';
import Dispecer from '../../../models/Dispecer';

@Component({
  selector: 'app-get-name-of-comapny-by-master-id',
  templateUrl: './get-name-of-comapny-by-master-id.component.html',
  styleUrls: ['./get-name-of-comapny-by-master-id.component.scss']
})
export class GetNameOfComapnyByMasterIdComponent implements OnInit {

  @Input() masterId: string;
  @Input() companyId: string;
  company: Company;
  @Output() sendCompanyToParent = new EventEmitter<Company>();
  constructor(private dispecerService: DispecerService, private companyService: CompanyService) { }

  ngOnInit(): void {
    if (this.masterId){
      const dispecerFromApp: Dispecer = this.dispecerService.getDispecerFromAnotherCompanies(this.masterId);
      if (!dispecerFromApp){ // ked dispecera nemam
        this.dispecerService.getDispecerById(this.masterId).pipe(take(1)).subscribe(dispecer => {
          if (dispecer){
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

}

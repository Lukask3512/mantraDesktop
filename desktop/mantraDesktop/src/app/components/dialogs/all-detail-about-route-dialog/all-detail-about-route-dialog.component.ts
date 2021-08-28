import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import Address from '../../../models/Address';
import {PackageService} from '../../../services/package.service';
import {ShowDetailDialogComponent} from '../show-detail-dialog/show-detail-dialog.component';


@Component({
  selector: 'app-all-detail-about-route-dialog',
  templateUrl: './all-detail-about-route-dialog.component.html',
  styleUrls: ['./all-detail-about-route-dialog.component.scss'],
})
export class AllDetailAboutRouteDialogComponent implements OnInit {

  addresses: Address[] = [];
  detail = [];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<AllDetailAboutRouteDialogComponent>,
              private packageService: PackageService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.addresses = this.data.addresses;
    this.stiahniDetail();
  }

  catchOpen(value, index){
    console.log(value);
    console.log(index);
  }

  stiahniDetail(){
    this.detail = [];
    this.addresses.forEach(oneAddress => {
      var myPackages = [];
      var detailAr = {detailArray: [], townsArray: [], packageId: []};
      oneAddress.packagesId.forEach( oneId => {
        if (oneAddress.type === 'nakladka'){
          const balik = this.packageService.getOnePackage(oneId);
          myPackages.push(balik);
        }else{
          // u by som mal vlozit len indexy do vykladky
          this.detail.forEach((oneDetail, townId) => {
            if (oneDetail.townsArray === undefined){
              oneDetail.forEach((oneDetailId, packageId) => {
                if (oneDetailId.id === oneId){
                  detailAr.detailArray.push(packageId);
                  detailAr.townsArray.push(townId);
                  detailAr.packageId.push(oneDetailId.id);
                }
              });
            }
          });

        }
      });
      if (myPackages.length !== 0){
        this.detail.push(myPackages);
      }else{
        this.detail.push(detailAr);
      }

    });
    console.log(this.detail);
  }

  openPackageDialogTowns(townId, detailId){
    console.log(townId)
    console.log(detailId);
    console.log(this.detail[townId])
    console.log(this.detail[townId].packageId[detailId]);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      detailId: this.detail[townId].packageId[detailId],
      carId: null,
    };
    dialogConfig.width = '70%';
    dialogConfig.height = '70%';

    const dialogRef = this.dialog.open(ShowDetailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }


  openPackageDialog(townId, detailId){
    console.log(townId)
    console.log(detailId);
    console.log(this.detail[townId])
    console.log(this.detail[townId][detailId].id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      detailId: this.detail[townId][detailId].id,
      carId: null,
    };
    dialogConfig.width = '70%';
    dialogConfig.height = '70%';

    const dialogRef = this.dialog.open(ShowDetailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }
    });
  }




}

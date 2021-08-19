import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import Cars from '../../../models/Cars';
import DeatilAboutAdresses from '../../../models/DeatilAboutAdresses';
import {CarService} from '../../../services/car.service';
import {DetailAboutRouteService} from '../../../services/detail-about-route.service';
import {PackageService} from '../../../services/package.service';

@Component({
  selector: 'app-show-detail-dialog',
  templateUrl: './show-detail-dialog.component.html',
  styleUrls: ['./show-detail-dialog.component.scss']
})
export class ShowDetailDialogComponent implements OnInit {

  car: Cars;
  detail: DeatilAboutAdresses;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
               public dialogRef: MatDialogRef<ShowDetailDialogComponent>,
               private carService: CarService,
               private packageService: PackageService) { }

  ngOnInit(): void {
    this.carService.cars$.subscribe(allCars => {
      this.car = allCars.find(oneCar => oneCar.id === this.data.carId);
    });
    this.detail = this.packageService.myPackages.find(onePackage => onePackage.id === this.data.detailId);
    if (!this.detail){
      this.detail = this.packageService.myPackagesOffer.find(onePackage => onePackage.id === this.data.detailId);
    }
    this.zobrazBednuVAframe();
  }

  zobrazBednuVAframe(){
    const x = this.detail.sizeS;
    const y = this.detail.sizeV;
    const z = this.detail.sizeD;
    // @ts-ignore
    document.getElementById('mojaABedna').setAttribute('scale', {x, y, z});


    const xVaha = this.detail.weight / 5;
    const yVaha = 1;
    const zVaha = 1;

    setTimeout(() => {
      // @ts-ignore
      document.getElementById('mojaSipka').object3D.scale.set(yVaha, xVaha, zVaha);
      document.getElementById('vahaText').setAttribute('value', this.detail.weight + 't');
    }, 100);

  }

}

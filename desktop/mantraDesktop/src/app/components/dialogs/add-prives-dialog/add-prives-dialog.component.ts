import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CarService} from "../../../services/car.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NewCarComponent} from "../../cars/new-car/new-car.component";
import {DataService} from "../../../data/data.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {take} from "rxjs/operators";
import Cars from "../../../models/Cars";
import {NewPrivesComponent} from "../../privesy/new-prives/new-prives.component";
import Prives from "../../../models/Prives";
import {PrivesService} from "../../../services/prives.service";

@Component({
  selector: 'app-add-prives-dialog',
  templateUrl: './add-prives-dialog.component.html',
  styleUrls: ['./add-prives-dialog.component.scss']
})
export class AddPrivesDialogComponent implements OnInit {

  privesForm = this.fb.group({
    ecv: ['', Validators.required],

    autoVyska: ['', Validators.required],
    autoDlzka: ['', Validators.required],
    autoSirka: ['', Validators.required],
    priestorVyska: ['', Validators.required],
    priestorDlzka: ['', Validators.required],
    priestorSirka: ['', Validators.required],
    vahaVozidlo: ['', Validators.required],
    nosnost: ['', Validators.required],

    vyskaHrany: [''],
    minHrana: [''],
    maxHrana: [''],

    zoZaduVyska: [''],
    zoZaduSirka: [''],
    zPravaVyska: [''],
    zPravaSirka: [''],
    zLavaVyska: [''],
    zLavaSirka: [''],
    zHoraVyska: [''],
    zHoraSirka: [''],


    fromBack: true,
    fromRight: false,
    fromLeft: false,
    fromUp: false,
    pohyblivaNakHrana: false,


  });

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private fb: FormBuilder, private privesService: PrivesService, public dialogRef: MatDialogRef<NewPrivesComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private dataServce: DataService, private snackBar: MatSnackBar) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    if (this.data){
      this.privesForm.controls.ecv.setValue(this.data.ecv);
      this.privesForm.controls.autoVyska.setValue(this.data.carSize[0]);
      this.privesForm.controls.autoDlzka.setValue(this.data.carSize[2]);
      this.privesForm.controls.autoSirka.setValue(this.data.carSize[1]);
      this.privesForm.controls.priestorVyska.setValue(this.data.sizePriestoru[0]);
      this.privesForm.controls.priestorDlzka.setValue(this.data.sizePriestoru[2]);
      this.privesForm.controls.priestorSirka.setValue(this.data.sizePriestoru[1]);
      this.privesForm.controls.vahaVozidlo.setValue(this.data.vaha);
      this.privesForm.controls.nosnost.setValue(this.data.nosnost);
      this.privesForm.controls.vyskaHrany.setValue(this.data.nakladaciaHrana[0]);

      if (this.data.nakladaciaHrana.length > 1){
        this.privesForm.controls.minHrana.setValue(this.data.nakladaciaHrana[0]);
        this.privesForm.controls.maxHrana.setValue(this.data.nakladaciaHrana[1]);
        this.privesForm.controls.pohyblivaNakHrana.setValue(true);
      }


      this.privesForm.controls.zoZaduVyska.setValue(this.data.nakladaciPriestorZoZadu[0]);
      this.privesForm.controls.zoZaduSirka.setValue(this.data.nakladaciPriestorZoZadu[1]);
      this.privesForm.controls.zPravaVyska.setValue(this.data.nakladaciPriestorZPrava[0]);
      this.privesForm.controls.zPravaSirka.setValue(this.data.nakladaciPriestorZPrava[1]);
      this.privesForm.controls.zLavaVyska.setValue(this.data.nakladaciPriestorZLava[0]);
      this.privesForm.controls.zLavaSirka.setValue(this.data.nakladaciPriestorZLava[1]);
      this.privesForm.controls.zHoraVyska.setValue(this.data.nakladaciPriestorZVrchu[0]);
      this.privesForm.controls.zHoraSirka.setValue(this.data.nakladaciPriestorZVrchu[1]);



      //
      // this.privesForm.controls.minTeplota.setValue(this.data.minTeplota);
      // this.privesForm.controls.maxTeplota.setValue(this.data.maxTeplota);
      // if (this.data.minTeplota){
      //   this.privesForm.controls.teplota.setValue(true);
      // }
      // this.privesForm.controls.adr.setValue(this.data.adr);
      // this.privesForm.controls.ruka.setValue(this.data.ruka);

      if (this.data.nakladaciPriestorZLava[0] !== ''){
        this.privesForm.controls.fromLeft.setValue(true);
      }
      if (this.data.nakladaciPriestorZPrava[0] !== ''){
        this.privesForm.controls.fromRight.setValue(true);
      }
      if (this.data.nakladaciPriestorZoZadu[0] !== ''){
        this.privesForm.controls.fromBack.setValue(true);
      }
      if (this.data.nakladaciPriestorZVrchu[0] !== ''){
        this.privesForm.controls.fromUp.setValue(true);
      }
      this.privesForm.controls.ecv.disable();
    }
  }

  closeDialog(){
    this.dialogRef.close();
  }

  savePrives(){
    console.log(this.assignToPrives());
    this.privesService.getPrivesByEcv(this.assignToPrives().ecv).pipe(take(1)).subscribe(car => {
      console.log(car)
      if (car.length == 0){
        this.privesService.createPrives(this.assignToPrives());
        this.dialogRef.close();
        return;
      }else{
        this.snackBar.open('Vložené ECV sa už nachádza v databáze', 'Ok', {
          duration: 5000
        });
        return;
      }

    })
    //
  }

  assignToPrives(): Prives {
    var createdBy;

    if (this.dataServce.getDispecer().createdBy !== 'master'){
      createdBy = this.dataServce.getDispecer().createdBy;
    }
    else {
      createdBy = this.dataServce.getDispecer().id;
    }
    var rozmeryVozidla = [
      this.privesForm.get('autoVyska').value ,
      this.privesForm.get('autoSirka').value,
      this.privesForm.get('autoDlzka').value];

    var rozmeryPriestoru= [
      this.privesForm.get('priestorVyska').value ,
      this.privesForm.get('priestorSirka').value,
      this.privesForm.get('priestorDlzka').value];

    var rozmeryNaklZLava= [
      this.privesForm.get('zLavaVyska').value ,
      this.privesForm.get('zLavaSirka').value];

    var rozmeryNaklZPrava= [
      this.privesForm.get('zPravaVyska').value ,
      this.privesForm.get('zPravaSirka').value];

    var rozmeryNaklZVrchu= [
      this.privesForm.get('zHoraVyska').value ,
      this.privesForm.get('zHoraSirka').value];

    var rozmeryNaklZoZadu= [
      this.privesForm.get('zoZaduVyska').value ,
      this.privesForm.get('zoZaduSirka').value];

    var nakladaciaHrana = []
    if (!this.privesForm.get('pohyblivaNakHrana').value){
      nakladaciaHrana.push(this.privesForm.get('vyskaHrany').value)

    }else{
      nakladaciaHrana.push(this.privesForm.get('minHrana').value)
      nakladaciaHrana.push(this.privesForm.get('maxHrana').value)
    }


    return {
      ecv: this.privesForm.get('ecv').value,
      createdBy: createdBy,
      carSize: rozmeryVozidla,
      sizePriestoru: rozmeryPriestoru,


      nakladaciPriestorZLava: rozmeryNaklZLava,
      nakladaciPriestorZPrava: rozmeryNaklZPrava,
      nakladaciPriestorZVrchu: rozmeryNaklZVrchu,
      nakladaciPriestorZoZadu: rozmeryNaklZoZadu,
      vaha: this.privesForm.get('vahaVozidlo').value,
      nosnost: this.privesForm.get('nosnost').value,
      nakladaciaHrana: nakladaciaHrana,
    };
  }

  updatePrives(){
    this.privesService.updatePrives(this.assignToPrives(), this.data.id);
    this.dialogRef.close();
    return;
  }

}


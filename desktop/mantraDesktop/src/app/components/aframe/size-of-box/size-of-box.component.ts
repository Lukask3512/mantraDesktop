import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-size-of-box',
  templateUrl: './size-of-box.component.html',
  styleUrls: ['./size-of-box.component.scss']
})
export class SizeOfBoxComponent implements OnInit {

  public innerWidth: any;
  constructor(private translation: TranslateService) { }

  @ViewChild('container') elWrapper: ElementRef;
  ngOnInit(): void {
    this.getName();
  }

  getName(){
    this.translation.onLangChange.subscribe((event) => {
      document.getElementById('texttiik2').setAttribute('value', this.translation.instant('AFRAME.velkost'));
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth / 150;
    const velkostElementu = this.elWrapper.nativeElement.offsetWidth / 100;
    console.log(velkostElementu);
    document.getElementById('texttiik2').setAttribute('width', String((velkostElementu)));
  }
}

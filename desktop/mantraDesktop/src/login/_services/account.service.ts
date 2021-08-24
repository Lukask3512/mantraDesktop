import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { User } from 'src/login/_models/user';
import Route from '../../app/models/Route';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private firebaseAuth: AngularFireAuth,
    private _snackBar: MatSnackBar
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }


  signup(email: string, password: string) {
   return new Promise((resolve => {
     this.firebaseAuth
       .createUserWithEmailAndPassword(email, password)
       .then(value => {
         console.log('Success!', value);
         resolve(false);
       })
       .catch(err => {
         resolve(true);
         console.log('Something went wrong:', err.message);
       });
   }));
  }

  login(email: string, password: string): Subject<any> {
    let user = new Subject();
    this.firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then(value => {
        // console.log('Nice, it worked!');
        // console.log(value);
        user.next(value);
      })
      .catch(err => {
        // console.log('Something went wrong:',err.message);
        this.openSnackBar('Nespravne heslo', 'Ok');
        user.next(false);
      });
    return user;
  }

  passwordReset(email) {
    this.firebaseAuth.sendPasswordResetEmail(email)
      .then( resp => console.log('sent!') )
      .catch( error => console.log('failed to send', error) );
  }

  logout() {
    this.firebaseAuth.signOut();
  }

  openSnackBar(message: string, action: string) {
    const snackBarRef = this._snackBar.open(message, action, {
      duration: 5000
    });
  }
}

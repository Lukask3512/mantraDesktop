import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }

  sendMessage(body) {
    const headesrs = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post('https://stormy-island-78166.herokuapp.com/email', body, headesrs);
    // return this.http.post('http://localhost:3000/email', body, headesrs);
      }

}


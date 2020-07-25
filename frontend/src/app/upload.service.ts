import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  serverUrl: string = "http://localhost:5000/upload"

  private message = new BehaviorSubject(null)
  sharedMessage = this.message.asObservable()

  constructor(private httpClient: HttpClient) { }

  public sendFormData(formData){
    return this.httpClient.post<any>(this.serverUrl, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  public nextMessage(message: any){
    this.message.next(message)
  }
}

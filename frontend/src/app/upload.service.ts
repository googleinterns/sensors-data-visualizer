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
    // this.message.next(message)

    if(message){
      var samples = []

      console.log("Upload Service msg: ", message)
      for(var i in message){
        samples.push(JSON.parse(message[i]))
      }

      // console.log("Upload Service msg: " , message.length)
      // message = JSON.parse(message[0])
      // console.log("Upload Service msg: " , message)

      // for(var i in message){
      //   console.log(i)
      //   //samples.push(JSON.parse(this.message[i]))
      // }

      this.message.next(samples)
    }
  }
}

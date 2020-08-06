import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdManagerService {
  nextID = 0;
  constructor() {}

  public getNextID() {
    this.nextID++;
    return this.nextID;
  }
}

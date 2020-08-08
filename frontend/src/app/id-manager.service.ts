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

  public getIDs(numTraces: number) {
    const ids: number[] = [];
    while (this.nextID < numTraces) {
      ids.push(this.nextID);
      this.nextID++;
    }

    return ids;
  }
}

import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdManagerService {
  constructor() {
    let nextID = 0;
  }
}

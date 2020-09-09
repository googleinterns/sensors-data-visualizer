/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdManagerService {
  nextID = 0;
  constructor() {}

  /**
   * Given some sample, assignIDs will return that sample with an ID for
   * each trace. I.E. trace = [id, [trace data]].
   * @param sample The sample that needs IDs assigned to it.
   */
  public assignIDs(sample) {
    console.log('id man sample', sample);
    sample.timestamp_diffs['id'] = this.nextID++;
    if ('latencies' in sample) {
      sample.latencies['id'] = this.nextID++;
    }
    for (const i in sample.data) {
      sample.data[i]['id'] = this.nextID++;
    }
    return sample;
  }

  /**
   * TODO integrate with stats data.
   * @param trace The data trace to be assigned an ID
   */
  public assignSingleID(trace) {
    return (trace['id'] = this.nextID++);
  }
}

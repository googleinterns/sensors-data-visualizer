/*Copyright 2020 Google LLC

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
   * Given some sample, assignIDs will return that sample with an ID
   * prepended to each individual trace.
   * @param sample The sample that needs IDs assigned to it.
   */
  public assignIDs(sample) {
    const ids = this.allocateIDs(sample.num_traces);
    sample.timestamp_diffs[0] = ids.pop();
    if ('latencies' in sample) {
      sample.latencies[0] = ids.pop();
    }
    for (const i in sample.data) {
      sample.data[i][0] = ids.pop();
    }
    return sample;
  }

  /**
   * Returns a list of ids that can be assigned to new data traces.
   * IDs will not be reused since they are simply unique identifiers.
   * @param numTraces The number of traces that need ids.
   */
  private allocateIDs(numTraces: number) {
    const ids: number[] = [];
    while (ids.length <= numTraces) {
      ids.push(this.nextID);
      this.nextID++;
    }
    return ids;
  }
}

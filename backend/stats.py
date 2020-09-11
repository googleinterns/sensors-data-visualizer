"""
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import numpy as np
import pandas as pd

def compute_running_avg(trace, period=100):
    """Computes the running average of a single data trace.

    Attributes:
        trace: The Python list data trace to compute averages for.
        period: The size of the window of previous data points that are
            used in the moving average computation.

    Returns: Python list containing the running average at each point.
    """
    n = len(trace)
    if period > n:
        period = n

    avgs = pd.Series(trace).rolling(period, min_periods=1).mean()
    return avgs.to_list()

def compute_stdev(trace, avgs, period=100):
    """Computes the standard deviation of a single data trace.

    Attributes:
        trace: The Python list data trace to compute stdev for.
        avgs: The previously computed averages for the same trace, used
            in the computation of the first period-1 standard deviations.
        period: The size of the window of previous data points that are
            used in the standard deviation computation.

    Returns: Python list containing the standard deviation at each point.
    """
    n = len(trace)
    if period > n:
        period = n

    stdevs = pd.Series(trace).rolling(period, min_periods=1).std()
    stdevs[0] = 0
    return stdevs.to_list()

from sklearn.metrics.metrics import mean_squared_error
from sklearn.metrics.pairwise import manhattan_distances
import numpy as np

def mean_absolute_error(x, y):
    vector = manhattan_distances(x, y)
    summation = np.sum(vector)      
    mae = summation / y.shape[0]
    
    return mae

def root_mean_squared_error(x, y):
    mse = mean_squared_error(x, y)
    rmse = np.sqrt(mse)
    return rmse
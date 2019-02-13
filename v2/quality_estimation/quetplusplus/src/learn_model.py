#!/usr/bin/env python

from evaluation_measures import root_mean_squared_error, mean_absolute_error
from sklearn.grid_search import GridSearchCV
from sklearn.linear_model.coordinate_descent import LassoCV
from sklearn.linear_model.least_angle import LassoLarsCV, LassoLars
from sklearn.svm.classes import SVR, SVC
from sklearn_utils import scale_datasets, open_datasets, assert_number, assert_string
import numpy as np
import sys
import yaml

SCORES = [
    ('mae', mean_absolute_error),
    ('rmse', root_mean_squared_error)
]

def set_optimization_params(opt):
    params = {}
    for key, item in opt.items():
        # checks if the item is a list with numbers (ignores cv and n_jobs params)
        if isinstance(item, list) and (len(item) == 3) and assert_number(item):
            # create linear space for each parameter to be tuned
            params[key] = np.linspace(item[0], item[1], num=item[2], endpoint=True)
            
        elif isinstance(item, list) and assert_string(item):
            print key, item
            params[key] = item

    return params


def optimize_model(estimator, X_train, y_train, params, folds, verbose, n_jobs):
    clf = None
    for score_name, score_func in SCORES:
        print("Tuning hyper-parameters for %s" % score_name)
        
        clf = GridSearchCV(estimator, params, loss_func=score_func, 
                           cv=folds, verbose=verbose, n_jobs=n_jobs)
        
        clf.fit(X_train, y_train)
        
        print("Best parameters set found on development set:")
        print(clf.best_params_)
        
    return clf.best_estimator_


def set_learning_method(config, X_train, y_train):
    """
    Instantiates the sklearn's class corresponding to the value set in the 
    configuration file for running the learning method.
    
    @param config: configuration object
    @return: an estimator with fit() and predict() methods
    """
    estimator = None
    
    learning_cfg = config.get("learning", None)
    if learning_cfg:
        p = learning_cfg.get("parameters", None)
        o = learning_cfg.get("optimize", None)
        
        method_name = learning_cfg.get("method", None)
        if method_name == "SVR":
            if o:
                tune_params = set_optimization_params(o)
                estimator = optimize_model(SVR(), X_train, y_train, 
                                          tune_params, 
                                          o.get("cv", 5),
                                          o.get("verbose", True),
                                          o.get("n_jobs", 1))
                
            elif p:
                estimator = SVR(C=p.get("C", 10),
                                epsilon=p.get('epsilon', 0.01),
                                kernel=p.get('kernel', 'rbf'),
                                degree=p.get('degree', 3),
                                gamma=p.get('gamma', 0.0034),
                                tol=p.get('tol', 1e-3),
                                verbose=False)
            else:
                estimator = SVR()
        
        elif method_name == "SVC":
            if o:
                tune_params = set_optimization_params(o)
                estimator = optimize_model(SVC(), X_train, y_train,
                                           tune_params,
                                           o.get('cv', 5),
                                           o.get('verbose', True),
                                           o.get('n_jobs', 1))
                
            elif p:
                estimator = SVC(C=p.get('C', 1.0),
                                kernel=p.get('kernel', 'rbf'), 
                                degree=p.get('degree', 3),
                                gamma=p.get('gamma', 0.0),
                                coef0=p.get('coef0', 0.0),
                                tol=p.get('tol', 1e-3),
                                verbose=p.get('verbose', False))
            else:
                estimator = SVC()
                    
        elif method_name == "LassoCV":
            if p:
                estimator = LassoCV(eps=p.get('eps', 1e-3),
                                    n_alphas=p.get('n_alphas', 100),
                                    normalize=p.get('normalize', False),
                                    precompute=p.get('precompute', 'auto'),
                                    max_iter=p.get('max_iter', 1000),
                                    tol=p.get('tol', 1e-4),
                                    cv=p.get('cv', 10),
                                    verbose=False)
            else:
                estimator = LassoCV()
        
        elif method_name == "LassoLars":
            if o:
                tune_params = set_optimization_params(o)
                estimator = optimize_model(LassoLars(), X_train, y_train, 
                                          tune_params,
                                          o.get("cv", 5),
                                          o.get("verbose", True),
                                          o.get("n_jobs", 1))
                
            if p:
                estimator = LassoLars(alpha=p.get('alpha', 1.0),
                                      fit_intercept=p.get('fit_intercept', True),
                                      verbose=p.get('verbose', False),
                                      normalize=p.get('normalize', True),
                                      max_iter=p.get('max_iter', 500),
                                      fit_path=p.get('fit_path', True))
            else:
                estimator = LassoLars()
        
        elif method_name == "LassoLarsCV":
            if p:
                estimator = LassoLarsCV(max_iter=p.get('max_iter', 500),
                                        normalize=p.get('normalize', True),
                                        max_n_alphas=p.get('max_n_alphas', 1000),
                                        n_jobs=p.get('n_jobs', 1),
                                        cv=p.get('cv', 10),
                                        verbose=False)
            else:
                estimator = LassoLarsCV()
                
    return estimator


def fit_predict(config, X_train, y_train, X_test=None, y_test=None):
    '''
    Uses the configuration dictionary settings to train a model using the
    specified training algorithm. If set, also evaluates the trained model 
    in a test set. Additionally, performs feature selection and model parameters
    optimization.
    
    @param config: the configuration dictionary obtained parsing the 
    configuration file.
    @param X_train: the np.array object for the matrix containing the feature
    values for each instance in the training set.
    @param y_train: the np.array object for the response values of each instance
    in the training set.
    @param X_test: the np.array object for the matrix containing the feature
    values for each instance in the test set. Default is None.
    @param y_test: the np.array object for the response values of each instance
    in the test set. Default is None.
    '''    
    
    # sets learning algorithm and runs it over the training data
    estimator = set_learning_method(config, X_train, y_train)
    print("Running learning algorithm %s" % str(estimator))
    estimator.fit(X_train, y_train)
    
    if (X_test is not None) and (y_test is not None):
        print("Predicting unseen data using the trained model...")
        y_hat = estimator.predict(X_test)
        print("Evaluating prediction on the test set...")
        for scorer_name, scorer_func in SCORES:
            v = scorer_func(y_test, y_hat)
            print("%s = %s" % (scorer_name, v))
        with open("predicted.csv", 'w') as _fout:
            for _x,  _y in zip(y_test, y_hat):
                _fout.write(str(_x)+'\t'+str(_y)+'\n')

def run(config):
    '''
    Runs the main code of the program. Checks for mandatory parameters, opens
    input files and performs the learning steps.
    '''

    # check if the mandatory parameters are set in the config file
    x_train_path = config.get("x_train")
    y_train_path = config.get("y_train")
    learning = config.get("learning")
    assert x_train_path
    assert y_train_path
    assert learning

    # checks for the optional parameters
    x_test_path = config.get("x_test", None)
    y_test_path = config.get("y_test", None)

    separator = config.get("separator", '\t')
    labels_path = config.get("labels", None)
        
    scale = config.get("scale", True)

    print("Opening input files ...")
    print("X_train: %s" % x_train_path)
    print("y_train: %s" % y_train_path)
    print("X_test: %s" % x_test_path)
    print("y_test_path: %s" % y_test_path)

    # open feature and response files    
    X_train, y_train, X_test, y_test, labels = \
    open_datasets(x_train_path, y_train_path, x_test_path,
                  y_test_path, separator, labels_path)

    if scale:
        # preprocess and execute mean removal
        X_train, X_test = scale_datasets(X_train, X_test)

    # fits training data and predicts the test set using the trained model
    y_hat = fit_predict(config, X_train, y_train, X_test, y_test)
    
def main():
    try:
        cfg_path = sys.argv[1]
            
        # opens the config file
        config = None
        with open(cfg_path, "r") as cfg_file:
            config = yaml.load(cfg_file.read())
         
        run(config)
        
    except KeyboardInterrupt:
        ### handle keyboard interrupt ###
        return -1

if __name__ == "__main__":
    sys.exit(main())
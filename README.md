
## Overview

This is the logic associated with a Google Earth Engine (GEE) Medium blog post. As part of the blog post we included a forest structure mapping demonstration.  

The Jupyter notebook handles the machine learning training workflow. It uses Optuna for hyperparameter optimization to find the best ElasticNet regression parameters through spatial cross-validation. The model learns to predict forest canopy height from the 64 AlphaEarth embedding features. After tuning, it trains a final model on the entire dataset. The script yields the the intercept and 64 coefficients that will be used for prediction in GEE. 


The GEE JavaScript code applies these trained coefficients to actually generate the forest height map. Forests are isolated using a forest/non-forest mask dervied from the 2024 NLCD landcover dataset (classes 41, 42, 43). The script then implements the linear model by multiplying each of the 64 embedding bands by its corresponding coefficient, summing the results, and adding the intercept to get predicted height in meters. Finally, it exports the height map as an Earth Engine asset.


## Create Environment

Install the conda enviornment
```bash
conda env create -f environment.yml
```

Activate the newly created Conda nvironment
```bash
conda activate gee_demo
```

Register the Conda kernel
```bash
python -m ipykernel install --user --name=gee_demo --display-name="Python (GEE demo)"
```

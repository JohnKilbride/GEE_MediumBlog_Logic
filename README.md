<p align="center">
  <img src="figures/Cover-Image.png" alt="Header Image" width="75%">
</p>

## Overview

This repo contains the logic used in the Google Earth and Google Earth Engine (GEE) Medium blog post: [Improved forest carbon estimation with AlphaEarth Foundations and Airborne LiDAR data](https://medium.com/google-earth/improved-forest-carbon-estimation-with-alphaearth-foundations-and-airborne-lidar-data-af2d93e94c55)

This repo demonstrates how to use Google Earth Engine and the AlphaEarth Foundations geospatial embedding fields to generate canopy height models. We derive our reference canopy height measurements from aerial LiDAR aggregated from the [USGS 3DEP program](https://www.usgs.gov/3d-elevation-program). Canopy height was modeled using [elastic net regression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.ElasticNet.html).  

The demonstration has three steps: 
1. Constructing a canopy height modeling dataset in Google Earth Engine. Here, we sample the canopy height and the spatially/temporally coincident embedding fields values.
2. Fitting an elastic net regression model to estimate canopy height. We use the Optuna package to efficiently search the elastic net hyperparameters. 
3. Applying the elastic net model in Google Earth Engine to map canopy height.
 
Steps 1 and 3 are performed using the Google Earth Engine JavaScript playground. Step 2 is performed locally using several standard Python data science libraries (e.g., SciKit-Learn). Below, we provide instructions for configuring a conda environment with the necessary packages.

## Configure your conda environment

Install the conda environment:
```bash
conda env create -f environment.yml
```
### Activate Environment
```bash
conda activate gee_demo
```
### Register Kernel
```bash
python -m ipykernel install --user --name=gee_demo --display-name="Python (GEE demo)"
```

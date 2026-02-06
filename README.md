<!-- Replace with your header image URL -->
![Header Image](figures/Cover-Image.png)


## Overview

This repo contains the logic used in the Google Earth and Google Earth Engine (GEE) Medium blog post: [Improved forest carbon estimation with AlphaEarth Foundations and Airborne LiDAR data](https://medium.com/google-earth/improved-forest-carbon-estimation-with-alphaearth-foundations-and-airborne-lidar-data-af2d93e94c55)

This repo demonstrates how to use Google Earth Engine and the AlphaEarth Foundations geospatial embedding fields to create generate canopy height models. 

This repo contains three primary steps: 
1. Constructing a modeling dataset using aerial lidar data and the geospatial embedding fields
2. Fitting an elastic net regression model to model canopy height
3. Applying the elastic net model in Google Earth Engine


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

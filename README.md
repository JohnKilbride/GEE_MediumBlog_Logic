<!-- Replace with your header image URL -->
![Header Image](figures/Cover-Image.png)

# Forest Canopy Height Mapping with Google Earth Engine

## Overview

This repository contains the code for a Google Earth Engine (GEE) Medium blog post demonstrating forest structure mapping using machine learning.

### Components

**Jupyter Notebook**
- Implements the machine learning training workflow
- Uses Optuna for hyperparameter optimization of ElasticNet regression
- Employs spatial cross-validation to find optimal parameters
- Predicts forest canopy height from 64 AlphaEarth embedding features
- Outputs intercept and 64 coefficients for use in GEE

**GEE JavaScript Code**
- Applies trained model coefficients to generate forest height maps
- Isolates forests using a forest/non-forest mask derived from 2024 NLCD landcover (classes 41, 42, 43)
- Implements linear prediction: multiplies each of the 64 embedding bands by its coefficient, sums results, and adds intercept
- Exports final height map (in meters) as an Earth Engine asset

## Installation

### Create Environment

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


## Overview



## Create Environment

Install the conda enviornment
```bash
conda env create -f environment.yml
```

Activate the newly created Conda nvironment
```bash
conda activate GEE_demo
```

Register the Conda kernel
```bash
python -m ipykernel install --user --name=GEE_demo --display-name="Python (GEE demo)"
```

# An open dataset for land-use classification in India for Sentinel-2
## Project Overview
In this project, we have addressed various challenges in land cover classification, which includes seasonal effects and temporal inconsistencies in prediction results. For this task, we created a pixel level dataset for India with the help of OSM data. We have created State-of-the-art pixel-level training dataset of 3 lakh points (for 30-meter resolution) capturing vast variation of demography across India. This unique dataset is constructed using OSM and visual interpretation to classify pixels into four classes- greenery, water, barren land, and built-up. Further, we created a rule-based technique on our classifier prediction to remove season effects. The temporal correction was done to remove the problem of temporal inconsistencies across years. Both the datasets and associated scripts to run classifiers are made available for open use.

## Dataset

The training dataset in the folder named IndiaSat_dataset.zip

## Scripts

The following scripts are used for the project.
* **download_sentinel.js**  -  To download the sentinel images using GEE (Google Earth Engine). 
* **validation_accuray.js**  -  To calculate the k-fold validation accuracy of the dataset using GEE (Google Earth Engine).
* **monthly_prediction.js**  -  To obtain Monthly classification results of a given area using GEE (Google Earth Engine).
* **final_yearly_prediction.ipynb**  -  To calculate the final prediction (land-use classification prediction) of a given area using the monthly prediction results.
*    **temporal_correction.py**  -  To do the temporal correction over yearly predictions of a given area.

## Prerequisites
* Google Earth Engine(GEE) account to run the google earth engine scripts for downloading and images and run the classifier
* Following python libraries to run the python scripts
    * PIL (Pillow)
    * scipy
    * numpy
    * pandas






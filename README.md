# An open dataset for land-use classification in India for Sentinel-2
## Project Overview
In this project, we have addressed various challenges in land cover classification, which includes seasonal effects and temporal inconsistencies in prediction results. For this task, we created a pixel level dataset for India with the help of OSM data. We have created State-of-the-art pixel-level training dataset of 3 lakh points (for 30-meter resolution) capturing vast variation of demography across India. This unique dataset is constructed using OSM and visual interpretation to classify pixels into four classes- greenery, water, barren land, and built-up. Further, we created a rule-based technique on our classifier prediction to remove season effects. The temporal correction was done to remove the problem of temporal inconsistencies across years. Both the datasets and associated scripts to run classifiers are made available for open use.

## Dataset

The training dataset in the folder named IndiaSat_dataset.zip

## Methodology for pixel-level-classification 
![alt text](images/sentinel-2_classification.png?raw=true)

## Step by step procedure to do classification of a selected area.
* **Step 1  : Run the GEE script**

Run the corresponding GEE script for monthly classification. (monthly_prediction.js).
The output of the GEE script will be more than one images(max 12(one for each month) or less than 12(if cloud-free image of some months are not available) ) for your area of interest (selected area) for each year.

> *Note - You should have the shapefile of that particular area or you can draw the area by hand in GEE.
Someone, who is new to Google earth engine, can find all the help from this [place](https://developers.google.com/earth-engine/getstarted)*

* **Step 2 : Compute final classification result for you area for each year**

Use the *script final_year_prediction.ipynb* to calculate the final prediction (land-use classification prediction) of your selected area using the monthly prediction results.

* **Step 3 : Perform temporal correction (If you are doing classification for more than two years )**

Use the script *temporal_correction.py* to do temporal correction over yearly prediction of the selected area.

## Shapefiles used as Google Earth Engine Assets
The following shapefiles were used to download the images, training the classifier and for prediction of landuse in various Indian dostrcits.
* **India_Boundary.zip / India_Boundary.geojson** - Boundary for India.
* **Indian_States.zip / Indian_States.geojson** - Boundaries for different Indian States.
* **india_district_boundaries.zip** - Boundaries for all Indian districts.
* **India_Assembly.zip / India_Assembly.geojson** - Boundaries for Indian constituency assemblies. 

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






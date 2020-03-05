# An open dataset for landuse classification in India for Sentinel-2
## Project Overview
In this paper, we have addressed various challenges in land cover classification, which includes seasonal effects and temporal inconsistencies in prediction results. For this task, we created a pixel level dataset for India with the help of OSM data. We have created State-of-the-art pixel-level training dataset of 3 lakh points (for 30-meter resolution) capturing vast variation of demography across India. This unique dataset is constructed using OSM and visual interpretation to classify pixels into four classes- greenery, water, barren land, and built-up. Further, we created a rule-based technique on our classifier prediction to remove season effects. The temporal correction was done to remove the problem of temporal inconsistencies across years. Both the datasets and associated scripts to  run classifiers is made available for open use.

## Dataset

The training daatset in in th folder named training_osm_india.zip

## Scripts

The following scripts are used for the project.
* **downloadSentinel.js**  -  To download the sentinel images using GEE (google Earth Engine). 
*  **validation_accuray.js**  -  TTo calculate the k-fold validation accuracy of dataset using GEE (Google Earth Engine).
*   **monthly_prediction.js**  -  To obtain Monthly classification results of a given area using GEE (google Earth Engine).
*    **final_prediction.ipynb**  -  To calculate final prediction (landuse classification prediction) of given area using the monthly prediction results.
*    **temporal_correction.ipynb**  -  To do the temporal correction over yearly predictions of a given area.

## Prerequisites
* Google Earth Engine(GEE) acount to run the google earth engine scripts for downloading images and to run the classifier
* Foloowing python libraries to run the python scripts
    * PIL (Pillow)
    * scipy
    * numpy
    * pandas


## Authors

* **Hari Om Ahlawat** - hariomahlawat@gmail.com
* **Prashant Kumar**
* **Mayank Jain**
* **Chahat Bansal**
.

## License

This project is licensed under the MIT License



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

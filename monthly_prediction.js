// Input imagery is a cloud-free Sentinel .
function maskS2clouds(image) {
  var qa = image.select('QA60');

 // Bits 10 and 11 are clouds and cirrus, respectively.
 var cloudBitMask = 1 << 10;
 var cirrusBitMask = 1 << 11;

 // Both flags should be set to zero, indicating clear conditions.
 var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

 return image.updateMask(mask);
}

//-------------------------------------------------------------------------


var year_list = ['2016','2017','2018','2019'];

var month_list = ['01','02','03','04','05','06','07','08','09','10','11','12','year_median']

var district_list =['Delhi','Mumbai','Hyderabad','Bangalore','Chennai','Chandigarh','Gurgaon','Kolkata'];
//var district_list =['Delhi'];

var bands = ['B1','B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B10', 'B11','B12','B8A'];

// Make sure that India_Boundary shapefiles are uploaded as assets in GEE and then change the path of that asset accordingly.
var india = ee.FeatureCollection('users/chahatresearch/India_Boundary')
    .geometry();

//The image for India is selected with less than 1 % cloud. This image is for training purpose.  
var india_image = ee.ImageCollection('COPERNICUS/S2') // searches all sentinel 2 imagery pixels...
  .filterBounds(india)
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 1)) // ...filters on the metadata for pixels less than 1% cloud
  .filterDate('2019-01-1' ,'2019-05-30') //... chooses only pixels between the dates you define here
  .sort('CLOUD_COVER')
  .map(maskS2clouds)
  .select(bands)  
  .median()
  

var ft = ee.FeatureCollection('users/chahatresearch/IndiaSat_dataset');

//Once a consolidated image of India is fetched, the chosen areas of groundtruth are fetched to train a random forest classifier
var training = india_image.sampleRegions(ft,['class'],30); //['class'] refers to column name (in Indiasat datsset shapefiles) containing labels against each area. 30 denotes resolution.
var trained = ee.Classifier.randomForest(10).train(training, 'class', bands);


for (var i in district_list) {
  var district_name = district_list[i];
  for (var j in year_list)
  {
    for (var k in month_list)
    {  
      var month = month_list[k]
      var start_month;
      var end_month;
      var start_date = '01';
      var end_date;
      
      if (month=='02')
      {
        start_month=month;
        end_date = '28';
        end_month=month;
      }
      else if (month=='year_median')
      {
        start_month = '01';
        end_date = '31';
        end_month = '12';
        
      }
      else
      {
        start_month=month;
        end_date = '30';
        end_month=month;
      }
      
      var year = year_list[j];
      
      /*
      Make sure that india_district_boundaries shapefiles are uploaded as assets in GEE 
      and then change the path of that asset accordingly.
      Any region can be used in place of district. You need to have the shpefile of that region uploaded as assests in GEE and
      then you need to change the path below accordingly.
      */
      var district = ee.FeatureCollection('users/chahatresearch/india_district_boundaries')
      .filter(ee.Filter.eq('Name',district_name)); 
      
      var district_image = ee.ImageCollection('COPERNICUS/S2')
      .filterBounds(district)
      .filterDate(year + '-'+ start_month +'-'+ start_date,  year + '-'+ end_month +'-'+ end_date)
      .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10))
      .sort('CLOUD_COVER')
      .map(maskS2clouds)
      .select(bands)
      .median();  
     
      print(district_image);
      var input = district_image;
      
      input = input.clip(district);
      input = input.classify(trained);

      input = input.expression('LC',{'LC':input.select('classification')});
     
      var str = district_name.replace(/\s/g,'');	//remove spaces in the district name for naming the downloaded image
      var misc = '_30mtr_'+month 
      
      Export.image.toDrive({
      image: input.clip(district),
      description: 'Classification_'+str + '_' + year+misc,
      maxPixels: 499295920080,
      scale: 30,
      folder: 'Classification_'+str,
      region: district.geometry().bounds()
      });
      
    }  
  }
 
}

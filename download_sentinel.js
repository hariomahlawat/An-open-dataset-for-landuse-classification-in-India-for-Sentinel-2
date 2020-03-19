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


var year_list = ['2019'];

//var state_list =['Madhya Pradesh','Maharashtra','Haryana','Punjab','Karnataka','Jharkhand','Andhra Pradesh','Telangana','Chhattisgarh','Uttar Pradesh'];
var state_list = ['Uttarakhand','Tripura','Tamil Nadu','Sikkim','Kerala','Gujarat','Bihar','Odisha','Rajasthan','Manipur','Mizoram','Assam']




//Loading India image, the extracting data for Haryana (a state in India) and then subsequently Ambala (a district in Haryana)
var bands = ['B4', 'B3', 'B2'];
var india = ee.FeatureCollection('ft:1UDdgOCf8DoRJ9bVm-UVbR6CqxtkJToLQjTFd0r0Z','geometry')
    .filter(ee.Filter.eq('Name','India'))
    .geometry();
    

for (var i in state_list) {
  
  var state_name = state_list[i];
  // shapefiles of all states are loaded in assests. You need to upload your shapefiles in assest and then change the path accordingly
  var state = ee.FeatureCollection('users/hariomahlawat/Indian_States') 
    .filter(ee.Filter.eq('st_nm',state_name)); //'ST_NM' is the state name field in shapefile. It can be different for different shapefiles.
  
    
  for (var j in year_list)
  {
     var year = year_list[j];
     var str = state_name.replace(/\s/g,'');
   
    var state_image =  ee.ImageCollection('COPERNICUS/S2')
    .filterBounds(state)
    .filterDate(year + '-01-01',year + '-05-30')
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 1))
    .sort('CLOUD_COVER')
    .map(maskS2clouds)
    .select(bands)
    .median();  

print(state_image)     
   
    Map.addLayer(state_image.clip(state),{},"State")
   
     
      Export.image.toDrive({
        image: state_image.clip(state),
        description: str + '_' + year+'_sentinel',
        maxPixels: 499295920080,
        scale: 10,
        folder: 'state_images_sentinel_'+str+'_'+year,
        region: state.geometry().bounds()
      });
  }
 
}

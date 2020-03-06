

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


//boundary for India
var india = ee.FeatureCollection('ft:1UDdgOCf8DoRJ9bVm-UVbR6CqxtkJToLQjTFd0r0Z','geometry')
    .filter(ee.Filter.eq('Name','India'))
    .geometry();

// Now select your image for training!

var training_image = ee.ImageCollection('COPERNICUS/S2') // searches all sentinel 2 imagery pixels...
  .filterBounds(india)
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 1)) // ...filters on the metadata for pixels less than 10% cloud
  .filterDate('2019-01-1' ,'2019-05-30') //... chooses only pixels between the dates you define here
  .map(maskS2clouds)
  .median()




function addBands(image){
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var ndbi = image.normalizedDifference(['B11', 'B8']).rename('NDBI');
  return image.addBands(ndvi).addBands(ndbi);
}

training_image = addBands(training_image);

var bands = ['B1','B2', 'B3', 'B4','B5','B6','B7','B8','B10','B11','B12','B8A','NDVI','NDBI'];

//Training feature collection. Imported from assets (Its a shapefile)
var training_fc = ee.FeatureCollection('users/hariomahlawat/training_dataset_india')

// Get the values for all pixels in each polygon in the training.
var training = training_image.sampleRegions({
  collection: training_fc, // Get the sample from the polygons FeatureCollection.
  properties: ['class'], // Keep this list of properties from the polygons.
  scale: 30 // Set the scale to get Sentinel pixels in the polygons.
});

print(training)


//######################### Partition the data into Testing and Training #######################################################

// Optionally, do some accuracy assessment.  Fist, add a column of random uniforms to the training dataset.
var withRandom = training.randomColumn('random');

var fold1 = withRandom.filter(ee.Filter.lt('random',0.2));
var fold2 = withRandom.filter(ee.Filter.lt('random',0.4)).filter(ee.Filter.gt('random',0.2));
var fold3 = withRandom.filter(ee.Filter.lt('random',0.6)).filter(ee.Filter.gt('random',0.4));
var fold4 = withRandom.filter(ee.Filter.lt('random',0.8)).filter(ee.Filter.gt('random',0.6));
var fold5 = withRandom.filter(ee.Filter.gt('random',0.8));




var fold1Size=fold1.size();
print(fold1Size);
var fold2Size=fold2.size();
var fold3Size=fold3.size();
var fold4Size=fold4.size();
var fold5Size=fold5.size();
var mergeFold1=fold2.merge(fold3).merge(fold4).merge(fold5);
var mergeFold2=fold1.merge(fold3).merge(fold4).merge(fold5);
var mergeFold3=fold2.merge(fold1).merge(fold4).merge(fold5);
var mergeFold4=fold2.merge(fold3).merge(fold1).merge(fold5);
var mergeFold5=fold2.merge(fold3).merge(fold4).merge(fold1);


print(fold2Size);
print(fold3Size);
print(fold4Size);
print(fold5Size);


var trainingClassifier1 = ee.Classifier.randomForest(10).train(mergeFold1, 'class', bands);
var validation1 = fold1.classify(trainingClassifier1);
var errorMatrix1 = validation1.errorMatrix('class', 'classification');
var accuracy1=errorMatrix1.accuracy();

var trainingClassifier2 = ee.Classifier.randomForest(10).train(mergeFold2, 'class', bands);
var validation2 = fold2.classify(trainingClassifier2);
var errorMatrix2 = validation2.errorMatrix('class', 'classification');
var accuracy2=errorMatrix2.accuracy();

var trainingClassifier3 = ee.Classifier.randomForest(10).train(mergeFold3, 'class', bands);
var validation3 = fold3.classify(trainingClassifier3);
var errorMatrix3 = validation3.errorMatrix('class', 'classification');
var accuracy3=errorMatrix3.accuracy();

var trainingClassifier4 = ee.Classifier.randomForest(10).train(mergeFold4, 'class', bands);
var validation4 = fold4.classify(trainingClassifier4);
var errorMatrix4 = validation4.errorMatrix('class', 'classification');
var accuracy4=errorMatrix4.accuracy();

var trainingClassifier5 = ee.Classifier.randomForest(10).train(mergeFold5, 'class', bands);
var validation5 = fold5.classify(trainingClassifier5);
var errorMatrix5 = validation5.errorMatrix('class', 'classification');

var accuracy5=errorMatrix5.accuracy();

var avgAccuracy=((accuracy1+accuracy2+accuracy3+accuracy4+accuracy5)/5);
print(avgAccuracy)

var validation= validation1.merge(validation2).merge(validation3).merge(validation4).merge(validation5);



var exportValidationAccuracy = ee.Feature(null, {matrix: validation})
var Average_Accuracy = ee.Feature(null, {matrix: avgAccuracy})

var accuracy5 = ee.Feature(null, {matrix: accuracy5})
var accuracy4 = ee.Feature(null, {matrix: accuracy4})
var accuracy3 = ee.Feature(null, {matrix: accuracy3})
var accuracy2 = ee.Feature(null, {matrix: accuracy2})
var accuracy1 = ee.Feature(null, {matrix: accuracy1})

var exportConfusionMatrix5 = ee.Feature(null, {matrix: errorMatrix5.array()})
var exportConfusionMatrix4 = ee.Feature(null, {matrix: errorMatrix4.array()})
var exportConfusionMatrix3 = ee.Feature(null, {matrix: errorMatrix3.array()})
var exportConfusionMatrix2 = ee.Feature(null, {matrix: errorMatrix2.array()})
var exportConfusionMatrix1 = ee.Feature(null, {matrix: errorMatrix1.array()})


var drive_folder_name = 'Sentinel-kfold-accuracy_21dec_allbands_ndvi_ndbi';

Export.table.toDrive({
collection: ee.FeatureCollection(accuracy5),
  description: 'accuracy5',
  folder: drive_folder_name,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: ee.FeatureCollection(accuracy4),
  description: 'accuracy4',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: ee.FeatureCollection(accuracy3),
  description: 'accuracy3',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: ee.FeatureCollection(accuracy2),
  description: 'accuracy2',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: ee.FeatureCollection(accuracy1),
  description: 'accuracy1',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});

///////////////////////////////////////////////////////////////////////////////////


Export.table.toDrive({
collection: ee.FeatureCollection(exportConfusionMatrix5),
  description: 'exportConfusionMatrix5',
  folder: drive_folder_name,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: ee.FeatureCollection(exportConfusionMatrix4),
  description: 'exportConfusionMatrix4',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: ee.FeatureCollection(exportConfusionMatrix3),
  description: 'exportConfusionMatrix3',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: ee.FeatureCollection(exportConfusionMatrix2),
  description: 'exportConfusionMatrix2',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: ee.FeatureCollection(exportConfusionMatrix1),
  description: 'exportConfusionMatrix1',
  folder : drive_folder_name,
  fileFormat: 'CSV'
});






          
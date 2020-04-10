from PIL import Image
import numpy as np
import pandas as pd
import unittest
import os, sys

# defining integer codes of different land cover classes as used before
Background=0
Green=1
Water=2
Builtup=3
Barrenland=4


'''
Function to find the type of inconsistency in pixel predictions over different years

Input:
a) pixelVals- list of predictions of a particular pixel over different years

Output: The integer code for the type of inconsistency in predicted pixel values
a) 0: no inconsistency
b) 1: all land-cover classes are detected. Atleast one builtup prediction is followed by atleast non-builtup prediction. Pattern-1234 
c) 2: If predictions are a mix of builup, water, and green. Pattern-123
d) 3: If predictions are a mix of builup, water, and barrenland. Pattern-234
e) 4: If predictions are a mix of builup, green, and barrenland. Pattern-134
f) 5: If predictions are a mix of builup, and green. Pattern-13
g) 6: If predictions are a mix of builup, and water. Pattern-23
h) 7: If predictions are a mix of builup, and barrenland. Pattern-34
'''
def Detect_inconsistency_pattern(pixelVals):
    # A pixel detected as builtup all years is consistent
    if all(val == Builtup for val in pixelVals):  
        return 0    

    # A pixel detected as non-builtup all years is consistent
    if not any(val == Builtup for val in pixelVals):  
        return 0    

    # find the first time a pixel was detected as Builtup
    for i in range(len(pixelVals)):
        if pixelVals[i] == Builtup :
            Builtupfirstindex = i
            break

    #If a pixel once predicted as builtup is predicted as builtup for further years, it is consistent
    if all(val == Builtup for val in pixelVals[Builtupfirstindex:]):
        return 0    

    ##### At this point all consistent patterns are determined ##### 
    ##### Now pixelVals holds atleast one builtup prediction followed by non-builup predictions and is therefore inconsistent #####

    # If all land cover classes are detected
    if(Green in pixelVals) and (Water in pixelVals) and (Barrenland in pixelVals):
        return 1   

    # If predictions are a mix of builup, water, and green
    if(Green in pixelVals) and (Water in pixelVals):
        return 2

    # If predictions are a mix of builup, water, and barrenland
    if(Water in pixelVals) and (Barrenland in pixelVals):
        return 3

    # If predictions are a mix of builup, green, and barrenland
    if(Green in pixelVals) and (Barrenland in pixelVals):
        return 4

    # If predictions are a mix of builup, and green
    if(Green in pixelVals):
        return 5

    # If predictions are a mix of builup, and water
    if(Water in pixelVals):
        return 6

    # If predictions are a mix of builup, and barrenland
    if(Barrenland in pixelVals):
        return 7


##### Defining correction methods for different pattern of inconsistencies. #####
##### Method names are determined by type of predictions in the temmporal list (pixelVals) #####

'''
This correction method temporally corrects the predictions that are a mix of all 4 land cover classes
Method: Majority out of green and water is assigned as final prediction for all years
'''
def pattern1234(pixelVals):
    if( pixelVals.count(Green) >= pixelVals.count(Water) ):
        return [Green for i in pixelVals]
    else:
        return [Water for i in pixelVals]

'''
This correction method temporally corrects the predictions that are a mix of Green, Water, and Builtup
Method: Majority out of green and water is assigned as final prediction for all years
'''
def pattern123(pixelVals):
    return pattern1234(pixelVals)

'''
This correction method temporally corrects the predictions that are a mix of Water, Builtup, and Barren land
Method: final prediction for all years is based on the majority occuring class. Tie breaking order is water > barrenland > builtup
'''
def pattern234(pixelVals):
    builtup_count = pixelVals.count(Builtup)
    water_count = pixelVals.count(Water)
    barren_count = pixelVals.count(Barrenland)

    if( water_count >= builtup_count and water_count >= barren_count ):
        return [Water for i in pixelVals]
    if( barren_count >= builtup_count):
        return [Barrenland for i in pixelVals]
    return [Builtup for i in pixelVals]

'''
This correction method temporally corrects the predictions that are a mix of Green, Builtup, and Barren land
Method: final prediction for all years is based on the majority between green and barrenland.
'''
def pattern134(pixelVals):
    if( pixelVals.count(Builtup) + pixelVals.count(Barrenland) <= pixelVals.count(Green)):
        return [Green for i in pixelVals]
    return [Barrenland for i in pixelVals]

'''
This correction method temporally corrects the predictions that are a mix of Green and Builtup
Method: This is solved using spatial context and thus takes the pixel coordinates (i,j) and the entire prediction dataset of all years as input.
'''
def pattern13(pixelVals,i,j,dataset):
    if( pixelVals.count(Builtup) >= pixelVals.count(Green)):
        return [Builtup for i in pixelVals]

    # If green is more than builtup then these areas can be green residential areas or just green altogether
    image_dimensions = dataset[0].shape
    builtup_area_count = 0
    for k in range(len(pixelVals)):
        neighbouring_builtup_pixels = 0
        neighbouring_pixels_count = 0
        for row in range( i-2 , i+3 ):
            if (row < 0) or ( row >= image_dimensions[0]):
                continue
            for col in range( j-2 , j+3 ):
                if (col < 0) or (col >= image_dimensions[1]):
                    continue
                if(dataset[k][row][col] == Background):
                    continue
                neighbouring_pixels_count += 1
                if(dataset[k][row][col] == Builtup):
                    neighbouring_builtup_pixels += 1
        if( neighbouring_builtup_pixels >= 0.5 * neighbouring_pixels_count):
            builtup_area_count += 1

    if( builtup_area_count > 0.5 * len(pixelVals) ):
        return [Builtup for i in pixelVals]
    return [Green for i in pixelVals]
        
'''
This correction method temporally corrects the predictions that are a mix of Water and Builtup
Method: If pixel is predicted as water more than 25% times in all years, it is water, else builtup
'''
def pattern23(pixelVals):
    if( pixelVals.count(Water) <= 0.25 * len(pixelVals)):
        return [Builtup for i in pixelVals]
    else:
        return [Water for i in pixelVals]

'''
This correction method temporally corrects the predictions that are a mix of Builtup and Barrenland
Method: If after a pixel is first detected as builtup, it is detected builtup for more than 50% times for remaining consecutive years, it is builtup in those consecutive years. Else, it is barren land for all the years.
'''
def pattern34(pixelVals):
    for i in range(len(pixelVals)):
        if pixelVals[i] == Builtup :
            Builtupfirstindex = i
            break

    if( pixelVals.count(Builtup) > 0.5 * ( len(pixelVals) - Builtupfirstindex ) ):
        return pixelVals[:Builtupfirstindex] + [Builtup for i in pixelVals[Builtupfirstindex:]]
    return [Barrenland for i in pixelVals]


'''
Driver Code Begins Here !!
'''
# list of districts
districts = ['Bangalore','Chennai','Delhi','Gurgaon','Hyderabad','Kolkata','Mumbai']

for district in districts:
    print (district)
    main_folder = 'Classification_'+district
    
    os.makedirs(main_folder+"/final/temporally_correct_predictions",exist_ok=True)
    years = [16,17, 18,19]
    
    dataset = [ np.array(Image.open(main_folder+'/final/'+district+'_prediction_20'+str(i)+'.png')) for i in years]
    
    # verify all images have same number of background pixels
    backgroundPixels = np.unique(dataset[0],return_counts=True)[1][0] #With [1] access frequency list, with [0] get frequency of background pixels
    
    if not all( np.unique(dataset[k],return_counts = True)[1][0] == backgroundPixels for k in range(len(dataset))):
        print("inconsistency in number of background pixels across years\n")
        raise SystemExit
    
    image_dimensions = dataset[0].shape
    patterns = []

    for i in range(image_dimensions[0]):
        for j in range(image_dimensions[1]):
            if(dataset[0][i][j] == 0):
                continue
            
            pixelVals = [dataset[k][i][j] for k in range(len(dataset))]  #List of a particular pixel value across different years
            
            pattern = Detect_inconsistency_pattern(pixelVals) #Find the patten of inconsistency across different years
            patterns.append(pattern) #This list stores all the inconsistencies in a particular district
            
            # calling relevant inconsistency correction method
            if pattern == 0:
                newPixelVals = pixelVals
            elif pattern == 1:
                newPixelVals = pattern1234(pixelVals)
            elif pattern == 2:
                newPixelVals = pattern123(pixelVals)
            elif pattern == 3:
                newPixelVals = pattern234(pixelVals)
            elif pattern == 4:
                newPixelVals = pattern134(pixelVals)
            elif pattern == 5:
                newPixelVals = pattern13(pixelVals,i,j,dataset)
            elif pattern == 6:
                newPixelVals = pattern23(pixelVals)
            else:
                newPixelVals = pattern34(pixelVals)

            # set corrected values over the dataset
            for k in range(len(newPixelVals)):
                dataset[k][i][j] = newPixelVals[k]

    # finding the percentage of incorrect 
    patterns = np.asarray(patterns)
    counts = np.unique(patterns,return_counts=True)[1]
    correct = counts[0]
    incorrect = sum(counts[1:])
    incorrect_percent = incorrect*100/(correct+incorrect)
    print("Percentage of inconsistencies in ",district," = ",incorrect_percent,"%")
 
    # storing corrected images
    for i in range(len(years)):
            dataset[i] = (Image.fromarray(dataset[i])).convert("L")
            dataset[i].save(main_folder+'/final/temporally_correct_predictions/'+district+'_prediction_20'+str(years[i])+'.png')
	    



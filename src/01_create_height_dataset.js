/**
 * ============================================================================
 * 
 * Author: John B. Kilbride
 * Date: 2026-01-05
 * 
 * Description: 
 *   This script samples LiDAR-derived forest height measurements and 
 *   extracts the spatially and temporally coincident embedding values from Google's 
 *   AlphaEarth Foundations (AEF) geospatial embedding dataset.
 * 
 * Output:
 * - CSV file exported to Google Drive w/ the forest heights (meters)
 *   and the AEF embedding field values. 
 * ============================================================================
 */
 
var SEED = 4924;
var SAMPLE_SIZE = 5000;

function main () {
  
  // Load in the LiDAR height map. This layer has two channels:
  //   "height_m": The forest height (i.e., the 95th percentile of returns) in meters. 
  //   "year": The year the LiDAR flight was flown. 
  var forest_height = ee.Image("users/JohnBKilbride/Google_Blog_Post/me_lidar_height_m");
  
  // Obtain a simple random sample of the forested locations
  var sample_locations = sample_reference_data(forest_height);
  
  // Sample the AlphaEarth Foundatiions embedding field values predictions
  var modeling_dataset = run_embedding_sampling(sample_locations);
  
  // Save the sampled dataset to Google Drive and as a GEE Asset (for visualization)
  Export.table.toDrive({
    collection: modeling_dataset, 
    description: "Height-Dataset-toDrive",
    fileNamePrefix: "forest_ht_dataset", 
  });

  return null;
  
}


// Obtain a simple random sample of the input forest height map.
// The forest height map is expected to have two channels ("height_m" and "year")
function sample_reference_data (height_map) {
  
  // Create a binary forest/not forest layer using the current extent of the height map.
  // The data have already been masked using information from the Annual NLCD dataset
  var forested_locations = height_map.select(["height_m"])
    .mask()
    .byte()
    .rename(["forest"]);
  
  // Obtain a simple random sample of the unmasked locations
  var samples = forested_locations.addBands(height_map).stratifiedSample({
    numPoints: 0, 
    classBand: "forest", 
    scale: 10, 
    projection: "EPSG:6348", 
    seed: SEED, 
    classValues: [0, 1], 
    classPoints: [0, SAMPLE_SIZE], 
    dropNulls: true, 
    geometries: true
  });
  
  // Select the final columns we need
  samples = samples.select(["height_m", "year"]);

  return samples;
  
}


// Samples spatially and temporally coincident embedding field values from
// Google's satellite embedding dataset for forest height observations.
function run_embedding_sampling (forest_height_samples) {

  // Load in the embedding fields
  var aef_dataset = ee.ImageCollection("GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL");
  
  // A helper function to iterate over the years during sampling
  function _sample_year (year) {
    
    // Cast the input type
    year = ee.Number(year);
    
    // Create an AEF composite for the current year
    var start_date = ee.Date.fromYMD(year, 1, 1);
    var end_date = ee.Date.fromYMD(year, 12, 31);
    var aef_mosaic = aef_dataset.filterDate(start_date, end_date).mosaic();
    
    // Subset the forest height observations for the current year being processed
    var samples_subset = forest_height_samples.filter(ee.Filter.eq("year", year));
    
    // Intersect the forest height samples with the AlphaEarth Foundations embedding fields
    var sampled_values = aef_mosaic.reduceRegions({
      collection: samples_subset, 
      reducer: ee.Reducer.mean(), 
      scale: 10, 
      crs: "EPSG:6348"
    });
    
    return sampled_values;
    
  }
  
  // Get the years to sample
  var year_list = forest_height_samples.aggregate_array("year").distinct().sort();
  
  // Get the sampled values
  var output_dataset = ee.FeatureCollection(year_list.map(_sample_year)).flatten();

  return output_dataset;
  
}


main();


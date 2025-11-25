/**
 * ============================================================================
 * MAINE FOREST HEIGHT PREDICTION USING GOOGLE AEF EMBEDDINGS
 * ============================================================================
 * 
 * Description:
 * This script generates a forest canopy height model for Maine using Google's
 * Annual Embedding Features (AEF) from satellite imagery. It applies a linear
 * regression model trained on 64 embedding features (A00-A63) to predict 
 * forest height in meters.
 * 
 * Author: John B. Kilbride
 * Date: 2025-11-24
 * 
 * ============================================================================
 */
 
function main () {
  
  // Define where you want to save your raster layer
  var output_asset_path = "users/JohnBKilbride/Google_Blog_Post/maine_height_m";

  // Pull Maine boundary from TIGER dataset
  var maine_state = ee.FeatureCollection("TIGER/2018/States")
    .filter(ee.Filter.eq("NAME", "Maine"))
    .geometry();
    
  // Create the Maine forest mask using annual NLCD data
  var forest_mask = ee.Image(ee.ImageCollection("projects/sat-io/open-datasets/USGS/ANNUAL_NLCD/LANDCOVER")
    .filterDate("2024-01-01", "2024-12-31")
    .first())
    .remap([41, 42, 43], [1, 1, 1],  0);
  
  // Load AEF embeddings and rename bands to match predictors
  var aef_maine_2024 = ee.ImageCollection("GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL")
    .filterBounds(maine_state)
    .filterDate("2024-01-01", "2024-12-31")
    .mosaic()
    .updateMask(ee.Image(0).paint(maine_state, 1))
    .updateMask(forest_mask);
    
  // Define the intercept
  var intercept = 11.53513;
  
  // Define coefficients for A00 to A63 (64 features)
  var coefficients = ee.Image.constant([
    1.45957, -0.90620, -2.88325, -7.73290, 5.60280, -6.12525, -6.58494, -0.56557,
    3.58247, -0.23105, -3.10215, 5.34825, 4.31927, 1.80639, -1.06402, 2.28553,
    -4.42215, 3.02548, 2.75686, -0.04212, 9.70114, 1.86458, 3.26989, 3.10177,
    17.52088, 5.64324, 2.77510, 1.24903, -6.37476, -7.97029, 3.29335, 7.40333,
    -6.37638, -8.09604, -1.09247, 5.48409, -6.23048, 1.38244, 5.78955, -11.91846,
    -17.61726, 0.25435, 7.09169, 5.12470, -3.13201, 3.02626, 7.85892, 10.35282,
    -9.31267, 13.52583, -9.03495, 0.37619, -1.82759, -0.00000, 3.65662, 13.14257,
    6.72767, 4.97101, -0.13353, 5.49163, 12.52566, 0.88531, 5.26727, -9.83451
  ]);
  
  // Apply the linear model coefficients
  var multiplied = aef_maine_2024.multiply(coefficients);
  var dot_product = multiplied.reduce(ee.Reducer.sum());
  var predicted_height = dot_product.add(intercept);
  
  // Export the final height map as an Earth Engine asset
  // NOTE: Normally, you might not save a canopy height model
  // as an integer raster but we do that here to accelerate the 
  // demonstration logic!
  Export.image.toAsset({
    image: predicted_height.toInt16(),
    description: 'Export-Maine-Height-Map',
    assetId: output_asset_path,
    region: maine_state,
    scale: 10,
    crs: "EPSG:6348",
    maxPixels: 1e13
  });
  
  Map.addLayer(predicted_height, {min: 2, max: 25, palette: ['black', 'green', 'yellow', 'red']}, 'Predicted height (m)');

  return null;

}


main();

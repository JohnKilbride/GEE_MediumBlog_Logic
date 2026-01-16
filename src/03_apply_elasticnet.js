/**
 * ============================================================================
 * MAINE FOREST HEIGHT PREDICTION USING GOOGLE AEF EMBEDDINGS
 * ============================================================================
 * 
 * Description:
 * This script generates a forest canopy height model for Maine using Google's
 * Annual Embedding Features (AEF) from satellite imagery. It applies an  ElasticNet
 * linear regression model trained on 64 embedding features to predict 
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

  // Load AEF embeddings and rename bands to match predictors
  var aef_maine_2024 = ee.ImageCollection("GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL")
    .filterBounds(maine_state)
    .filterDate("2024-01-01", "2024-12-31")
    .mosaic()
    .updateMask(ee.Image(0).paint(maine_state, 1));
    
  // Define coefficients for A00 to A63 and the intercept
  var coefficients = ee.Image([
    6.21349, -5.14427, -2.17843, -1.54080, 2.03129, -5.14193, -13.86519, 3.94153,
    1.93333, -1.39021, -2.53777, 7.16267, 4.99431, 1.32216, 0.80886, 3.90452,
    -3.51082, 5.85346, 1.40148, 6.13936, 11.92165, 2.49262, 2.09877, -1.93478,
    18.50259, 6.93415, -1.72847, 2.36279, -5.49988, -3.33400, 10.38891, -0.30358,
    1.01380, -7.49258, 2.56873, 1.56880, -9.45943, -0.02616, 2.06422, -14.93276,
    -8.94964, -1.42208, 11.86911, 14.45245, 3.09161, 2.59974, 5.55327, 1.55783,
    -7.19424, 12.22383, -4.92856, 3.02634, 6.25473, -2.75925, 10.38340, 18.01230,
    1.10743, 4.08490, -6.00191, 5.36376, 11.72404, -4.75845, 4.62674, -7.00501
  ]);
  var intercept = 8.17316;
  
  // Apply the linear model coefficients
  var multiplied = aef_maine_2024.multiply(coefficients);
  var dot_product = multiplied.reduce(ee.Reducer.sum());
  var predicted_height = dot_product.add(intercept);
  
  // Visualize the forest inventory plot
  add_legend();
  Map.addLayer(predicted_height, {min: 0, max: 30, palette: ['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529']}, 'Predicted height (m)');
  Map.centerObject(maine_state, 7);
  
  return null;
  
}


// Add a legend to the chart area
function add_legend() {
  
  // Create legend panel
  var legend = ui.Panel({
    style: {
      position: 'bottom-center',
      padding: '8px 15px'
    }
  });
  
  // Add legend title
  var legend_title = ui.Label({
    value: 'Forest Height (m)',
    style: {
      fontWeight: 'bold',
      fontSize: '16px',
      margin: '0 0 4px 0',
      padding: '0'
    }
  });
  legend.add(legend_title);
  
  // Define color palette and corresponding values
  var palette = ['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529'];
  var min = 0;
  var max = 30;
  var steps = 4;
  
  // Create gradient bar
  var make_color_bar = function(palette) {
    return ui.Thumbnail({
      image: ee.Image.pixelLonLat().select(0),
      params: {
        bbox: [0, 0, 1, 0.1],
        dimensions: '200x20',
        format: 'png',
        min: 0,
        max: 1,
        palette: palette,
      },
      style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
    });
  };
  
  // Create labels for min and max
  var make_labels = function(min, max) {
    var label_panel = ui.Panel({
      widgets: [
        ui.Label(min, {margin: '4px 8px'}),
        ui.Label((max + min) / 2, {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(max, {margin: '4px 8px'})
      ],
      layout: ui.Panel.Layout.flow('horizontal')
    });
    return label_panel;
  };
  
  // Add color bar and labels to legend
  legend.add(make_color_bar(palette));
  legend.add(make_labels(min, max));
  
  // Add legend to map
  Map.add(legend);
  
  return null;
  
}


main();

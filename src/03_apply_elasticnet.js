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
    
  // Define coefficients for A00 to A63 (64 features) and the intercept
  var coefficients = ee.Image([
    6.34034, -5.13683, -2.18111, -1.61492, 2.02927, -5.20815, -14.01099, 3.89481,
    1.96547, -1.37582, -2.55338, 7.25312, 5.16031, 1.32938, 0.78591, 3.99678,
    -3.52214, 5.83732, 1.38374, 6.14284, 11.92806, 2.53979, 2.13103, -1.96898,
    18.66803, 7.02725, -1.70710, 2.33185, -5.50539, -3.37021, 10.45325, -0.30094,
    1.00722, -7.52678, 2.55469, 1.60619, -9.52485, -0.06286, 1.95546, -15.01173,
    -9.00199, -1.34967, 11.97590, 14.66658, 3.16185, 2.55333, 5.52506, 1.56971,
    -7.21744, 12.31672, -4.91304, 3.14709, 6.30731, -2.82525, 10.49843, 18.04515,
    1.09810, 4.05667, -6.02932, 5.38651, 11.73387, -4.84238, 4.66655, -7.03959
  ]);
  var intercept = 8.16020;
  
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

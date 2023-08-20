/*** Injectable Estradiol Simulator by Aly @ Transfeminine Science (transfemscience.org) ***/
/*** Copyright of Transfeminine Science and all rights reserved (please don't reproduce) ***/

// Developer options
var dev_options = {
  use_html_legend: true,
  show_tooltips: false,
  show_copy_data_menu_items: false,
}

// Simulator options
var options = {
  mode: undefined, // 'single' or 'all'
  ester: undefined,
  active_form: undefined,
  molecular_weight: undefined,
  dose: undefined,
  repeated_administration: undefined,
  dose_interval: undefined,
  dose_interval_units: undefined,
  dose_limit: undefined,
  concentration_units: undefined,
  time_interval: undefined,
  time_interval_units: 'days',
  y_axis_max: undefined,
  baseline_level: undefined,
  hide_legend_items: {}, // For keeping track of legend item show/hide states across chart regenerations
  share_link: undefined,
}

// Set theme if applicable
if (is_local_storage_available() == true && localStorage.getItem('theme')) {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Set dev options if applicable
if (is_local_storage_available() == true) {
  if (localStorage.getItem('use_html_legend')) {
    dev_options['use_html_legend'] = JSON.parse(localStorage.getItem('use_html_legend'));
  }
  if (localStorage.getItem('show_tooltips')) {
    dev_options['show_tooltips'] = JSON.parse(localStorage.getItem('show_tooltips'));
  }
  if (localStorage.getItem('show_copy_data_menu_items')) {
    dev_options['show_copy_data_menu_items'] = JSON.parse(localStorage.getItem('show_copy_data_menu_items'));
  }
}

// If in iframe, set data variable for CSS styling
if (window !== window.parent) {
  document.documentElement.setAttribute('data-iframe', 'true');
// If not in iframe, redirect to main site
} else if (window.location.hostname == 'transfemscience.github.io') {
  window.location.replace('https://sim.transfemscience.org/');
  // document.open(); // Fallback in case redirect blocked
}

// On page load
window.onload = function () {
  // Set up GUI listeners
  set_up_gui_listeners();

  // Set up context menu
  set_up_context_menu();

  // Apply URL parameters
  apply_url_params();

  // Update simulator for first time (get/update options, draw graph, and update share link)
  update_simulator();

  // Hack fix to prevent scrolling up between graph regenerations
  set_graph_min_height();

  return;
};

// Update simulator
function update_simulator() {
  update_options();
  draw_graph();
  update_share_link();
  return;
}

// Set up GUI (options) listeners
function set_up_gui_listeners() {
  // Mode switch listener
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.getElementById('mode-advanced-button').addEventListener(event_name, function (event) {
      // If keydown event and not Enter or Space key
      if (event_name == 'keydown' && event.code != 'Enter' && event.code != 'Space') { return; }

      // If mousedown event and not main mouse button (e.g., context menu)
      if (event_name == 'mousedown' && event.button != 0) { return; }

      // Switch to advanced sim
      // If not in iframe
      if (window === window.parent) {
        window.location = 'https://advsim.transfemscience.org/';
      // If in iframe
      } else {
        parent.postMessage({ action: 'switch_advanced_mode' }, '*');
      }

      return;
    });
  });

  // Options listeners
  ['ester', 'dose', 'dose-interval', 'dose-interval-units', 'dose-limit', 'time-interval', 'y-axis-max',
   'baseline-level'].forEach(function (element_id) {
    document.getElementById(element_id).addEventListener('change', function () {
      update_simulator();
      return;
    });
  });

  // Toggle button listeners for repeated administration and concentration units options
  ['repeated-administration', 'concentration-units'].forEach(function (element_id) {
    ['mousedown', 'keydown'].forEach(function (event_name) {
      document.getElementById(element_id + '-container').addEventListener(event_name, function (event) {
        // If not main mouse button (e.g., context menu)
        if (event_name == 'mousedown' && event.button != 0) { return; }
        else if (event_name == 'keydown') {
          if (event.key != 'Enter' && event.code != 'Space' && 
              event.key != 'ArrowUp' && event.key != 'ArrowDown') {
            return;
          }
        }
        event.preventDefault();
        event.stopPropagation();
        event.target.focus();
        var element = document.getElementById(element_id);
        switch (element_id) {
          case 'repeated-administration':
            element.innerText = (element.innerText == 'No' ? 'Yes' : 'No'); // Toggle
            toggle_dose_interval_disable();
            break;
          case 'concentration-units':
            element.innerText = (element.innerText == 'pg/mL' ? 'pmol/L' : 'pg/mL'); // Toggle
            break;
        }
        update_simulator();
        return;
      }, false);
    });
  });

  // Share button listener
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.getElementById('share-button').addEventListener(event_name, function (event) {
      // If keydown event and not Enter or Space key
      if (event_name == 'keydown' && event.code != 'Enter' && event.code != 'Space') { return; }

      // If mousedown event and not main mouse button (e.g., context menu)
      if (event_name == 'mousedown' && event.button != 0) { return; }

      // Do share button click
      share_button_click();

      return;
    });
  });

  // Download button listener
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.getElementById('download-button').addEventListener(event_name, function (event) {
      // If keydown event and not Enter or Space key
      if (event_name == 'keydown' && event.code != 'Enter' && event.code != 'Space') { return; }

      // If mousedown event and not main mouse button (e.g., context menu)
      if (event_name == 'mousedown' && event.button != 0) { return; }

      // Do download graph button
      download_graph_image();

      return;
    });
  });

  // Reset button listener
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.getElementById('reset-button').addEventListener(event_name, function (event) {
      // If keydown event and not Enter or Space key
      if (event_name == 'keydown' && event.code != 'Enter' && event.code != 'Space') { return; }

      // If mousedown event and not main mouse button (e.g., context menu)
      if (event_name == 'mousedown' && event.button != 0) { return; }

      // Reset page
      reset_page();

      return;
    });
  });

  // About section show/hide more text button listener
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.getElementById('about-hide-button').addEventListener(event_name, function (event) {
      // If keydown event and not Enter or Space key
      if (event_name == 'keydown' && event.code != 'Enter' && event.code != 'Space') { return; }

      // If mousedown event and not main mouse button (e.g., context menu)
      if (event_name == 'mousedown' && event.button != 0) { return; }

      // Show/hide more text in about section
      toggle_about_text();

      return;
    });
  });

  // Parent frame <-> iframe communication listener
  window.addEventListener('message', function (event) {
    // Dark mode change
    if (event.data['action'] && event.data['action'] == 'theme_change') {
      if (event.data['reset'] == false) {
        if (is_local_storage_available() == true) {
          localStorage.setItem('theme', event.data['theme']);
        }
        document.documentElement.setAttribute('data-theme', event.data['theme']);
      } else {
        if (is_local_storage_available() == true) {
          localStorage.removeItem('theme');
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
      // Update chart theme as well
      var no_start_animation = !event.data['animation'];
      draw_graph(no_start_animation);
    }
    return;
  });

  // Watch for light/dark mode switch (follow system)
  if (window.matchMedia) {
    matchMediaAddEventListener('(prefers-color-scheme: dark)', function (event) {
      if (is_local_storage_available() == true && !localStorage.getItem('theme')) {
        var theme = event.matches == true ? 'dark' : 'light';
        if (theme == 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        // Update chart theme as well
        var no_start_animation = true;
        draw_graph(no_start_animation);
      }
      return;
    });
  }

  // Watch for screen width changes
  if (window.matchMedia) {
    // Narrow-width mobile (350px) and mobile versus desktop (900px)
    ['350px', '900px'].forEach(function (max_width) {
      matchMediaAddEventListener('(max-width: ' + max_width + ')', function () {
        var no_start_animation = true;
        draw_graph(no_start_animation);
        set_graph_min_height();
        return;
      });
      return;
    });
  }

  return;
}

// Toggle dose interval option enabled/disabled based on repeated administration option
function toggle_dose_interval_disable(reset) {
  if (document.getElementById('repeated-administration').innerText == 'Yes' && !reset) {
    document.getElementById('dose-interval-container').style.opacity = '1';
    document.getElementById('dose-interval').disabled = false;
    document.getElementById('dose-interval-units').disabled = false;
    document.getElementById('dose-limit-container').style.opacity = '1';
    document.getElementById('dose-limit').disabled = false;
  } else {
    document.getElementById('dose-interval-container').style.opacity = '0.6';
    document.getElementById('dose-interval').disabled = true;
    document.getElementById('dose-interval-units').disabled = true;
    document.getElementById('dose-limit-container').style.opacity = '0.6';
    document.getElementById('dose-limit').value = '';
    document.getElementById('dose-limit').disabled = true;
  }
  return;
}

// Get and apply URL query string parameters
function apply_url_params() {
  const query_string = window.location.search;
  const url_params = new URLSearchParams(query_string);
  // Ester
  if (url_params.has('e')) {
    document.getElementById('ester').value = url_params.get('e');
  }
  // Dose
  if (url_params.has('d')) {
    document.getElementById('dose').value = url_params.get('d');
  }
  // Repeated?
  if (url_params.has('r')) {
    if (url_params.get('r') == 'y') {
      document.getElementById('repeated-administration').innerText = 'Yes';
      toggle_dose_interval_disable();
    }
  }
  // Dose interval
  if (url_params.has('di')) {
    document.getElementById('dose-interval').value = url_params.get('di');
  }
  // Dose limit
  if (url_params.has('dl')) {
    document.getElementById('dose-limit').value = url_params.get('dl');
  }
  // Units
  if (url_params.has('u')) {
    if (url_params.get('u') == 'mss') {
      document.getElementById('concentration-units').innerText = 'pg/mL';
    } else if (url_params.get('u') == 'mlr') {
      document.getElementById('concentration-units').innerText = 'pmol/L';
    }
  }
  // Graph time interval (x-axis max)
  if (url_params.has('xm')) {
    document.getElementById('time-interval').value = url_params.get('xm');
  }
  // Custom y-axis max
  if (url_params.has('ym')) {
    document.getElementById('y-axis-max').value = url_params.get('ym');
  }
  // Hidden legend items for all esters mode
  if (url_params.has('lh')) {
    if (url_params.has('e') && url_params.get('e').startsWith('all_')) {
      var hide_string = url_params.get('lh');
      var active_form = document.getElementById('ester').value.split('_').pop();
      all_data[active_form]['esters'].forEach(function (ester) {
        if (hide_string.includes(ester_data[ester]['url_hide_string_code'])) {
          options['hide_legend_items'][ester] = true;
        }
      });
    }
  }

  // Persistent URL params are ugly... let's hide them from the address bar after they're applied
  clear_url_params();
  return;
}

// Update URL params in address bar when options change
function update_url_params() {
  var query_string = make_query_string();
  // If not in iframe
  if (window === window.parent) {
    // Actually persistent URL params are ugly... let's not show them
    // window.history.replaceState(null, null, window.location.pathname + query_string);
  // If in iframe
  } else {
    // Actually persistent URL params are ugly... let's not show them
    // parent.postMessage({action: 'update_url_params', query_string: query_string}, '*');
  }
  return;
}

// Clear/hide URL params from address bar
function clear_url_params() {
  // If not in iframe
  if (window === window.parent) {
    window.history.replaceState(null, null, window.location.pathname);
  // If in iframe
  } else {
    parent.postMessage({action: 'clear_url_params'}, '*');
  }
  return;
}

// Get, check, and fix user options
function update_options() {
  // Get options
  options['ester'] = document.getElementById('ester').value;
  options['dose'] = parseFloat(document.getElementById('dose').value);
  options['repeated_administration'] = document.getElementById('repeated-administration').innerText;
  options['dose_interval'] = parseFloat(document.getElementById('dose-interval').value);
  options['dose_interval_units'] = document.getElementById('dose-interval-units').value;
  options['dose_limit'] = parseInt(document.getElementById('dose-limit').value);
  options['concentration_units'] = document.getElementById('concentration-units').innerText;
  options['time_interval'] = parseInt(document.getElementById('time-interval').value);
  options['y_axis_max'] = parseFloat(document.getElementById('y-axis-max').value);
  options['baseline_level'] = parseFloat(document.getElementById('baseline-level').value);

  // Check and fix options

  if (options['ester'].startsWith('all_') == false) {
    options['mode'] = 'single';
    options['active_form'] = ester_data[options['ester']]['active_form'];
  } else {
    options['mode'] = 'all';
    options['active_form'] = options['ester'].split('_').pop();
    options['ester'] = undefined;
  }
  options['molecular_weight'] = active_form_data[options['active_form']]['molecular_weight'];

  if (isNaN(options['dose']) === true || options['dose'] <= 0 || options['dose'] > 9999) {
    options['dose'] = parseFloat(document.getElementById('dose').defaultValue);
  }

  options['repeated_administration'] = (options['repeated_administration'] == 'Yes' ? true : false);
  if (options['repeated_administration'] == true) {
    if (isNaN(options['dose_interval']) === true || options['dose_interval'] <= 0 || options['dose_interval'] > 999) {
      options['dose_interval'] = parseInt(document.getElementById('dose-interval').defaultValue);
    }

    options['dose_interval_original'] = options['dose_interval'];
    if (options['dose_interval_units'] == 'hours') {
      options['dose_interval'] = options['dose_interval'] / 24;
    } else if (options['dose_interval_units'] == 'weeks') {
      options['dose_interval'] = options['dose_interval'] * 7;
    } else if (options['dose_interval_units'] == 'months') {
      options['dose_interval'] = options['dose_interval'] * 30;
    }

    if (isNaN(options['dose_limit']) == true || options['time_interval'] < 1 || options['time_interval'] > 9999) {
      options['dose_limit'] = parseInt(document.getElementById('dose-limit').defaultValue);
    }  
  } else {
    options['dose_interval'] = undefined;
    options['dose_interval_units'] = undefined;
    options['dose_limit'] = undefined;
  }
  
  if (options['concentration_units'] != 'pg/mL' && options['concentration_units'] != 'pmol/L') {
    options['concentration_units'] = 'pg/mL';
  }

  if (isNaN(options['time_interval']) === true || options['time_interval'] <= 0 || options['time_interval'] > 999) {
    options['time_interval'] = parseInt(document.getElementById('time-interval').defaultValue);
  }

  document.getElementById('y-axis-max-units').innerHTML = options['concentration_units'];
  document.getElementById('baseline-level-units').innerHTML = options['concentration_units'];

  if (isNaN(options['y_axis_max']) === true || options['y_axis_max'] < 1 || options['y_axis_max'] > 99999) {
    options['y_axis_max'] = undefined;
  }

  if (isNaN(options['baseline_level']) === true || options['baseline_level'] < 0 || options['baseline_level'] > 9999) {
    options['baseline_level'] = parseFloat(document.getElementById('baseline-level').defaultValue);
  }

  return;
}

// Hack fix to prevent scrolling up between graph regenerations
function set_graph_min_height() {
  document.getElementById('graph-canvas').style.minHeight = document.getElementById('graph-canvas').style.height;
  return;
}

// Construct and draw the graph canvas
function draw_graph(no_start_animation) {

  // Reset chart if it already exists (i.e., options were changed)
  if(window.graph) {
    window.graph.destroy();
  }

  // Increase height if mobile portrait mode and all mode
  // Fixes shortened graph due to legend taking up graph space in all mode
  if (dev_options['use_html_legend'] == false) {
    var canvas_element = document.getElementById('graph-canvas');
    if (options['mode'] == 'single') {
      canvas_element.height = 375;
    } else {
      if (is_mobile() == true) {
        canvas_element.height = 510;
      } else {
        canvas_element.height = 394;
      }
    }
  }

  // Set chart colors (will be based on color scheme)
  var font_color = get_css_variable_value('--graph-font-color');
  var axis_label_color = get_css_variable_value('--graph-axis-label-color');
  var axis_tick_color = get_css_variable_value('--graph-axis-tick-color');
  var grid_line_color = get_css_variable_value('--graph-grid-line-color');
  var background_color = get_css_variable_value('--graph-background-color');

  // Set time intervals at which points are drawn
  // Needed to ensure no variability in peak/trough rendering at long time intervals / frequent doses
  var point_time_interval = 0.01388888888888; // 20 minutes
  switch (options['time_interval']) {
    case 7:
    case 10:
      point_time_interval *= 1; // Every 20 minutes
      break;
    case 14:
      point_time_interval *= 2; // Every 40 minutes
      break;
    case 20:
    case 21:
      point_time_interval *= 2; // Every 40 minutes
      break;
    case 28:
    case 30:
    case 35:
      point_time_interval *= 3; // Every 60 minutes
      break;
    case 42:
    case 45:
      point_time_interval *= 4.5; // Every 1.5 hours
      break;
    case 56:
    case 60:
    case 70:
      point_time_interval *= 6; // Every 2 hours
      break;
    case 84:
    case 90:
      point_time_interval *= 9; // Every 3 hours
      break;
    case 180:
      point_time_interval *= 18; // Every 6 hours
      break;
    case 270:
    case 360:
      point_time_interval *= 36; // Every 12 hours
      break;
    default:
      point_time_interval = 0.001 * options['time_interval']; // Fallback
      break;
  }

  // Get curve data for traces
  if (options['mode'] == 'single') {
    var curve_data = calc_curve(options['time_interval'], point_time_interval, options['baseline_level'],
      options['dose'], options['dose_interval'], options['dose_limit'], ester_data[options['ester']]['model'],
      ester_data[options['ester']]['params']);
  } else {
    var curve_data = {};
    all_data[options['active_form']]['esters'].forEach(function (ester) {
      if (ester_data[ester]['dose_scale_all_mode']) {
        var new_dose = options['dose'] * ester_data[ester]['dose_scale_all_mode'];
      } else {
        var new_dose = options['dose'];
      }
      curve_data[ester] = calc_curve(options['time_interval'], point_time_interval, options['baseline_level'],
        new_dose, options['dose_interval'], options['dose_limit'], ester_data[ester]['model'],
        ester_data[ester]['params']);
    });
  }

  // Set up traces
  if (options['mode'] == 'single') {
    if (document.documentElement.getAttribute('data-theme') == 'dark') {
      var trace_border_color = ester_data[options['ester']]['colors']['dark']['single_mode']['trace_border_color'];
      var trace_background_color = ester_data[options['ester']]['colors']['dark']['single_mode']['trace_background_color'];
    } else {
      var trace_border_color = ester_data[options['ester']]['colors']['light']['single_mode']['trace_border_color'];
      var trace_background_color = ester_data[options['ester']]['colors']['light']['single_mode']['trace_background_color'];
    }

    var datasets = [{
      borderWidth: 2.5,
      borderColor: trace_border_color,
      backgroundColor: trace_background_color,
      pointRadius: 0,
      data: curve_data,
      fill: 'origin',
    }];

    var legend = {
      display: false,
    };
  } else {
    var datasets = [];

    all_data[options['active_form']]['esters'].forEach(function (ester) {
      if (document.documentElement.getAttribute('data-theme') == 'dark') {
        var trace_border_color = ester_data[ester]['colors']['dark']['all_mode']['trace_border_color'];
        var trace_background_color = ester_data[ester]['colors']['dark']['all_mode']['trace_background_color'];
      } else {
        var trace_border_color = ester_data[ester]['colors']['light']['all_mode']['trace_border_color'];
        var trace_background_color = ester_data[ester]['colors']['light']['all_mode']['trace_background_color'];
      }

      var label = ester_data[ester]['trace_label_format'];
      label = label.replace('<name>', ester_data[ester]['name']);
      label = label.replace('<form>', ester_data[ester]['dose_form']);
      if (ester_data[ester]['dose_scale_all_mode']) {
        label = label.replace('<dose scale>', make_dose_scale_label(options['dose'], ester_data[ester]['dose_scale_all_mode']));
      }

      datasets.push({
        label: label,
        borderWidth: 2.5,
        borderColor: trace_border_color,
        backgroundColor: trace_background_color,
        pointRadius: 0,
        fill: false,
        hidden: options['hide_legend_items'][ester],
        data: curve_data[ester],
        ester: ester,
      });
    });

    // For desired curve stacking
    datasets = datasets.reverse();

    // For persisting legend item state when app options change
    var new_legend_click_handler = function (event, legend_item) {
      var index = legend_item.datasetIndex;
      var legend_item_text = legend_item.text;

      // Save what the states were for restoration across chart regenerations
      all_data[options['active_form']]['esters'].forEach(function (ester) {
        var label = ester_data[ester]['trace_label_format'];
        label = label.replace('<name>', ester_data[ester]['name']);
        label = label.replace('<form>', ester_data[ester]['dose_form']);
        if (ester_data[ester]['dose_scale_all_mode']) {
          label = label.replace('<dose scale>', make_dose_scale_label(options['dose'], ester_data[ester]['dose_scale_all_mode']));
        }
        if (legend_item_text == label) {
          options['hide_legend_items'][ester] = !options['hide_legend_items'][ester];
        }
      });

      // Update share link
      update_share_link();

      var ci = this.chart;
      var meta = ci.getDatasetMeta(index);
      // See controller.isDatasetVisible comment
      meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
      ci.update();

      return;
    }

    if (dev_options['use_html_legend'] == false) {
      var legend = {
        display: true,
        position: 'bottom',
        reverse: true,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          fontColor: font_color,
        },
        onClick: new_legend_click_handler,
      };
    } else {
      var legend = {
        display: false,
      };
    }
  }

  // Plugin for setting canvas background color
  // For download image and copy as image, otherwise always black background color
  var background_plugin = {
    id: 'custom_canvas_background_color',
    beforeDraw: function (chart) {
      var canvas_context = chart.canvas.getContext('2d');
      canvas_context.save();
      canvas_context.globalCompositeOperation = 'destination-over';
      canvas_context.fillStyle = background_color;
      canvas_context.fillRect(0, 0, chart.width, chart.height);
      canvas_context.restore();
      return;
    }
  }

  // Skip start animation if applicable
  if (no_start_animation) {
    var start_animation_duration = 0;
  } else {
    var start_animation_duration = 1000;
  }

  // Determine x-axis step size based on graph time interval
  switch (options['time_interval']) {
    case 7:
    case 10:
    case 14:
      var step_size_x = 1;
      break;
    case 20:
    case 28:
    case 30:
      var step_size_x = 2;
      break;
    case 21:
      var step_size_x = 3.5;
      break;
    case 35:
    case 42:
    case 56:
    case 84:
      var step_size_x = 7;
      break;
    case 45:
      var step_size_x = 5;
      break;
    case 60:
    case 70:
    case 90:
      var step_size_x = 10;
      break;
    case 180:
      var step_size_x = 15;
      break;
    case 270:
    case 360:
      var step_size_x = 30;
      break;
    default:
      var step_size_x = 2;
      break;
  }

  // Chart settings
  var chart_params = {
    type: 'line',
    data: {
      datasets: datasets,
    },
    options: {
      spanGaps: true,
      maintainAspectRatio: true,
			elements: {
				line: {
					tension: 0,
				}
			},
      title: {
        display: true,
        text: make_graph_title(),
        fontSize: 20,
        fontColor: font_color,
        fontStyle: 'normal',
      },
      scales: {
        xAxes: [{
          type: 'linear',
          position: 'bottom',
          scaleLabel: {
            display: true,
            fontSize: 15,
            fontColor: axis_tick_color,
            labelString: 'Time (' + options['time_interval_units'] + ')',
          },
          ticks: {
            fontSize: 13,
            fontColor: axis_tick_color,
            beginAtZero: true,
            stepSize: step_size_x,
            max: options['time_interval'] ? options['time_interval'] : undefined,
          },
          gridLines:{
            color: grid_line_color,
            lineWidth: 1,
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            fontSize: 15,
            fontColor: axis_label_color,
            labelString: active_form_data[options['active_form']]['name'] + 
                         (is_narrow_width_mobile() == false ? ' levels ' : ' ') + 
                         '(' + options['concentration_units'] + ')',
          },
          ticks: {
            fontSize: 13,
            fontColor: axis_tick_color,
            beginAtZero: true,
            min: 0,
            max: options['y_axis_max'] ? options['y_axis_max'] : undefined,
            userCallback: function (value, index, values) {
              // Add commas to labels
              return value.toLocaleString();
            }
          },
          gridLines: {
            color: grid_line_color,
            lineWidth: 1,
          }
        }],
      },
      legend: legend,
      tooltips: {
        enabled: dev_options['show_tooltips'],
        // Hover by x-axis instead of points
        mode: 'x-axis',
        // Customize hover tooltips
        callbacks: {
          // Hide tooltip titles
          title: function () { return null; },
          // Customize tooltip labels
          label: function (tooltip_item) {
            var label = 'Time: ' + (Math.round(tooltip_item.xLabel * 1000) / 1000) + ' ';
            label += options['time_interval_units'];
            label += ' | Concentration: ';
            label += (Math.round(tooltip_item.yLabel * 1000) / 1000) + ' ' + options['concentration_units'];
            return label;
          }
        }
      },
      hover: {
        mode: null,
      },
      animation: {
        duration: start_animation_duration,
      }
    },
    plugins: [background_plugin],
  };

  // Get canvas 2D context for chart
  var canvas_context = document.getElementById('graph-canvas').getContext('2d');

  // Create new chart or update chart by replacing existing chart
  window.graph = new Chart(canvas_context, chart_params);

  // Do graph HTML legend
  if (dev_options['use_html_legend'] == true) {
    var graph_html_legend = document.getElementById('graph-html-legend');
    var graph_html_legend_items = document.getElementById('graph-html-legend-items');
    var html_legend_code = '';
    if (datasets.length > 1) {
      for (var i = datasets.length - 1, trace = 1; i >= 0; i--, trace++) {
        var trace_background_color = datasets[i].backgroundColor;
        var trace_border_color = datasets[i].borderColor;
        var trace_label = datasets[i].label;
        var ester = datasets[i].ester;

        html_legend_code += '<span id="graph-html-legend-item-' + trace + '" ';
        html_legend_code += 'data-trace="' + trace + '" ';
        html_legend_code += 'data-ester="' + ester + '" ';
        html_legend_code += 'class="graph-html-legend-item" ';
        html_legend_code += 'onmousedown="graph_html_legend_item_click(event);"';
        html_legend_code += '>';
        html_legend_code += '<span class="graph-html-legend-item-circle" style="';
        html_legend_code += 'border-color: ' + trace_border_color + '; ';
        html_legend_code += 'background-color: ' + trace_background_color + ';';
        html_legend_code += '"></span>';
        html_legend_code += '<span class="graph-html-legend-item-text';

        if (options['hide_legend_items'][ester] == true) {
          html_legend_code += ' graph-html-legend-item-text-hidden';
        }

        html_legend_code += '">' + trace_label + '</span>';
        html_legend_code += '</span>';
        html_legend_code += '&ZeroWidthSpace;'; // Needed for proper between-legend-item wrapping
      }
      graph_html_legend_items.innerHTML = html_legend_code;
      graph_html_legend.style.display = '';
    } else {
      graph_html_legend_items.innerHTML = html_legend_code;
      graph_html_legend.style.display = 'none';
    }
  }

  // Update URL parameters
  update_url_params();

  return;
}

// Make graph title
function make_graph_title() {
  // Make ester name
  if (options['mode'] == 'single') {
    var make_name = ester_data[options['ester']]['name'];
  } else {
    var make_name = all_data[options['active_form']]['name'];
  }

  // Make dose form
  if (options['mode'] == 'single') {
    if (ester_data[options['ester']]['dose_form'] == 'oil') {
      make_dose_form = 'in ' + ester_data[options['ester']]['dose_form'];
    } else if (ester_data[options['ester']]['dose_form'] == 'susp.') {
      make_dose_form = ester_data[options['ester']]['dose_form'];
    } else {
      make_dose_form = '';
    }
  } else {
    make_dose_form = '';
  }

  // Make dose
  var make_dose = options['dose'] + ' mg';

  // Make dose interval
  if (options['repeated_administration'] == true) {
    var make_dose_interval = is_mobile() == false ? 'every ' : '/';
    if (options['dose_interval_original'] != 1) {
      make_dose_interval += options['dose_interval_original'] + ' ' + options['dose_interval_units'];
    } else {
      make_dose_interval += options['dose_interval_units'].slice(0, -1);
    }
  } else {
    make_dose_interval = '';
  }

  // Make dose limit
  if (options['dose_limit']) {
    var make_dose_limit = '(' + options['dose_limit'];
    make_dose_limit += ' dose' + (options['dose_limit'] == 1 ? '' : 's') + ')';
  } else {
    make_dose_limit = '';
  }

  // Make route
  if (is_mobile() == false) {
    var make_route = 'by i.m. injection';
  } else {
    var make_route = 'i.m.';
  }

  // Combine to make title
  var make_title = make_name + ' ';
  make_title += make_dose_form != '' ? make_dose_form + ' ' : '';
  make_title += make_dose + (make_dose_interval != '' && is_mobile() == true ? '' : ' ');
  make_title += (make_dose_interval != '' ? make_dose_interval + ' ' : '');
  make_title += (make_dose_limit != '' ? make_dose_limit + ' ' : '');
  make_title += make_route;

  return make_title;
}

// Handle HTML legend item click
function graph_html_legend_item_click(event) {
  // If not main mouse button (e.g., context menu)
  if (event.button != 0) { return; }

  // Get HTML legend item text
  var html_legend_item = event.target;
  // var html_legend_item_number = html_legend_item.id.match(/[0-9]+$/);
  var html_legend_item_text = html_legend_item.querySelector('.graph-html-legend-item-text');
  var ester = html_legend_item.getAttribute('data-ester');

  // Show/hide the legend item
  if (html_legend_item_text.classList.contains('graph-html-legend-item-text-hidden')) {
    html_legend_item_text.classList.remove('graph-html-legend-item-text-hidden');
    options['hide_legend_items'][ester] = false;
  } else {
    html_legend_item_text.classList.add('graph-html-legend-item-text-hidden');
    options['hide_legend_items'][ester] = true;
  }

  update_simulator();

  return;
}

// Make label part for all esters mode if ester is dose-scaled (namely for PEP 6.5× dose)
function make_dose_scale_label(dose, dose_scale) {
  // Get scaled dose based on dose and dose scaling multiplier
  var scaled_dose = dose * dose_scale;
  // If dose is <1 mg, round to two decimal places
  if (scaled_dose < 1) {
    rounded_scaled_dose = Math.round(scaled_dose * 100) / 100
  // If dose is <100 mg, round to one decimal place
  } else if (scaled_dose < 100) {
    rounded_scaled_dose = Math.round(scaled_dose * 10) / 10
  // If dose is ≥100 mg, round to nearest whole number
  } else {
    rounded_scaled_dose = Math.round(scaled_dose)
  }
  // Add approximate sign if rounded
  if (scaled_dose != rounded_scaled_dose) {
    rounded_scaled_dose = '~' + String(rounded_scaled_dose);
  } else {
    rounded_scaled_dose = String(rounded_scaled_dose);
  }
  // Make the dose scale label part
  var label_part = '(' + dose_scale + '× dose: ' + rounded_scaled_dose + ' mg)';
  return label_part;
};

// Reset page (when reset button is triggered)
function reset_page() {
  // Reset URL params first
  clear_url_params();

  // Reset options
  document.getElementById('options-form').reset();
  toggle_dose_interval_disable(true);
  Object.keys(options['hide_legend_items']).forEach(function (ester) {
    options['hide_legend_items'][ester] = undefined;
  });

  update_simulator();
  return;
}

// Construct the share link
function make_share_link() {
  // Construct share link based on options
  var share_link = '';
  // If not in iframe
  if (window === window.parent) {
    share_link += window.location.href.split('?')[0]; // Get current URL without query string
  // If in iframe
  } else {
    share_link += 'https://sim.transfemscience.org/';
  }
  share_link += make_query_string();
  return share_link;
}

// Update the share link
function update_share_link() {
  options['share_link'] = make_share_link();
  document.getElementById('share-link').value = options['share_link'];
  return;
}

// Do share button stuff like copy share link and handle tooltip (when share button is triggered)
function share_button_click(show_tooltip) {
  // Copy share link to clipboard
  var copy_text = document.createElement('textarea');
  copy_text.value = options['share_link'];
  copy_text.setAttribute('readonly', '');
  copy_text.style.position = 'absolute';
  copy_text.style.left = '-9999px';
  document.body.appendChild(copy_text);
  copy_text.select();
  document.execCommand('copy');
  document.body.removeChild(copy_text);

  if (show_tooltip != false) {
    // Update share button hover tooltip to indicate link copied
    var tooltip = document.getElementById('share-link-tooltip');
    // tooltip.classList.add('tooltip-triggered');
    tooltip.innerHTML = 'Copied!';

    // Reset tooltip text after 3 seconds
    setTimeout(function () {
      var tooltip = document.getElementById('share-link-tooltip');
      // tooltip.classList.remove('tooltip-triggered');
      tooltip.innerHTML = 'Copy share link';
    }, 3000);
  }

  return;
}

// Construct URL query string (for sharing, etc.)
function make_query_string() {
  var query_string = '';
  if (options['mode'] == 'single') {
    query_string += '?' + 'e=' + options['ester'];
  } else {
    query_string += '?' + 'e=' + options['mode'] + '_' + options['active_form'];
  }
  query_string += '&' + 'd=' + options['dose'];
  if (options['repeated_administration'] == true) {
    query_string += '&' + 'r=' + 'y';
    query_string += '&' + 'di=' + options['dose_interval'];
    if (options['dose_limit']) {
      query_string += '&' + 'dl=' + options['dose_limit'];
    }
  }
  if (options['concentration_units'] != 'pg/mL') {
    query_string += '&' + 'u=' + 'mlr'; // pmol/L
  }
  query_string += '&' + 'xm=' + options['time_interval'];
  if (options['y_axis_max']) {
    query_string += '&' + 'ym=' + options['y_axis_max'];
  }
  if (options['mode'] == 'all') {
    var hide_string = '';
    all_data[options['active_form']]['esters'].forEach(function (ester) {
      if (options['hide_legend_items'][ester] == true) {
        hide_string += ester_data[ester]['url_hide_string_code'];
      }
    });
    if (hide_string != '') {
      query_string += '&' + 'lh=' + hide_string;
    }
  }
  return query_string;
}

// Make graph image filename
function make_graph_image_filename() {
  var filename = '';
  filename += 'Sim' + '-';
  if (options['mode'] == 'single') {
    var short_name = ester_data[options['ester']]['short_name'];
  } else {
    var short_name = all_data[options['active_form']]['short_name'];
  }
  short_name = short_name.replaceAll(' ', '-');
  filename += short_name + '-';
  filename += options['dose'] + '-' + 'mg' + '-';
  if (options['repeated_administration']) {
    filename += options['dose_interval'] + '-';
    filename += options['dose_interval_units'] + '-';
  }
  filename += 'i.m';
  filename += '.png';
  return filename;
}

// Get and download graph image (when download button triggered)
async function download_graph_image(show_tooltip) {
  // Make sure graph exists first
  if (!window.graph) {
    return;
  }

  // Get graph image as a base64 data URL string
  var a = document.createElement('a');
  if (dev_options['use_html_legend'] == false) {
    var data_url = window.graph.toBase64Image();
  } else {
    var data_url = await htmlToImage.toPng(document.getElementById('graph-and-legend-container'));
  }

  // Download the image
  a.href = data_url;
  a.download = make_graph_image_filename();
  a.click();
  a.remove();

  if (show_tooltip != false) {
    // Update share button hover tooltip to indicate link copied
    var tooltip = document.getElementById('download-graph-tooltip');
    // tooltip.classList.add('tooltip-triggered');
    tooltip.innerHTML = 'Downloaded!';

    // Reset tooltip text after 3 seconds
    setTimeout(function () {
      var tooltip = document.getElementById('download-graph-tooltip');
      // tooltip.classList.remove('tooltip-triggered');
      tooltip.innerHTML = 'Download graph';
    }, 3000);
  }

  return;
}

// Copy graph image to clipboard
async function copy_graph_image(show_tooltip) {
  // Make sure graph exists first
  if (!window.graph) {
    return;
  }

  // Need it like this for iOS (https://stackoverflow.com/a/68241516/17813188)
  var make_image_promise = async function () {
    // Get graph image as a base64 data URL string
    if (dev_options['use_html_legend'] == false) {
      var data_url = window.graph.toBase64Image();
    } else {
      var data_url = await htmlToImage.toPng(document.getElementById('graph-and-legend-container'));
    }

    // Convert the image to blob
    var response = await fetch(data_url);
    var blob = await response.blob();

    return blob;
  }

  // Copy the image to clipboard as blob
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        // [blob.type]: blob, // Can't do it like this due to iOS
        ['image/png']: make_image_promise(),
      }),
    ]);
  } catch (error) {
    alert('Copy graph image failed: ' + error);
    return;
  }

  if (show_tooltip != false) {
    // Update copy image button hover tooltip to indicate link copied
    var tooltip = document.getElementById('copy-image-tooltip');
    // tooltip.classList.add('tooltip-triggered');
    tooltip.innerHTML = 'Copied!';

    // Reset tooltip text after 3 seconds
    setTimeout(function () {
      var tooltip = document.getElementById('copy-image-tooltip');
      // tooltip.classList.remove('tooltip-triggered');
      tooltip.innerHTML = 'Copy image';
    }, 3000);
  }

  return;
}

// Share graph image via web share API
async function share_graph_image() {
  // Make sure graph exists first
  if (!window.graph) {
    return;
  }

  // Get graph image as a base64 data URL string
  if (dev_options['use_html_legend'] == false) {
    var data_url = window.graph.toBase64Image();
  } else {
    var data_url = await htmlToImage.toPng(document.getElementById('graph-and-legend-container'));
  }

  // Convert the image to blob
  var response = await fetch(data_url);
  var blob = await response.blob();

  var files_array = [
    new File(
      [blob],
      make_graph_image_filename(),
      {
        type: 'image/png',
        lastModified: new Date().getTime(),
      },
   ),
  ];
  var share_data = {
    files: files_array,
  };
  try {
    if (navigator.canShare(share_data)) {
      navigator.share(share_data);
    } else {
      throw 'navigator.canShare(share_data) is false';
    }
  } catch (error) {
    alert('Share graph image failed: ' + error);
  }

  return;
}

// Save graph image as via native filesystem
async function save_graph_as() {
  // Make sure graph exists first
  if (!window.graph) {
    return;
  }

  // Get graph image as a base64 data URL string
  if (dev_options['use_html_legend'] == false) {
    var data_url = window.graph.toBase64Image();
  } else {
    var data_url = await htmlToImage.toPng(document.getElementById('graph-and-legend-container'));
  }

  // Convert the image to blob
  var response = await fetch(data_url);
  var blob = await response.blob();

  try {
    var options = {
      suggestedName: make_graph_image_filename(),
      types: [{
        description: 'PNG',
        accept: {'image/png': ['.png']},
      }],
    };

    var file_handle = await window.showSaveFilePicker(options);
    var writable_stream = await file_handle.createWritable();
    await writable_stream.write(blob);
    await writable_stream.close();
  } catch (error) {
    if (error['name'] != 'AbortError') {
      alert('Save graph image as failed: ' + error);
    }
  }

  return;
}

// Copy curve data to clipboard (as x and y arrays or as spreadsheet string)
// Currently single-ester mode only
function copy_curve_data(copy_mode) {
  // Make sure right mode
  if (options['mode'] != 'single') {
    alert('This feature currently only works in single-ester mode. Please try again.');
    return;
  }

  // Get point interval time
  var point_time_interval = prompt('Enter time interval between points (in days):', '1');
  point_time_interval = parseFloat(point_time_interval);
  if (!point_time_interval || point_time_interval <= 0) {
    point_time_interval = 1; // Every 24 hours
  }
 
  // Get curve data
  var curve_data = calc_curve(options['time_interval'], point_time_interval, options['baseline_level'],
  options['dose'], options['dose_interval'], options['dose_limit'], ester_data[options['ester']]['model'],
  ester_data[options['ester']]['params']);

  // Format curve data
  var x_array_string = 'x: [';
  var y_array_string = 'y: [';
  var spreasheet_string = '';
  for (var i = 0; i < curve_data.length; i++) {
    x_array_string += curve_data[i]['x'];
    y_array_string += curve_data[i]['y'] < 0 ? 0 : curve_data[i]['y'];
    if (i != curve_data.length - 1) {
      x_array_string += ', ';
      y_array_string += ', ';
    }
    spreasheet_string += curve_data[i]['x'] + '\t' + (curve_data[i]['y'] < 0 ? 0 : curve_data[i]['y']) + '\n';
  }
  x_array_string += ']';
  y_array_string += ']';

  // Select data string format based on copy mode
  if (copy_mode == 'arrays') {
    var data_copy_string = x_array_string + '\n' + y_array_string + '\n';
  } else if (copy_mode == 'spreadsheet') {
    var data_copy_string = spreasheet_string;
  }

  // Copy curve data to clipboard
  var copy_text = document.createElement('textarea');
  copy_text.value = data_copy_string;
  copy_text.setAttribute('readonly', '');
  copy_text.style.position = 'absolute';
  copy_text.style.left = '-9999px';
  document.body.appendChild(copy_text);
  copy_text.select();
  document.execCommand('copy');
  document.body.removeChild(copy_text);

  // Select data string format based on copy mode
  if (copy_mode == 'arrays') {
    // alert('Data (x, y) copied to clipboard in array format.');
    // alert('Data (x, y) copied to clipboard in array format:\n\n' + data_copy_string);
  } else if (copy_mode == 'spreadsheet') {
    // alert('Data (x, y) copied to clipboard in spreadsheet format.');
    // alert('Data (x, y) copied to clipboard in spreadsheet format:\n\n' + data_copy_string);
  }

  return;
}

// Custom context menu on graph image (and HTML legend)
// https://itnext.io/how-to-create-a-custom-right-click-menu-with-javascript-9c368bb58724
function set_up_context_menu() {
  var context_menu = document.getElementById('context-menu');
  var overlay = document.getElementById('overlay');

  var event_list = is_iOS() == false ? ['contextmenu'] : ['contextmenu', 'long-press'];
  event_list.forEach(function (event_name) {
    // Show context menu event listener
    document.body.addEventListener(event_name, function (event) {
      // Only trigger on graph
      if (event.target.id != 'col-graph' && event.target.id != 'graph-canvas' && 
          event.target.id != 'graph-html-legend' && event.target.id != 'graph-html-legend-items' && 
          !event.target.classList.contains('graph-html-legend-item')) {
        // Allow regular/native context menu on links still but prevent elsewhere
        /*if (event.target.tagName != 'A') {
          event.preventDefault();
        }*/
        return;
      }

      // Prevent default context menu
      event.preventDefault();
    
      // Get mouse position
      var { clientX: mouse_x, clientY: mouse_y } = event;

      // Fix context menu position if out of bounds re: window
      var normalize_position = function (mouse_x, mouse_y) {
        var { left: scope_offset_x, top: scope_offset_y } = document.body.getBoundingClientRect();
        var scope_x = mouse_x - scope_offset_x;
        var scope_y = mouse_y - scope_offset_y;

        var out_of_bounds_on_x = (scope_x + context_menu.clientWidth) > document.body.clientWidth;
        var out_of_bounds_on_y = (scope_y + context_menu.clientHeight) > document.body.clientHeight;

        var normalized_x = mouse_x;
        var normalized_y = mouse_y;

        if (out_of_bounds_on_x) {
          normalized_x = document.body.clientWidth - context_menu.clientWidth;
        }
        if (out_of_bounds_on_y) {
          normalized_y = document.body.clientHeight - context_menu.clientHeight;
        }

        return { normalized_x, normalized_y };
      };
      var { normalized_x, normalized_y } = normalize_position(mouse_x, mouse_y);

      // Set context menu position (unless on mobile)
      if (is_mobile() == false) {
        context_menu.style.top = normalized_y + 1 + 'px';
        context_menu.style.left = normalized_x + 1 + 'px';
      }

      // Hide copy data context menu items if all esters mode
      if (document.getElementById('copy-data-arrays-menu-item') && 
          document.getElementById('copy-data-spreadsheet-menu-item')) {
        if (options['mode'] != 'single') {
          document.getElementById('copy-data-arrays-menu-item').style.display = 'none';
          document.getElementById('copy-data-spreadsheet-menu-item').style.display = 'none';
        } else {
          document.getElementById('copy-data-arrays-menu-item').style.display = '';
          document.getElementById('copy-data-spreadsheet-menu-item').style.display = '';
        }
      }

      // Show context menu
      context_menu.classList.add('context-menu-visible');
      overlay.classList.add('context-menu-visible');

      return;
    });
  });

  // Hide context menu event listeners
  ['mousedown', 'keydown'].forEach(function (event_name) {
    document.body.addEventListener(event_name, function (event) {
      if (event_name == 'keydown' && event.key != 'Escape' || 
          event_name == 'mousedown' && event.button != 0) {
        return;
      }
      if (context_menu.classList.contains('context-menu-visible')) {
        setTimeout(function () {
          context_menu.classList.remove('context-menu-visible');
          overlay.classList.remove('context-menu-visible');
          return;
        }, 100);
      }
      return;  
    });
    return;
  });

  // Context menu item event listeners
  ['copy-share-link-menu-item', 'share-image-menu-item', 'copy-image-menu-item',
   'download-image-menu-item', 'save-image-as-menu-item', 'copy-data-arrays-menu-item', 'copy-data-spreadsheet-menu-item'].forEach(function (menu_item) {
    document.getElementById(menu_item).addEventListener('mousedown', function () {
      switch (menu_item) {
        case 'copy-share-link-menu-item':
          share_button_click(false);
          break;
        case 'share-image-menu-item':
          share_graph_image();
          break;
        case 'copy-image-menu-item':
          copy_graph_image(false);
          break;
        case 'download-image-menu-item':
          download_graph_image(false);
          break;
        case 'save-image-as-menu-item':
          save_graph_as();
          break;
        case 'copy-data-arrays-menu-item':
          copy_curve_data('arrays');
          break;
        case 'copy-data-spreadsheet-menu-item':
          copy_curve_data('spreadsheet');
          break;
      }
      return;
    });
    return;
  });

  // Hide certain menu items if unsupported by web browser
  // Using remove() instead of display: none; for CSS-related reasons
  // Second conditional checks whether Firefox (which doesn't support web share with files yet)
  if (!navigator.canShare || ('netscape' in window && / rv:/.test(navigator.userAgent))) {
    document.getElementById('share-image-menu-item').remove();
  }
  if ('write' in navigator.clipboard == false) {
    document.getElementById('copy-image-menu-item').remove();
  }
  // Latter conditional is whether iframe or not—doesn't work in iframe for now... (to-do: workaround?)
  if ('showSaveFilePicker' in window == false || window !== window.parent) {
    document.getElementById('save-image-as-menu-item').remove();
  }

  if (dev_options['show_copy_data_menu_items'] != true) {
    document.getElementById('copy-data-arrays-menu-item').remove();
    document.getElementById('copy-data-spreadsheet-menu-item').remove();
  }

  return;
}

function toggle_about_text() {
  var hidden_text = document.getElementById('about-hidden');
  if (hidden_text.style.display == '') {
    hidden_text.style.display = 'inline';
  } else {
    hidden_text.style.display = '';
  }
  return;
}

function is_mobile() {
  if (window.matchMedia) {
    var media_query = window.matchMedia('only screen and (max-width: 500px)');
    if (media_query.matches == true) {
      return true;
    } else {
      return false;
    }
  }
  return;
}

function is_narrow_width_mobile() {
  if (window.matchMedia) {
    var media_query = window.matchMedia('only screen and (max-width: 350px)');
    if (media_query.matches == true) {
      return true;
    } else {
      return false;
    }
  }
  return;
}

// Wrapper function for window.matchMedia().addEventListener() for cross-browser support
// https://stackoverflow.com/questions/56466261/matchmedia-addlistener-marked-as-deprecated-addeventlistener-equivalent
function matchMediaAddEventListener(media_query, listener_function) {
	try {
    // Chrome, Firefox, iOS/Safari 14+, etc.
		window.matchMedia(media_query).addEventListener('change', listener_function);
	} catch {
    try {
      // iOS/Safari 13 and below
      window.matchMedia(media_query).addListener(listener_function);
    } catch {
      console.error('window.matchMedia.addEventListener() and window.matchMedia.addListener() not supported.');
    }
	}
	return;
}

// Check if local storage is supported and available (avoid exceptions)
// https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function is_local_storage_available() {
  let storage;
  try {
    storage = window['localStorage'];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (error) {
    return error instanceof DOMException && (
      // Everything except Firefox
      error.code === 22 ||
      // Firefox
      error.code === 1014 ||
      // Test name field too, because code might not be present
      // Everything except Firefox
      error.name === 'QuotaExceededError' ||
      // Firefox
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // Acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

// Check if device is iOS
// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
function is_iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}

// Shorthand utility function to get CSS variable name
function get_css_variable_value(variable_name) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variable_name);
}

// Convert original simulator URL params to advanced simulator URL params
function convert_to_advanced_mode_url_params() {
  // To-do: add active form (options['active_form']) (need to do/check advanced sim)
  var query_string = '';
  if (options['mode'] == 'single') {
    query_string = '?' + 'r=1';
    query_string += '&e=' + ester_to_index(options['ester']);
    query_string += '&d1=' + options['dose'];
    if (options['repeated_administration'] == false) {
      query_string += '&ra=' + '0';
    } else {
      if (options['dose_interval_units']) {
        query_string += '&ra=' + (1 + interval_time_values.indexOf(options['dose_interval_units']));
      } else {
        query_string += '&ra=' + (1 + interval_time_values.indexOf('days'));
      }
      query_string += '&i1=' + options['dose_interval_original'];
      if (options['dose_limit']) {
        query_string += '&dl1=' + options['dose_limit'];
      }
    }
  } else {
    query_string = '?' + 'r=7' + '&e=';
    for (var i = 0; i < persistent_ester_list.length; i++) {
      query_string += i;
    }
    for (var i = 1; i < persistent_ester_list.length + 1; i++) {
      query_string += '&d' + i + '=' + options['dose'];
    }
    query_string += '&ra=';
    if (options['repeated_administration'] == false) {
      query_string += '0';
    } else {
      for (var i = 1; i < persistent_ester_list.length + 1; i++) {
        if (options['dose_interval_units']) {
          query_string += (1 + interval_time_values.indexOf(options['dose_interval_units']));
        } else {
          query_string += (1 + interval_time_values.indexOf('days'));
        }
      }
      for (var i = 1; i < persistent_ester_list.length + 1; i++) {
        query_string += '&i' + i + '=' + options['dose_interval_original'];
        if (options['dose_limit']) {
          query_string += '&dl' + i + '=' + options['dose_limit'];
        }
      }
    }
  }

  // Missing: steady state (not in original sim)
  query_string += '&s=0';

  if (options['concentration_units'] != 'pg/mL') {
    query_string += '&' + 'u=' + 'mlr'; // pmol/L
  }

  query_string += '&' + 'xm=' + options['time_interval'];
  if (options['y_axis_max']) {
    query_string += '&' + 'ym=' + options['y_axis_max'];
  }

  // Not working properly right now, need to fix (to-do)
  if (options['mode'] == 'all') {
    var h = 0;
    for (var i = 1; i < persistent_ester_list.length + 1; i++) {
      if (options['hide_legend_items'][persistent_ester_list[i - 1]] == true) {
        h += Math.pow(2, i);
      }
    }
    query_string += '&h=' + h;
  } else {
    query_string += '&h=0';
  }

  // Missing: cis cycle (not in original sim)

  return query_string;
}

// Persistent ester list, used for share links / URL params
// Add any new esters to the end and do not remove values
// Otherwise backwards/forwards compatibility will break
var persistent_ester_list = ['eb', 'ev', 'ec_o', 'ec_s', 'een', 'eu', 'pep'];

function ester_to_index(ester) {
  return persistent_ester_list.indexOf(ester);
}

var interval_time_values = ['minutes', 'hours', 'days', 'weeks', 'months'];


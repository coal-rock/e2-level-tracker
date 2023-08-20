/*** Injectable Estradiol Simulator by Aly @ Transfeminine Science (transfemscience.org) ***/
/*** Copyright of Transfeminine Science and all rights reserved (please don't reproduce) ***/

// Generate concentration–time curve data for a trace
function calc_curve(time_interval, point_time_interval, baseline_level, dose, dose_interval, dose_limit, model, params) {
  var dose_transform = dose / params['fit_dose'];
  var curve_data = [];

  for (var t = 0; t <= time_interval; t += point_time_interval) {
    var C = baseline_level;
    if (!dose_interval) {
      C += calc_curve_point(t, model, params) * dose_transform;
    } else {
      var num_doses = Math.ceil(t / dose_interval);
      if (num_doses > dose_limit) {
        num_doses = dose_limit;
      }
      for (var dose_num = 0; dose_num < num_doses; dose_num++) {
        var tdose = t - dose_num * dose_interval;
        C += calc_curve_point(tdose, model, params) * dose_transform;
      }
    }
    var curve_point = {
      x: t,
      y: convert_concentration_units(C, 'pg/mL', options['concentration_units'], options['molecular_weight']),
    };
    curve_data.push(curve_point);
  }
  return curve_data;
}

// Calculate concentration at time t with different pharmacokinetic models
function calc_curve_point(t, model, p) {
  switch (model) {
    // 1C model
    case '1c':
      var Cp = (p['D'] * p['ka']) / (p['Vd'] * (p['ka'] - p['ke'])) * (Math.exp(-p['ke'] * t) - Math.exp(-p['ka'] * t));
      break;
    // 2C model
    case '2c':
      var A = (p['ka'] / p['V']) * ((p['k21'] - p['a']) / (p['ka'] - p['a']) * (p['b'] - p['a']))
      var B = (p['ka'] / p['V']) * ((p['k21'] - p['b']) / (p['ka'] - p['b']) * (p['a'] - p['b']))
      var Cp = p['D'] * (A * Math.exp(-p['a'] * t) + B * Math.exp(-p['b'] * t) - (A + B) * Math.exp(-p['ka'] * t));
      break;
    // 3C model
    case '3c':
      var A = (1 / p['V']) * (p['ka'] / (p['ka'] - p['a'])) * ((p['k21'] - p['a']) / (p['a'] - p['b'])) * ((p['k31'] - p['a']) / (p['a'] - p['g']))
      var B = (1 / p['V']) * (p['ka'] / (p['ka'] - p['b'])) * ((p['k21'] - p['b']) / (p['b'] - p['a'])) * ((p['k31'] - p['b']) / (p['b'] - p['g']))
      var C = (1 / p['V']) * (p['ka'] / (p['ka'] - p['g'])) * ((p['k21'] - p['g']) / (p['g'] - p['b'])) * ((p['k31'] - p['g']) / (p['g'] - p['a']))
      var Cp = p['D'] * (A * Math.exp(-p['a'] * t) + B * Math.exp(-p['b'] * t) + C * Math.exp(-p['g'] * t) - ((A + B + C) * Math.exp(-p['ka'] * t)));
      break;
    // V3C model
    case 'v3c':
      var Cp = p['D'] * p['k1'] * p['k2'] * (Math.exp(-t * p['k1']) / ((p['k1'] - p['k2']) * (p['k1'] - p['k3'])) + 
      Math.exp(-t * p['k3']) / ((p['k1'] - p['k3']) * (p['k2'] - p['k3'])) + 
      (Math.exp(-t * p['k2']) * (p['k3'] - p['k1'])) / ((p['k1'] - p['k2']) * (p['k1'] - p['k3']) * (p['k2'] - p['k3'])));
      break;
    // V4C model
    case 'v4c':
      var Cp = (-p['D'] * p['k1'] * p['k2'] * p['k3'] * (
        (p['k2'] * p['k2'] * p['k3'] - p['k2'] * p['k3'] * p['k3'] - p['k2'] * p['k2'] * p['k4'] + p['k3'] * p['k3'] * p['k4'] + p['k2'] * p['k4'] * p['k4'] - p['k3'] * p['k4'] * p['k4']) * Math.exp(-p['k1'] * t)
        + (-p['k1'] * p['k1'] * p['k3'] + p['k1'] * p['k3'] * p['k3'] + p['k1'] * p['k1'] * p['k4'] - p['k3'] * p['k3'] * p['k4'] - p['k1'] * p['k4'] * p['k4'] + p['k3'] * p['k4'] * p['k4']) * Math.exp(-p['k2'] * t)
        + (p['k1'] * p['k1'] * p['k2'] - p['k1'] * p['k2'] * p['k2'] - p['k1'] * p['k1'] * p['k4'] + p['k2'] * p['k2'] * p['k4'] + p['k1'] * p['k4'] * p['k4'] - p['k2'] * p['k4'] * p['k4']) * Math.exp(-p['k3'] * t)
        + (-p['k1'] * p['k1'] * p['k2'] + p['k1'] * p['k2'] * p['k2'] + p['k1'] * p['k1'] * p['k3'] - p['k2'] * p['k2'] * p['k3'] - p['k1'] * p['k3'] * p['k3'] + p['k2'] * p['k3'] * p['k3']) * Math.exp(-p['k4'] * t))
        / ((p['k1'] - p['k2']) * (p['k1'] - p['k3']) * (p['k2'] - p['k3']) * (p['k1'] - p['k4']) * (p['k2'] - p['k4']) * (p['k3'] - p['k4'])));
      break;
  }
  return Cp;
}

// Convert concentration units (e.g., pg/mL to pmol/L)
function convert_concentration_units(C, unit_from, unit_to, mol_weight) {
  if (unit_from == unit_to) {
    return C;
  } else if (unit_from == 'pg/mL' && unit_to == 'pmol/L') {
    C = C / mol_weight * 1000;
  } else if (unit_from == 'pmol/L' && unit_to == 'pg/mL') {
    C = C * mol_weight / 1000;
  } else if (unit_from == 'ng/dL' && unit_to == 'nmol/L') {
    C = C / mol_weight * 10;
  } else if (unit_from == 'nmol/L' && unit_to == 'ng/dL') {
    C = C * mol_weight / 10;
  } else if (unit_from == 'ng/mL' && unit_to == 'nmol/L') {
    C = C / mol_weight * 1000;
  } else if (unit_from == 'nmol/L' && unit_to == 'ng/mL') {
    C = C * mol_weight / 1000;
  }
  return C;
}


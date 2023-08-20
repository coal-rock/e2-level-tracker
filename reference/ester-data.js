/*** Injectable Estradiol Simulator by Aly @ Transfeminine Science (transfemscience.org) ***/
/*** Copyright of Transfeminine Science and all rights reserved (please don't reproduce) ***/

// Active form data
var active_form_data = {
  e2: {
    name: 'Estradiol',
    short_name: 'E2',
    molecular_weight: 272.38, // g/mol
  },
};

// Ester data
var ester_data = {
  eb: {
    name: 'Estradiol benzoate',
    short_name: 'EB',
    dose_form: 'oil',
    trace_label_format: '<name>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 1.7050e+08,
      k1: 3.22397192,
      k2: 0.58870148,
      k3: 70721.4018,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(245, 90, 90, 0.85)',
          trace_background_color: 'rgba(245, 90, 90, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(245, 90, 90, 0.75)',
          trace_background_color: 'rgba(237, 83, 83, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(246, 101, 101)',
          trace_background_color: 'rgba(246, 101, 101, 0.45)',
        },
        all_mode: {
          trace_border_color: 'rgb(246, 101, 101)',
          trace_background_color: 'rgba(246, 101, 101, 0.6)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'b',
  },
  // Currently unused/disabled
  edp: {
    name: 'Estradiol dipropionate',
    short_name: 'EDP',
    dose_form: 'oil',
    trace_label_format: '<name>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      //D: 3262.20864, // Original 2 mg (gives ~185 pg/mL for 5 mg/7 days)
      D: 5288.35292, // Scaled up ~1.62× to give similar levels to other esters (~300 pg/mL for 5 mg/7 days)
      k1: 0.59848665,
      k2: 2.51794147,
      k3: 2.51820476,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(255, 161, 90, 0.85)',
          trace_background_color: 'rgba(255, 161, 90, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(255, 161, 90, 0.85)',
          trace_background_color: 'rgba(255, 161, 90, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(255, 168, 102)',
          trace_background_color: 'rgba(255, 168, 102, 0.4)',
        },
        all_mode: {
          trace_border_color: 'rgb(255, 168, 102)',
          trace_background_color: 'rgba(255, 168, 102, 0.55)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'd',
  },
  ev: {
    name: 'Estradiol valerate',
    short_name: 'EV',
    dose_form: 'oil',
    trace_label_format: '<name>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 2596.05956,
      k1: 2.38229125,
      k2: 0.23345814,
      k3: 1.37642769,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(0, 204, 150, 0.85)',
          trace_background_color: 'rgba(0, 204, 150, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(0, 204, 150, 0.85)',
          trace_background_color: 'rgba(0, 204, 150, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(38, 237, 177)',
          trace_background_color: 'rgba(38, 237, 177, 0.4)',
        },
        all_mode: {
          trace_border_color: 'rgb(38, 237, 177)',
          trace_background_color: 'rgba(38, 237, 177, 0.55)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'v',
  },
  ec_o: {
    name: 'Estradiol cypionate',
    short_name: 'EC oil',
    dose_form: 'oil',
    trace_label_format: '<name> <form>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 1920.89671,
      k1: 0.10321089,
      k2: 0.89854779,
      k3: 0.89359759,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(171, 99, 250, 0.85)',
          trace_background_color: 'rgba(171, 99, 250, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(171, 99, 250, 0.85)',
          trace_background_color: 'rgba(171, 99, 250, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(189, 131, 251)',
          trace_background_color: 'rgba(189, 131, 251, 0.4)',
        },
        all_mode: {
          trace_border_color: 'rgb(189, 131, 251)',
          trace_background_color: 'rgba(189, 131, 251, 0.55)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'co',
  },
  ec_s: {
    name: 'Estradiol cypionate',
    short_name: 'EC susp.',
    dose_form: 'susp.',
    trace_label_format: '<name> <form>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 1.5669e+08,
      k1: 0.13586726,
      k2: 2.51772731,
      k3: 74768.1493,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(254, 203, 82, 0.95)',
          trace_background_color: 'rgba(254, 203, 82, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(254, 203, 82, 0.95)',
          trace_background_color: 'rgba(254, 203, 82, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(254, 231, 103)',
          trace_background_color: 'rgba(254, 231, 103, 0.45)',
        },
        all_mode: {
          trace_border_color: 'rgb(254, 231, 103)',
          trace_background_color: 'rgba(254, 231, 103, 0.6)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'cs',
  },
  een: {
    name: 'Estradiol enanthate',
    short_name: 'EEn',
    dose_form: 'oil',
    trace_label_format: '<name>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 333.874181,
      k1: 0.42412968,
      k2: 0.43452980,
      k3: 0.15291485,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgb(92, 139, 250)',
          trace_background_color: 'rgba(92, 139, 250, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgb(92, 139, 250)',
          trace_background_color: 'rgba(92, 139, 250, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(84, 132, 242)',
          trace_background_color: 'rgba(84, 132, 242, 0.45)',
        },
        all_mode: {
          trace_border_color: 'rgb(84, 132, 242)',
          trace_background_color: 'rgba(84, 132, 242, 0.6)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'e',
  },
  eu: {
    name: 'Estradiol undecylate',
    short_name: 'EU',
    dose_form: 'oil',
    trace_label_format: '<name>',
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      D: 65.9493374,
      k1: 0.29634323,
      k2: 4799337.57,
      k3: 0.03141554,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(25, 211, 243, 0.85)',
          trace_background_color: 'rgba(25, 211, 243, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(25, 211, 243, 0.85)',
          trace_background_color: 'rgba(25, 211, 243, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(52, 212, 244)',
          trace_background_color: 'rgba(52, 212, 244, 0.45)',
        },
        all_mode: {
          trace_border_color: 'rgb(52, 212, 244)',
          trace_background_color: 'rgba(52, 212, 244, 0.6)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'u',
  },
  pep: {
    name: 'Polyestradiol phosphate',
    short_name: 'PEP',
    dose_form: '',
    trace_label_format: '<name> <dose scale>',
    dose_scale_all_mode: 6.5,
    active_form: 'e2',
    model: 'v3c',
    params: {
      /* V3C */
      fit_dose: 5, // mg
      //D: 1102.98780, // 160 mg
      D: 34.46836875, // 5 mg
      k1: 0.02456035,
      k2: 135643.711,
      k3: 0.10582368,
    },
    colors: {
      light: {
        single_mode: {
          trace_border_color: 'rgba(255, 140, 184, 0.85)',
          trace_background_color: 'rgba(255, 140, 184, 0.1)',
        },
        all_mode: {
          trace_border_color: 'rgba(255, 140, 184, 0.85)',
          trace_background_color: 'rgba(255, 140, 184, 0.25)', // Affects legend only
        },
      },
      dark: {
        single_mode: {
          trace_border_color: 'rgb(255, 158, 195)',
          trace_background_color: 'rgba(255, 158, 195, 0.45)',
        },
        all_mode: {
          trace_border_color: 'rgb(255, 158, 195)',
          trace_background_color: 'rgba(255, 158, 195, 0.6)', // Affects legend only
        },
      },
    },
    url_hide_string_code: 'p',
  },
};

// All mode data
var all_data = {
  e2: {
    name: 'Estradiol esters',
    short_name: 'All',
    esters: ['eb', 'ev', 'ec_o', 'ec_s', 'een', 'eu', 'pep'],
    active_form: 'e2',
  },
};


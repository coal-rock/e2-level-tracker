use std::collections::HashMap;

use time::OffsetDateTime;

use crate::graph::GraphOptions;

#[derive(PartialEq)]
pub enum Unit {
    PgML,
    PmolL,
}

pub enum DoseForm {
    Oil,
    Suspension,
}

struct EsterData {
    d: &'static f64,
    k1: &'static f64,
    k2: &'static f64,
    k3: &'static f64,
}

pub struct Ester {
    name: &'static str,
    short_name: &'static str,
    dose_form: DoseForm,
    data: EsterData,
}

pub const EB: Ester = Ester {
    name: "Estradiol benzoate",
    short_name: "EB",
    dose_form: DoseForm::Oil,
    data: EsterData {
        d: &1.7050e+08,
        k1: &3.22397192,
        k2: &0.58870148,
        k3: &70721.4018,
    },
};

pub const EV: Ester = Ester {
    name: "Estradiol valerate",
    short_name: "EV",
    dose_form: DoseForm::Oil,
    data: EsterData {
        d: &2596.05956,
        k1: &2.38229125,
        k2: &0.23345814,
        k3: &1.37642769,
    },
};

pub const EC_OIL: Ester = Ester {
    name: "Estradiol cypionate",
    short_name: "EC oil",
    dose_form: DoseForm::Oil,
    data: EsterData {
        d: &1920.89671,
        k1: &0.10321089,
        k2: &0.89854779,
        k3: &0.89359759,
    },
};

pub const EC_SUSP: Ester = Ester {
    name: "Estradiol cypionate",
    short_name: "EC susp.",
    dose_form: DoseForm::Suspension,
    data: EsterData {
        d: &1.5669e+08,
        k1: &0.13586726,
        k2: &2.51772731,
        k3: &74768.1493,
    },
};

pub const EEN: Ester = Ester {
    name: "Estradiol enanthate",
    short_name: "EEn",
    dose_form: DoseForm::Oil,
    data: EsterData {
        d: &333.874181,
        k1: &0.42412968,
        k2: &0.43452980,
        k3: &0.15291485,
    },
};

pub const EU: Ester = Ester {
    name: "Estradiol undecylate",
    short_name: "EU",
    dose_form: DoseForm::Oil,
    data: EsterData {
        d: &65.9493374,
        k1: &0.29634323,
        k2: &4799337.57,
        k3: &0.03141554,
    },
};

#[derive(Clone)]
pub struct Dose {
    pub datetime: OffsetDateTime,
    pub amount: f64, // mg
    pub ester: &'static Ester,
}

//                                           day x 1000   concentration (pg/ml)
pub fn calc_graph(graph_options: &GraphOptions) -> Vec<f64> {
    const FIT_DOSE: i32 = 5; // we use a fit dose of 5mg here

    let total_sample_count = graph_options.samples_per_day
        * (time_difference(graph_options.date_start, graph_options.date_end));

    println!("{:#?}", total_sample_count);
    let mut concentrations: Vec<f64> = vec![0.0; total_sample_count.try_into().unwrap()];
    let increment: f64 = 1.0f64 / graph_options.samples_per_day as f64;

    for dose in &graph_options.doses {
        let mut time: f64 = 0.0;
        let mut pos = 0;

        let dose_transform = dose.amount as f64 / FIT_DOSE as f64;

        let dose_offset = calc_concentration_offset(
            graph_options.date_start,
            dose.datetime,
            graph_options.samples_per_day,
        );

        let total_graph_time =
            (time_difference(graph_options.date_start, graph_options.date_end)) as f64;

        while time <= total_graph_time {
            let concentration = calc_concentration(time, dose.ester) * dose_transform;

            match concentrations.get(pos + dose_offset) {
                Some(current_concentration) => {
                    concentrations[pos + dose_offset] = concentration + current_concentration;
                }
                None => {
                    println!("pos: {}", pos);
                    //panic!("error in calculating graph points, we should never be here");
                }
            }

            time += increment;
            pos += 1;
        }
    }

    concentrations
}

//                      time in days
pub fn calc_concentration(time: f64, ester: &Ester) -> f64 {
    // we use the V3C model here
    let d = &ester.data;
    return d.d
        * d.k1
        * d.k2
        * ((-time * d.k1).exp() / ((d.k1 - d.k2) * (d.k1 - d.k3))
            + (-time * d.k3).exp() / ((d.k1 - d.k3) * (d.k2 - d.k3))
            + ((-time * d.k2).exp() * (d.k3 - d.k1))
                / ((d.k1 - d.k2) * (d.k1 - d.k3) * (d.k2 - d.k3)));
}

// calculates the position of our vec the concentration should be in
// takes in graph starting date, dose date, and samples per day
pub fn calc_concentration_offset(
    graph_start_date: OffsetDateTime,
    dose_date: OffsetDateTime,
    samples_per_day: i32,
) -> usize {
    (time_difference(graph_start_date, dose_date) * samples_per_day)
        .try_into()
        .unwrap()
}

pub fn convert_units(concentration: f64, unit_from: Unit, unit_to: Unit) -> f64 {
    const E2_MOLAR_MASS: f64 = 272.38; // g/mol

    if unit_from == unit_to {
        return concentration;
    }

    match unit_to {
        Unit::PgML => concentration * E2_MOLAR_MASS / 1000.0,
        Unit::PmolL => concentration / E2_MOLAR_MASS * 1000.0,
    }
}

// takes in two OffsetDateTimes and returns the difference in hours between them in days
pub fn time_difference(minuend: OffsetDateTime, subtrahend: OffsetDateTime) -> i32 {
    (((minuend.unix_timestamp() - subtrahend.unix_timestamp()) as f64) / (60.0 * 60.0 * 24.0))
        .round()
        .abs() as i32
}

use crate::esters::Dose;
use plotters::prelude::*;
use std::collections::HashMap;
use time::OffsetDateTime;

pub struct GraphOptions {
    pub date_start: OffsetDateTime,
    pub date_end: OffsetDateTime,
    pub samples_per_day: i32,
    pub doses: Vec<Dose>,
}

pub fn create_graph(concentrations: &Vec<f64>, graph_options: &GraphOptions) {
    let now = OffsetDateTime::now_utc();

    let root = BitMapBackend::new("assets.png", (640, 480)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let mut highest_concentration: f64 = 0.0;

    for concentration in concentrations {
        if concentration > &highest_concentration {
            highest_concentration = *concentration;
        }
    }

    // round to the nearest increment of 100
    highest_concentration = (highest_concentration * 0.1).ceil() / 0.1;

    let mut chart = ChartBuilder::on(&root)
        .caption("y=x^2", ("sans-serif", 32).into_font())
        .margin(5)
        .x_label_area_size(30)
        .y_label_area_size(30)
        .build_cartesian_2d(0.0..32.0, 0.0..highest_concentration)
        .unwrap();

    chart.configure_mesh().draw().unwrap();

    chart
        .draw_series(LineSeries::new(
            (0..concentrations.len()).map(|x| {
                (
                    x as f64 * (1.0 / graph_options.samples_per_day as f64),
                    concentrations[x],
                )
            }),
            &RED,
        ))
        .unwrap();

    chart
        .configure_series_labels()
        .background_style(&WHITE.mix(0.8))
        .border_style(&BLACK)
        .draw()
        .unwrap();

    root.present().unwrap();
}

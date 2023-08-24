use crate::esters::{time_difference, Dose};
use plotters::prelude::*;
use time::OffsetDateTime;

pub struct GraphOptions {
    pub date_start: OffsetDateTime,
    pub date_end: OffsetDateTime,
    pub samples_per_day: i32,
    pub doses: Vec<Dose>,
}

pub fn create_graph(concentrations: &Vec<f64>, graph_options: &GraphOptions) {
    let root = BitMapBackend::new("assets.png", (1280, 960)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let mut highest_concentration: f64 = 0.0;

    for concentration in concentrations {
        if concentration > &highest_concentration {
            highest_concentration = *concentration;
        }
    }

    // round to the nearest increment of 100 (for y key)
    highest_concentration = (highest_concentration * 0.2).ceil() / 0.2;

    let graph_x_axis = time_difference(graph_options.date_start, graph_options.date_end) as f64;

    let mut chart = ChartBuilder::on(&root)
        .caption(
            "E2 Concentrations | Aug 16 - Present",
            ("sans-serif", 32).into_font(),
        )
        .margin(20)
        .x_label_area_size(50)
        .y_label_area_size(80)
        .build_cartesian_2d(0.0..graph_x_axis, 0.0..highest_concentration)
        .unwrap();

    chart
        .configure_mesh()
        .x_desc("Date (days)")
        .y_desc("Concentration (pg/ml)")
        .label_style(TextStyle::from(("sans-serif", 20)))
        .draw()
        .unwrap();

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

    // it's slow to use a for loop here, but i'm not sure hot to properly handle
    // labeling different esters here
    let mut first = true;

    for dose in &graph_options.doses {
        let position_offset = if first {
            first = false;
            (12, -8)
        } else {
            (-12, 10)
        };

        chart
            .draw_series(PointSeries::of_element(
                vec![dose_to_coords(&dose, &concentrations, graph_options)],
                5,
                &RED,
                &|c, s, st| {
                    return EmptyElement::at(c)    // We want to construct a composed element on-the-fly
            + Circle::new((0,0),s,st.filled()) // At this point, the new pixel coordinate is established
            + Text::new(format!("{} {}mg", dose.ester.short_name, dose.amount), position_offset, ("sans-serif", 20).into_font());
                },
            ))
            .unwrap();
    }

    root.present().unwrap();
}

pub fn dose_to_coords(
    dose: &Dose,
    concentrations: &Vec<f64>,
    graph_options: &GraphOptions,
) -> (f64, f64) {
    let x = time_difference(dose.datetime, graph_options.date_start);

    (
        (x) as f64,
        concentrations[x as usize * graph_options.samples_per_day as usize],
    )
}

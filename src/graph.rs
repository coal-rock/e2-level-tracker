use plotters::prelude::*;
use std::collections::HashMap;

pub fn create_graph(points: HashMap<i64, f64>) {
    let root = BitMapBackend::new("assets.png", (640, 480)).into_drawing_area();
    root.fill(&WHITE).unwrap();

    let mut highest_point: f64 = 0.0;

    // hacky and slow
    let mut timestamps: Vec<&i64> = points.keys().collect();
    timestamps.sort();

    let mut scaled_points = vec![];

    for timestamp in timestamps {
        let point = *points.get(timestamp).unwrap();

        scaled_points.push((
            (*timestamp as f64) / 1000.0,
            *points.get(timestamp).unwrap(),
        ));

        if point > highest_point {
            highest_point = point;
        }
    }

    // round to the nearest increment of 100
    highest_point = (highest_point * 0.01).ceil() / 0.01;

    let mut chart = ChartBuilder::on(&root)
        .caption("y=x^2", ("sans-serif", 32).into_font())
        .margin(5)
        .x_label_area_size(30)
        .y_label_area_size(30)
        .build_cartesian_2d(0.0..32.0, 0.0..highest_point)
        .unwrap();

    chart.configure_mesh().draw().unwrap();

    chart
        .draw_series(LineSeries::new(scaled_points, &RED))
        .unwrap()
        .label("y = x^2")
        .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], &RED));

    chart
        .configure_series_labels()
        .background_style(&WHITE.mix(0.8))
        .border_style(&BLACK)
        .draw()
        .unwrap();

    root.present().unwrap();
}

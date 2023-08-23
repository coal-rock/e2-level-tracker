use time::macros::datetime;
use time::OffsetDateTime;

use crate::esters::{calc_graph, time_difference, Dose, EEN};
use crate::graph::{create_graph, GraphOptions};

pub mod config;
pub mod esters;
pub mod graph;

fn main() {
    let doses = vec![
        Dose {
            datetime: datetime!(2023-7-16 12:00:00 UTC),
            amount: 8.0,
            ester: &EEN,
        },
        Dose {
            datetime: datetime!(2023-7-30 12:00:00 UTC),
            amount: 10.0,
            ester: &EEN,
        },
        Dose {
            datetime: datetime!(2023-8-12 12:00:00 UTC),
            amount: 6.0,
            ester: &EEN,
        },
        Dose {
            datetime: datetime!(2023-8-19 12:00:00 UTC),
            amount: 12.0,
            ester: &EEN,
        },
    ];

    let graph_options = GraphOptions {
        date_start: datetime!(2023-7-16 12:00:00 UTC),
        date_end: datetime!(2023-8-23 12:00:00 UTC),
        samples_per_day: 24,
        doses: doses.clone(),
    };

    let concentrations = calc_graph(&graph_options);

    // println!("{:#?}", concentrations);
    println!(
        "{:#?}",
        time_difference(
            datetime!(2023-8-02 12:00:00 UTC),
            datetime!(2023-8-03 12:00:00 UTC)
        )
    );
    create_graph(&concentrations, &graph_options);
}

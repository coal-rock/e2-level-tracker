use time::macros::datetime;
use time::OffsetDateTime;

use crate::esters::{calc_graph, Dose, EEN};
use crate::graph::{create_graph, GraphOptions};

pub mod config;
pub mod esters;
pub mod graph;

fn main() {
    let doses = vec![
        Dose {
            datetime: datetime!(2023-8-02 12:00:00 UTC),
            amount: 7,
            ester: &EEN,
        },
        Dose {
            datetime: datetime!(2023-8-09 12:00:00 UTC),
            amount: 7,
            ester: &EEN,
        },
    ];

    let graph_options = GraphOptions {
        date_start: datetime!(2023-8-02 12:00:00 UTC),
        date_end: datetime!(2023-8-12 12:00:00 UTC),
        samples_per_day: 24,
        doses: doses.clone(),
    };

    let concentrations = calc_graph(&graph_options);

    println!("{:#?}", concentrations);

    create_graph(&concentrations, &graph_options);
}

use crate::{
    esters::{calc_graph, Dose, EEN},
    graph::create_graph,
};

pub mod config;
pub mod esters;
pub mod graph;

fn main() {
    let points = calc_graph(vec![Dose {
        timestamp: 0,
        amount: 7,
        ester: &EEN,
    }]);

    println!("{:#?}", points);

    create_graph(points);
}

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

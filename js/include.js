// console.log("Version: v=0.0.1");
// © 2022 Chase Curtis. All rights reserved.

// Demographic Data
const Gender = {
Male: "Male",
Female: "Female",
}
const PATIENT_GENDER_MALE_ELEMENT = document.getElementById("patient_gender_male");
const PATIENT_GENDER_FEMALE_ELEMENT = document.getElementById("patient_gender_female");
const PATIENT_AGE_ELEMENT = document.getElementById("patient_age");
const PATIENT_HEIGHT_ELEMENT = document.getElementById("patient_height");
const PATIENT_WEIGHT_ELEMENT = document.getElementById("patient_weight");
const PATIENT_SCR_ELEMENT = document.getElementById("patient_scr");

 // AUC:MIC Vancomycin Dosing Calculator
const ESTIMATED_CrCl_ELEMENT = document.getElementById("estimated_crcl");
const DESIRED_VANC_DOSE_ELEMENT = document.getElementById("desiredVancDose");
const DOSE_FREQUENCY_ELEMENT = document.getElementById("desiredVancDoseingFrequency");

// Demographic Data
function IdealBodyWeight(patient_height, gender) {
    if (gender === Gender.Female) {
        return 45.5 + (2.3 * ((patient_height - 152.4) / 2.54))
    }

    return 50 + (2.3 * ((patient_height - 152.4) / 2.54))
}

function adjustedBodyWeight(patientIdealWeight, patient_weight) {
    return patientIdealWeight + 0.4 * (patient_weight - patientIdealWeight);
}

function personsObese(patientIdealWeight, patient_weight) {
    return ((patient_weight - patientIdealWeight) / patientIdealWeight) * 100;
}

function BMI(patient_weight, patient_height) {
    return patient_weight / ((patient_height / 100) * patient_height / 100);
}

function estimateCrClWeight(patient_age, patient_scr, patient_weight, gender) {
    const maleCrClWeight = ((140 - patient_age) * patient_weight) / (72 * patient_scr)

    if (gender === Gender.Female) {
        return maleCrClWeight * 0.85
    }
    return maleCrClWeight
}

function estimateCrClWithNoWeight(patient_age, patient_scr, gender) {
    const maleCrClNoWeight = (140 - patient_age) / patient_scr;

    if (gender === Gender.Female) {
        return maleCrClNoWeight * 0.85;
    }
    return maleCrClNoWeight;
}

// AUC:MIC Vancomycin Dosing Calculator
function vancKe(Cl, Vd) {
    // =K13/K12
    return Cl / Vd
}

function vancTHalfLife(Ke) {
    // =0.693/K10
    return 0.693 / Ke;

}

function vancVd(patient_age, patient_weight) {
    // =(0.29*E5) + (0.33*E7) + 11
    return (0.29 * patient_age) + (0.33 * patient_weight) + 11
}

function vancCl(estimatedCrCl) {
    // ((0.705*M6)+4)*0.06
    return ((0.705 * estimatedCrCl) + 4) * 0.06;
}

function vancAUC_24(Cl, size) {
    // K13*400
    // K13*500
    // K13*600
    return Cl * size;
}

function vancEstimatePeak(desiredVancDose, Cl, Ke, doseFrequency) {
    // ((M21)/(M26*K13))*((1-EXP(-K10*M26))/(1-EXP(-K10*M22)))
    // M26 = M21/1000
    return (desiredVancDose / ((desiredVancDose / 1000) * Cl)) * ((1 - Math.E ** ( - Ke * (desiredVancDose / 1000))) / (1 - Math.E ** (- Ke * doseFrequency)));

}

function vancEstimateTrough(vancEstimatePeak, desiredVancDose, Ke, doseFrequency) {
    // K24*(EXP(-K10*(M22-M26)))
    // M26 = M21/1000

    //K24*(EXP(-K10*(M22-M21/1000)))
    return vancEstimatePeak * (Math.E ** ( - Ke * (doseFrequency - (desiredVancDose / 1000))));
}

function vancEstimateAUC_24(desiredVancDose, Cl, doseFrequency) {
    // K29/K13
    // K29 =(M21*24)/M22
    return ((desiredVancDose * 24) / doseFrequency) / Cl
}

function vancDoubleCheckAUC_24(desiredVancDose, doseFrequency, vancEstimatePeak, vancEstimateTrough, Ke) {
    // (O30+O31)*(24/M22)
    // AUCinf O30 = ((K24+K25)/2)*(M21/1000)
    // AUCelim= O31 = (K24-K25)/K10

    // (((K24+K25)/2)*(M21/1000)+(K24-K25)/K10)*(24/M22)
    return (((vancEstimatePeak + vancEstimateTrough) / 2) * (desiredVancDose / 1000) + ((vancEstimatePeak - vancEstimateTrough) / Ke)) * (24 / doseFrequency);
}

// Helper Functions
function setInnerHTML(element, value, precision = 2) {
    document.getElementById(element).innerHTML = value.toFixed(precision);
}

function setValue(element, value, precision = 2) {
    document.getElementById(element).value = value.toFixed(precision);
}

// main function
function run(setCrClInput) {
    const patient_age = parseInt(PATIENT_AGE_ELEMENT.value);
    const patient_height = parseInt(PATIENT_HEIGHT_ELEMENT.value);
    const patient_weight = parseFloat(PATIENT_WEIGHT_ELEMENT.value);
    const patient_scr = parseFloat(PATIENT_SCR_ELEMENT.value);

    if (PATIENT_GENDER_MALE_ELEMENT.checked) {
        var gender = Gender.Male;
    } else if (PATIENT_GENDER_FEMALE_ELEMENT.checked) {
        var gender = Gender.Female;
    } else {
        console.log("No gender provided");
    }

    // Demographic Data
    const patient_IdealBodyWeight = IdealBodyWeight(patient_height, gender);
    const patient_adjustedBodyWeight = adjustedBodyWeight(patient_IdealBodyWeight, patient_weight);
    const patient_personsObese = personsObese(patient_IdealBodyWeight, patient_weight);
    const patient_BMI = BMI(patient_weight, patient_height);
    const patient_estimatedCrClActualWeight = estimateCrClWeight(patient_age, patient_scr, patient_weight, gender);
    const patient_estimatedCrClAdjustedWeight = estimateCrClWeight(patient_age, patient_scr, patient_adjustedBodyWeight, gender);
    const patient_estimatedCrClIdealWeight = estimateCrClWeight(patient_age, patient_scr, patient_IdealBodyWeight, gender);
    const patient_estCrClNoWeight = estimateCrClWithNoWeight(patient_age, patient_scr, gender);

    setInnerHTML("patient_Ideal_body_weight_value", patient_IdealBodyWeight);
    setInnerHTML("patient_adjusted_body_weight_value", patient_adjustedBodyWeight);
    setInnerHTML("patient_percent_obese_weight_value", patient_personsObese);
    setInnerHTML("patient_bmi_value", patient_BMI);
    setInnerHTML("patient_estimated_crcl_using_actual_weight_value", patient_estimatedCrClActualWeight);
    setInnerHTML("patient_estimated_crcl_using_adjusted_weight_value", patient_estimatedCrClAdjustedWeight);
    setInnerHTML("patient_estimated_crcl_using_ideal_weight_value", patient_estimatedCrClIdealWeight);
    setInnerHTML("patient_estimated_crcl_using_no_weight_value", patient_estCrClNoWeight);

    switch(setCrClInput) {
        case 'actual':
            setValue('estimated_crcl', patient_estimatedCrClActualWeight);
            break;
        case 'adjusted':
            setValue('estimated_crcl', patient_estimatedCrClAdjustedWeight);
            break;
        case 'ideal':
            setValue('estimated_crcl', patient_estimatedCrClIdealWeight);
            break;
        case 'no':
            setValue('estimated_crcl', patient_estCrClNoWeight);
            break;
    }

     // AUC:MIC Vancomycin Dosing Calculator
    const estimatedCrCl = parseFloat(ESTIMATED_CrCl_ELEMENT.value);
    const desiredVancDose = parseFloat(DESIRED_VANC_DOSE_ELEMENT.value);
    const doseFrequency = parseFloat(DOSE_FREQUENCY_ELEMENT.value);

    const calcCl = vancCl(estimatedCrCl);
    const calcVd = vancVd(patient_age, patient_weight);
    const calcKe = vancKe(calcCl, calcVd);
    const calcTHalfLife = vancTHalfLife(calcKe);
    const calcAUC_24_400 = vancAUC_24(calcCl, 400);
    const calcAUC_24_500 = vancAUC_24(calcCl, 500);
    const calcAUC_24_600 = vancAUC_24(calcCl, 600);
    const calcEstimatePeak = vancEstimatePeak(desiredVancDose, calcCl, calcKe, doseFrequency);
    const calcEstimateTrough = vancEstimateTrough(calcEstimatePeak, desiredVancDose, calcKe, doseFrequency);
    const calcEstimateAUC_24 = vancEstimateAUC_24(desiredVancDose, calcCl, doseFrequency);
    const calcDoubleCheckAUC_24 = vancDoubleCheckAUC_24(desiredVancDose, doseFrequency, calcEstimatePeak, calcEstimateTrough, calcKe);

    setInnerHTML("patient_ke_value", calcKe, 4);
    setInnerHTML("patient_t_half_value", calcTHalfLife);
    setInnerHTML("patient_vd_value", calcVd, 1);
    setInnerHTML("patient_cl_vanc_value", calcCl);
    setInnerHTML("patient_AUC_24_400_value", calcAUC_24_400, 0);
    setInnerHTML("patient_AUC_24_400_value_rounded", Math.round(calcAUC_24_400 / 250) * 250, 0);
    setInnerHTML("patient_AUC_24_500_value", calcAUC_24_500, 0);
    setInnerHTML("patient_AUC_24_500_value_rounded", Math.round(calcAUC_24_500 / 250) * 250, 0);
    setInnerHTML("patient_AUC_24_600_value", calcAUC_24_600, 0);
    setInnerHTML("patient_AUC_24_600_value_rounded", Math.round(calcAUC_24_600 / 250) * 250, 0);
    setInnerHTML("estimated_peak_value", calcEstimatePeak, 1);
    setInnerHTML("estimated_trough_value", calcEstimateTrough, 1);
    setInnerHTML("estimated_AUC_24_value", calcEstimateAUC_24, 0);
    setInnerHTML("doubleCheck_AUC_24_value", calcDoubleCheckAUC_24, 0);
}

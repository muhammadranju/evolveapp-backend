import { DailyTracking } from '../app/modules/appAthlete/dailyTracking/daily.tracking.interface';

export function calculateNumericAverages(weeklyData: DailyTracking[]) {
  const totals = {
    weight: 0,
    sleepHour: 0,
    sleepQuality: 0,
    activityStep: 0,

    energyAndWellBeing: {
      energyLevel: 0,
      stressLevel: 0,
      muscelLevel: 0,
      mood: 0,
      motivation: 0,
      bodyTemperature: 0,
    },
    training: {
      cardioDuration: 0,
    },
    nutrition: {
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0,
      hungerLevel: 0,
      digestionLevel: 0,
      salt: 0,
    },
    woman: {
      pmsSymptoms: 0,
      cramps: 0,
    },
    bloodPressure: {
      systolic: 0,
      diastolic: 0,
      restingHeartRate: 0,
      bloodGlucose: 0,
    },
  };

  weeklyData.forEach(item => {
    totals.weight += Number(item.weight);
    totals.sleepHour += Number(item.sleepHour);
    totals.sleepQuality += Number(item.sleepQuality); // convert string to number
    totals.activityStep += Number(item.activityStep);

    totals.energyAndWellBeing.energyLevel += Number(
      item.energyAndWellBeing?.energyLevel,
    );
    totals.energyAndWellBeing.stressLevel += Number(
      item.energyAndWellBeing?.stressLevel,
    );
    totals.energyAndWellBeing.muscelLevel += Number(
      item.energyAndWellBeing?.muscelLevel,
    );
    totals.energyAndWellBeing.mood += Number(item.energyAndWellBeing?.mood);
    totals.energyAndWellBeing.motivation += Number(
      item.energyAndWellBeing?.motivation,
    );
    totals.energyAndWellBeing.bodyTemperature += Number(
      item.energyAndWellBeing?.bodyTemperature,
    ); // string to number

    totals.training.cardioDuration += Number(item.training?.duration);

    totals.nutrition.calories += Number(item.nutrition?.calories);
    totals.nutrition.carbs += Number(item.nutrition?.carbs);
    totals.nutrition.protein += Number(item.nutrition?.protein);
    totals.nutrition.fats += Number(item.nutrition?.fats);
    totals.nutrition.hungerLevel += Number(item.nutrition?.hungerLevel);
    totals.nutrition.digestionLevel += Number(item.nutrition?.digestionLevel);
    totals.nutrition.salt += Number(item.nutrition?.salt);

    totals.woman.pmsSymptoms += Number(item.woman?.pmsSymptoms);
    totals.woman.cramps += Number(item.woman?.cramps);

    totals.bloodPressure.systolic += Number(item.bloodPressure?.systolic);
    totals.bloodPressure.diastolic += Number(item.bloodPressure?.diastolic);
    totals.bloodPressure.restingHeartRate += Number(
      item.bloodPressure?.restingHeartRate,
    );
    totals.bloodPressure.bloodGlucose += Number(
      item.bloodPressure?.bloodGlucose,
    );
  });

  const count = weeklyData.length || 1;

  return {
    weight: totals.weight / count,
    sleepHour: totals.sleepHour / count,
    sleepQuality: totals.sleepQuality / count, // average as number
    activityStep: totals.activityStep / count,
    energyAndWellBeing: {
      energyLevel: totals.energyAndWellBeing.energyLevel / count,
      stressLevel: totals.energyAndWellBeing.stressLevel / count,
      muscelLevel: totals.energyAndWellBeing.muscelLevel / count,
      mood: totals.energyAndWellBeing.mood / count,
      motivation: totals.energyAndWellBeing.motivation / count,
      bodyTemperature: totals.energyAndWellBeing.bodyTemperature / count,
    },
    nutrition: {
      calories: totals.nutrition.calories / count,
      carbs: totals.nutrition.carbs / count,
      protein: totals.nutrition.protein / count,
      fats: totals.nutrition.fats / count,
      hungerLevel: totals.nutrition.hungerLevel / count,
      digestionLevel: totals.nutrition.digestionLevel / count,
      salt: totals.nutrition.salt / count,
    },
    training: {
      cardioDuration: totals.training.cardioDuration / count,
    },
    woman: {
      pmsSymptoms: totals.woman.pmsSymptoms / count,
      cramps: totals.woman.cramps / count,
    },
    bloodPressure: {
      systolic: totals.bloodPressure.systolic / count,
      diastolic: totals.bloodPressure.diastolic / count,
      restingHeartRate: totals.bloodPressure.restingHeartRate / count,
      bloodGlucose: totals.bloodPressure.bloodGlucose / count,
    },
  };
}

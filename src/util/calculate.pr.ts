interface PushData {
  weight: number;
  reps: number;
}

interface PRResult {
  weightPR: boolean;
  repsPR: boolean;
  oneRMPR: boolean;
  totalPR: number;
}

/**
 * Calculate One-Rep Max (1RM)
 * Formula: 1RM = Weight × (1 + Reps / 30)
 */
export const calculateOneRM = (weight: number, reps: number): number => {
  return Math.round(weight * (1 + reps / 30));
};

export const calculatePR = (
  previousData: PushData[],
  currentData: PushData[]
): PRResult => {
  let weightPR = false;
  let repsPR = false;
  let oneRMPR = false;

  const previousMaxWeight = Math.max(...previousData.map(d => d.weight));
  const previousMaxOneRM = Math.max(
    ...previousData.map(d => calculateOneRM(d.weight, d.reps))
  );

  currentData.forEach(current => {
    const currentOneRM = calculateOneRM(current.weight, current.reps);

    // Weight PR
    if (current.weight > previousMaxWeight) {
      weightPR = true;
    }

    // Reps PR (same weight)
    const prevSameWeight = previousData.find(p => p.weight === current.weight);
    if (prevSameWeight && current.reps > prevSameWeight.reps) {
      repsPR = true;
    }

    // 1RM PR
    if (currentOneRM > previousMaxOneRM) {
      oneRMPR = true;
    }
  });

  const totalPR = Number(weightPR) + Number(repsPR) + Number(oneRMPR);

  return {
    weightPR,
    repsPR,
    oneRMPR,
    totalPR,
  };
};

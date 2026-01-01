// services/ruleEngineServices.js
export const runRules = (stats) => {
  const results = [];

  // Low accuracy on easy problems
  if (stats.accuracy < 60 && stats.easyWrong > 0) {
    results.push({
      rootCause: "lowAccuracy",
      severity: "critical"
    });
  }

  // Slow problem solving
  if (stats.avgTime > 300) {
    results.push({
      rootCause: "slowSpeed",
      severity: "high"
    });
  }

  // Inconsistency over multiple attempts
  if (stats.attempts >= 5 && stats.accuracy < 65) {
    results.push({
      rootCause: "inconsistency",
      severity: "medium"
    });
  }

  return results;
};

export default runRules;

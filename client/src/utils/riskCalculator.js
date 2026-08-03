/**
 * Unified Risk Score Calculation used across CloudAtlas
 * Formula considers concentration risk ratio (% spend in top service)
 * and active service spread count.
 */
export const calculateRiskScore = (dataSummary) => {
  if (!dataSummary || !dataSummary.serviceSpend || dataSummary.serviceSpend.length === 0) {
    return 0;
  }
  const services = dataSummary.serviceSpend;
  const totalCost = dataSummary.totalCost || 1;
  const topCost = services[0]?.cost || 0;
  
  // 1. Concentration Risk Ratio (% of spend locked in top single service)
  const concentrationRatio = (topCost / totalCost) * 100;
  
  // 2. Multi-Service Spread (Number of active services spreading risk)
  const activeServiceCount = services.length;
  const spreadBonus = Math.max(0, (5 - activeServiceCount) * 4); // Higher risk if few services
  
  // 3. Dynamic Calculation: Baseline 18 + (Concentration * 0.45) + SpreadBonus
  const calculatedScore = Math.round(18 + (concentrationRatio * 0.45) + spreadBonus);
  return Math.min(95, Math.max(15, calculatedScore));
};

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

  // 1. Service Concentration Risk via Herfindahl-Hirschman Index (HHI)
  // HHI is sum of (percentage share)^2. Range: 1000 to 10000.
  let hhi = 0;
  services.forEach(s => {
    const pct = (s.cost / totalCost) * 100;
    hhi += Math.pow(pct, 2);
  });
  const rConc = Math.min(35, Math.round((hhi / 10000) * 85));

  // 2. Daily Cost Volatility (CV = Standard Deviation / Mean)
  let rVol = 5;
  if (dataSummary.dailySpend && dataSummary.dailySpend.length > 1) {
    const dailyCosts = dataSummary.dailySpend.map(d => Number(d.cost) || 0);
    const avgDaily = dailyCosts.reduce((s, c) => s + c, 0) / dailyCosts.length;
    if (avgDaily > 0) {
      const variance = dailyCosts.reduce((s, c) => s + Math.pow(c - avgDaily, 2), 0) / dailyCosts.length;
      const cv = Math.sqrt(variance) / avgDaily;
      rVol = Math.min(30, Math.round(cv * 30));
    }
  }

  // 3. Cost Spike Anomaly Ratio (Spikes > 1.35x mean daily spend / total days)
  let rSpike = 0;
  if (dataSummary.dailySpend && dataSummary.dailySpend.length > 0) {
    const avgDaily = dataSummary.dailySpend.reduce((s, d) => s + d.cost, 0) / dataSummary.dailySpend.length;
    const spikeDays = dataSummary.dailySpend.filter(d => d.cost > avgDaily * 1.35).length;
    const spikeRatio = spikeDays / dataSummary.dailySpend.length;
    rSpike = Math.min(20, Math.round(spikeRatio * 100));
  }

  // 4. Single Cloud Vendor Dependency Risk
  let rVendor = 15;
  if (dataSummary.providerSpend) {
    const pSpend = dataSummary.providerSpend;
    const costs = typeof pSpend === 'object' ? Object.values(pSpend).filter(v => v > 0) : [];
    if (costs.length > 1) {
      const topP = Math.max(...costs);
      const share = topP / totalCost;
      rVendor = Math.round(share * 15);
    }
  }

  // Final Pure FinOps Mathematical Risk Score
  const finalScore = Math.round(rConc + rVol + rSpike + rVendor);
  return Math.min(99, Math.max(1, finalScore));
};

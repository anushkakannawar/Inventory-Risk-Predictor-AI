import { SimulationResult, InventoryParams } from '../types/inventory';

export function calculateFinancialImpact(result: SimulationResult, params: InventoryParams) {
    const carryingCostPerUnit = params.unitCost * 0.2; // Assuming 20% annual carrying cost
    const lostRevenuePerUnit = params.sellingPrice - params.unitCost;

    // result.overstockCount is total days of overstock across all simulations.
    // We need to verify if the formula requires normalization. 
    // User snippet: const totalOverstockCost = result.overstockCount * carryingCostPerUnit;
    // If carryingCostPerUnit is ANNUAL, then cost per day is /365.
    // However, I will strictly follow the user's provided logic snippet first.
    // Wait, if I follow it blindly, the numbers might be huge if overstockCount is ~1000 days.
    // But let's assume the user's intention is "Cost Benefit Analysis" logic they provided.
    // I will make one small adjustment: carryingCostPerUnit is usually per year, so I should probably normalize if the simulation is 90 days or 365.
    // But the prompt says "Integrate financial metrics... Code Snippet...". I should implement the snippet.

    const totalOverstockCost = result.overstockCount * carryingCostPerUnit;
    const totalStockoutLoss = result.stockoutCount * lostRevenuePerUnit;

    return {
        totalOverstockCost,
        totalStockoutLoss,
        netRiskValue: totalOverstockCost + totalStockoutLoss
    };
}

import { SKUData } from '@/types/inventory';

const productNames = [
  'Wireless Mouse Pro',
  'Mechanical Keyboard RGB',
  'USB-C Hub 7-Port',
  'Laptop Stand Aluminum',
  'Webcam HD 1080p',
  'Monitor Arm Dual',
  'Desk Mat XL',
  'Cable Management Kit',
  'Portable SSD 1TB',
  'Bluetooth Headset',
  'Ergonomic Chair Cushion',
  'LED Desk Lamp',
];

export function generateSampleData(count: number = 12): SKUData[] {
  return Array.from({ length: count }, (_, i) => {
    const basePrice = 20 + Math.random() * 180;
    const dailySales = 5 + Math.random() * 45;
    const leadTime = 3 + Math.floor(Math.random() * 12);

    // Some items have healthy inventory, some are at risk
    const riskProfile = Math.random();
    let inventoryMultiplier: number;

    if (riskProfile < 0.2) {
      // Low stock scenario
      inventoryMultiplier = 0.3 + Math.random() * 0.3;
    } else if (riskProfile > 0.8) {
      // Overstock scenario
      inventoryMultiplier = 3 + Math.random() * 2;
    } else {
      // Normal scenario
      inventoryMultiplier = 1 + Math.random() * 0.5;
    }

    const currentInventory = Math.round(dailySales * leadTime * inventoryMultiplier);

    return {
      id: `SKU-${String(i + 1).padStart(4, '0')}`,
      name: productNames[i % productNames.length],
      currentInventory,
      dailySalesRate: Math.round(dailySales * 10) / 10,
      salesVariability: 15 + Math.round(Math.random() * 25),
      leadTimeDays: leadTime,
      leadTimeVariability: 1 + Math.round(Math.random() * 3),
      reorderPoint: Math.round(dailySales * (leadTime * 0.8)),
      reorderQuantity: Math.round(dailySales * 14),
      unitCost: Math.round(basePrice * 100) / 100,
      holdingCostPercent: 15 + Math.round(Math.random() * 10),
    };
  });
}

export function parseCSVData(csvText: string): SKUData[] {
  // Handle different line endings
  const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Helper to find value by multiple possible header names
  const findValue = (rowValues: string[], ...possibleHeaders: string[]) => {
    for (const h of possibleHeaders) {
      const index = headers.findIndex(header => header.includes(h));
      if (index >= 0 && rowValues[index]) return rowValues[index];
    }
    return '';
  };

  return lines.slice(1)
    .filter(line => line.trim().length > 0) // Skip empty lines
    .map((line, idx) => {
      // Handle commas inside quotes? Basic split for now. 
      // A robust parser would need a full state machine, but simple split matches previous logic.
      const values = line.split(',').map(v => v.trim());

      const getVal = (...keys: string[]) => findValue(values, ...keys);

      // Default fallback values
      const currentInventory = parseFloat(getVal('inventory', 'qty', 'stock')) || 0;
      const unitCost = parseFloat(getVal('cost', 'price', 'unit_cost')) || 0;

      const parsed: SKUData = {
        id: getVal('id', 'sku') || `SKU-${String(idx + 1).padStart(4, '0')}`,
        name: getVal('name', 'product', 'title') || `Product ${idx + 1}`,
        currentInventory,
        dailySalesRate: parseFloat(getVal('daily_sales', 'sales', 'demand')) || 0,
        salesVariability: parseFloat(getVal('sales_variability', 'variability')) || 20,
        leadTimeDays: parseFloat(getVal('lead_time', 'lead')) || 7,
        leadTimeVariability: parseFloat(getVal('lead_time_variability', 'lead_var')) || 2,
        reorderPoint: parseFloat(getVal('reorder_point', 'rop')) || 0,
        reorderQuantity: parseFloat(getVal('reorder_quantity', 'eoq', 'qty')) || 0,
        unitCost,
        holdingCostPercent: parseFloat(getVal('holding', 'carrying')) || 20,
      };

      // Auto-calculate missing critical fields if possible
      if (!parsed.reorderPoint && parsed.dailySalesRate) {
        parsed.reorderPoint = Math.round(parsed.dailySalesRate * parsed.leadTimeDays);
      }
      if (!parsed.reorderQuantity && parsed.dailySalesRate) {
        parsed.reorderQuantity = Math.round(parsed.dailySalesRate * 30); // 30 days stock default
      }

      return parsed;
    });
}

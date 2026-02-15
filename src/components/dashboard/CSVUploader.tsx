// src/components/dashboard/CSVUploader.tsx
import React from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/context/InventoryContext';
import { SKUData } from '@/types/inventory';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CSVUploader = () => {
  const { setSkus } = useInventory();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData: SKUData[] = results.data.map((row: any) => ({
            id: row.id || Math.random().toString(36).substr(2, 9),
            name: row.name || 'Unknown SKU',
            currentInventory: Number(row.currentInventory) || 0,
            dailySalesRate: Number(row.dailySalesRate) || 0,
            salesVariability: Number(row.salesVariability) || 0,
            leadTimeDays: Number(row.leadTimeDays) || 0,
            leadTimeVariability: Number(row.leadTimeVariability) || 0,
            reorderPoint: Number(row.reorderPoint) || 0,
            reorderQuantity: Number(row.reorderQuantity) || 0,
            unitCost: Number(row.unitCost) || 0,
            holdingCostPercent: Number(row.holdingCostPercent) || 0,
          }));

          setSkus(parsedData);
          toast({
            title: "Success",
            description: `Imported ${parsedData.length} SKUs from CSV.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to parse CSV. Ensure columns match the SKU schema.",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" className="relative cursor-pointer">
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
      </Button>
    </div>
  );
};
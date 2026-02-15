import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SKUData, RiskAnalysis } from "@/types/inventory";
import { getRiskLevel } from "@/lib/simulation";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSKUs: string[];
    skus: SKUData[];
    analyses: Map<string, RiskAnalysis>;
}

export function ComparisonModal({
    isOpen,
    onClose: handleClose,
    selectedSKUs,
    skus,
    analyses,
}: ComparisonModalProps) {
    const comparisonData = selectedSKUs
        .map((id) => {
            const sku = skus.find((s) => s.id === id);
            const analysis = analyses.get(id);
            if (!sku || !analysis) return null;
            return { sku, analysis };
        })
        .filter((item): item is { sku: SKUData; analysis: RiskAnalysis } => item !== null);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>SKU Comparison</DialogTitle>
                    <DialogDescription>
                        Comparing {comparisonData.length} selected items side-by-side.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-md border mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] font-bold bg-muted/50">Metric</TableHead>
                                {comparisonData.map(({ sku }) => (
                                    <TableHead key={sku.id} className="text-center font-bold bg-muted/50">
                                        {sku.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Inventory Stats */}
                            <TableRow>
                                <TableCell className="font-medium">Current Inventory</TableCell>
                                {comparisonData.map(({ sku }) => (
                                    <TableCell key={sku.id} className="text-center">
                                        {sku.currentInventory}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Daily Sales Rate</TableCell>
                                {comparisonData.map(({ sku }) => (
                                    <TableCell key={sku.id} className="text-center">
                                        {sku.dailySalesRate}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Lead Time (Days)</TableCell>
                                {comparisonData.map(({ sku }) => (
                                    <TableCell key={sku.id} className="text-center">
                                        {sku.leadTimeDays}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Risk Levels */}
                            <TableRow className="bg-muted/30">
                                <TableCell className="font-medium">Understock Risk</TableCell>
                                {comparisonData.map(({ analysis }) => {
                                    const riskLevel = getRiskLevel(analysis.understockRisk);
                                    return (
                                        <TableCell
                                            key={analysis.skuId}
                                            className={`text-center font-medium ${riskLevel === "high"
                                                    ? "text-risk-high"
                                                    : riskLevel === "medium"
                                                        ? "text-risk-medium"
                                                        : "text-risk-low"
                                                }`}
                                        >
                                            {analysis.understockRisk.toFixed(1)}%
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            <TableRow className="bg-muted/30">
                                <TableCell className="font-medium">Overstock Risk</TableCell>
                                {comparisonData.map(({ analysis }) => {
                                    const riskLevel = getRiskLevel(analysis.overstockRisk);
                                    return (
                                        <TableCell
                                            key={analysis.skuId}
                                            className={`text-center font-medium ${riskLevel === "high"
                                                    ? "text-risk-high"
                                                    : riskLevel === "medium"
                                                        ? "text-risk-medium"
                                                        : "text-risk-low"
                                                }`}
                                        >
                                            {analysis.overstockRisk.toFixed(1)}%
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            <TableRow className="bg-muted/30">
                                <TableCell className="font-medium">Dead Stock Risk</TableCell>
                                {comparisonData.map(({ analysis }) => {
                                    const riskLevel = getRiskLevel(analysis.deadInventoryRisk);
                                    return (
                                        <TableCell
                                            key={analysis.skuId}
                                            className={`text-center font-medium ${riskLevel === "high"
                                                    ? "text-risk-high"
                                                    : riskLevel === "medium"
                                                        ? "text-risk-medium"
                                                        : "text-risk-low"
                                                }`}
                                        >
                                            {analysis.deadInventoryRisk.toFixed(1)}%
                                        </TableCell>
                                    );
                                })}
                            </TableRow>

                            {/* Recommendations */}
                            <TableRow>
                                <TableCell className="font-medium">Safety Stock</TableCell>
                                {comparisonData.map(({ analysis }) => (
                                    <TableCell key={analysis.skuId} className="text-center">
                                        {Math.round(analysis.safetyStock)}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Reorder Point</TableCell>
                                {comparisonData.map(({ analysis }) => (
                                    <TableCell key={analysis.skuId} className="text-center">
                                        {Math.round(analysis.optimalReorderPoint)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}

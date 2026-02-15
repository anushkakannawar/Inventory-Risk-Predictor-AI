import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  TrendingDown,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useCurrency } from '@/context/CurrencyContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SKUTable } from '@/components/dashboard/SKUTable';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { Button } from '@/components/ui/button';
import { ComparisonModal } from '@/components/dashboard/ComparisonModal';
import { BentoCard } from '@/components/common/BentoCard';

export default function Dashboard() {
  const { skus, analyses, metrics, isLoading, loadSampleData, runAnalysis } = useInventory();
  const { formatCurrency } = useCurrency();
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    if (skus.length > 0 && analyses.size === 0 && !isLoading) {
      runAnalysis();
    }
  }, [skus, analyses.size, isLoading, runAnalysis]);

  // Empty state
  if (skus.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md space-y-6"
          >
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Welcome to Inventory Risk Predictor</h1>
              <p className="text-slate-500">
                Upload your inventory data or generate sample data to get started with AI-powered risk analysis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/input">
                <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                  <Package className="w-4 h-4" />
                  Add Inventory Data
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={loadSampleData} className="gap-2 rounded-xl">
                <Sparkles className="w-4 h-4" />
                Load Sample Data
              </Button>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-slate-700">Running Monte Carlo simulation...</p>
          <p className="text-slate-500">Analyzing risk across {skus.length} SKUs</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Risk Dashboard</h1>
            <p className="text-slate-500 mt-1">
              AI-powered inventory risk analysis for {skus.length} SKUs
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/simulator">
              <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                Run What-If Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Key Metrics - Top Row */}
          {metrics && (
            <>
              <MetricCard
                title="Total SKUs"
                value={metrics.totalSKUs}
                subtitle="Being monitored"
                icon={Package}
              />
              <MetricCard
                title="At Risk"
                value={metrics.atRiskSKUs}
                subtitle="Need attention"
                icon={AlertTriangle}
                variant={metrics.atRiskSKUs > 0 ? 'warning' : 'success'}
              />
              <MetricCard
                title="Healthy"
                value={metrics.healthySKUs}
                subtitle="Low risk items"
                icon={CheckCircle}
                variant="success"
              />
              <MetricCard
                title="Inventory Value"
                value={formatCurrency(metrics.totalInventoryValue)}
                subtitle="Total stock value"
                icon={IndianRupee}
              />
            </>
          )}

          {/* Risk Overview - Spans 2 cols */}
          {metrics && (
            <div className="md:col-span-2 lg:col-span-2">
              <BentoCard title="Overall Risk Assessment">
                <div className="flex flex-col gap-6">
                  <p className="text-slate-500">
                    Based on Monte Carlo simulation of 1,000 scenarios over 90 days,
                    here's your portfolio risk breakdown.
                  </p>

                  <div className="flex gap-4 flex-wrap justify-around">
                    <RiskGauge value={metrics.averageUnderstockRisk} label="Understock" />
                    <RiskGauge value={metrics.averageOverstockRisk} label="Overstock" />
                    <RiskGauge value={metrics.averageDeadInventoryRisk} label="Dead Stock" />
                  </div>

                  {metrics.projectedLosses > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium">
                        Projected losses: <strong>{formatCurrency(metrics.projectedLosses)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </BentoCard>
            </div>
          )}

          {/* Chart 1 - Understock - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
            <BentoCard title="Understock Risk Distribution">
              <RiskDistributionChart
                skus={skus}
                analyses={analyses}
                riskType="understock"
                title=""
              />
            </BentoCard>
          </div>

          {/* Chart 2 - Overstock - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
            <BentoCard title="Overstock Risk Distribution">
              <RiskDistributionChart
                skus={skus}
                analyses={analyses}
                riskType="overstock"
                title=""
              />
            </BentoCard>
          </div>

          {/* Chart 3 - Dead Stock - Spans 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
            <BentoCard title="Dead Stock Risk Distribution">
              <RiskDistributionChart
                skus={skus}
                analyses={analyses}
                riskType="deadInventory"
                title=""
              />
            </BentoCard>
          </div>
        </div>

        {/* SKU Table - Full Width */}
        <BentoCard
          title="Inventory Details"
          className="overflow-hidden"
          action={
            selectedSKUs.length > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setIsComparisonOpen(true)} className="rounded-lg">
                Compare {selectedSKUs.length} Selected
              </Button>
            )
          }
        >
          <SKUTable
            skus={skus}
            analyses={analyses}
            selectedSKUs={selectedSKUs}
            onSelectSKU={setSelectedSKUs}
          />
        </BentoCard>
      </div>
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        selectedSKUs={selectedSKUs}
        skus={skus}
        analyses={analyses}
      />
    </AppLayout>
  );
}

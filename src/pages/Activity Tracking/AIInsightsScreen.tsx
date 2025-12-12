import { ArrowLeft, Activity, Target, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import Chart from "chart.js/auto";

interface AIInsightsScreenProps {
  onNavigate: (screen: string) => void;
}

export function AIInsightsScreen({ onNavigate }: AIInsightsScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIActivityInsights | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester' | 'all'>('month');

  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);

  const COLORS = ['#7A0019', '#C2410C', '#0369A1'];

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const filters: AIInsightsFilters = { period: selectedPeriod };

      try {
        const data = await getAIActivityInsights(filters);
        setInsights(data);
      } catch {
        // fallback mock data
        const mockInsights: AIActivityInsights = {
          trends: {
            mostActiveDay: 'Wednesday',
            mostActiveCategory: 'Sports',
            consistencyScore: 78,
            consistencyImprovement: 12,
            averageSessionDuration: 2.5
          },
          patterns: {
            preferredTimeOfDay: 'Evening (6-9 PM)',
            activityFrequency: 3.2,
            weekdayVsWeekend: { weekday: 65, weekend: 35 }
          },
          recommendations: [
            "You're most consistent with sports activities. Consider diversifying into fitness training.",
            "Your activity levels peak on Wednesdays. Try maintaining this energy throughout the week.",
            "Evening sessions work best for you. Schedule important activities during this time.",
            "You're 12% more consistent than last period - keep up the great work!"
          ],
          chartData: {
            weeklyActivity: [
              { day: 'Mon', hours: 2 }, { day: 'Tue', hours: 2.5 }, { day: 'Wed', hours: 4 },
              { day: 'Thu', hours: 3 }, { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 1.5 }, { day: 'Sun', hours: 1 }
            ],
            categoryDistribution: [
              { category: 'Sports', count: 12 },
              { category: 'Fitness', count: 8 },
              { category: 'Outdoor', count: 4 }
            ]
          }
        };
        setInsights(mockInsights);
      }
    } catch (error) {
      console.error('Insights loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedPeriod]);

  // Chart.js rendering
  useEffect(() => {
    if (insights) {
      if (weeklyChartRef.current) {
        new Chart(weeklyChartRef.current, {
          type: 'line',
          data: {
            labels: insights.chartData.weeklyActivity.map(d => d.day),
            datasets: [{
              label: 'Hours',
              data: insights.chartData.weeklyActivity.map(d => d.hours),
              borderColor: '#7A0019',
              backgroundColor: 'rgba(122,0,25,0.2)',
              tension: 0.3
            }]
          },
          options: { responsive: true, plugins: { legend: { display: true } } }
        });
      }

      if (categoryChartRef.current) {
        new Chart(categoryChartRef.current, {
          type: 'pie',
          data: {
            labels: insights.chartData.categoryDistribution.map(d => d.category),
            datasets: [{
              data: insights.chartData.categoryDistribution.map(d => d.count),
              backgroundColor: COLORS
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }
    }
  }, [insights]);

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return { bg: '#F0F9FF', text: '#0369A1' };
    if (score >= 60) return { bg: '#FFF7ED', text: '#C2410C' };
    return { bg: '#FEF2F2', text: '#991B1B' };
  };

  const getConsistencyLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: "#E5E5E5" }}>
        <button onClick={() => onNavigate("activity-main")} className="flex items-center justify-center w-9 h-9" style={{ color: "#1A1A1A" }}>
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 style={{ color: "#1A1A1A", fontWeight: 600, fontSize: 20 }}>AI Activity Insights</h1>
          <p style={{ color: "#6A6A6A", fontSize: 14 }}>Understand your activity patterns</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Period Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['week', 'month', 'semester', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p as any)}
              className="px-4 py-2 whitespace-nowrap"
              style={{
                backgroundColor: selectedPeriod === p ? "#7A0019" : "#FFF",
                color: selectedPeriod === p ? "#FFF" : "#6A6A6A",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                border: selectedPeriod === p ? "none" : "1px solid #E5E5E5"
              }}
            >
              {p === 'week' ? 'Last Week' : p === 'month' ? 'Last Month' : p === 'semester' ? 'This Semester' : 'All Time'}
            </button>
          ))}
        </div>

        {isLoading && <div className="text-center py-12">Analyzing your activities...</div>}

        {insights && !isLoading && (
          <>
            {/* Key Trends */}
            <div className="p-5 border rounded-lg bg-gradient-to-br from-red-900 to-red-700 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" /> <h2 className="font-semibold">Your Activity Trends</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-xs opacity-90">Most Active Day</div>
                  <div className="text-lg font-semibold">{insights.trends.mostActiveDay}</div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-xs opacity-90">Top Category</div>
                  <div className="text-lg font-semibold">{insights.trends.mostActiveCategory}</div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-xs opacity-90">Avg. Session</div>
                  <div className="text-lg font-semibold">{insights.trends.averageSessionDuration.toFixed(1)} hrs</div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-xs opacity-90">Frequency</div>
                  <div className="text-lg font-semibold">{insights.patterns.activityFrequency}/week</div>
                </div>
              </div>
            </div>

            {/* Consistency */}
            <div className="p-5 border rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-900" /> <h3 className="font-semibold">Consistency Score</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${insights.trends.consistencyScore}%`,
                      backgroundColor: insights.trends.consistencyScore >= 60 ? "#7A0019" : "#C2410C"
                    }}
                  />
                </div>
                <div className="font-semibold text-lg min-w-[60px] text-right">{insights.trends.consistencyScore}%</div>
              </div>
              <div className="p-3 rounded-lg" style={getConsistencyColor(insights.trends.consistencyScore)}>
                <div className="font-semibold text-sm">{getConsistencyLabel(insights.trends.consistencyScore)}</div>
                {insights.trends.consistencyImprovement !== 0 && (
                  <div className="text-xs">{insights.trends.consistencyImprovement > 0 ? '↑' : '↓'} {Math.abs(insights.trends.consistencyImprovement)}% from last period</div>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="p-5 border rounded-lg">
              <h3 className="font-semibold mb-4">Weekly Activity Pattern</h3>
              <canvas ref={weeklyChartRef}></canvas>
            </div>

            <div className="p-5 border rounded-lg">
              <h3 className="font-semibold mb-4">Activity Category Distribution</h3>
              <canvas ref={categoryChartRef}></canvas>
            </div>

            {/* Recommendations */}
            <div className="p-5 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600" /> <h3 className="font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-semibold">{idx + 1}</div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!insights && !isLoading && (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-semibold mb-2">Not Enough Data</p>
            <p className="text-sm text-gray-500">Record at least 5 activities to see your insights</p>
          </div>
        )}
      </div>
    </div>
  );
}

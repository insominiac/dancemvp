'use client'

import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface PerformanceData {
  currentPeriod: any
  trend: any[]
  classAnalytics: any[]
  feedbackSummary: any
  period: {
    type: string
    start: string
    end: string
  }
}

interface EngagementData {
  stats: any
  trend: any[]
  students: any[]
  insights: any
  classEngagement: any[]
  period: {
    type: string
    start: string
    end: string
  }
}

export default function PerformanceDashboard({ instructorId }: { instructorId: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [instructorId, selectedPeriod])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [performanceRes, engagementRes] = await Promise.all([
        fetch(`/api/instructor/performance/${instructorId}?period=${selectedPeriod}`),
        fetch(`/api/instructor/engagement/${instructorId}?period=${selectedPeriod}`)
      ])

      if (!performanceRes.ok || !engagementRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [performanceResult, engagementResult] = await Promise.all([
        performanceRes.json(),
        engagementRes.json()
      ])

      setPerformanceData(performanceResult.data)
      setEngagementData(engagementResult.data)
    } catch (err) {
      setError('Failed to load performance data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !performanceData || !engagementData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'No data available'}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  // Chart configurations
  const performanceTrendData = {
    labels: performanceData.trend.map(item => 
      new Date(item.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ),
    datasets: [
      {
        label: 'Average Rating',
        data: performanceData.trend.map(item => item.averageRating || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Attendance Rate (%)',
        data: performanceData.trend.map(item => item.attendanceRate),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  }

  const engagementDistributionData = {
    labels: ['High Engagement', 'Neutral', 'Low Engagement'],
    datasets: [
      {
        data: [
          engagementData.stats.engagementDistribution.high,
          engagementData.stats.engagementDistribution.neutral,
          engagementData.stats.engagementDistribution.low,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        max: 5,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Classes"
          value={performanceData.currentPeriod.totalClasses}
          trend={getTrend(performanceData.trend, 'totalClasses')}
          icon="📚"
        />
        <MetricCard
          title="Total Students"
          value={performanceData.currentPeriod.totalStudents}
          trend={getTrend(performanceData.trend, 'totalStudents')}
          icon="👥"
        />
        <MetricCard
          title="Average Rating"
          value={performanceData.currentPeriod.averageRating?.toFixed(1) || 'N/A'}
          trend={getTrend(performanceData.trend, 'averageRating')}
          icon="⭐"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${performanceData.currentPeriod.attendanceRate.toFixed(1)}%`}
          trend={getTrend(performanceData.trend, 'attendanceRate')}
          icon="✅"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="h-64">
            <Line data={performanceTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Engagement Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Student Engagement</h3>
          <div className="h-64">
            <Doughnut 
              data={engagementDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Average Participation</h4>
          <p className="text-2xl font-bold text-blue-600">
            {engagementData.stats.averageParticipation.toFixed(1)}/100
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Questions Asked</h4>
          <p className="text-2xl font-bold text-green-600">
            {engagementData.stats.totalQuestionsAsked}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Help Requests</h4>
          <p className="text-2xl font-bold text-orange-600">
            {engagementData.stats.totalHelpRequests}
          </p>
        </div>
      </div>

      {/* Student Performance Insights */}
      {engagementData.insights.topPerformers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Top Performers</h3>
            <div className="space-y-3">
              {engagementData.insights.topPerformers.slice(0, 5).map((student: any, index: number) => (
                <div key={student.userId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.user?.fullName || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Overall Score: {student.overallScore.toFixed(1)}</p>
                  </div>
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-orange-700">Students Needing Support</h3>
            <div className="space-y-3">
              {engagementData.insights.strugglingStudents.slice(0, 5).map((student: any) => (
                <div key={student.userId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.user?.fullName || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Overall Score: {student.overallScore.toFixed(1)}</p>
                  </div>
                  <span className="text-yellow-500">⚠️</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, trend, icon }: {
  title: string
  value: string | number
  trend: { direction: 'up' | 'down' | 'neutral', percentage: number }
  icon: string
}) {
  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '➡️'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <div className={`flex items-center text-sm ${getTrendColor()}`}>
        <span className="mr-1">{getTrendIcon()}</span>
        <span>{Math.abs(trend.percentage).toFixed(1)}%</span>
      </div>
    </div>
  )
}

function getTrend(trendData: any[], metric: string) {
  if (trendData.length < 2) {
    return { direction: 'neutral' as const, percentage: 0 }
  }

  const current = trendData[trendData.length - 1]?.[metric] || 0
  const previous = trendData[trendData.length - 2]?.[metric] || 0

  if (previous === 0) {
    return { direction: 'neutral' as const, percentage: 0 }
  }

  const percentage = ((current - previous) / previous) * 100
  const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'neutral'

  return { direction, percentage }
}
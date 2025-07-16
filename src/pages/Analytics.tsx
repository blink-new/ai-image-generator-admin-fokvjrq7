import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Image as ImageIcon,
  Calendar,
  Download
} from 'lucide-react'
import { blink } from '../lib/blink'

interface AnalyticsData {
  totalUsers: number
  totalImages: number
  dailyStats: Array<{
    date: string
    users: number
    images: number
  }>
  topPrompts: Array<{
    prompt: string
    count: number
  }>
  userGrowth: Array<{
    month: string
    users: number
  }>
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalImages: 0,
    dailyStats: [],
    topPrompts: [],
    userGrowth: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  const loadAnalytics = useCallback(async () => {
    try {
      // Load users and images
      const users = await blink.db.users.list({ limit: 1000 })
      const images = await blink.db.generatedImages.list({ limit: 1000 })

      // Calculate date range
      const now = new Date()
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

      // Filter data by time range
      const filteredImages = images.filter(img => 
        new Date(img.createdAt) >= startDate
      )

      // Generate daily stats
      const dailyStats = []
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayImages = filteredImages.filter(img => 
          img.createdAt.startsWith(dateStr)
        )
        
        const dayUsers = new Set(dayImages.map(img => img.userId)).size

        dailyStats.push({
          date: dateStr,
          users: dayUsers,
          images: dayImages.length
        })
      }

      // Calculate top prompts
      const promptCounts = filteredImages.reduce((acc, img) => {
        const prompt = img.prompt.slice(0, 50) + (img.prompt.length > 50 ? '...' : '')
        acc[prompt] = (acc[prompt] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topPrompts = Object.entries(promptCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([prompt, count]) => ({ prompt, count }))

      // Calculate user growth by month
      const monthlyUsers = users.reduce((acc, user) => {
        const month = new Date(user.createdAt || new Date()).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const userGrowth = Object.entries(monthlyUsers)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, users]) => ({ 
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
          users 
        }))

      setData({
        totalUsers: users.length,
        totalImages: images.length,
        dailyStats,
        topPrompts,
        userGrowth
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const exportData = () => {
    const csvContent = [
      ['Date', 'Users', 'Images'],
      ...data.dailyStats.map(stat => [stat.date, stat.users, stat.images])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track usage patterns and system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Images generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.dailyStats.reduce((sum, stat) => sum + stat.images, 0) / data.dailyStats.length) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Images per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(data.dailyStats.flatMap(stat => Array(stat.users).fill(0))).size}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Daily Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dailyStats.slice(-7).map((stat) => (
                <div key={stat.date} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-muted-foreground">
                    {new Date(stat.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Images: {stat.images}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (stat.images / Math.max(...data.dailyStats.map(s => s.images))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{stat.users} users</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>User Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.userGrowth.map((growth) => (
                <div key={growth.month} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-muted-foreground">
                    {growth.month}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (growth.users / Math.max(...data.userGrowth.map(g => g.users))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{growth.users} new</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Popular Prompts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prompts data available</p>
            ) : (
              data.topPrompts.map((prompt, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{prompt.prompt}</p>
                    <div className="w-full bg-secondary rounded-full h-1 mt-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (prompt.count / Math.max(...data.topPrompts.map(p => p.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{prompt.count}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
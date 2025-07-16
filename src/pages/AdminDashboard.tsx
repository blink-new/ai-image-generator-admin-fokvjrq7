import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { 
  Users, 
  Image as ImageIcon, 
  Activity, 
  TrendingUp,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { blink } from '../lib/blink'

interface DashboardStats {
  totalUsers: number
  totalImages: number
  imagesThisMonth: number
  activeUsers: number
  systemStatus: 'healthy' | 'warning' | 'error'
}

interface RecentActivity {
  id: string
  type: 'user_joined' | 'image_generated' | 'system_event'
  message: string
  timestamp: string
  userId?: string
  userEmail?: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalImages: 0,
    imagesThisMonth: 0,
    activeUsers: 0,
    systemStatus: 'healthy'
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load users
      const users = await blink.db.users.list({ limit: 1000 })
      
      // Load images
      const images = await blink.db.generatedImages.list({ limit: 1000 })
      
      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const imagesThisMonth = images.filter(img => 
        new Date(img.createdAt) >= thisMonth
      ).length

      // Simulate active users (users who generated images in last 7 days)
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const activeUserIds = new Set(
        images
          .filter(img => new Date(img.createdAt) >= lastWeek)
          .map(img => img.userId)
      )

      setStats({
        totalUsers: users.length,
        totalImages: images.length,
        imagesThisMonth,
        activeUsers: activeUserIds.size,
        systemStatus: 'healthy'
      })

      // Generate recent activity
      const activities: RecentActivity[] = []
      
      // Add recent image generations
      images.slice(0, 5).forEach(img => {
        const user = users.find(u => u.id === img.userId)
        activities.push({
          id: `img-${img.id}`,
          type: 'image_generated',
          message: `Image generated: "${img.prompt.slice(0, 50)}..."`,
          timestamp: img.createdAt,
          userId: img.userId,
          userEmail: user?.email
        })
      })

      // Add recent user registrations
      users.slice(0, 3).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_joined',
          message: `New user registered`,
          timestamp: user.createdAt || new Date().toISOString(),
          userId: user.id,
          userEmail: user.email
        })
      })

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 10))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'image_generated':
        return <ImageIcon className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your AI Image Generator admin panel
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Images generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.imagesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Images this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(stats.systemStatus)}
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Generation Service</span>
              <Badge variant="default" className="bg-green-500">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <Badge variant="default" className="bg-green-500">
                Available
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {activity.userEmail && (
                          <span>{activity.userEmail}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
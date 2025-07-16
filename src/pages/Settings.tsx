import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import { 
  Settings as SettingsIcon, 
  Save, 
  Database, 
  Shield, 
  Bell,
  Palette,
  Server,
  Key
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettings {
  siteName: string
  siteDescription: string
  maxImagesPerUser: number
  enableRegistration: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
  apiRateLimit: number
  storageLimit: number
}

export function Settings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'AI Image Generator',
    siteDescription: 'Generate stunning AI-powered images with ease',
    maxImagesPerUser: 100,
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false,
    apiRateLimit: 60,
    storageLimit: 1000
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save these settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => handleInputChange('enableRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable system notifications
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the site in maintenance mode
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Active</Badge>
                )}
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API & Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>API & Limits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxImages">Max Images per User</Label>
              <Input
                id="maxImages"
                type="number"
                value={settings.maxImagesPerUser}
                onChange={(e) => handleInputChange('maxImagesPerUser', parseInt(e.target.value) || 0)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of images a user can generate
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimit">API Rate Limit (per minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value) || 0)}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground">
                Maximum API requests per minute per user
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageLimit">Storage Limit (MB)</Label>
            <Input
              id="storageLimit"
              type="number"
              value={settings.storageLimit}
              onChange={(e) => handleInputChange('storageLimit', parseInt(e.target.value) || 0)}
              placeholder="1000"
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Maximum storage space for generated images
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Manage API keys for external services
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage Keys
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage database backups
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Create Backup
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Configure security notifications
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Customize the application theme
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Light
                </Button>
                <Button variant="default" size="sm">
                  Dark
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Brand Colors</p>
                <p className="text-sm text-muted-foreground">
                  Customize primary and accent colors
                </p>
              </div>
              <Button variant="outline" size="sm">
                Customize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">45ms</div>
              <p className="text-sm text-muted-foreground">Response Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.1GB</div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
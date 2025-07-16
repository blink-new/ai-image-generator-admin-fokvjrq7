import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  Wand2, 
  Image as ImageIcon, 
  LayoutDashboard, 
  Users, 
  BarChart3,
  X,
  Sparkles
} from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
  role?: string
}

interface SidebarProps {
  user: User
  isAdmin: boolean
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Generate', href: '/', icon: Wand2, adminOnly: false },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon, adminOnly: false },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: true },
  { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
]

export function Sidebar({ user, isAdmin, open, onClose }: SidebarProps) {
  const location = useLocation()

  const allNavigation = [
    ...navigation,
    ...(isAdmin ? adminNavigation : [])
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI Generator</h1>
                {isAdmin && (
                  <span className="text-xs text-indigo-600 font-medium">Admin Panel</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {allNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-indigo-700" : "text-gray-400"
                  )} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.displayName?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Administrator
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
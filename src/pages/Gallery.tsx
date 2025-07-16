import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Download, Share2, Search, Filter, Image as ImageIcon } from 'lucide-react'
import { blink } from '../lib/blink'
import toast from 'react-hot-toast'

interface GeneratedImage {
  id: string
  userId: string
  url: string
  prompt: string
  size: string
  quality: string
  createdAt: string
}

export function Gallery() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [qualityFilter, setQualityFilter] = useState('all')

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const user = await blink.auth.me()
      const userImages = await blink.db.generatedImages.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      setImages(userImages)
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSize = sizeFilter === 'all' || image.size === sizeFilter
    const matchesQuality = qualityFilter === 'all' || image.quality === qualityFilter
    return matchesSearch && matchesSize && matchesQuality
  })

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const handleShare = async (imageUrl: string, prompt: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: "${prompt}"`,
          url: imageUrl
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(imageUrl)
        toast.success('Image URL copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy URL')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <ImageIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Your Gallery</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Browse and manage all your AI-generated images
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="1024x1024">Square</SelectItem>
                <SelectItem value="1792x1024">Landscape</SelectItem>
                <SelectItem value="1024x1792">Portrait</SelectItem>
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {images.length === 0 ? 'No images yet' : 'No images match your filters'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {images.length === 0 
              ? 'Start creating amazing AI-generated images!' 
              : 'Try adjusting your search or filters'
            }
          </p>
          {images.length === 0 && (
            <Button onClick={() => window.location.href = '/'}>
              Create Your First Image
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredImages.length} of {images.length} images
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative group">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(image.url, image.prompt)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleShare(image.url, image.prompt)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        {image.size}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {image.quality}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
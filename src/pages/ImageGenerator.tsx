import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { 
  Wand2, 
  Download, 
  Share2, 
  Sparkles, 
  Image as ImageIcon,
  Loader2,
  Settings,
  Palette
} from 'lucide-react'
import { blink } from '../lib/blink'
import toast from 'react-hot-toast'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  size: string
  quality: string
  createdAt: string
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('high')
  const [style, setStyle] = useState('natural')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const user = await blink.auth.me()
      
      // Generate image using Blink AI
      const { data } = await blink.ai.generateImage({
        prompt,
        size: size as '1024x1024' | '1792x1024' | '1024x1792',
        quality: quality as 'auto' | 'low' | 'medium' | 'high',
        style: style as 'vivid' | 'natural',
        n: 1
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (data && data[0]?.url) {
        const imageData = {
          id: `img_${Date.now()}`,
          userId: user.id,
          url: data[0].url,
          prompt,
          size,
          quality,
          createdAt: new Date().toISOString()
        }

        // Save to database
        await blink.db.generatedImages.create(imageData)

        // Add to local state
        setGeneratedImages(prev => [imageData, ...prev])
        
        toast.success('Image generated successfully!')
      } else {
        throw new Error('No image data received')
      }
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your imagination into stunning visuals with the power of artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Wand2 className="h-6 w-6 text-indigo-600" />
                  <span>Create Your Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Describe your image
                  </label>
                  <Textarea
                    placeholder="A majestic mountain landscape at sunset with golden light reflecting on a crystal clear lake..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={generating}
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>Size</span>
                    </label>
                    <Select value={size} onValueChange={setSize} disabled={generating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                        <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                        <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quality</label>
                    <Select value={quality} onValueChange={setQuality} disabled={generating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Palette className="h-4 w-4" />
                      <span>Style</span>
                    </label>
                    <Select value={style} onValueChange={setStyle} disabled={generating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="vivid">Vivid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {/* Progress */}
                {generating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Creating your masterpiece...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <ImageIcon className="h-6 w-6 text-indigo-600" />
                  <span>Your Creations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No images yet
                    </h3>
                    <p className="text-gray-500">
                      Your generated images will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="group">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownload(image.url, image.prompt)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleShare(image.url, image.prompt)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {image.size}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {image.quality}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(image.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
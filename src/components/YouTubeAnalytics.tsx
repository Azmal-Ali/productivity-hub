import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedYouTubeService } from "@/services/EnhancedYouTubeService";
import VideoSummaryAnalyzer from "./VideoSummaryAnalyzer";
import TaskManager from "./TaskManager";
import AIChatbot from "./AIChatbot";
import { 
  Youtube, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Shield,
  BarChart3,
  ExternalLink,
  Key,
  Brain,
  Calendar,
  Bot
} from "lucide-react";
import { toast } from "sonner";

const YouTubeAnalytics = () => {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState(EnhancedYouTubeService.getApiKey() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!EnhancedYouTubeService.getApiKey());
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    EnhancedYouTubeService.saveApiKey(apiKey.trim());
    setShowApiKeyInput(false);
    setError(null);
    toast.success("API key saved successfully!");
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!EnhancedYouTubeService.getApiKey()) {
      toast.error("Please set your YouTube API key first");
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await EnhancedYouTubeService.analyzeVideo(url);
      setAnalytics(result);
      toast.success("Video analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze video";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: string | number) => {
    const n = parseInt(num.toString());
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-success" />;
      case 'negative': return <Frown className="w-4 h-4 text-destructive" />;
      default: return <Meh className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Setup */}
      {showApiKeyInput && (
        <Alert>
          <Key className="w-4 h-4" />
          <AlertDescription className="space-y-4">
            <div>
              <p className="font-medium mb-2">YouTube Data API v3 Setup Required</p>
              <ol className="text-sm space-y-1 mb-4">
                <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                <li>2. Create a project or select existing one</li>
                <li>3. Enable YouTube Data API v3</li>
                <li>4. Create credentials (API key)</li>
                <li>5. Enter your API key below</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter YouTube Data API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={handleApiKeySave}>Save API Key</Button>
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>Cancel</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* URL Input */}
      <Card className="bg-gradient-secondary shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            YouTube Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          
          {!EnhancedYouTubeService.getApiKey() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowApiKeyInput(true)}
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Set API Key
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <Card className="bg-gradient-secondary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 animate-pulse text-red-500" />
                <span>Analyzing video...</span>
              </div>
              <Progress value={66} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Fetching video stats, comments, and performing sentiment analysis...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analytics && (
        <div className="space-y-6">
          {/* Video Overview */}
          <Card className="bg-gradient-secondary shadow-card">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img 
                  src={analytics.video.thumbnails.high.url} 
                  alt={analytics.video.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{analytics.video.title}</h3>
                  <p className="text-sm text-muted-foreground">by {analytics.video.channelTitle}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(analytics.video.viewCount)} views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatNumber(analytics.video.likeCount)} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {formatNumber(analytics.video.commentCount)} comments
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Duration: {formatDuration(analytics.video.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-secondary shadow-card">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.analytics.engagementRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-secondary shadow-card">
              <CardContent className="p-4 text-center">
                <Smile className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">{analytics.analytics.positiveComments}</div>
                <div className="text-sm text-muted-foreground">Positive Comments</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-secondary shadow-card">
              <CardContent className="p-4 text-center">
                <Frown className="w-8 h-8 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-destructive">{analytics.analytics.negativeComments}</div>
                <div className="text-sm text-muted-foreground">Negative Comments</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-secondary shadow-card">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-warning">{analytics.analytics.spamComments}</div>
                <div className="text-sm text-muted-foreground">Spam Detected</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs defaultValue="comments" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="space-y-4">
              <Card className="bg-gradient-secondary shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Comments ({analytics.comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.comments.slice(0, 20).map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <img 
                        src={comment.authorProfileImageUrl} 
                        alt={comment.authorDisplayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.authorDisplayName}</span>
                          <div className="flex items-center gap-1">
                            {getSentimentIcon(comment.sentiment)}
                            <span className={`text-xs ${getSentimentColor(comment.sentiment)}`}>
                              {comment.sentiment}
                            </span>
                          </div>
                          {comment.isSpam && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Spam
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm line-clamp-3">{comment.textDisplay}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likeCount}
                          <span>•</span>
                          <span>{new Date(comment.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights">
              <Card className="bg-gradient-secondary shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Sentiment Analysis Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Positive Sentiment</span>
                        <span className="text-sm text-success">
                          {((analytics.analytics.positiveComments / analytics.analytics.totalComments) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(analytics.analytics.positiveComments / analytics.analytics.totalComments) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Negative Sentiment</span>
                        <span className="text-sm text-destructive">
                          {((analytics.analytics.negativeComments / analytics.analytics.totalComments) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(analytics.analytics.negativeComments / analytics.analytics.totalComments) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Spam Detection</span>
                        <span className="text-sm text-warning">
                          {((analytics.analytics.spamComments / analytics.analytics.totalComments) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(analytics.analytics.spamComments / analytics.analytics.totalComments) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <h4 className="font-medium">Overall Sentiment Score</h4>
                      <div className="text-2xl font-bold">
                        {analytics.analytics.averageSentiment >= 0 ? '+' : ''}
                        {analytics.analytics.averageSentiment.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analytics.analytics.averageSentiment > 0.3 ? 'Very Positive' :
                         analytics.analytics.averageSentiment > 0.1 ? 'Positive' :
                         analytics.analytics.averageSentiment > -0.1 ? 'Neutral' :
                         analytics.analytics.averageSentiment > -0.3 ? 'Negative' : 'Very Negative'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Quality Rating</h4>
                      <div className="text-2xl font-bold">
                        {(((analytics.analytics.positiveComments - analytics.analytics.spamComments) / 
                           analytics.analytics.totalComments) * 5 + 5).toFixed(1)}/10
                      </div>
                      <p className="text-sm text-muted-foreground">Based on sentiment & spam analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="summary">
              <VideoSummaryAnalyzer videoData={analytics?.video} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TaskManager />
            </TabsContent>
            
            <TabsContent value="chat">
              <AIChatbot />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default YouTubeAnalytics;
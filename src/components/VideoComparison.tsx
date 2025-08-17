import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { ComparisonService, ComparisonResult } from '@/services/ComparisonService';
import { YouTubeService } from '@/services/YouTubeService';
import { GitCompare, ExternalLink, Trophy, TrendingUp, TrendingDown, AlertCircle, Key } from 'lucide-react';

export const VideoComparison = () => {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = YouTubeService.getApiKey();
    setHasApiKey(!!savedApiKey);
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    YouTubeService.saveApiKey(apiKey.trim());
    setHasApiKey(true);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "YouTube API key saved successfully",
    });
  };

  const handleCompare = async () => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your YouTube API key first",
        variant: "destructive",
      });
      setShowApiKeyInput(true);
      return;
    }

    if (!url1 || !url2) {
      toast({
        title: "Error", 
        description: "Please enter both YouTube URLs to compare",
        variant: "destructive",
      });
      return;
    }

    // Check if URLs are YouTube URLs
    if (!url1.includes('youtube.com') && !url1.includes('youtu.be')) {
      toast({
        title: "Error", 
        description: "First URL must be a YouTube video",
        variant: "destructive",
      });
      return;
    }

    if (!url2.includes('youtube.com') && !url2.includes('youtu.be')) {
      toast({
        title: "Error", 
        description: "Second URL must be a YouTube video",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const comparisonResult = await ComparisonService.compareContent(url1, url2);
      setResult(comparisonResult);
      toast({
        title: "Comparison Complete",
        description: "Video analysis finished successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, isReversed: boolean = false) => {
    if (isReversed) value = 100 - value;
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const MetricDisplay = ({ label, value, suffix = '', isPercentage = false }: { label: string; value: number; suffix?: string; isPercentage?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {isPercentage ? `${value}%` : `${formatNumber(value)}${suffix}`}
        </span>
      </div>
      {isPercentage && (
        <Progress 
          value={Math.min(value * 10, 100)} 
          className="h-2"
          style={{ 
            '--progress-background': getMetricColor(value * 10) 
          } as React.CSSProperties}
        />
      )}
    </div>
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const ContentCard = ({ item, isWinner }: { item: ComparisonResult['item1']; isWinner: boolean }) => (
    <Card className={`p-6 space-y-4 relative ${isWinner ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      {isWinner && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary text-primary-foreground">
            <Trophy className="w-3 h-3 mr-1" />
            Winner
          </Badge>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{item.contentType}</Badge>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <h3 className="font-semibold text-lg">{item.title}</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Channel: {item.channelTitle}</p>
          <p>Published: {new Date(item.publishedAt).toLocaleDateString()}</p>
          <p>Duration: {item.duration}</p>
        </div>
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Performance Metrics</h4>
        <div className="space-y-3">
          <MetricDisplay label="Views" value={item.metrics.views} />
          <MetricDisplay label="Likes" value={item.metrics.likes} />
          <MetricDisplay label="Comments" value={item.metrics.comments} />
          <MetricDisplay label="Engagement Rate" value={item.metrics.engagementRate} isPercentage />
          <MetricDisplay label="Like Ratio" value={item.metrics.likesToViewsRatio} isPercentage />
          <MetricDisplay label="Comment Ratio" value={item.metrics.commentsToViewsRatio} isPercentage />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="font-medium text-sm">Pros</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {item.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="font-medium text-sm">Cons</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {item.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">YouTube Video Comparison</h2>
        <p className="text-muted-foreground">Compare YouTube videos based on views, likes, comments, and engagement</p>
      </div>

      {!hasApiKey && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            YouTube API key required for video comparison. Please{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-primary"
              onClick={() => setShowApiKeyInput(true)}
            >
              set your API key
            </Button>{' '}
            to continue.
          </AlertDescription>
        </Alert>
      )}

      {showApiKeyInput && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <h3 className="text-lg font-semibold">YouTube API Key</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your YouTube Data API v3 key to enable video comparison.{' '}
              <a 
                href="https://developers.google.com/youtube/v3/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get API key here
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter YouTube API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveApiKey}>Save</Button>
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First YouTube URL</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                disabled={isLoading || !hasApiKey}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Second YouTube URL</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                disabled={isLoading || !hasApiKey}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCompare}
            disabled={isLoading || !url1 || !url2 || !hasApiKey}
            className="w-full"
          >
            {isLoading ? (
              <>Analyzing Videos...</>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Videos
              </>
            )}
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-lg font-medium">Analyzing content...</div>
            <Progress value={50} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Analyzing views, likes, comments, and engagement rates
            </p>
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Comparison Result</h3>
              <div className="space-y-2">
                <Badge 
                  className={`text-lg px-4 py-2 ${
                    result.verdict.winner === 'tie' 
                      ? 'bg-yellow-500 text-yellow-50' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {result.verdict.winner === 'tie' ? 'It\'s a Tie!' : 
                   result.verdict.winner === 'item1' ? 'First URL Wins' : 'Second URL Wins'}
                </Badge>
                <p className="font-medium">{result.verdict.reason}</p>
                <p className="text-muted-foreground text-sm">{result.verdict.summary}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard 
              item={result.item1} 
              isWinner={result.verdict.winner === 'item1'} 
            />
            <ContentCard 
              item={result.item2} 
              isWinner={result.verdict.winner === 'item2'} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
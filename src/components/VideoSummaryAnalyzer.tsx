import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface VideoSummary {
  title: string;
  summary: string;
  truthScore: number;
  factChecks: {
    claim: string;
    isTrue: boolean;
    confidence: number;
    source?: string;
  }[];
  keyTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  credibilityScore: number;
  duration: string;
}

interface VideoSummaryAnalyzerProps {
  videoData: any;
}

const VideoSummaryAnalyzer = ({ videoData }: VideoSummaryAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async () => {
    if (!videoData) {
      toast.error("No video data available for analysis");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call Supabase Edge Function for AI analysis
      const response = await fetch('/api/analyze-video-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: videoData.title,
          description: videoData.description,
          channelTitle: videoData.channelTitle,
          duration: videoData.duration,
          viewCount: videoData.viewCount,
          likeCount: videoData.likeCount,
          commentCount: videoData.commentCount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video content');
      }

      const result = await response.json();
      setSummary(result);
      toast.success("Video analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze video";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTruthScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getTruthScoreBadge = (score: number) => {
    if (score >= 80) return "High Accuracy";
    if (score >= 60) return "Moderate Accuracy";
    return "Low Accuracy";
  };

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <Card className="bg-gradient-secondary shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Video Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze video content for factual accuracy, generate summary, and extract key insights using AI.
            </p>
            <Button 
              onClick={analyzeVideo} 
              disabled={isAnalyzing || !videoData}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing Content...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Start AI Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="bg-gradient-secondary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse text-primary" />
                <span>AI is analyzing video content...</span>
              </div>
              <Progress value={66} className="w-full" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Extracting key information from video metadata</p>
                <p>• Analyzing content for factual accuracy</p>
                <p>• Generating comprehensive summary</p>
                <p>• Fact-checking claims and statements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {summary && (
        <div className="space-y-6">
          {/* Truth Score Overview */}
          <Card className="bg-gradient-secondary shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Content Accuracy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className={`text-4xl font-bold ${getTruthScoreColor(summary.truthScore)}`}>
                  {summary.truthScore}%
                </div>
                <Badge 
                  variant={summary.truthScore >= 80 ? "default" : summary.truthScore >= 60 ? "secondary" : "destructive"}
                  className="text-sm"
                >
                  {getTruthScoreBadge(summary.truthScore)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTruthScoreColor(summary.credibilityScore)}`}>
                    {summary.credibilityScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Credibility Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {summary.factChecks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Claims Checked</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    summary.sentiment === 'positive' ? 'text-success' : 
                    summary.sentiment === 'negative' ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {summary.sentiment.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Tone</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Summary */}
          <Card className="bg-gradient-secondary shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                AI-Generated Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="leading-relaxed">{summary.summary}</p>
              </div>
              
              {/* Key Topics */}
              <div className="space-y-2">
                <h4 className="font-medium">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fact Checks */}
          <Card className="bg-gradient-secondary shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Fact Check Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.factChecks.map((factCheck, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 p-4 rounded-lg bg-muted/50 border-l-4"
                  style={{
                    borderLeftColor: factCheck.isTrue ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                  }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {factCheck.isTrue ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">{factCheck.claim}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confidence: {factCheck.confidence}%</span>
                      {factCheck.source && (
                        <>
                          <span>•</span>
                          <span>Source: {factCheck.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoSummaryAnalyzer;
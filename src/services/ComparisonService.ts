export interface ComparisonMetrics {
  views: number;
  likes: number;
  comments: number;
  engagementRate: number; // percentage
  likesToViewsRatio: number; // percentage
  commentsToViewsRatio: number; // percentage
}

export interface ComparisonItem {
  url: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  metrics: ComparisonMetrics;
  pros: string[];
  cons: string[];
  contentType: 'video' | 'website';
}

export interface ComparisonResult {
  item1: ComparisonItem;
  item2: ComparisonItem;
  verdict: {
    winner: 'item1' | 'item2' | 'tie';
    reason: string;
    summary: string;
  };
}

export class ComparisonService {
  static async compareContent(url1: string, url2: string): Promise<ComparisonResult> {
    try {
      // Import YouTubeService dynamically to avoid circular dependencies
      const { YouTubeService } = await import('./YouTubeService');
      
      const item1 = await this.analyzeVideoUrl(url1);
      const item2 = await this.analyzeVideoUrl(url2);
      
      const verdict = this.generateVerdict(item1, item2);

      return {
        item1,
        item2,
        verdict
      };
    } catch (error) {
      console.error('Error comparing videos:', error);
      throw new Error('Failed to compare videos. Please check the URLs and try again.');
    }
  }

  private static async analyzeVideoUrl(url: string): Promise<ComparisonItem> {
    const { YouTubeService } = await import('./YouTubeService');
    
    const videoId = YouTubeService.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const videoStats = await YouTubeService.getVideoStats(videoId);
    if (!videoStats) {
      throw new Error('Failed to fetch video statistics');
    }

    const views = parseInt(videoStats.viewCount);
    const likes = parseInt(videoStats.likeCount || '0');
    const comments = parseInt(videoStats.commentCount || '0');
    
    const engagementRate = views > 0 ? ((likes + comments) / views * 100) : 0;
    const likesToViewsRatio = views > 0 ? (likes / views * 100) : 0;
    const commentsToViewsRatio = views > 0 ? (comments / views * 100) : 0;

    const metrics: ComparisonMetrics = {
      views,
      likes,
      comments,
      engagementRate: Number(engagementRate.toFixed(2)),
      likesToViewsRatio: Number(likesToViewsRatio.toFixed(2)),
      commentsToViewsRatio: Number(commentsToViewsRatio.toFixed(2))
    };

    const pros = this.generatePros(metrics, videoStats);
    const cons = this.generateCons(metrics, videoStats);

    return {
      url,
      title: videoStats.title,
      description: videoStats.description.substring(0, 150) + '...',
      channelTitle: videoStats.channelTitle,
      publishedAt: videoStats.publishedAt,
      duration: videoStats.duration,
      metrics,
      pros,
      cons,
      contentType: 'video'
    };
  }

  private static generatePros(metrics: ComparisonMetrics, videoStats: any): string[] {
    const pros: string[] = [];
    
    if (metrics.views > 1000000) pros.push(`High viewership (${this.formatNumber(metrics.views)} views)`);
    if (metrics.engagementRate > 2) pros.push(`Strong engagement rate (${metrics.engagementRate}%)`);
    if (metrics.likesToViewsRatio > 1) pros.push(`Good like ratio (${metrics.likesToViewsRatio}%)`);
    if (metrics.comments > 1000) pros.push(`Active discussion (${this.formatNumber(metrics.comments)} comments)`);
    if (videoStats.channelTitle) pros.push(`Published by ${videoStats.channelTitle}`);
    
    return pros.length > 0 ? pros : ['Video has basic metrics available'];
  }

  private static generateCons(metrics: ComparisonMetrics, videoStats: any): string[] {
    const cons: string[] = [];
    
    if (metrics.views < 10000) cons.push('Limited viewership');
    if (metrics.engagementRate < 0.5) cons.push('Low engagement rate');
    if (metrics.likesToViewsRatio < 0.1) cons.push('Poor like-to-view ratio');
    if (metrics.comments < 50) cons.push('Limited discussion in comments');
    
    const publishedDate = new Date(videoStats.publishedAt);
    const monthsOld = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 12) cons.push('Content may be outdated');
    
    return cons.length > 0 ? cons : ['No significant issues detected'];
  }

  private static generateVerdict(item1: ComparisonItem, item2: ComparisonItem): ComparisonResult['verdict'] {
    // Calculate engagement scores
    const score1 = this.calculateEngagementScore(item1.metrics);
    const score2 = this.calculateEngagementScore(item2.metrics);

    const scoreDiff = Math.abs(score1 - score2);
    
    if (scoreDiff < 10) {
      return {
        winner: 'tie',
        reason: 'Both videos have similar engagement and performance metrics',
        summary: 'Close competition - both videos show comparable audience engagement.'
      };
    }

    const winner = score1 > score2 ? 'item1' : 'item2';
    const winnerItem = score1 > score2 ? item1 : item2;
    const loserItem = score1 > score2 ? item2 : item1;
    
    return {
      winner,
      reason: `${winnerItem.title} has significantly better engagement metrics`,
      summary: `${winnerItem.title} outperforms with ${this.formatNumber(winnerItem.metrics.views)} views vs ${this.formatNumber(loserItem.metrics.views)} views and ${winnerItem.metrics.engagementRate}% vs ${loserItem.metrics.engagementRate}% engagement rate.`
    };
  }

  private static calculateEngagementScore(metrics: ComparisonMetrics): number {
    // Weighted scoring system
    const viewScore = Math.min(metrics.views / 1000000 * 30, 30); // Max 30 points for views
    const engagementScore = Math.min(metrics.engagementRate * 10, 40); // Max 40 points for engagement
    const likeScore = Math.min(metrics.likesToViewsRatio * 5, 20); // Max 20 points for like ratio
    const commentScore = Math.min(metrics.commentsToViewsRatio * 100, 10); // Max 10 points for comment ratio
    
    return viewScore + engagementScore + likeScore + commentScore;
  }

  private static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.split('/')[0] || 'Unknown source';
    }
  }
}
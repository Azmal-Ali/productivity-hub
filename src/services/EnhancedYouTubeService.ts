interface YouTubeVideoStats {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
}

interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  isSpam?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotionScore?: number;
}

interface YouTubeAnalytics {
  video: YouTubeVideoStats;
  comments: YouTubeComment[];
  analytics: {
    totalComments: number;
    positiveComments: number;
    negativeComments: number;
    neutralComments: number;
    spamComments: number;
    averageSentiment: number;
    engagementRate: number;
  };
}

export class EnhancedYouTubeService {
  private static API_KEY_STORAGE_KEY = 'youtube_api_key';
  
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static async getVideoStats(videoId: string): Promise<YouTubeVideoStats | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('YouTube API key not found. Please set your API key first.');

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          if (errorData.error?.message?.includes('YouTube Data API v3 has not been used')) {
            throw new Error(
              'YouTube Data API v3 is not enabled for your Google Cloud project. Please:\n' +
              '1. Go to Google Cloud Console\n' +
              '2. Enable YouTube Data API v3\n' +
              '3. Wait a few minutes for activation\n' +
              '4. Try again'
            );
          } else if (errorData.error?.message?.includes('quotaExceeded')) {
            throw new Error('YouTube API quota exceeded. Please try again later or check your quota limits.');
          } else {
            throw new Error('Access denied. Please check your API key permissions.');
          }
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check the video URL.');
        } else {
          throw new Error(`YouTube API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found. Please check the URL and try again.');
      }

      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: video.statistics.viewCount || '0',
        likeCount: video.statistics.likeCount || '0',
        commentCount: video.statistics.commentCount || '0',
        duration: video.contentDetails.duration,
        thumbnails: video.snippet.thumbnails
      };
    } catch (error) {
      console.error('Error fetching video stats:', error);
      throw error;
    }
  }

  static async getVideoComments(videoId: string, maxResults: number = 50): Promise<YouTubeComment[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('YouTube API key not found. Please set your API key first.');

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          if (errorData.error?.message?.includes('commentsDisabled')) {
            console.warn('Comments are disabled for this video');
            return [];
          } else if (errorData.error?.message?.includes('YouTube Data API v3 has not been used')) {
            throw new Error(
              'YouTube Data API v3 is not enabled for your Google Cloud project. Please enable it in Google Cloud Console.'
            );
          }
        }
        
        console.warn('Could not fetch comments:', errorData.error?.message);
        return [];
      }

      const data = await response.json();
      
      if (!data.items) {
        return [];
      }

      return data.items.map((item: any) => {
        const comment = item.snippet.topLevelComment.snippet;
        return {
          id: item.id,
          authorDisplayName: comment.authorDisplayName,
          authorProfileImageUrl: comment.authorProfileImageUrl,
          textDisplay: comment.textDisplay,
          likeCount: comment.likeCount || 0,
          publishedAt: comment.publishedAt,
          isSpam: this.detectSpam(comment.textDisplay),
          sentiment: this.analyzeSentiment(comment.textDisplay),
          emotionScore: this.calculateEmotionScore(comment.textDisplay)
        };
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Don't throw error for comments, just return empty array
      return [];
    }
  }

  static async analyzeVideo(url: string): Promise<YouTubeAnalytics> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
    }

    const [video, comments] = await Promise.all([
      this.getVideoStats(videoId),
      this.getVideoComments(videoId, 100)
    ]);

    if (!video) {
      throw new Error('Failed to fetch video data. Please check the URL and try again.');
    }

    const analytics = this.calculateAnalytics(video, comments);

    return {
      video,
      comments,
      analytics
    };
  }

  private static detectSpam(text: string): boolean {
    const spamKeywords = [
      'subscribe', 'follow me', 'check out my channel', 'click here',
      'free money', 'earn money', 'work from home', 'make money online',
      'winner', 'congratulations', 'you won', 'claim now'
    ];
    
    const lowerText = text.toLowerCase();
    const hasSpamKeywords = spamKeywords.some(keyword => lowerText.includes(keyword));
    const hasExcessiveEmojis = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length > 5;
    const hasExcessiveCaps = text.replace(/[^A-Z]/g, '').length > text.length * 0.5;
    
    return hasSpamKeywords || hasExcessiveEmojis || hasExcessiveCaps;
  }

  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'excellent', 'fantastic', 'wonderful', 'best', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'stupid', 'boring', 'trash'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static calculateEmotionScore(text: string): number {
    const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'excited', 'angry', 'happy', 'sad'];
    const lowerText = text.toLowerCase();
    const emotionCount = emotionalWords.filter(word => lowerText.includes(word)).length;
    
    return Math.min(emotionCount / text.split(' ').length * 10, 1);
  }

  private static calculateAnalytics(video: YouTubeVideoStats, comments: YouTubeComment[]) {
    const totalComments = comments.length;
    const positiveComments = comments.filter(c => c.sentiment === 'positive').length;
    const negativeComments = comments.filter(c => c.sentiment === 'negative').length;
    const neutralComments = comments.filter(c => c.sentiment === 'neutral').length;
    const spamComments = comments.filter(c => c.isSpam).length;
    
    const averageSentiment = totalComments > 0 
      ? (positiveComments - negativeComments) / totalComments 
      : 0;
      
    const engagementRate = parseInt(video.viewCount) > 0 
      ? (parseInt(video.likeCount) + parseInt(video.commentCount)) / parseInt(video.viewCount) * 100
      : 0;

    return {
      totalComments,
      positiveComments,
      negativeComments,
      neutralComments,
      spamComments,
      averageSentiment,
      engagementRate
    };
  }
}
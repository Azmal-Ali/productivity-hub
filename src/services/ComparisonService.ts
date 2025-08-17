export interface ComparisonMetrics {
  quality: number; // 0-100
  accuracy: number; // 0-100
  clarity: number; // 0-100
  bias: number; // 0-100 (lower is better)
  recency: number; // 0-100
}

export interface ComparisonItem {
  url: string;
  title: string;
  description: string;
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
    // Simulate API call - in real app, this would analyze the actual content
    await new Promise(resolve => setTimeout(resolve, 2000));

    const item1 = this.analyzeUrl(url1);
    const item2 = this.analyzeUrl(url2);
    
    const verdict = this.generateVerdict(item1, item2);

    return {
      item1,
      item2,
      verdict
    };
  }

  private static analyzeUrl(url: string): ComparisonItem {
    // Mock analysis - in real app, this would fetch and analyze actual content
    const isVideo = url.includes('youtube') || url.includes('vimeo') || url.includes('video');
    
    const mockMetrics: ComparisonMetrics = {
      quality: Math.floor(Math.random() * 30) + 70, // 70-100
      accuracy: Math.floor(Math.random() * 25) + 75, // 75-100
      clarity: Math.floor(Math.random() * 35) + 65, // 65-100
      bias: Math.floor(Math.random() * 40) + 10, // 10-50
      recency: Math.floor(Math.random() * 50) + 50, // 50-100
    };

    const mockPros = [
      "High production value",
      "Clear explanations", 
      "Up-to-date information",
      "Good visual aids",
      "Comprehensive coverage"
    ].slice(0, Math.floor(Math.random() * 3) + 2);

    const mockCons = [
      "Could be more detailed",
      "Some bias detected",
      "Missing recent updates", 
      "Audio quality issues",
      "Too basic for advanced users"
    ].slice(0, Math.floor(Math.random() * 2) + 1);

    return {
      url,
      title: isVideo ? `Video: ${this.extractDomain(url)}` : `Website: ${this.extractDomain(url)}`,
      description: `Content from ${this.extractDomain(url)} - ${isVideo ? 'video format' : 'web article'}`,
      metrics: mockMetrics,
      pros: mockPros,
      cons: mockCons,
      contentType: isVideo ? 'video' : 'website'
    };
  }

  private static generateVerdict(item1: ComparisonItem, item2: ComparisonItem): ComparisonResult['verdict'] {
    const score1 = (item1.metrics.quality + item1.metrics.accuracy + item1.metrics.clarity + (100 - item1.metrics.bias) + item1.metrics.recency) / 5;
    const score2 = (item2.metrics.quality + item2.metrics.accuracy + item2.metrics.clarity + (100 - item2.metrics.bias) + item2.metrics.recency) / 5;

    const scoreDiff = Math.abs(score1 - score2);
    
    if (scoreDiff < 5) {
      return {
        winner: 'tie',
        reason: 'Both sources are comparable in quality and reliability',
        summary: 'Very close comparison - both sources have similar strengths and weaknesses.'
      };
    }

    const winner = score1 > score2 ? 'item1' : 'item2';
    const winnerItem = score1 > score2 ? item1 : item2;
    
    return {
      winner,
      reason: `${winnerItem.title} scores higher in overall quality metrics`,
      summary: `Clear winner based on ${winner === 'item1' ? 'first' : 'second'} source's superior ${this.getBestMetric(winnerItem.metrics)}.`
    };
  }

  private static getBestMetric(metrics: ComparisonMetrics): string {
    const metricEntries = [
      ['quality', metrics.quality],
      ['accuracy', metrics.accuracy], 
      ['clarity', metrics.clarity],
      ['objectivity', 100 - metrics.bias],
      ['recency', metrics.recency]
    ];
    
    const best = metricEntries.reduce((prev, current) => 
      (current[1] as number) > (prev[1] as number) ? current : prev
    );
    
    return best[0] as string;
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.split('/')[0] || 'Unknown source';
    }
  }
}
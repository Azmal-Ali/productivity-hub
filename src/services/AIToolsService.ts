export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  url: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  features: string[];
  useCases: string[];
  tags: string[];
  logo?: string;
}

export interface UserGoal {
  domain: string;
  goal: string;
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  budget: 'Free' | 'Low' | 'Medium' | 'High';
}

export class AIToolsService {
  private static tools: AITool[] = [
    // Content Creation
    {
      id: '1',
      name: 'ChatGPT',
      description: 'Advanced conversational AI for text generation, coding, and problem-solving',
      category: 'Content & Writing',
      subcategory: 'Text Generation',
      url: 'https://chat.openai.com',
      pricing: 'Freemium',
      rating: 4.8,
      features: ['Text generation', 'Code assistance', 'Q&A', 'Creative writing'],
      useCases: ['Content creation', 'Programming help', 'Research assistance', 'Learning'],
      tags: ['gpt', 'conversational', 'text', 'coding', 'creative']
    },
    {
      id: '2',
      name: 'Midjourney',
      description: 'AI-powered image generation from text prompts',
      category: 'Design & Visual',
      subcategory: 'Image Generation',
      url: 'https://midjourney.com',
      pricing: 'Paid',
      rating: 4.9,
      features: ['High-quality images', 'Artistic styles', 'Creative prompts', 'Community'],
      useCases: ['Art creation', 'Marketing visuals', 'Concept art', 'Social media'],
      tags: ['image', 'art', 'creative', 'visual', 'prompt']
    },
    {
      id: '3',
      name: 'Grammarly',
      description: 'AI writing assistant for grammar, clarity, and tone improvement',
      category: 'Content & Writing',
      subcategory: 'Writing Assistant',
      url: 'https://grammarly.com',
      pricing: 'Freemium',
      rating: 4.6,
      features: ['Grammar check', 'Tone detection', 'Plagiarism check', 'Style suggestions'],
      useCases: ['Professional writing', 'Academic writing', 'Email improvement', 'Content editing'],
      tags: ['grammar', 'writing', 'editing', 'professional', 'clarity']
    },
    {
      id: '4',
      name: 'GitHub Copilot',
      description: 'AI pair programmer that suggests code and entire functions',
      category: 'Development',
      subcategory: 'Code Assistant',
      url: 'https://github.com/features/copilot',
      pricing: 'Paid',
      rating: 4.7,
      features: ['Code completion', 'Function generation', 'Multiple languages', 'Context aware'],
      useCases: ['Software development', 'Code learning', 'Productivity boost', 'Bug fixing'],
      tags: ['coding', 'programming', 'development', 'autocomplete', 'github']
    },
    {
      id: '5',
      name: 'Notion AI',
      description: 'AI-powered writing and productivity assistant within Notion',
      category: 'Productivity',
      subcategory: 'Note Taking',
      url: 'https://notion.so/product/ai',
      pricing: 'Freemium',
      rating: 4.5,
      features: ['Content generation', 'Summarization', 'Translation', 'Task automation'],
      useCases: ['Note organization', 'Content planning', 'Project management', 'Team collaboration'],
      tags: ['productivity', 'notes', 'collaboration', 'organization', 'workflow']
    },
    {
      id: '6',
      name: 'Canva AI',
      description: 'AI-powered design tools for creating graphics, presentations, and marketing materials',
      category: 'Design & Visual',
      subcategory: 'Graphic Design',
      url: 'https://canva.com/ai-image-generator',
      pricing: 'Freemium',
      rating: 4.4,
      features: ['Template generation', 'Image editing', 'Brand kit', 'Magic resize'],
      useCases: ['Social media graphics', 'Presentations', 'Marketing materials', 'Brand design'],
      tags: ['design', 'graphics', 'templates', 'marketing', 'visual']
    },
    {
      id: '7',
      name: 'Loom AI',
      description: 'Screen recording with AI-powered summaries and insights',
      category: 'Communication',
      subcategory: 'Video Creation',
      url: 'https://loom.com',
      pricing: 'Freemium',
      rating: 4.6,
      features: ['Screen recording', 'Video summaries', 'Transcription', 'Analytics'],
      useCases: ['Team communication', 'Tutorials', 'Client presentations', 'Documentation'],
      tags: ['video', 'recording', 'communication', 'tutorials', 'team']
    },
    {
      id: '8',
      name: 'Jasper AI',
      description: 'AI content platform for marketing teams and businesses',
      category: 'Content & Writing',
      subcategory: 'Marketing Copy',
      url: 'https://jasper.ai',
      pricing: 'Paid',
      rating: 4.3,
      features: ['Marketing copy', 'Brand voice', 'Templates', 'Team collaboration'],
      useCases: ['Marketing campaigns', 'Blog writing', 'Ad copy', 'Social media content'],
      tags: ['marketing', 'copywriting', 'business', 'templates', 'campaigns']
    },
    {
      id: '9',
      name: 'RunwayML',
      description: 'AI tools for video editing, generation, and creative projects',
      category: 'Design & Visual',
      subcategory: 'Video Generation',
      url: 'https://runwayml.com',
      pricing: 'Freemium',
      rating: 4.5,
      features: ['Video generation', 'Image-to-video', 'Green screen', 'Motion tracking'],
      useCases: ['Video content', 'Creative projects', 'Film production', 'Social media videos'],
      tags: ['video', 'creative', 'generation', 'editing', 'motion']
    },
    {
      id: '10',
      name: 'Otter.ai',
      description: 'AI meeting assistant that records, transcribes, and summarizes meetings',
      category: 'Productivity',
      subcategory: 'Meeting Assistant',
      url: 'https://otter.ai',
      pricing: 'Freemium',
      rating: 4.4,
      features: ['Live transcription', 'Meeting summaries', 'Action items', 'Integration'],
      useCases: ['Meeting notes', 'Interview transcription', 'Lecture recording', 'Team collaboration'],
      tags: ['meetings', 'transcription', 'notes', 'collaboration', 'productivity']
    },
    {
      id: '11',
      name: 'Perplexity AI',
      description: 'AI-powered search engine that provides accurate, cited answers',
      category: 'Research & Analysis',
      subcategory: 'Search & Research',
      url: 'https://perplexity.ai',
      pricing: 'Freemium',
      rating: 4.7,
      features: ['Real-time search', 'Source citations', 'Follow-up questions', 'Academic mode'],
      useCases: ['Research', 'Fact-checking', 'Learning', 'Content verification'],
      tags: ['search', 'research', 'citations', 'accuracy', 'learning']
    },
    {
      id: '12',
      name: 'Claude',
      description: 'AI assistant focused on helpful, harmless, and honest interactions',
      category: 'Content & Writing',
      subcategory: 'AI Assistant',
      url: 'https://claude.ai',
      pricing: 'Freemium',
      rating: 4.6,
      features: ['Long-form conversations', 'Code analysis', 'Document analysis', 'Creative tasks'],
      useCases: ['Research assistance', 'Content creation', 'Code review', 'Analysis'],
      tags: ['assistant', 'conversation', 'analysis', 'helpful', 'creative']
    }
  ];

  static getAllTools(): AITool[] {
    return this.tools;
  }

  static getCategories(): string[] {
    return [...new Set(this.tools.map(tool => tool.category))];
  }

  static getToolsByCategory(category: string): AITool[] {
    return this.tools.filter(tool => tool.category === category);
  }

  static searchTools(query: string): AITool[] {
    const lowercaseQuery = query.toLowerCase();
    return this.tools.filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.tags.some(tag => tag.includes(lowercaseQuery)) ||
      tool.useCases.some(useCase => useCase.toLowerCase().includes(lowercaseQuery))
    );
  }

  static recommendTools(userGoal: UserGoal): AITool[] {
    const { domain, goal, experience, budget } = userGoal;
    
    let recommendations = this.tools.filter(tool => {
      // Filter by budget
      if (budget === 'Free' && tool.pricing === 'Paid') return false;
      
      // Match domain and goal with tool categories and use cases
      const domainMatch = tool.category.toLowerCase().includes(domain.toLowerCase()) ||
                         tool.subcategory.toLowerCase().includes(domain.toLowerCase()) ||
                         tool.tags.some(tag => tag.includes(domain.toLowerCase()));
      
      const goalMatch = tool.useCases.some(useCase => 
        useCase.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(useCase.toLowerCase())
      ) || tool.description.toLowerCase().includes(goal.toLowerCase());
      
      return domainMatch || goalMatch;
    });

    // If no specific matches, provide general recommendations based on experience level
    if (recommendations.length === 0) {
      if (experience === 'Beginner') {
        recommendations = this.tools.filter(tool => 
          tool.pricing === 'Free' || tool.pricing === 'Freemium'
        ).slice(0, 6);
      } else {
        recommendations = this.tools.slice(0, 8);
      }
    }

    // Sort by rating and limit results
    return recommendations
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }

  static getPopularTools(): AITool[] {
    return this.tools
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  static getToolsByPricing(pricing: string): AITool[] {
    return this.tools.filter(tool => tool.pricing === pricing);
  }
}
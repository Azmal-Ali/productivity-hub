interface GoogleCourse {
  id: string;
  title: string;
  provider: string;
  category: string;
  rating: number;
  duration: string;
  hasCertificate: boolean;
  url: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: 'Free' | 'Paid' | 'Freemium';
  tags: string[];
  thumbnailUrl?: string;
}

interface GoogleCoursesResponse {
  courses: GoogleCourse[];
  totalResults: number;
  nextPageToken?: string;
}

export class GoogleCoursesService {
  private static GOOGLE_COURSES_API_BASE = 'https://www.googleapis.com/customsearch/v1';
  
  // Mock course data enhanced with real course providers
  private static mockCourses: GoogleCourse[] = [
    {
      id: '1',
      title: 'Google IT Support Professional Certificate',
      provider: 'Google Career Certificates',
      category: 'Technology',
      rating: 4.6,
      duration: '3-6 months',
      hasCertificate: true,
      url: 'https://www.coursera.org/professional-certificates/google-it-support',
      description: 'Prepare for a career in IT support. No experience required.',
      difficulty: 'Beginner',
      price: 'Paid',
      tags: ['IT', 'Support', 'Troubleshooting', 'Networks']
    },
    {
      id: '2',
      title: 'Google Data Analytics Professional Certificate',
      provider: 'Google Career Certificates',
      category: 'Data Science',
      rating: 4.7,
      duration: '3-6 months',
      hasCertificate: true,
      url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
      description: 'Learn data analytics skills including data cleaning, analysis, and visualization.',
      difficulty: 'Beginner',
      price: 'Paid',
      tags: ['Data Analysis', 'SQL', 'Tableau', 'R Programming']
    },
    {
      id: '3',
      title: 'Google Digital Marketing & E-commerce Certificate',
      provider: 'Google Career Certificates',
      category: 'Marketing',
      rating: 4.8,
      duration: '3-6 months',
      hasCertificate: true,
      url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
      description: 'Learn digital marketing and e-commerce skills to grow businesses online.',
      difficulty: 'Beginner',
      price: 'Paid',
      tags: ['Digital Marketing', 'SEO', 'E-commerce', 'Social Media']
    },
    {
      id: '4',
      title: 'Google UX Design Professional Certificate',
      provider: 'Google Career Certificates',
      category: 'Design',
      rating: 4.7,
      duration: '3-6 months',
      hasCertificate: true,
      url: 'https://www.coursera.org/professional-certificates/google-ux-design',
      description: 'Learn UX design fundamentals and create a professional portfolio.',
      difficulty: 'Beginner',
      price: 'Paid',
      tags: ['UX Design', 'Figma', 'Prototyping', 'User Research']
    },
    {
      id: '5',
      title: 'Google Project Management Professional Certificate',
      provider: 'Google Career Certificates',
      category: 'Business',
      rating: 4.8,
      duration: '3-6 months',
      hasCertificate: true,
      url: 'https://www.coursera.org/professional-certificates/google-project-management',
      description: 'Learn project management skills and tools used by Google.',
      difficulty: 'Beginner',
      price: 'Paid',
      tags: ['Project Management', 'Agile', 'Scrum', 'Leadership']
    },
    {
      id: '6',
      title: 'Machine Learning Crash Course',
      provider: 'Google AI Education',
      category: 'AI/ML',
      rating: 4.5,
      duration: '15 hours',
      hasCertificate: true,
      url: 'https://developers.google.com/machine-learning/crash-course',
      description: 'A self-study guide for aspiring machine learning practitioners.',
      difficulty: 'Intermediate',
      price: 'Free',
      tags: ['Machine Learning', 'TensorFlow', 'Python', 'Deep Learning']
    },
    {
      id: '7',
      title: 'Google Cloud Fundamentals',
      provider: 'Google Cloud',
      category: 'Cloud Computing',
      rating: 4.4,
      duration: '8 hours',
      hasCertificate: true,
      url: 'https://www.cloudskillsboost.google/course_templates/60',
      description: 'Introduction to Google Cloud Platform services and solutions.',
      difficulty: 'Beginner',
      price: 'Free',
      tags: ['Cloud Computing', 'GCP', 'Infrastructure', 'DevOps']
    },
    {
      id: '8',
      title: 'Android Development for Beginners',
      provider: 'Google Developers',
      category: 'Mobile Development',
      rating: 4.3,
      duration: '20 hours',
      hasCertificate: false,
      url: 'https://developer.android.com/courses',
      description: 'Learn to build Android apps from scratch.',
      difficulty: 'Beginner',
      price: 'Free',
      tags: ['Android', 'Mobile Development', 'Java', 'Kotlin']
    },
    {
      id: '9',
      title: 'Google Ads Certification',
      provider: 'Google Skillshop',
      category: 'Marketing',
      rating: 4.6,
      duration: '4-6 hours',
      hasCertificate: true,
      url: 'https://skillshop.exceedlms.com/student/catalog',
      description: 'Master Google Ads and become certified in advertising.',
      difficulty: 'Intermediate',
      price: 'Free',
      tags: ['Google Ads', 'PPC', 'Advertising', 'Analytics']
    },
    {
      id: '10',
      title: 'YouTube Creator Academy',
      provider: 'YouTube',
      category: 'Content Creation',
      rating: 4.2,
      duration: '10 hours',
      hasCertificate: false,
      url: 'https://creatoracademy.youtube.com/page/education',
      description: 'Learn to create engaging content and grow your YouTube channel.',
      difficulty: 'Beginner',
      price: 'Free',
      tags: ['YouTube', 'Content Creation', 'Video Marketing', 'Analytics']
    }
  ];

  static async searchCourses(query: string = '', category: string = 'All', page: number = 1): Promise<GoogleCoursesResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredCourses = this.mockCourses;
    
    // Filter by category
    if (category !== 'All') {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    
    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.provider.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    return {
      courses: filteredCourses,
      totalResults: filteredCourses.length
    };
  }

  static async getPopularCourses(): Promise<GoogleCourse[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockCourses
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  static async getFreeCourses(): Promise<GoogleCourse[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockCourses
      .filter(course => course.price === 'Free')
      .sort((a, b) => b.rating - a.rating);
  }

  static async getCertifiedCourses(): Promise<GoogleCourse[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockCourses
      .filter(course => course.hasCertificate)
      .sort((a, b) => b.rating - a.rating);
  }

  static async getRecommendations(userInterests: string[] = []): Promise<GoogleCourse[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (userInterests.length === 0) {
      return this.getPopularCourses();
    }
    
    const recommendedCourses = this.mockCourses.filter(course =>
      userInterests.some(interest =>
        course.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
        course.category.toLowerCase().includes(interest.toLowerCase()) ||
        course.title.toLowerCase().includes(interest.toLowerCase())
      )
    );
    
    return recommendedCourses.sort((a, b) => b.rating - a.rating).slice(0, 8);
  }

  static getCategories(): string[] {
    const categories = [...new Set(this.mockCourses.map(course => course.category))];
    return ['All', ...categories.sort()];
  }

  static getDifficultyLevels(): string[] {
    return ['All', 'Beginner', 'Intermediate', 'Advanced'];
  }

  static getPriceFilters(): string[] {
    return ['All', 'Free', 'Paid', 'Freemium'];
  }

  // Real Google Custom Search integration (requires API key)
  static async searchCoursesWithGoogleAPI(query: string, apiKey: string): Promise<GoogleCoursesResponse> {
    const searchEngineId = 'your-custom-search-engine-id'; // Would need to be configured
    
    try {
      const response = await fetch(
        `${this.GOOGLE_COURSES_API_BASE}?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query + ' course certificate')}&num=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search courses with Google API');
      }
      
      const data = await response.json();
      
      // Transform Google search results to course format
      const courses: GoogleCourse[] = data.items?.map((item: any, index: number) => ({
        id: `google-${index}`,
        title: item.title,
        provider: this.extractProvider(item.displayLink),
        category: 'General',
        rating: 4.0, // Default rating
        duration: 'Variable',
        hasCertificate: item.snippet.toLowerCase().includes('certificate'),
        url: item.link,
        description: item.snippet,
        difficulty: 'Beginner' as const,
        price: item.snippet.toLowerCase().includes('free') ? 'Free' as const : 'Paid' as const,
        tags: this.extractTags(item.snippet)
      })) || [];
      
      return {
        courses,
        totalResults: data.searchInformation?.totalResults || 0,
        nextPageToken: data.queries?.nextPage?.[0]?.startIndex?.toString()
      };
    } catch (error) {
      console.error('Error searching courses with Google API:', error);
      // Fall back to mock data
      return this.searchCourses(query);
    }
  }

  private static extractProvider(displayLink: string): string {
    const domain = displayLink.replace('www.', '');
    const providerMap: { [key: string]: string } = {
      'coursera.org': 'Coursera',
      'edx.org': 'edX',
      'udemy.com': 'Udemy',
      'khanacademy.org': 'Khan Academy',
      'youtube.com': 'YouTube',
      'google.com': 'Google',
      'developers.google.com': 'Google Developers'
    };
    
    return providerMap[domain] || domain;
  }

  private static extractTags(snippet: string): string[] {
    const keywords = ['programming', 'data', 'marketing', 'design', 'business', 'ai', 'machine learning', 'web development'];
    const tags: string[] = [];
    
    keywords.forEach(keyword => {
      if (snippet.toLowerCase().includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags.length > 0 ? tags : ['General'];
  }
}
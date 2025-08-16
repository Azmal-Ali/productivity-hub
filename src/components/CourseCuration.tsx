import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, ExternalLink, Search, Star, Clock, Award } from "lucide-react";

interface Course {
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
}

const CourseCuration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Complete Python Bootcamp',
      provider: 'freeCodeCamp',
      category: 'Programming',
      rating: 4.8,
      duration: '40 hours',
      hasCertificate: true,
      url: '#',
      description: 'Learn Python from scratch with hands-on projects and exercises.',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      title: 'Machine Learning Course',
      provider: 'Stanford Online',
      category: 'AI/ML',
      rating: 4.9,
      duration: '60 hours',
      hasCertificate: true,
      url: '#',
      description: 'Comprehensive introduction to machine learning algorithms and applications.',
      difficulty: 'Intermediate'
    },
    {
      id: '3',
      title: 'Digital Marketing Fundamentals',
      provider: 'Google Digital Garage',
      category: 'Marketing',
      rating: 4.6,
      duration: '24 hours',
      hasCertificate: true,
      url: '#',
      description: 'Learn the basics of digital marketing and grow your online presence.',
      difficulty: 'Beginner'
    },
    {
      id: '4',
      title: 'Web Development Basics',
      provider: 'Mozilla Developer Network',
      category: 'Programming',
      rating: 4.7,
      duration: '30 hours',
      hasCertificate: false,
      url: '#',
      description: 'HTML, CSS, and JavaScript fundamentals for web development.',
      difficulty: 'Beginner'
    }
  ]);

  const categories = ['All', 'Programming', 'AI/ML', 'Marketing', 'Design', 'Business'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success/20 text-success';
      case 'Intermediate': return 'bg-warning/20 text-warning';
      case 'Advanced': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="bg-gradient-secondary shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Free Courses with Certificates
        </CardTitle>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No courses found matching your criteria.
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                  <p className="text-sm">{course.description}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
                {course.hasCertificate && (
                  <Badge className="bg-primary/20 text-primary">
                    <Award className="w-3 h-3 mr-1" />
                    Certificate
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-current text-warning" />
                  {course.rating}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCuration;
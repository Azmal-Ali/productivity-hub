import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleCoursesService } from "@/services/GoogleCoursesService";
import { BookOpen, ExternalLink, Search, Star, Clock, Award, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  price: 'Free' | 'Paid' | 'Freemium';
  tags: string[];
}

const CourseCuration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [courses, setCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [freeCourses, setFreeCourses] = useState<Course[]>([]);
  const [certifiedCourses, setCertifiedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const categories = GoogleCoursesService.getCategories();
  const difficulties = GoogleCoursesService.getDifficultyLevels();
  const priceFilters = GoogleCoursesService.getPriceFilters();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "search") {
      searchCourses();
    }
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedPrice, activeTab]);

  const loadInitialData = async () => {
    try {
      const [popular, free, certified] = await Promise.all([
        GoogleCoursesService.getPopularCourses(),
        GoogleCoursesService.getFreeCourses(),
        GoogleCoursesService.getCertifiedCourses()
      ]);
      
      setPopularCourses(popular);
      setFreeCourses(free);
      setCertifiedCourses(certified);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const searchCourses = async () => {
    setIsLoading(true);
    try {
      const result = await GoogleCoursesService.searchCourses(searchTerm, selectedCategory);
      let filteredCourses = result.courses;

      // Apply additional filters
      if (selectedDifficulty !== "All") {
        filteredCourses = filteredCourses.filter(course => course.difficulty === selectedDifficulty);
      }
      
      if (selectedPrice !== "All") {
        filteredCourses = filteredCourses.filter(course => course.price === selectedPrice);
      }

      setCourses(filteredCourses);
    } catch (error) {
      toast.error("Failed to search courses");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'Free': return 'bg-success/20 text-success';
      case 'Paid': return 'bg-primary/20 text-primary';
      case 'Freemium': return 'bg-warning/20 text-warning';
      default: return 'bg-muted';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success/20 text-success';
      case 'Intermediate': return 'bg-warning/20 text-warning';
      case 'Advanced': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted';
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="p-4 rounded-lg bg-muted/50 space-y-3 hover:bg-muted/70 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.provider}</p>
          <p className="text-sm line-clamp-2">{course.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 ml-2"
          onClick={() => window.open(course.url, '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
          {course.difficulty}
        </Badge>
        <Badge variant="outline" className={getPriceColor(course.price)}>
          {course.price}
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
      
      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {course.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Google-Powered Course Recommendations
        </h2>
        <p className="text-muted-foreground">
          Discover high-quality courses from Google and top educational platforms
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="free">Free Courses</TabsTrigger>
          <TabsTrigger value="certified">With Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by title, provider, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 6).map((category) => (
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <div className="flex flex-wrap gap-1">
                    {difficulties.map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <div className="flex flex-wrap gap-1">
                    {priceFilters.map((price) => (
                      <Button
                        key={price}
                        variant={selectedPrice === price ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPrice(price)}
                      >
                        {price}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {isLoading ? (
            <Card className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Searching courses...</p>
            </Card>
          ) : (
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || selectedCategory !== "All" || selectedDifficulty !== "All" || selectedPrice !== "All"
                      ? "No courses found matching your criteria."
                      : "Start searching to discover amazing courses!"}
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Found {courses.length} course{courses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular">
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Most Popular Courses</CardTitle>
              <p className="text-muted-foreground">Top-rated courses from Google and partner platforms</p>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="free">
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Free Courses</CardTitle>
              <p className="text-muted-foreground">High-quality courses at no cost</p>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {freeCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certified">
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Certified Courses</CardTitle>
              <p className="text-muted-foreground">Courses that provide professional certificates</p>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {certifiedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseCuration;
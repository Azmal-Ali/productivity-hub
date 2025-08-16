import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIToolsService, AITool, UserGoal } from "@/services/AIToolsService";
import { 
  Sparkles, 
  ExternalLink, 
  Star, 
  Search, 
  Target, 
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const AIToolsRecommender = () => {
  const [activeTab, setActiveTab] = useState("recommend");
  const [searchQuery, setSearchQuery] = useState("");
  const [userGoal, setUserGoal] = useState<UserGoal>({
    domain: "",
    goal: "",
    experience: "Beginner",
    budget: "Free"
  });
  const [recommendations, setRecommendations] = useState<AITool[]>([]);
  const [searchResults, setSearchResults] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleGetRecommendations = () => {
    if (!userGoal.domain.trim() || !userGoal.goal.trim()) {
      toast.error("Please fill in both domain and goal fields");
      return;
    }

    const tools = AIToolsService.recommendTools(userGoal);
    setRecommendations(tools);
    toast.success(`Found ${tools.length} recommended tools for you!`);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = AIToolsService.searchTools(searchQuery);
    setSearchResults(results);
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return 'bg-success/20 text-success';
      case 'Freemium': return 'bg-primary/20 text-primary';
      case 'Paid': return 'bg-warning/20 text-warning';
      default: return 'bg-muted';
    }
  };

  const categories = AIToolsService.getCategories();
  const popularTools = AIToolsService.getPopularTools();
  
  const filteredTools = selectedCategory === "All" 
    ? AIToolsService.getAllTools()
    : AIToolsService.getToolsByCategory(selectedCategory);

  const ToolCard = ({ tool }: { tool: AITool }) => (
    <Card className="bg-gradient-secondary shadow-card hover:shadow-elevated transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground">{tool.subcategory}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3 h-3 fill-current text-warning" />
                {tool.rating}
              </div>
              <Badge className={getPricingColor(tool.pricing)}>
                {tool.pricing}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm line-clamp-2">{tool.description}</p>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {tool.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {tool.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.features.length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {tool.useCases.slice(0, 2).map((useCase, index) => (
                  <span key={index} className="text-xs text-muted-foreground">
                    #{useCase.toLowerCase().replace(' ', '')}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Try Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-secondary shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Tools Recommender
          </CardTitle>
          <p className="text-muted-foreground">
            Discover the perfect AI tools for your goals and projects
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="recommend" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Get Recommendations
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Tools
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Browse All
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        {/* Personalized Recommendations */}
        <TabsContent value="recommend" className="space-y-6">
          <Card className="bg-gradient-secondary shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Tell us about your needs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain/Field</label>
                  <Input
                    placeholder="e.g., content creation, development, design"
                    value={userGoal.domain}
                    onChange={(e) => setUserGoal(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specific Goal</label>
                  <Input
                    placeholder="e.g., write blog posts, create social media graphics"
                    value={userGoal.goal}
                    onChange={(e) => setUserGoal(prev => ({ ...prev, goal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select 
                    value={userGoal.experience} 
                    onValueChange={(value: any) => setUserGoal(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget Preference</label>
                  <Select 
                    value={userGoal.budget} 
                    onValueChange={(value: any) => setUserGoal(prev => ({ ...prev, budget: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free tools only</SelectItem>
                      <SelectItem value="Low">Under $20/month</SelectItem>
                      <SelectItem value="Medium">$20-$100/month</SelectItem>
                      <SelectItem value="High">No budget limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleGetRecommendations} className="w-full md:w-auto">
                <Zap className="w-4 h-4 mr-2" />
                Get My Recommendations
              </Button>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Search Tools */}
        <TabsContent value="search" className="space-y-6">
          <Card className="bg-gradient-secondary shadow-card">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Search AI tools by name, category, or use case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Search Results ({searchResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Browse All Tools */}
        <TabsContent value="browse" className="space-y-6">
          <Card className="bg-gradient-secondary shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">{filteredTools.length} tools</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        {/* Popular Tools */}
        <TabsContent value="popular" className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Most Popular AI Tools</h3>
            <p className="text-muted-foreground">Top-rated tools loved by the community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-border">
            <Card className="text-center bg-gradient-secondary shadow-card">
              <CardContent className="p-4">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{AIToolsService.getAllTools().length}</div>
                <div className="text-sm text-muted-foreground">AI Tools Curated</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-secondary shadow-card">
              <CardContent className="p-4">
                <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold">{AIToolsService.getToolsByPricing('Free').length}</div>
                <div className="text-sm text-muted-foreground">Free Tools Available</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-secondary shadow-card">
              <CardContent className="p-4">
                <Star className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold">4.6</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIToolsRecommender;
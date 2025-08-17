import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PomodoroTimer from "@/components/PomodoroTimer";
import DailyTracker from "@/components/DailyTracker";
import CourseCuration from "@/components/CourseCuration";
import YouTubeAnalytics from "@/components/YouTubeAnalytics";
import AIToolsRecommender from "@/components/AIToolsRecommender";
import { VideoComparison } from "@/components/VideoComparison";
import { 
  Brain, 
  Target, 
  BookOpen, 
  Users, 
  Trophy, 
  MessageSquare,
  BarChart3,
  Youtube,
  Sparkles,
  GitCompare
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const features = [
    { icon: Youtube, title: "YouTube Analytics", desc: "Video stats & sentiment analysis", status: "active" },
    { icon: GitCompare, title: "Video Comparison", desc: "Compare videos on quality & bias", status: "active" },
    { icon: BookOpen, title: "Course Curation", desc: "Free courses with certificates", status: "active" },
    { icon: Sparkles, title: "AI Tools", desc: "Personalized tool recommendations", status: "active" },
    { icon: Target, title: "Goals & Timer", desc: "Pomodoro & daily tracking", status: "active" },
    { icon: Users, title: "Community", desc: "Reddit-like discussions", status: "coming-soon" },
    { icon: Trophy, title: "Leaderboard", desc: "Compete with friends", status: "coming-soon" },
    { icon: MessageSquare, title: "AI Chatbot", desc: "Career guidance & Q&A", status: "coming-soon" }
  ];

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-gradient-success text-xs">Live</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Coming Soon</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  ProductivityHub
                </h1>
                <p className="text-sm text-muted-foreground">Your all-in-one learning & productivity platform</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sign In</Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "youtube", label: "YouTube Analytics", icon: Youtube },
              { id: "comparison", label: "Video Compare", icon: GitCompare },
              { id: "aitools", label: "AI Tools", icon: Sparkles },
              { id: "timer", label: "Focus Timer", icon: Target },
              { id: "courses", label: "Courses", icon: BookOpen },
              { id: "community", label: "Community", icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Supercharge Your Learning Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover courses, track progress, stay motivated, and connect with learners worldwide
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="text-center bg-gradient-secondary shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">127</div>
                  <div className="text-sm text-muted-foreground">Study Hours</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-secondary shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-success">7</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-secondary shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-accent">12</div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-secondary shadow-card">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-warning">85%</div>
                  <div className="text-sm text-muted-foreground">Goals Hit</div>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="bg-gradient-secondary shadow-card hover:shadow-elevated transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                        {getStatusBadge(feature.status)}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Active Components Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DailyTracker />
              <PomodoroTimer />
            </div>
          </div>
        )}

        {activeTab === "youtube" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">YouTube Video Analytics</h2>
              <p className="text-muted-foreground">Analyze video stats, comments sentiment, and detect spam</p>
            </div>
            <YouTubeAnalytics />
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="space-y-6">
            <VideoComparison />
          </div>
        )}

        {activeTab === "aitools" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">AI Tools Recommender</h2>
              <p className="text-muted-foreground">Discover the perfect AI tools for your goals and projects</p>
            </div>
            <AIToolsRecommender />
          </div>
        )}

        {activeTab === "timer" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Focus Timer</h2>
              <p className="text-muted-foreground">Use the Pomodoro technique to boost your productivity</p>
            </div>
            <PomodoroTimer />
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Course Library</h2>
              <p className="text-muted-foreground">Discover free courses with certificates from top providers</p>
            </div>
            <CourseCuration />
          </div>
        )}

        {activeTab === "community" && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Community Coming Soon</h2>
            <p className="text-muted-foreground mb-8">Connect with learners, share experiences, and get motivated together</p>
            <Button variant="outline">Join Waitlist</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
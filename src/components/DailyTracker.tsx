import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

const DailyTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Study Sessions',
      target: 4,
      current: 0,
      unit: 'sessions',
      color: 'primary'
    },
    {
      id: '2',
      title: 'Reading',
      target: 60,
      current: 0,
      unit: 'minutes',
      color: 'accent'
    },
    {
      id: '3',
      title: 'Exercise',
      target: 30,
      current: 0,
      unit: 'minutes',
      color: 'success'
    }
  ]);

  const [streak, setStreak] = useState(7);
  const [todayComplete, setTodayComplete] = useState(false);

  const incrementGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId && goal.current < goal.target) {
        const newCurrent = goal.current + (goal.unit === 'sessions' ? 1 : 15);
        const isComplete = newCurrent >= goal.target;
        
        if (isComplete) {
          toast.success(`🎉 Goal "${goal.title}" completed!`);
        }
        
        return { ...goal, current: Math.min(newCurrent, goal.target) };
      }
      return goal;
    }));
  };

  const resetDay = () => {
    setGoals(prev => prev.map(goal => ({ ...goal, current: 0 })));
    setTodayComplete(false);
    toast.info("Daily goals reset!");
  };

  const allGoalsComplete = goals.every(goal => goal.current >= goal.target);

  useEffect(() => {
    if (allGoalsComplete && !todayComplete) {
      setTodayComplete(true);
      setStreak(prev => prev + 1);
      toast.success(`🔥 All goals completed! ${streak + 1} day streak!`);
    }
  }, [allGoalsComplete, todayComplete, streak]);

  const overallProgress = (goals.reduce((acc, goal) => acc + (goal.current / goal.target), 0) / goals.length) * 100;

  return (
    <Card className="bg-gradient-secondary shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Daily Progress
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {streak} day streak
            </Badge>
            {todayComplete && (
              <Badge className="bg-gradient-success">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isComplete = goal.current >= goal.target;
          
          return (
            <div key={goal.id} className="space-y-2 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{goal.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {goal.current}/{goal.target} {goal.unit}
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-1.5" />
                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => incrementGoal(goal.id)}
                    disabled={isComplete}
                    className="text-xs"
                  >
                    +{goal.unit === 'sessions' ? '1' : '15'} {goal.unit}
                  </Button>
                  {isComplete && (
                    <Badge className="bg-gradient-success text-xs">
                      Completed! 🎉
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Today's Goals
            </div>
            <Button size="sm" variant="ghost" onClick={resetDay}>
              Reset Day
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyTracker;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Timer } from "lucide-react";
import { toast } from "sonner";

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);

  const workTime = 25 * 60;
  const breakTime = 5 * 60;
  const longBreakTime = 15 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (mode === 'work') {
        setSessions(prev => prev + 1);
        const newSessions = sessions + 1;
        
        if (newSessions % 4 === 0) {
          // Long break after 4 sessions
          setTimeLeft(longBreakTime);
          setMode('break');
          toast.success("Work session complete! Time for a long break.");
        } else {
          // Short break
          setTimeLeft(breakTime);
          setMode('break');
          toast.success("Work session complete! Time for a short break.");
        }
      } else {
        // Break finished, back to work
        setTimeLeft(workTime);
        setMode('work');
        toast.success("Break over! Ready for another work session?");
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessions]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workTime : (sessions % 4 === 0 ? longBreakTime : breakTime));
  };

  const switchMode = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakTime);
    } else {
      setMode('work');
      setTimeLeft(workTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? ((workTime - timeLeft) / workTime) * 100
    : ((breakTime - timeLeft) / breakTime) * 100;

  return (
    <Card className="bg-gradient-secondary shadow-card hover:shadow-elevated transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Timer className="w-6 h-6 text-primary" />
          Pomodoro Timer
        </CardTitle>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>Sessions: {sessions}</span>
          <span className={`px-2 py-1 rounded-md ${
            mode === 'work' 
              ? 'bg-primary/20 text-primary' 
              : 'bg-success/20 text-success'
          }`}>
            {mode === 'work' ? 'Work' : 'Break'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            {formatTime(timeLeft)}
          </div>
          <Progress 
            value={progress} 
            className="w-full h-2"
          />
        </div>
        
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggle}
            size="lg"
            variant={isActive ? "secondary" : "default"}
            className="flex items-center gap-2"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={reset}
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={switchMode}
            size="lg"
            variant="outline"
          >
            Switch to {mode === 'work' ? 'Break' : 'Work'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
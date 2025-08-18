import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Bell,
  CheckCircle,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  reminderSet: boolean;
  createdAt: Date;
}

interface PomodoroSession {
  taskId?: string;
  duration: number; // in minutes
  isActive: boolean;
  timeRemaining: number; // in seconds
  type: 'work' | 'break';
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as Task['priority']
  });
  const [pomodoro, setPomodoro] = useState<PomodoroSession>({
    duration: 25,
    isActive: false,
    timeRemaining: 25 * 60,
    type: 'work'
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('youtube-analytics-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        deadline: new Date(task.deadline),
        createdAt: new Date(task.createdAt)
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('youtube-analytics-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pomodoro.isActive && pomodoro.timeRemaining > 0) {
      interval = setInterval(() => {
        setPomodoro(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (pomodoro.timeRemaining === 0) {
      // Timer finished
      setPomodoro(prev => ({ ...prev, isActive: false }));
      toast.success(`${pomodoro.type === 'work' ? 'Work' : 'Break'} session completed!`);
      
      // Play notification sound (if available)
      if (typeof Audio !== 'undefined') {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSeMzvi8cyMFl2+z9NaJOAcXZrjn8KdvGQg+ltryxnksBC19zfPZiTYIG2i98OScTgwOUarg0LhkHgU5kdf0wXYpBSh+0O/ZjjoD5HHR7+GTOQ1FouPzvmYdBDOWwv7xbCEGMH3B9NZ+OAgXb8Hn6aZTEwxCpN/qs2AhBz6a1/iu');
          audio.play();
        } catch (e) {
          // Fallback notification
          if (Notification.permission === 'granted') {
            new Notification(`${pomodoro.type === 'work' ? 'Work' : 'Break'} session completed!`);
          }
        }
      }
    }

    return () => clearInterval(interval);
  }, [pomodoro.isActive, pomodoro.timeRemaining, pomodoro.type]);

  // Check for upcoming deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const upcoming = tasks.filter(task => {
        if (task.completed) return false;
        const timeDiff = task.deadline.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
      });

      if (upcoming.length > 0) {
        toast.warning(`${upcoming.length} task(s) due within 24 hours!`);
      }
    };

    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // Check every hour
    checkDeadlines(); // Check immediately

    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!newTask.deadline) {
      toast.error("Please set a deadline");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      deadline: new Date(newTask.deadline),
      priority: newTask.priority,
      completed: false,
      reminderSet: false,
      createdAt: new Date()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '', deadline: '', priority: 'medium' });
    toast.success("Task added successfully!");
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success("Task deleted");
  };

  const getTimeUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = (taskId?: string) => {
    setPomodoro(prev => ({
      ...prev,
      taskId,
      isActive: true,
      timeRemaining: prev.duration * 60
    }));
    toast.success("Pomodoro timer started!");
  };

  const pausePomodoro = () => {
    setPomodoro(prev => ({ ...prev, isActive: false }));
  };

  const resetPomodoro = () => {
    setPomodoro(prev => ({
      ...prev,
      isActive: false,
      timeRemaining: prev.duration * 60
    }));
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = pendingTasks.filter(task => task.deadline < new Date());

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-secondary shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Task Manager & Countdown Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Pomodoro
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              {/* Add New Task */}
              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Task
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-deadline">Deadline</Label>
                      <Input
                        id="task-deadline"
                        type="datetime-local"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Input
                      id="task-description"
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Priority:</Label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map(priority => (
                        <Button
                          key={priority}
                          variant={newTask.priority === priority ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewTask(prev => ({ ...prev, priority }))}
                          className={getPriorityColor(priority)}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={addTask} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>

              {/* Task Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-secondary">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-secondary">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success">{completedTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-secondary">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-secondary">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning">
                      {pendingTasks.length > 0 ? Math.round((completedTasks.length / (completedTasks.length + pendingTasks.length)) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {overdueTasks.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      You have {overdueTasks.length} overdue task(s). Please review them urgently.
                    </AlertDescription>
                  </Alert>
                )}

                {pendingTasks.map(task => (
                  <Card key={task.id} className="bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTask(task.id)}
                          className="mt-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                            <Badge 
                              variant={task.deadline < new Date() ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeUntilDeadline(task.deadline)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Due: {task.deadline.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startPomodoro(task.id)}
                              className="text-xs"
                            >
                              <Timer className="w-3 h-3 mr-1" />
                              Start Timer
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {completedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-success">Completed Tasks</h3>
                    {completedTasks.slice(0, 5).map(task => (
                      <Card key={task.id} className="bg-success/10 border-success/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="line-through text-muted-foreground">{task.title}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTask(task.id)}
                              className="ml-auto text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timer" className="space-y-4">
              {/* Pomodoro Timer */}
              <Card className="bg-gradient-secondary shadow-card">
                <CardHeader>
                  <CardTitle className="text-center">Pomodoro Timer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-mono font-bold text-primary">
                      {formatTime(pomodoro.timeRemaining)}
                    </div>
                    <Badge variant={pomodoro.type === 'work' ? 'default' : 'secondary'} className="text-sm">
                      {pomodoro.type === 'work' ? 'Work Session' : 'Break Time'}
                    </Badge>
                    {pomodoro.taskId && (
                      <p className="text-sm text-muted-foreground">
                        Working on: {tasks.find(t => t.id === pomodoro.taskId)?.title}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {!pomodoro.isActive ? (
                      <Button onClick={() => startPomodoro()} className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pausePomodoro} variant="secondary" className="flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetPomodoro} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Session Duration (minutes)</Label>
                    <div className="flex gap-2">
                      {[15, 25, 30, 45].map(duration => (
                        <Button
                          key={duration}
                          size="sm"
                          variant={pomodoro.duration === duration ? "default" : "outline"}
                          onClick={() => setPomodoro(prev => ({ 
                            ...prev, 
                            duration, 
                            timeRemaining: duration * 60,
                            isActive: false 
                          }))}
                        >
                          {duration}m
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Progress 
                    value={((pomodoro.duration * 60 - pomodoro.timeRemaining) / (pomodoro.duration * 60)) * 100}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {/* Schedule Overview */}
              <Card className="bg-gradient-secondary shadow-card">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTasks
                      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
                      .slice(0, 10)
                      .map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="text-sm font-mono">
                            {task.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground">{task.description}</div>
                            )}
                          </div>
                          <Badge 
                            variant={task.deadline < new Date() ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {getTimeUntilDeadline(task.deadline)}
                          </Badge>
                        </div>
                      ))}
                    
                    {pendingTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks scheduled. Add some tasks to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManager;
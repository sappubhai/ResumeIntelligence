import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  Download, 
  Layout, 
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  Settings,
  Plus,
  Palette,
  Upload,
  Grid3X3,
  Layers,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Clock,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalResumes: number;
  totalDownloads: number;
  totalTemplates: number;
  recentActivity: Array<{
    type: string;
    userId: number;
    resumeId: number;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    enabled: !!user && (user as any).role === 'admin',
  });

  // Chart data
  const pieChartData = [
    { name: 'Professional', value: 45, color: '#6366f1' },
    { name: 'Creative', value: 30, color: '#8b5cf6' },
    { name: 'Executive', value: 15, color: '#ec4899' },
    { name: 'Student', value: 10, color: '#f59e0b' },
  ];

  const monthlyData = [
    { month: 'Jan', users: 20, resumes: 45, downloads: 30 },
    { month: 'Feb', users: 35, resumes: 60, downloads: 45 },
    { month: 'Mar', users: 45, resumes: 80, downloads: 65 },
    { month: 'Apr', users: 60, resumes: 100, downloads: 85 },
    { month: 'May', users: 75, resumes: 130, downloads: 110 },
    { month: 'Jun', users: 90, resumes: 160, downloads: 140 },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="group hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Upload className="h-8 w-8" />
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Upload Template</CardTitle>
                  <CardDescription className="text-white/80">
                    Convert PDF/Word to HTML template
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Palette className="h-8 w-8" />
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Template Builder</CardTitle>
                  <CardDescription className="text-white/80">
                    Create custom templates visually
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-pink-500 to-orange-600 text-white border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Users className="h-8 w-8" />
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Manage Users</CardTitle>
                  <CardDescription className="text-white/80">
                    View and manage platform users
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <div className="flex items-center text-sm text-green-600 mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+12% from last month</span>
                  </div>
                  <Progress value={75} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalResumes || 0}</div>
                  <div className="flex items-center text-sm text-green-600 mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+23% from last month</span>
                  </div>
                  <Progress value={60} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Download className="h-6 w-6 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalDownloads || 0}</div>
                  <div className="flex items-center text-sm text-green-600 mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+18% from last month</span>
                  </div>
                  <Progress value={85} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Layout className="h-6 w-6 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalTemplates || 0}</div>
                  <div className="flex items-center text-sm text-blue-600 mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    <span>2 new this week</span>
                  </div>
                  <Progress value={40} className="mt-3" />
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Analytics</CardTitle>
                  <CardDescription>Monthly trends for key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="resumes" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="downloads" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Usage</CardTitle>
                  <CardDescription>Distribution by template type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: Download, color: "blue", title: "Resume Downloaded", desc: "User #123 downloaded Professional Template", time: "2 min ago" },
                    { icon: FileText, color: "green", title: "New Resume Created", desc: "User #456 created a new resume", time: "15 min ago" },
                    { icon: Users, color: "purple", title: "New User Registered", desc: "john.doe@example.com joined", time: "1 hour ago" },
                    { icon: Layout, color: "orange", title: "Template Updated", desc: "Creative Template v2.0 published", time: "3 hours ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        activity.color === "blue" && "bg-blue-100",
                        activity.color === "green" && "bg-green-100",
                        activity.color === "purple" && "bg-purple-100",
                        activity.color === "orange" && "bg-orange-100"
                      )}>
                        <activity.icon className={cn(
                          "w-5 h-5",
                          activity.color === "blue" && "text-blue-600",
                          activity.color === "green" && "text-green-600",
                          activity.color === "purple" && "text-purple-600",
                          activity.color === "orange" && "text-orange-600"
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-sm text-slate-600">{activity.desc}</p>
                      </div>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Template Management Section */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Template Management</h2>
                <p className="text-slate-600">Create and manage resume templates</p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/templates/upload">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Template
                  </Button>
                </Link>
                <Link href="/admin/templates/builder">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Palette className="w-4 h-4 mr-2" />
                    Template Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Professional", type: "Modern", uses: 245, color: "blue" },
                { name: "Creative", type: "Artistic", uses: 182, color: "purple" },
                { name: "Executive", type: "Corporate", uses: 156, color: "green" },
                { name: "Student", type: "Academic", uses: 98, color: "orange" },
              ].map((template, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all">
                  <div className={cn(
                    "h-48 rounded-t-lg flex items-center justify-center",
                    template.color === "blue" && "bg-gradient-to-br from-blue-400 to-blue-600",
                    template.color === "purple" && "bg-gradient-to-br from-purple-400 to-purple-600",
                    template.color === "green" && "bg-gradient-to-br from-green-400 to-green-600",
                    template.color === "orange" && "bg-gradient-to-br from-orange-400 to-orange-600"
                  )}>
                    <Layout className="w-16 h-16 text-white/50" />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge variant="secondary">{template.type}</Badge>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {template.uses} uses
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Updated 2d ago
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">User management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>In-depth platform insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Advanced analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
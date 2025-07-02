import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Settings
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

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
  const chartData = [
    { name: 'Users', value: parseInt(stats?.totalUsers || '0'), color: '#3b82f6' },
    { name: 'Resumes', value: parseInt(stats?.totalResumes || '0'), color: '#10b981' },
    { name: 'Downloads', value: parseInt(stats?.totalDownloads || '0'), color: '#f59e0b' },
    { name: 'Templates', value: parseInt(stats?.totalTemplates || '0'), color: '#8b5cf6' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
              <p className="text-neutral-600 mt-1">Manage your resume builder platform</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/templates">
                <Button variant="outline">
                  <Layout className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/">
                <Button>
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                Active registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalResumes || 0}</div>
              <p className="text-xs text-muted-foreground">
                <BarChart3 className="inline w-3 h-3 mr-1" />
                Created by users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
              <p className="text-xs text-muted-foreground">
                <PieChart className="inline w-3 h-3 mr-1" />
                PDF downloads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTemplates || 0}</div>
              <p className="text-xs text-muted-foreground">
                <Activity className="inline w-3 h-3 mr-1" />
                Available templates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentActivity?.length ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Download className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          User {activity.userId} downloaded resume {activity.resumeId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">Download</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/templates/new" className="block">
                <Button className="w-full" variant="outline">
                  <Layout className="w-4 h-4 mr-2" />
                  Add New Template
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/resumes" className="block">
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Resumes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
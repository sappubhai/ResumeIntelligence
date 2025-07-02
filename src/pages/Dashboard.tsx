import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';

interface Resume {
  id: number;
  title: string;
  full_name: string;
  professional_title: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: async (): Promise<Resume[]> => {
      return apiRequest('/resumes');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Handle the parsed resume data - you could navigate to resume builder
      console.log('Parsed resume data:', data);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    uploadMutation.mutate(formData);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hello, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/create-resume">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Create New Resume
              </button>
            </Link>
            
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isPending}
              />
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {uploadMutation.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{uploadMutation.error.message}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">{resume.title}</h3>
              <p className="text-gray-600 mb-2">{resume.full_name}</p>
              <p className="text-gray-500 mb-4">{resume.professional_title}</p>
              <p className="text-sm text-gray-400 mb-4">
                Updated: {new Date(resume.updated_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <Link href={`/resume/${resume.id}`}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Edit
                  </button>
                </Link>
                <a
                  href={`/api/resumes/${resume.id}/pdf`}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>

        {resumes.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first resume or uploading an existing one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
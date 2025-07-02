import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            ResumeBuilder Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create professional resumes with AI-powered parsing and beautiful templates
          </p>
          <div className="space-x-4">
            <Link href="/auth">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Get Started
              </button>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">AI-Powered Parsing</h3>
              <p className="text-gray-600">Upload your existing resume and let AI extract all the information automatically</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600">Choose from a variety of professional templates designed for different industries</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Instant PDF Download</h3>
              <p className="text-gray-600">Generate and download your resume as a high-quality PDF instantly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
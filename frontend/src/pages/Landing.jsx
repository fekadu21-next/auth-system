import { Link } from "react-router-dom";
import { 
  FileText, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Clock,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LiveDocs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Real-time collaboration made simple</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Collaborate on documents
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              in real-time
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Work together seamlessly with your team. Edit, share, and collaborate on documents with live syncing, instant updates, and powerful sharing controls.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register" 
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • Free forever for individuals
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to collaborate
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed for modern teams
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Real-time Collaboration",
              description: "See changes instantly as team members edit. Multiple users can work together simultaneously with live cursors and presence indicators."
            },
            {
              icon: Globe,
              title: "Share Anywhere",
              description: "Share documents with anyone via link. Control permissions with viewer, commenter, or editor access levels."
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built for speed with instant syncing and minimal latency. Your changes are saved and propagated in milliseconds."
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Enterprise-grade security with encrypted connections. Your data is protected with advanced security protocols."
            },
            {
              icon: Clock,
              title: "Version History",
              description: "Never lose your work with automatic version tracking. Restore previous versions anytime with detailed history."
            },
            {
              icon: FileText,
              title: "Rich Document Editor",
              description: "Powerful editor with formatting, tables, images, and more. Create professional documents with ease."
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to transform how you collaborate?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using LiveDocs to work together more effectively.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">LiveDocs</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 LiveDocs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
import {
    MapPin,
    Shield,
    Zap,
    Users,
    TrendingUp,
    Check,
    Download,
    LogIn,
    Globe,
    Lock,
    ArrowRight,
    Star,
    Bell,
    BarChart3,
    Smartphone,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const features = [
        {
            icon: MapPin,
            title: "Real-time Reporting",
            description:
                "Report civic issues instantly with location-based mapping and photo documentation.",
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description:
                "Get instant updates on report status, government responses, and community activities.",
        },
        {
            icon: BarChart3,
            title: "Analytics Dashboard",
            description:
                "Comprehensive insights and data visualization for istrators and citizens.",
        },
        {
            icon: Users,
            title: "Community Engagement",
            description:
                "Connect with local communities and participate in democratic decision-making.",
        },
        {
            icon: Shield,
            title: "Secure & Verified",
            description:
                "Government-grade security with verified user authentication and data protection.",
        },
        {
            icon: Zap,
            title: "Fast Response",
            description:
                "Quick resolution tracking with automated workflow and priority management.",
        },
    ];

    const stats = [
        { number: "50K+", label: "Active Citizens" },
        { number: "15K+", label: "Issues Resolved" },
        { number: "98%", label: "User Satisfaction" },
        { number: "24/7", label: "Support Available" },
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-[#2E6A56]/8 to-emerald-400/8 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute top-1/3 right-10 w-96 h-96 bg-gradient-to-br from-emerald-300/6 to-[#2E6A56]/6 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
                <div
                    className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-green-300/8 to-teal-400/8 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute bottom-10 right-1/3 w-64 h-64 bg-gradient-to-br from-teal-300/6 to-[#2E6A56]/6 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "3s" }}
                ></div>
            </div>

            {/* Navigation */}
            <nav className="bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E6A56] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#2E6A56]/30">
                                <MapPin className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white">
                                civik
                            </span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Link
                                href="/auth?mode=login"
                                className="text-white/80 hover:text-white font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                            <Link
                                href="/auth?mode=signup"
                                className="bg-gradient-to-r from-[#2E6A56] to-emerald-600 hover:from-[#1f4a3a] hover:to-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-[#2E6A56]/30"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Decorative Leaf Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute top-20 left-1/4 w-8 h-8 text-[#2E6A56]/60 animate-bounce"
                        style={{
                            animationDelay: "0.5s",
                            animationDuration: "4s",
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-full h-full"
                        >
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                        </svg>
                    </div>

                    <div
                        className="absolute top-1/3 right-1/4 w-6 h-6 text-emerald-600/70 animate-pulse"
                        style={{
                            animationDelay: "1s",
                            animationDuration: "3s",
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-full h-full rotate-45"
                        >
                            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                        </svg>
                    </div>

                    <div
                        className="absolute top-1/2 left-16 w-7 h-7 text-green-700/50 animate-pulse"
                        style={{
                            animationDelay: "3s",
                            animationDuration: "3.5s",
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-full h-full rotate-12"
                        >
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                        </svg>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-10 max-w-5xl mx-auto">
                        <div className="inline-flex items-center bg-gradient-to-r from-[#2E6A56]/20 to-emerald-600/20 border border-[#2E6A56]/30 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#2E6A56]/20 backdrop-blur-xl">
                            <Globe className="w-4 h-4 mr-2 text-emerald-400" />
                            Digital Governance Platform
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight">
                            Connect with your city.
                            <span className="text-emerald-400 block mt-3">
                                Make it better.
                            </span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto font-light">
                            Report issues, track updates, and participate in
                            building stronger communities through digital
                            governance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
                            <Link
                                href="/auth?mode=signup"
                                className="bg-gradient-to-r from-[#2E6A56] to-emerald-600 hover:from-[#1f4a3a] hover:to-emerald-700 text-white px-12 py-5 text-lg rounded-2xl shadow-2xl shadow-[#2E6A56]/40 hover:shadow-[#2E6A56]/60 transition-all duration-300 transform hover:scale-105 group flex items-center font-semibold"
                            >
                                <Download className="w-5 h-5 mr-3" />
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/auth?mode=login"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-12 py-5 text-lg rounded-2xl font-semibold flex items-center group transition-all duration-300 hover:scale-105"
                            >
                                <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Admin Portal
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center items-center gap-8 pt-12 text-white/60 text-sm">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>50K+ Active Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>98% Satisfaction Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-b from-black via-[#2E6A56]/5 to-black border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group-hover:scale-105 group-hover:border-[#2E6A56]/40 transition-all duration-300">
                                    <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm lg:text-base text-white/70 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Preview Section */}
            <section className="py-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center bg-[#2E6A56]/10 text-[#2E6A56] px-4 py-2 rounded-full text-sm font-medium">
                                <Smartphone className="w-4 h-4 mr-2" />
                                Mobile App
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white">
                                Everything you need
                                <span className="text-[#2E6A56] block">
                                    in your pocket
                                </span>
                            </h2>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56] to-emerald-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-[#2E6A56]/20 transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                                    <div className="bg-gradient-to-br from-[#2E6A56]/10 to-emerald-600/10 text-center pb-6 pt-8 px-6 border-b border-white/10">
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#2E6A56] to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#2E6A56]/40 group-hover:scale-110 transition-transform duration-500">
                                            <Smartphone className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-3">
                                            civik Mobile App
                                        </h3>
                                        <div className="flex items-center justify-center space-x-1 mt-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                                />
                                            ))}
                                            <span className="ml-3 text-base font-semibold text-white/80">
                                                4.8 (12K+ reviews)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-6">
                                        <div className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#2E6A56]/30 transition-all duration-300 group/item">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                <MapPin className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-white/90">
                                                Report civic issues instantly
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#2E6A56]/30 transition-all duration-300 group/item">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                <Bell className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-white/90">
                                                Track resolution progress
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#2E6A56]/30 transition-all duration-300 group/item">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                <Users className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-white/90">
                                                Community engagement
                                            </span>
                                        </div>
                                        <div className="pt-4">
                                            <Link
                                                href="/auth?mode=signup"
                                                className="w-full bg-gradient-to-r from-[#2E6A56] to-emerald-600 hover:from-[#1f4a3a] hover:to-emerald-700 text-white py-4 rounded-xl font-semibold group/btn transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#2E6A56]/30 hover:shadow-[#2E6A56]/50"
                                            >
                                                <Download className="w-5 h-5 mr-2" />
                                                Get Started Now
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-16">
                        <div className="inline-flex items-center bg-[#2E6A56]/10 text-[#2E6A56] px-4 py-2 rounded-full text-sm font-medium">
                            Platform Features
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                            Built for citizens,
                            <span className="text-[#2E6A56] block">
                                powered by innovation
                            </span>
                        </h2>
                        <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                            Modern tools that make civic engagement simple,
                            transparent, and effective for everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-[#2E6A56]/10 hover:border-[#2E6A56]/30 transition-all duration-500 hover:scale-105 rounded-2xl p-8">
                                    <div className="pb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#2E6A56]/20 to-emerald-600/20 border border-[#2E6A56]/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#2E6A56]/50 transition-all duration-300 shadow-lg shadow-[#2E6A56]/20">
                                            <feature.icon className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-white/70 leading-relaxed text-base">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-[#2E6A56] via-emerald-600 to-emerald-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                                Ready to make a difference?
                            </h2>
                            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light max-w-3xl mx-auto">
                                Join thousands building stronger communities
                                through digital governance.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
                            <Link
                                href="/auth?mode=signup"
                                className="bg-white hover:bg-white/90 text-[#2E6A56] px-12 py-5 text-lg rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 group transform hover:scale-105 font-bold flex items-center"
                            >
                                <Download className="w-5 h-5 mr-3" />
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/auth?mode=login"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white px-12 py-5 text-lg rounded-2xl font-semibold flex items-center group transition-all duration-300 hover:scale-105"
                            >
                                <Lock className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black border-t border-white/10 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E6A56] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#2E6A56]/30">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold">
                                    civik
                                </span>
                            </div>
                            <p className="text-white/60 leading-relaxed text-base">
                                Empowering digital democracy through
                                transparent, efficient, and responsive
                                governance.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white">
                                Quick Links
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href="/auth?mode=signup"
                                    className="block text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1 font-medium"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href="/auth?mode=login"
                                    className="block text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1 font-medium"
                                >
                                    Admin Portal
                                </Link>
                                <Link
                                    href="/citizen/dashboard"
                                    className="block text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1 font-medium"
                                >
                                    Citizen Portal
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white">
                                Contact
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="mailto:support@civik.gov.in"
                                    className="block text-white/60 hover:text-emerald-400 transition-colors font-medium"
                                >
                                    support@civik.gov.in
                                </a>
                                <p className="text-white/60 font-medium">
                                    +91 1800-XXX-XXXX
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/50 text-sm">
                            © 2025 civik. All rights reserved. | A Digital India
                            Initiative
                        </p>
                        <div className="flex gap-6">
                            <Link
                                href="#"
                                className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

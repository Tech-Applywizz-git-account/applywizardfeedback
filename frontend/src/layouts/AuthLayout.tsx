import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bug } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — gradient */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BugTracker</h1>
              <p className="text-white/70 text-sm">Beta Feedback Portal</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Help shape the future of our app
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Report bugs, request features, and collaborate with our team to build a better product.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Beta Testers', value: '500+' },
              { label: 'Bugs Fixed', value: '1,200+' },
              { label: 'Features Shipped', value: '80+' },
              { label: 'Response Time', value: '< 24h' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-white/70 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">BugTracker</p>
              <p className="text-muted-foreground text-xs">Beta Feedback Portal</p>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

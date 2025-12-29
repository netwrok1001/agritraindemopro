import React from 'react';
import { DashboardStats } from '@/types';
import { 
  Users, 
  GraduationCap, 
  Building, 
  TreePine,
  UserCheck,
  UserX
} from 'lucide-react';

interface StatsSidebarProps {
  stats: DashboardStats;
  title?: string;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subLabel?: string;
  variant?: 'default' | 'accent' | 'success';
}> = ({ icon, label, value, subLabel, variant = 'default' }) => {
  const bgClass = {
    default: 'bg-sidebar-accent/50',
    accent: 'bg-accent/20',
    success: 'bg-success/20',
  }[variant];

  return (
    <div className={`${bgClass} rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-sidebar-accent">
          {icon}
        </div>
        <span className="text-sm text-sidebar-foreground/80">{label}</span>
      </div>
      <p className="text-2xl font-bold text-sidebar-foreground">{value}</p>
      {subLabel && (
        <p className="text-xs text-sidebar-foreground/60 mt-1">{subLabel}</p>
      )}
    </div>
  );
};

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ stats, title = "Dashboard Stats" }) => {
  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground p-6 flex flex-col gap-6 min-h-screen">
      <div className="border-b border-sidebar-border pb-4">
        <h2 className="font-serif text-xl font-semibold text-sidebar-foreground">{title}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Overview of activities</p>
      </div>

      <div className="space-y-4">
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-sidebar-primary" />}
          label="Total Trainings"
          value={stats.totalTrainings}
          variant="accent"
        />

        <StatCard
          icon={<Users className="w-5 h-5 text-sidebar-primary" />}
          label="Farmers Trained"
          value={stats.totalFarmers}
          subLabel={`${stats.maleFarmers} male, ${stats.femaleFarmers} female`}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Building className="w-4 h-4 text-sidebar-primary" />}
            label="On-campus"
            value={stats.onCampusTrainings}
          />
          <StatCard
            icon={<TreePine className="w-4 h-4 text-sidebar-primary" />}
            label="Off-campus"
            value={stats.offCampusTrainings}
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-sidebar-foreground/80 mb-3">Demographics Breakdown</h3>
        <div className="space-y-2">
          {[
            { label: 'Scheduled Caste (SC)', value: stats.demographicsBreakdown.sc },
            { label: 'Scheduled Tribe (ST)', value: stats.demographicsBreakdown.st },
            { label: 'General (GEN)', value: stats.demographicsBreakdown.gen },
            { label: 'OBC', value: stats.demographicsBreakdown.obc },
          ].map((demo) => (
            <div key={demo.label} className="flex items-center justify-between text-sm">
              <span className="text-sidebar-foreground/70">{demo.label}</span>
              <span className="font-semibold text-sidebar-foreground">{demo.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">Active Session</p>
            <p className="text-xs text-sidebar-foreground/60">Logged in</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  User, 
  Pill, 
  UserPlus, 
  Stethoscope, 
  QrCode, 
  Settings, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: ShieldAlert,
      title: 'Emergency Card',
      description: 'Quick access to critical medical info',
      path: '/emergency',
      color: 'text-destructive',
    },
    {
      icon: User,
      title: 'My Profile',
      description: 'Manage your medical information',
      path: '/profile',
      color: 'text-primary',
    },
    {
      icon: Pill,
      title: 'Medications',
      description: 'Track medications and reminders',
      path: '/medications',
      color: 'text-primary',
    },
    {
      icon: UserPlus,
      title: 'Emergency Contacts',
      description: 'Manage emergency contact list',
      path: '/contacts',
      color: 'text-primary',
    },
    {
      icon: Stethoscope,
      title: 'Doctors',
      description: 'Your healthcare providers',
      path: '/doctors',
      color: 'text-primary',
    },
    {
      icon: QrCode,
      title: 'QR Code',
      description: 'Generate emergency info QR code',
      path: '/qr',
      color: 'text-primary',
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'App preferences',
      path: '/settings',
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediSync</h1>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'Welcome back'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="rounded-full"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group cursor-pointer rounded-card border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-card bg-secondary p-4 transition-colors group-hover:bg-primary/10">
                  <feature.icon className={`h-8 w-8 ${feature.color} transition-colors group-hover:text-primary`} />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sync Status */}
        <div className="mt-8 rounded-card border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <p className="text-sm text-muted-foreground">Data synced to cloud</p>
            </div>
            <p className="text-xs text-muted-foreground">Last synced: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

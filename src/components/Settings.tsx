import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Database } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Cloud Sync */}
          <Card className="rounded-card border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                Cloud Sync
              </CardTitle>
              <CardDescription>
                Your data is automatically synchronized with Lovable Cloud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All your medical data is automatically backed up and synced in real-time.
                You can access it from any device by logging in.
              </p>
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card className="rounded-card border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Secure Storage
              </CardTitle>
              <CardDescription>
                Your data is encrypted and protected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All your medical information is stored securely with enterprise-grade encryption.
                Your data is protected by Row Level Security (RLS) policies, ensuring only you can access it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

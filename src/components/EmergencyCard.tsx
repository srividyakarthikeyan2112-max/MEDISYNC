import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Phone, Droplet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  blood_group: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergency_contact_id: string | null;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const EmergencyCard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contact, setContact] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        
        if (profileData.emergency_contact_id) {
          const { data: contactData, error: contactError } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('id', profileData.emergency_contact_id)
            .maybeSingle();

          if (contactError) console.error('Failed to load contact:', contactError);
          if (contactData) setContact(contactData);
        }
      }
    } catch (error) {
      console.error('Failed to load emergency data:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-card border-destructive bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-6 w-6" />
                Emergency Card Not Set Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please complete your profile to enable the emergency card.
              </p>
              <Button onClick={() => navigate('/profile')}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Emergency Header */}
        <Card className="rounded-card border-destructive bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-6 w-6" />
              EMERGENCY MEDICAL INFORMATION
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Personal Info */}
        <Card className="rounded-card border-border bg-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{profile.name}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">{profile.age}</p>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-semibold">{profile.blood_group}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Alerts */}
        {(profile.allergies || profile.conditions) && (
          <Card className="rounded-card border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Medical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.allergies && (
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="font-semibold text-destructive">{profile.allergies}</p>
                </div>
              )}
              {profile.conditions && (
                <div>
                  <p className="text-sm text-muted-foreground">Medical Conditions</p>
                  <p className="font-semibold">{profile.conditions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {contact && (
          <Card className="rounded-card border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{contact.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p>{contact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${contact.phone}`} className="text-lg font-semibold text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default EmergencyCard;

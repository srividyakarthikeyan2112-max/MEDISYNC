import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Stethoscope, Phone, Mail, Trash2 } from 'lucide-react';

interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const Doctors = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadDoctors();
  }, [user]);

  const loadDoctors = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .insert([{
          ...formData,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Doctor added",
        description: `Dr. ${formData.name} has been added to your list.`,
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        specialization: '',
        hospital: '',
        phone: '',
        email: '',
        notes: '',
      });
      loadDoctors();
    } catch (error) {
      toast({
        title: "Failed to add",
        description: "Unable to add doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Doctor removed",
        description: "The doctor has been deleted.",
      });
      loadDoctors();
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Unable to remove doctor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-card bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Healthcare Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Doctor Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Cardiologist, General Practitioner"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital/Clinic *</Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Doctor</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {doctors.length === 0 ? (
            <Card className="rounded-card border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No doctors added yet</p>
                <p className="text-sm text-muted-foreground">Click "Add Doctor" to get started</p>
              </CardContent>
            </Card>
          ) : (
            doctors.map((doctor) => (
              <Card key={doctor.id} className="rounded-card border-border bg-card">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Dr. {doctor.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{doctor.specialization}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                  <div className="flex flex-col gap-2">
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a href={`tel:${doctor.phone}`} className="text-primary hover:underline">
                          {doctor.phone}
                        </a>
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href={`mailto:${doctor.email}`} className="text-primary hover:underline">
                          {doctor.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;

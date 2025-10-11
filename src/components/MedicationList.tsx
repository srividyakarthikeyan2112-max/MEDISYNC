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
import { ArrowLeft, Plus, Pill, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

const MedicationList = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadMedications();
  }, [user]);

  const loadMedications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Failed to load medications:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('medications')
        .insert([{
          ...formData,
          user_id: user.id,
          end_date: formData.end_date || null,
        }]);

      if (error) throw error;

      toast({
        title: "Medication added",
        description: `${formData.name} has been added to your list.`,
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        notes: '',
      });
      loadMedications();
    } catch (error) {
      toast({
        title: "Failed to add",
        description: "Unable to add medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error} = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Medication removed",
        description: "The medication has been deleted.",
      });
      loadMedications();
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Unable to remove medication.",
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
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-card bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 500mg"
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="e.g., Twice daily"
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Medication</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {medications.length === 0 ? (
            <Card className="rounded-card border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Pill className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No medications added yet</p>
                <p className="text-sm text-muted-foreground">Click "Add Medication" to get started</p>
              </CardContent>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id} className="rounded-card border-border bg-card">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      {med.name}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(med.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dosage</p>
                      <p className="font-semibold">{med.dosage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-semibold">{med.frequency}</p>
                    </div>
                  </div>
                  {med.start_date && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Started: {format(new Date(med.start_date), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationList;

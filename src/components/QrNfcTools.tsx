import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Download } from 'lucide-react';

const QrNfcTools = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    generateQrData();
  }, [user]);

  const generateQrData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setQrData('No profile data available. Please complete your profile first.');
        return;
      }

      // Fetch emergency contact if exists
      let contactData = '';
      if (profile.emergency_contact_id) {
        const { data: contact, error: contactError } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('id', profile.emergency_contact_id)
          .maybeSingle();

        if (!contactError && contact) {
          contactData = `\nEmergency Contact: ${contact.name} (${contact.relationship})\nPhone: ${contact.phone}`;
        }
      }

      // Create compact emergency info
      const emergencyInfo = `🚨 EMERGENCY MEDICAL INFO
Name: ${profile.name}
Age: ${profile.age}
Blood: ${profile.blood_group}
${profile.allergies ? `Allergies: ${profile.allergies}` : ''}
${profile.conditions ? `Conditions: ${profile.conditions}` : ''}${contactData}`;

      setQrData(emergencyInfo);
    } catch (error) {
      console.error('Failed to generate QR data:', error);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'medisync-emergency-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="rounded-card border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary" />
              Emergency QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              This QR code contains your essential emergency medical information. 
              Save it to your phone's lock screen or print it for your wallet.
            </p>

            {qrData ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-card bg-white p-6">
                  <QRCodeSVG
                    id="qr-code"
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>

                <Button onClick={downloadQR} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>

                <div className="w-full rounded-card bg-secondary p-4">
                  <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                    {qrData}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading emergency data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QrNfcTools;

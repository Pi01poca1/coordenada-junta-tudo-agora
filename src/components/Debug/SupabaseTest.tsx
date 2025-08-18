import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('Testando conexão...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    console.log('SupabaseTest component loaded!');
    
    const testConnection = async () => {
      try {
        console.log('Testando conexão com Supabase...');
        
        // Teste básico de conectividade
        const { data, error } = await supabase.from('books').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Erro na conexão Supabase:', error);
          setStatus('error');
          setMessage('Erro na conexão com Supabase');
          setDetails(error);
        } else {
          console.log('Conexão Supabase OK');
          setStatus('success');
          setMessage('Conexão com Supabase funcionando');
          setDetails(data);
        }
      } catch (err) {
        console.error('Erro no teste:', err);
        setStatus('error');
        setMessage('Falha na conexão');
        setDetails(err);
      }
    };

    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Status do Supabase
          <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
            {status === 'testing' ? 'Testando' : status === 'success' ? 'OK' : 'Erro'}
          </Badge>
        </CardTitle>
        <CardDescription>Verificando conectividade com o banco de dados</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{message}</p>
        {details && (
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};
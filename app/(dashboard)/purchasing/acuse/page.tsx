'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AcusePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/purchasing"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Acuse de DTE Proveedores</h1>
          <p className="text-sm text-muted-foreground">Ver módulo completo en Compras</p>
        </div>
      </div>
      <div className="text-center py-10 text-muted-foreground text-sm">
        <p>El acuse de DTE está integrado en la página principal de <Link href="/purchasing" className="text-primary hover:underline">Compras</Link>.</p>
      </div>
    </div>
  );
}

import '@xyflow/react/dist/style.css';
import { ArquitecturaDiagram } from '@/components/arquitectura/ArquitecturaDiagram';
import { Network, Database, Server, Monitor, ExternalLink } from 'lucide-react';

export default function ArquitecturaPage() {
  return (
    <div className="flex flex-col h-full gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Arquitectura del Sistema</h1>
            <p className="text-sm text-muted-foreground">Mapa completo de conexiones — Ampuero ERP v0.5.0</p>
          </div>
        </div>

        {/* Capas resumen */}
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            { icon: Database, label: 'SQL Server', desc: '8 grupos · ~70 tablas · stored procedures', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/50' },
            { icon: Server,   label: 'Next.js API Routes', desc: '8 grupos · ~80 endpoints + SPs', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/50' },
            { icon: Monitor,  label: 'Frontend', desc: '10 módulos · 28 rutas implementadas', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50' },
            { icon: ExternalLink, label: 'Integraciones', desc: 'SII · SERVEL · Talana · Bancos', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/50' },
          ].map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${bg}`}>
              <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
              <div>
                <span className={`font-semibold text-xs ${color}`}>{label}</span>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagrama — ocupa todo el espacio restante */}
      <div className="flex-1 min-h-0">
        <ArquitecturaDiagram />
      </div>
    </div>
  );
}

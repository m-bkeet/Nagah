import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Barcode, ShieldCheck, User, BookOpen, Users, MapPin, Award, FileText, Smartphone } from 'lucide-react';
import { buildUniversalIdentifier, UniversalIdentifier } from '../../domain/qrBarcodeService';

export interface EntityCardProps {
  type: UniversalIdentifier['entityType'];
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Array<{ label: string; value: string }>;
  photoUrl?: string;
  onAction?: (actionName: string) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  type,
  id,
  code,
  title,
  subtitle,
  status = 'active',
  metadata = [],
  photoUrl,
  onAction,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const univId = buildUniversalIdentifier(type, id, code);

  const getIcon = () => {
    switch (type) {
      case 'STUDENT': return <User className="w-5 h-5 text-cyan-400" />;
      case 'TRAINER': return <Users className="w-5 h-5 text-indigo-400" />;
      case 'COURSE': return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'GROUP': return <Users className="w-5 h-5 text-emerald-400" />;
      case 'BRANCH': return <MapPin className="w-5 h-5 text-purple-400" />;
      case 'CERTIFICATE': return <Award className="w-5 h-5 text-yellow-400" />;
      case 'RECEIPT': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'DEVICE': return <Smartphone className="w-5 h-5 text-blue-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-all text-slate-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2.5">
            {photoUrl ? (
              <img src={photoUrl} alt={title} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                {getIcon()}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-100 leading-tight">{title}</h4>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-semibold">
            {code}
          </span>
        </div>

        {/* Metadata Details */}
        {metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {metadata.map((item, idx) => (
              <div key={idx} className="bg-slate-950/50 p-2 rounded border border-slate-800/50">
                <span className="text-[10px] text-slate-400 block">{item.label}</span>
                <span className="font-medium text-slate-200 truncate block">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions & QR Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
            title="عرض الـ QR والباربود"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono">{univId.barcodeValue}</span>
          </button>
        </div>

        {onAction && (
          <button
            onClick={() => onAction('view')}
            className="px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
          >
            التفاصيل
          </button>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">الكود الموحد: {univId.humanCode}</p>

            <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
              <QRCodeSVG value={univId.qrToken} size={160} level="H" />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-4 font-mono text-xs text-slate-300 flex items-center justify-center gap-2">
              <Barcode className="w-5 h-5 text-amber-400" />
              <span>الباركد: {univId.barcodeValue}</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

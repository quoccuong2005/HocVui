'use client';

import React, { useRef, useState } from 'react';
import { StorageService } from '@/lib/storage';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { sound } from '@/lib/soundEffects';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HocVui_Sao_Luu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playCorrect();
    setMessage('Đã tải xuống file sao lưu an toàn!');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = StorageService.importFullBackup(content);
      if (success) {
        sound.playFanfare();
        setMessage('Khôi phục dữ liệu thành công!');
        onDataReloaded();
      } else {
        setMessage('Lỗi: File sao lưu không đúng định dạng!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    if (confirm('Khôi phục lại toàn bộ lớp học và câu hỏi mẫu gốc? Dữ liệu bạn thêm mới sẽ bị xóa.')) {
      StorageService.resetToDefault();
      sound.playCorrect();
      setMessage('Đã đặt lại dữ liệu mẫu ban đầu!');
      onDataReloaded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Quản Lý Dữ Liệu & Sao Lưu</h3>
              <p className="text-xs text-slate-500 font-medium">Chế độ Offline-First trực tiếp trên máy tính</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-black flex items-center space-x-2 ${
              message.startsWith('Lỗi')
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.startsWith('Lỗi') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Export button */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-800">Xuất file sao lưu (JSON)</h4>
              <p className="text-xs text-slate-500">Lưu lại toàn bộ lớp học, học sinh và câu hỏi để chuyển sang máy khác</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải file</span>
            </button>
          </div>

          {/* Import button */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-800">Nhập từ file sao lưu</h4>
              <p className="text-xs text-slate-500">Khôi phục lại dữ liệu đã sao lưu trước đó</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={(e) => e.target.files?.[0] && handleImportBackup(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Chọn file</span>
            </button>
          </div>

          {/* Reset button */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-rose-900">Khôi phục dữ liệu mẫu ban đầu</h4>
              <p className="text-xs text-rose-700/80">Xóa dữ liệu hiện tại và nạp lại lớp 3A, 2B cùng 15+ câu hỏi mẫu</p>
            </div>
            <button
              onClick={handleResetDefault}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-400 font-medium">
          Dữ liệu của thầy cô được lưu cục bộ trên trình duyệt, hoạt động hoàn hảo khi không có Internet!
        </div>
      </div>
    </div>
  );
};

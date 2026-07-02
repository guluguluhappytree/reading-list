import { useRef, useState } from "react";
import type { AppState } from "../types";
import {
  backupStats,
  buildReadableSummary,
  copyBackupJson,
  downloadBackupJson,
  parseBackup,
  shareBackupFile,
} from "../backup";

interface BackupModalProps {
  open: boolean;
  state: AppState;
  onClose: () => void;
  onImport: (state: AppState) => void;
}

export function BackupModal({ open, state, onClose, onImport }: BackupModalProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const stats = backupStats(state);

  const resetFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleCopyJson = async () => {
    resetFeedback();
    setBusy(true);
    try {
      await copyBackupJson(state);
      setMessage("JSON 已复制。可粘贴到微信「文件传输助手」或电脑记事本保存。");
    } catch {
      setError("复制失败，请改用「下载 JSON 文件」。");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    resetFeedback();
    downloadBackupJson(state);
    setMessage("已开始下载。请在微信中选择该文件发送给电脑。");
  };

  const handleShare = async () => {
    resetFeedback();
    setBusy(true);
    try {
      const shared = await shareBackupFile(state);
      if (shared) {
        setMessage("已通过系统分享发送。");
      } else {
        setError("当前浏览器不支持直接分享文件，请用「下载 JSON 文件」。");
      }
    } catch {
      setError("分享已取消或失败，请改用下载。");
    } finally {
      setBusy(false);
    }
  };

  const handleCopySummary = async () => {
    resetFeedback();
    setBusy(true);
    try {
      const text = buildReadableSummary(state);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("clipboard unavailable");
      }
      setMessage("可读摘要已复制，可直接粘贴到微信。");
    } catch {
      setError("复制摘要失败。");
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = async (file: File) => {
    resetFeedback();
    setBusy(true);
    try {
      const text = await file.text();
      const imported = parseBackup(text);
      if (
        state.goals.length > 0 &&
        !confirm(`将用备份中的 ${imported.goals.length} 个目标替换当前 ${state.goals.length} 个目标，确定吗？`)
      ) {
        return;
      }
      onImport(imported);
      setMessage(`已导入 ${imported.goals.length} 个阅读目标。`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--form backup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">导出 / 导入备份</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>关闭</button>
        </div>

        <div className="tip-box">
          无法云同步时，可导出 JSON 通过微信发到电脑保存；在电脑浏览器打开本 App 后可导入恢复。
        </div>

        <div className="backup-stats">
          当前：{stats.goals} 个目标 · {stats.books} 本书 · {stats.read} 本已读 · {stats.notes} 条笔记
        </div>

        <div className="section-title">导出</div>
        <div className="backup-actions">
          <button className="btn btn--primary btn--full" disabled={busy} onClick={() => void handleDownload()}>
            下载 JSON 文件
          </button>
          <button className="btn btn--secondary btn--full" disabled={busy} onClick={() => void handleCopyJson()}>
            复制 JSON 文本
          </button>
          {"share" in navigator && (
            <button className="btn btn--secondary btn--full" disabled={busy} onClick={() => void handleShare()}>
              分享备份文件
            </button>
          )}
          <button className="btn btn--ghost btn--full" disabled={busy} onClick={() => void handleCopySummary()}>
            复制可读摘要（微信粘贴）
          </button>
        </div>

        <div className="section-title" style={{ marginTop: 16 }}>导入</div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImportFile(file);
          }}
        />
        <button
          className="btn btn--secondary btn--full"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          从 JSON 文件导入
        </button>

        {message && <p className="backup-feedback backup-feedback--ok">{message}</p>}
        {error && <p className="backup-feedback backup-feedback--err">{error}</p>}
      </div>
    </div>
  );
}

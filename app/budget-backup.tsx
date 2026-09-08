import { useRef, useState } from 'react';
import { Download, Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { makeBackup, parseBackup, type BudgetBackup } from './local-purchases';
import { importSharedBackup } from './shared-purchases';
import type { SavedPurchase } from './purchase-state';
export default function BudgetTransfer({
  records,
  disabled,
  onImport,
  onBusyChange,
}: {
  records: Record<string, SavedPurchase>;
  disabled: boolean;
  onImport: () => Promise<void>;
  onBusyChange: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BudgetBackup | null>(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [importing, setImporting] = useState(false);
  function download() {
    const blob = new Blob([JSON.stringify(makeBackup(records), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'japan-2026-budget-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function read(file?: File) {
    setError('');
    setMessage('');
    setPending(null);
    if (!file) return;
    try {
      if (file.size > 1000000)
        throw new Error('Файл слишком большой: максимум 1 МБ');
      setPending(parseBackup(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось прочитать файл');
    }
    if (input.current) input.current.value = '';
  }
  async function apply() {
    if (!pending || disabled || importing) return;
    setImporting(true);
    onBusyChange(true);
    setError('');
    try {
      const result = await importSharedBackup(pending);
      setPending(null);
      await onImport();
      setMessage('Готово: обновлено покупок — ' + result.changed);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Не удалось импортировать бюджет',
      );
      await onImport();
    } finally {
      setImporting(false);
      onBusyChange(false);
    }
  }
  return (
    <section className="budget-transfer" aria-label="Перенос бюджета">
      <div>
        <h3>Резервная копия бюджета</h3>
        <p>
          Скачайте суммы и отметки в файл на случай восстановления. Файл
          содержит ваши заметки — храните его у себя. Для синхронизации
          телефонов используйте личную ссылку общего бюджета выше.
        </p>
      </div>
      <div className="budget-transfer-actions">
        <Button
          variant="outline"
          disabled={disabled || importing}
          onClick={download}
        >
          <Download size={16} />
          Экспорт бюджета
        </Button>
        <Button
          variant="outline"
          disabled={disabled || importing}
          onClick={() => input.current?.click()}
        >
          <Upload size={16} />
          Импорт
        </Button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => void read(e.target.files?.[0])}
        />
      </div>
      {pending && (
        <div className="backup-preview">
          <p>
            В файле {pending.purchases.length} позиций. Обновятся только записи,
            которые новее сохранённых на этом устройстве.
          </p>
          <Button disabled={disabled || importing} onClick={() => void apply()}>
            <Check size={16} />
            {importing ? 'Переносим…' : 'Перенести отметки'}
          </Button>
          <Button
            variant="ghost"
            disabled={importing}
            onClick={() => setPending(null)}
          >
            <X size={16} />
            Отмена
          </Button>
        </div>
      )}
      {message && <output>{message}</output>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

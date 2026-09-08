import { useState } from 'react';
import { Link, Users, Check, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cloudReady,
  getConnection,
  connectionLink,
  createSharedTrip,
  disconnectSharedTrip,
} from './shared-purchases';
import type { SavedPurchase } from './purchase-state';
export default function SharedBudget({
  records,
  disabled,
  connected,
  onChange,
  onBusyChange,
}: {
  records: Record<string, SavedPurchase>;
  disabled: boolean;
  connected: boolean;
  onChange: () => Promise<void>;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [copied, setCopied] = useState(false),
    [showLink, setShowLink] = useState(false),
    [disconnectConfirm, setDisconnectConfirm] = useState(false);
  async function create() {
    if (disabled || busy) return;
    setBusy(true);
    onBusyChange(true);
    setError('');
    try {
      await createSharedTrip(records);
      await onChange();
      setShowLink(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Не удалось создать общий бюджет',
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  async function copy() {
    setError('');
    try {
      await navigator.clipboard.writeText(connectionLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShowLink(true);
    }
  }
  async function disconnect() {
    if (disabled || busy) return;
    setBusy(true);
    onBusyChange(true);
    try {
      disconnectSharedTrip();
      setDisconnectConfirm(false);
      setShowLink(false);
      await onChange();
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <section className="shared-budget">
      <div className="shared-budget-heading">
        <Users size={22} />
        <div>
          <h3>
            {connected
              ? 'Общий бюджет подключён'
              : 'Один бюджет на два телефона'}
          </h3>
          <p>
            {connected
              ? 'Изменения автоматически обновляются, пока сайт открыт.'
              : 'Создайте общую поездку и откройте её личную ссылку на втором телефоне.'}
          </p>
        </div>
        <span className={connected ? 'sync-badge online' : 'sync-badge'}>
          {connected ? 'Синхронизация включена' : 'На этом устройстве'}
        </span>
      </div>
      <div className="shared-budget-actions">
        {connected ? (
          <>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void copy()}
            >
              {copied ? <Check size={16} /> : <Link size={16} />}{' '}
              {copied ? 'Ссылка скопирована' : 'Ссылка для второго телефона'}
            </Button>
            <Button
              variant="ghost"
              disabled={disabled || busy}
              onClick={() => setDisconnectConfirm((v) => !v)}
            >
              <Unplug size={16} />
              Отключить устройство
            </Button>
          </>
        ) : (
          <Button
            disabled={disabled || busy || !cloudReady}
            onClick={() => void create()}
          >
            <Users size={16} />
            {busy ? 'Создаём…' : 'Создать общий бюджет'}
          </Button>
        )}
      </div>
      {connected && (
        <p className="share-hint">
          Любой, у кого есть личная ссылка, сможет менять бюджет. Передайте её
          только своему спутнику.
        </p>
      )}
      {!cloudReady && <p>Подключение общей базы ещё настраивается.</p>}
      {showLink && connected && getConnection() && (
        <label className="shared-link">
          Личная ссылка
          <input
            readOnly
            value={connectionLink()}
            onFocus={(e) => e.target.select()}
          />
        </label>
      )}
      {disconnectConfirm && (
        <div className="disconnect-confirm">
          <p>
            На этом устройстве останется последняя загруженная копия. Другой
            телефон продолжит работать с общим бюджетом. Сохраните личную ссылку
            для повторного подключения.
          </p>
          <Button
            variant="outline"
            disabled={disabled || busy}
            onClick={() => void disconnect()}
          >
            Отключить этот телефон
          </Button>
          <Button variant="ghost" onClick={() => setDisconnectConfirm(false)}>
            Отмена
          </Button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

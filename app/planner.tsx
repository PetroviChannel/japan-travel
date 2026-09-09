'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowUpRight,
  Plane,
  Check,
  Wallet,
  Map,
  Compass,
  Pencil,
  Search,
  CheckCheck,
  RefreshCw,
  Bike,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { purchases, groups, kindLabels, type Purchase } from './trip-data';
import {
  mergeCurrentDefaults,
  summarize,
  validatePurchase,
  type SavedPurchase,
} from './purchase-state';
import Deals from './deals';
import RoutePlanner from './route-planner';
import TripVariants from './trip-variants';
import { registerTripTools } from './trip-tools';
import { PhotoCredits } from './place-photo';
import { storageKey } from './local-purchases';
import {
  readPurchases,
  savePurchase,
  getConnection,
  sharedConnectionKey,
  type Snapshot,
} from './shared-purchases';
import BudgetTransfer from './budget-backup';
import SharedBudget from './shared-budget';
export const rub = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
const defaults = () => mergeCurrentDefaults({});
class PurchaseConflict extends Error {
  constructor(readonly current: SavedPurchase) {
    super(
      'Эту покупку изменили на другом устройстве. В форме показаны актуальные данные. Проверьте их и внесите правку заново.',
    );
  }
}
function PurchaseCard({
  item: x,
  record,
  disabled,
  onSave,
}: {
  item: Purchase;
  record: SavedPurchase;
  disabled: boolean;
  onSave: (r: SavedPurchase) => Promise<SavedPurchase>;
}) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(record),
    [conflictDraft, setConflictDraft] = useState<SavedPurchase | null>(null),
    [error, setError] = useState('');
  const commit = async (r: SavedPurchase) => {
    setError('');
    try {
      await onSave(r);
      setConflictDraft(null);
      setEditing(false);
    } catch (e) {
      if (e instanceof PurchaseConflict) {
        setConflictDraft(r);
        setDraft(e.current);
      }
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
    }
  };
  const open = () => {
    setDraft(record);
    setConflictDraft(null);
    setError('');
    setEditing(true);
  };
  return (
    <article
      id={x.id}
      className={`purchase-card ${record.paid ? 'is-paid' : ''}`}
    >
      <div className="purchase-check">
        <Checkbox
          aria-label={`Оплачено: ${x.title}`}
          checked={record.paid}
          disabled={disabled || editing}
          onCheckedChange={(v) => void commit({ ...record, paid: v === true })}
        />
      </div>
      <div className="purchase-main">
        <p className="purchase-date">
          {x.date} <span>· {x.city}</span>
        </p>
        <h4>{x.title}</h4>
        <p className="purchase-note">{x.note}</p>
        <span className={`price-kind ${x.kind}`}>{kindLabels[x.kind]}</span>
        {record.coupon && (
          <span className="saved-detail">Промокод: {record.coupon}</span>
        )}
        {record.note && <p className="user-note">{record.note}</p>}
        {x.extra && (
          <a
            className="source-link"
            href={x.extra.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {x.extra.label} ↗
          </a>
        )}
      </div>
      <div className="purchase-action">
        <strong>{rub(record.actual ?? record.plan)}</strong>
        <small>
          {record.actual !== null ? 'Ваша сумма' : 'План'} · на двоих
        </small>
        {record.plan !== x.price && (
          <small>Цена проверки: {rub(x.price)} · ваш план сохранён</small>
        )}
        {(record.customUrl || x.link) && (
          <a
            className="purchase-link"
            href={record.customUrl || x.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.customUrl ? 'Ваша ссылка' : x.linkLabel}
            <ArrowUpRight size={15} />
          </a>
        )}
        <Button
          variant="ghost"
          className="edit-button"
          disabled={disabled}
          onClick={open}
        >
          <Pencil size={14} /> Цена и заметка
        </Button>
        <span className="paid-label">
          {record.paid ? 'Отмечено оплаченным' : 'Ещё не оплачено'}
        </span>
      </div>
      {editing && (
        <form
          className="purchase-editor"
          onSubmit={(e) => {
            e.preventDefault();
            void commit(draft);
          }}
        >
          <div className="editor-fields">
            <label>
              План на двоих, ₽
              <Input
                type="number"
                step="0.01"
                min="0"
                max="10000000"
                required
                value={draft.plan}
                onChange={(e) =>
                  setDraft({ ...draft, plan: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Фактическая сумма, ₽
              <Input
                type="number"
                step="0.01"
                min="0"
                max="10000000"
                placeholder="Ещё не оплачено"
                value={draft.actual ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    actual:
                      e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Промокод
              <Input
                maxLength={100}
                value={draft.coupon}
                placeholder="Если применился при оплате"
                onChange={(e) => setDraft({ ...draft, coupon: e.target.value })}
              />
            </label>
          </div>
          <label>
            Своя ссылка на бронирование
            <Input
              type="url"
              maxLength={2000}
              value={draft.customUrl}
              placeholder="https://…"
              onChange={(e) =>
                setDraft({ ...draft, customUrl: e.target.value })
              }
            />
          </label>
          <label>
            Заметка
            <Textarea
              maxLength={2000}
              value={draft.note}
              placeholder="Например: включён багаж, отмена до 18 октября"
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
          </label>
          <p className="form-hint">
            Промокод сохраняется как заметка. Введите итоговую цену после
            скидки. Если откажетесь от пункта, поставьте план 0 ₽ и очистите
            фактическую сумму.
          </p>
          <div className="editor-buttons">
            {conflictDraft && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  setDraft({ ...conflictDraft, updatedAt: record.updatedAt });
                  setConflictDraft(null);
                  setError(
                    'Ваши поля возвращены в форму. Проверьте их перед сохранением.',
                  );
                }}
              >
                Вернуть мои правки в форму
              </Button>
            )}
            <Button type="submit" disabled={disabled}>
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setEditing(false);
                setError('');
              }}
            >
              Отмена
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p className="card-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
export default function Planner() {
  const [records, setRecords] =
      useState<Record<string, SavedPurchase>>(defaults),
    [loaded, setLoaded] = useState(false),
    [loadError, setLoadError] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('Загружаем ваши отметки…'),
    [category, setCategory] = useState('all'),
    [query, setQuery] = useState(''),
    [unpaid, setUnpaid] = useState(false),
    [activeTab, setActiveTab] = useState('route'),
    [connected, setConnected] = useState(false);
  useEffect(() => {
    const sync = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab && ['purchases', 'route', 'deals', 'variants'].includes(tab))
        setActiveTab(tab);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const selectTab = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  };
  const showPurchase = (id: string) => {
    const item = purchases.find((p) => p.id === id);
    if (!item) return;
    setCategory('all');
    setUnpaid(false);
    setQuery(item.title);
    selectTab('purchases');
    requestAnimationFrame(() =>
      document
        .getElementById('trip-workspace')
        ?.scrollIntoView({ behavior: 'smooth' }),
    );
  };
  const showFujiGuide = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'route');
    url.searchParams.set('day', '2026-11-05');
    url.searchParams.set('section', 'fuji-lakeside');
    url.searchParams.delete('variant');
    url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url);
    flushSync(() => {
      setActiveTab('route');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    requestAnimationFrame(() => {
      const guide = document.getElementById(
        'fuji-lakeside',
      ) as HTMLDetailsElement | null;
      if (!guide) return;
      guide.open = true;
      guide.querySelector('summary')?.focus({ preventScroll: true });
      guide.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  };
  const recordsRef = useRef(records),
    ready = useRef(false),
    saving = useRef(false),
    latestSnapshot = useRef<{ room: string | null; revision: number }>({
      room: null,
      revision: 0,
    });
  const operationBusy = useCallback((value: boolean) => {
    saving.current = value;
    setBusy(value);
  }, []);
  const acceptSnapshot = useCallback((result: Snapshot) => {
    if (result.room !== (getConnection()?.room ?? null)) return false;
    if (
      result.room &&
      latestSnapshot.current.room === result.room &&
      result.revision < latestSnapshot.current.revision
    )
      return false;
    latestSnapshot.current = { room: result.room, revision: result.revision };
    recordsRef.current = mergeCurrentDefaults(result.purchases);
    return true;
  }, []);
  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setNotice('Загружаем ваши отметки…');
      try {
        const result = await readPurchases();
        if (!acceptSnapshot(result)) return;
        ready.current = true;
        setRecords(recordsRef.current);
        setLoaded(true);
        setConnected(Boolean(result.room));
        setLoadError('');
        if (!quiet)
          setNotice(
            result.room
              ? 'Общий бюджет обновлён'
              : 'Отметки загружены с этого устройства',
          );
      } catch (e) {
        setLoadError(
          e instanceof Error ? e.message : 'Не удалось загрузить отметки',
        );
        setNotice(
          ready.current
            ? 'Не удалось обновить бюджет. Показаны последние загруженные данные.'
            : 'Не удалось загрузить отметки. Повторите попытку.',
        );
      }
    },
    [acceptSnapshot],
  );
  useEffect(() => {
    void load();
    const sync = (event: StorageEvent) => {
      if (
        event.key === storageKey ||
        event.key === sharedConnectionKey ||
        event.key === null
      )
        void load(true);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [load]);
  useEffect(() => {
    if (!connected) return;
    let polling = false;
    const refresh = async () => {
      if (polling || saving.current || document.hidden) return;
      polling = true;
      try {
        await load(true);
      } finally {
        polling = false;
      }
    };
    const timer = window.setInterval(() => void refresh(), 5000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [connected, load]);
  const save = useCallback(
    async (input: SavedPurchase) => {
      if (!ready.current) throw new Error('Сначала дождитесь загрузки отметок');
      if (saving.current)
        throw new Error('Предыдущее изменение ещё сохраняется');
      const valid = validatePurchase(input);
      saving.current = true;
      setBusy(true);
      setNotice('Сохраняем…');
      try {
        const data = await savePurchase({
          ...valid,
          updatedAt: input.updatedAt,
        });
        if (data.room !== (getConnection()?.room ?? null))
          throw new Error(
            'Подключение к поездке изменилось. Загрузите бюджет заново.',
          );
        if (acceptSnapshot(data))
          flushSync(() => setRecords(recordsRef.current));
        if (data.conflict)
          throw new PurchaseConflict(recordsRef.current[input.id]);
        setLoadError('');
        setNotice(
          data.room
            ? 'Сохранено в общем бюджете'
            : 'Сохранено на этом устройстве',
        );
        return recordsRef.current[input.id];
      } catch (e) {
        setNotice('Изменение не сохранено. Повторите попытку.');
        throw e;
      } finally {
        saving.current = false;
        setBusy(false);
      }
    },
    [acceptSnapshot],
  );
  useEffect(
    () =>
      registerTripTools(() => {
        if (!ready.current) throw new Error('Отметки ещё не загружены');
        return recordsRef.current;
      }, save),
    [save],
  );
  const summary = summarize(Object.values(records)),
    base = purchases.reduce((s, p) => s + p.price, 0);
  const visible = purchases.filter(
    (x) =>
      (category === 'all' || x.category === category) &&
      (!unpaid || !records[x.id].paid) &&
      `${x.title} ${x.city}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="travel-app">
      <header className="topbar">
        <a href={import.meta.env.BASE_URL} className="wordmark">
          <span className="sunmark" /> TABI <span>путешествие вдвоём</span>
        </a>
        <span className="private-label">Личная поездка · 2026</span>
      </header>
      <div className="page-heading">
        <div>
          <p className="eyebrow">20 октября — 12 ноября / 2 взрослых</p>
          <h1>
            Япония, поехали.<span>日本</span>
          </h1>
          <p className="intro">
            Море, старые улочки и огни Токио. Ваш план всегда под рукой.
          </p>
        </div>
        <div className="trip-stamp">
          <Plane size={18} />
          <span>
            19 ночей в Японии
            <br />
            <strong>6 остановок</strong>
          </span>
        </div>
      </div>
      <Tabs
        id="trip-workspace"
        value={activeTab}
        onValueChange={selectTab}
        className="workspace-tabs"
      >
        <TabsList className="tabbar main-tabbar" variant="line">
          <TabsTrigger value="route">
            <Map size={17} />
            Маршрут
          </TabsTrigger>
          <TabsTrigger value="variants">
            <Compass size={17} />5 вариантов
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <Wallet size={17} />
            Покупки
          </TabsTrigger>
          <TabsTrigger value="deals">Где дешевле</TabsTrigger>
        </TabsList>
        <Button
          className="fuji-guide-shortcut"
          variant="outline"
          onClick={showFujiGuide}
        >
          <Bike size={22} aria-hidden="true" />
          <span>
            <strong>Наш рёкан на Кавагутико: Yamagishi</strong>
            <small>5–6 ноября · футоны и онсэн · 17 427 ₽ на двоих</small>
          </span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </Button>
        <TabsContent value="purchases">
          <section className="overview">
            <div className="budget-surface">
              <div className="budget-top">
                <span>
                  <Wallet size={18} /> Основной маршрут · бюджет на двоих
                </span>
                <span className="small-badge">₽ RUB</span>
              </div>
              <div className="budget-grid">
                <div>
                  <p>Ожидаемый итог</p>
                  <strong>{rub(summary.total)}</strong>
                </div>
                <div>
                  <p>Отмечено оплаченным</p>
                  <strong>{loaded ? rub(summary.paid) : '—'}</strong>
                </div>
                <div>
                  <p>Осталось</p>
                  <strong>{loaded ? rub(summary.remaining) : '—'}</strong>
                </div>
              </div>
              <Progress
                value={(100 * summary.count) / purchases.length}
                aria-label="Доля отмеченных расходов"
                className="budget-progress"
              />
              <p className="budget-footer">
                <Check size={15} />
                {loaded
                  ? `${summary.count} из ${purchases.length} пунктов отмечено`
                  : 'Загрузка отметок…'}
                <span>Исходный план {rub(base)}</span>
              </p>
            </div>
          </section>
          <div className="section-intro">
            <h2>Всё, что нужно оформить</h2>
            <p>
              Суммы на двоих за весь указанный период. Цены проверки — 7–8
              сентября 2026, не закреплённые предложения. Резервы выделены
              отдельно.
            </p>
          </div>
          <div className="save-status" role="status">
            <CheckCheck size={17} />
            {notice}
            {loadError && (
              <Button variant="outline" onClick={() => void load()}>
                <RefreshCw size={14} />
                Повторить загрузку
              </Button>
            )}
          </div>
          <SharedBudget
            records={records}
            disabled={!loaded || busy}
            connected={connected}
            onChange={load}
            onBusyChange={operationBusy}
          />
          <BudgetTransfer
            records={records}
            disabled={!loaded || busy}
            onImport={load}
            onBusyChange={operationBusy}
          />
          {loadError && (
            <p className="load-error" role="alert">
              {loadError}
            </p>
          )}
          <div className="filters">
            <div className="category-buttons">
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                onClick={() => setCategory('all')}
              >
                Всё
              </Button>
              {groups.map((g) => (
                <Button
                  key={g.id}
                  variant={category === g.id ? 'default' : 'outline'}
                  onClick={() => setCategory(g.id)}
                >
                  {g.name}
                </Button>
              ))}
            </div>
            <div className="search-row">
              <label className="search-input">
                <Search size={17} />
                <Input
                  aria-label="Найти расход"
                  placeholder="Найти место или город"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <Button
                variant={unpaid ? 'default' : 'outline'}
                aria-pressed={unpaid}
                onClick={() => setUnpaid(!unpaid)}
              >
                Только неоплаченное
              </Button>
            </div>
          </div>
          {visible.length === 0 && (
            <p className="empty-state">
              Здесь пока пусто. Сбросьте фильтр или попробуйте другое название.
            </p>
          )}
          {groups
            .filter((g) => visible.some((x) => x.category === g.id))
            .map((g) => (
              <section key={g.id} className="purchase-group">
                <header>
                  <div>
                    <p className="eyebrow">{g.label}</p>
                    <h3>{g.name}</h3>
                  </div>
                  <strong>
                    {rub(
                      purchases
                        .filter((x) => x.category === g.id)
                        .reduce(
                          (s, x) =>
                            s + (records[x.id].actual ?? records[x.id].plan),
                          0,
                        ),
                    )}
                  </strong>
                </header>
                {visible
                  .filter((x) => x.category === g.id)
                  .map((x) => (
                    <PurchaseCard
                      key={x.id}
                      item={x}
                      record={records[x.id]}
                      disabled={!loaded || busy}
                      onSave={save}
                    />
                  ))}
              </section>
            ))}
          <div className="method-note">
            <h3>Как считается бюджет</h3>
            <p>
              Итог — фактическая сумма, если она введена, иначе план. «Оплачено»
              — только пункты с галочкой. Галочка без фактической цены сохраняет
              план как оплаченную сумму. Еду и транспорт отмечайте после расхода
              или в конце поездки. Сайт не совершает покупки и не получает
              заказы из Trip.com автоматически.
            </p>
            <p>
              Расчёт йены: ¥100 = 55,2789 ₽ на 8 сентября 2026. Конвертация и
              комиссия при оплате могут отличаться. Отдельно не заложены виза,
              страховка, покупки, Express Pass и отель в Дохе. Тарифы перелётов
              — по проверке с оплатой СБП; другие способы могут стоить иначе.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="route">
          <RoutePlanner records={records} onPurchase={showPurchase} />
        </TabsContent>
        <TabsContent value="deals">
          <Deals records={records} disabled={!loaded || busy} save={save} />
        </TabsContent>
        <TabsContent value="variants">
          <TripVariants />
        </TabsContent>
      </Tabs>
      <PhotoCredits />
      <footer className="site-footer">
        <span>
          TABI · Япония 2026 ·{' '}
          {connected
            ? 'общий бюджет на ваших устройствах'
            : 'отметки в этом браузере'}
        </span>
        <span>Планируйте спокойно. Оставляйте место спонтанности.</span>
      </footer>
    </main>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  MapPin,
  X,
  Clock3,
  List,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type RouteDay, mapSearch } from './route-data';
import {
  photoForDay,
  photoForStop,
  nextRandomDay,
  storySeconds,
  storyDuration,
} from './trip-photos';
import { PlaceImage, PhotoCredit } from './place-photo';

type StoryProps = {
  days: RouteDay[];
  index: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectDay: (i: number) => void;
  onProgram: (point: number) => void;
};
export default function DayStories(props: StoryProps) {
  return props.open ? (
    <StoryPlayer key={props.days[props.index].date} {...props} />
  ) : null;
}
function StoryPlayer({
  days,
  index,
  open,
  onOpenChange,
  onSelectDay,
  onProgram,
}: StoryProps) {
  const [slide, setSlide] = useState(0),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [ended, setEnded] = useState(false);
  const elapsed = useRef(0);
  const day = days[index],
    stop = day.stops[slide] || day.stops[0];
  const exact = photoForStop(stop),
    photo = exact || photoForDay(day);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = requestAnimationFrame(() =>
      setPlaying(!motion.matches && !document.hidden),
    );
    const change = () => {
      if (motion.matches) setPlaying(false);
    };
    motion.addEventListener('change', change);
    return () => {
      cancelAnimationFrame(start);
      motion.removeEventListener('change', change);
    };
  }, []);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    if (!open || !playing || ended) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += Math.min(now - previous, 250);
      previous = now;
      const value = Math.min(elapsed.current / (storySeconds * 1000), 1);
      setProgress(value);
      if (value >= 1) {
        elapsed.current = 0;
        if (slide >= day.stops.length - 1) {
          setPlaying(false);
          setEnded(true);
        } else {
          setSlide((s) => s + 1);
          setProgress(0);
        }
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [open, playing, ended, slide, day.stops.length]);
  function seek(n: number) {
    if (n < 0 || n >= day.stops.length) return;
    elapsed.current = 0;
    setProgress(0);
    setSlide(n);
    setEnded(false);
  }
  function replay() {
    seek(0);
    setPlaying(true);
  }
  function chooseDay(n: number) {
    if (n >= 0 && n < days.length) onSelectDay(n);
  }
  function showProgram() {
    onOpenChange(false);
    onProgram(slide);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="story-dialog"
        showCloseButton={false}
        onKeyDown={(e) => {
          if (
            ['INPUT', 'SELECT', 'TEXTAREA'].includes(
              (e.target as HTMLElement).tagName,
            )
          )
            return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            seek(slide + 1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            seek(slide - 1);
          }
        }}
      >
        <DialogTitle className="sr-only">
          {day.label}: {day.title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Фотоистория программы дня, {storyDuration(day)} секунд. Можно
          поставить на паузу, переключить остановку или открыть её на карте.
          Escape закрывает просмотр.
        </DialogDescription>
        <div className={`story-screen ${playing ? 'is-playing' : ''}`}>
          <div className="story-image" key={`${day.date}-${slide}`}>
            <PlaceImage photo={photo} eager />
          </div>
          <div className="story-shade" />
          <div className="story-top">
            <div
              className="story-progress"
              aria-label={`Остановка ${slide + 1} из ${day.stops.length}`}
            >
              {day.stops.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => seek(i)}
                  aria-label={`Перейти: ${s.title}`}
                >
                  <span
                    style={{
                      width: `${i < slide ? 100 : i === slide ? progress * 100 : 0}%`,
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="story-top-line">
              <span className="story-avatar">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{day.city}</strong>
                <small>{day.label} · Япония, местное время</small>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="story-icon"
                aria-label="Закрыть истории"
                onClick={() => onOpenChange(false)}
              >
                <X />
              </Button>
            </div>
          </div>
          <div className="story-caption">
            <span className="story-time">
              <Clock3 size={17} />
              {stop.time}
            </span>
            <h3>{ended ? 'Вот таким будет этот день' : stop.title}</h3>
            <p>
              {ended
                ? 'Откройте программу: там дорога, билеты, отель и подробности.'
                : stop.leg}
            </p>
            <span className="story-plan-label">
              {stop.published ? 'Опубликованное расписание' : 'Плановое время'}{' '}
              · {slide + 1}/{day.stops.length}
            </span>
            <div className="story-playback">
              <Button
                variant="ghost"
                size="icon"
                className="story-icon"
                disabled={slide === 0}
                onClick={() => seek(slide - 1)}
                aria-label="Предыдущая остановка"
              >
                <ArrowLeft />
              </Button>
              <Button
                className="story-play"
                onClick={() => (ended ? replay() : setPlaying((v) => !v))}
              >
                {ended ? (
                  <RotateCcw size={19} />
                ) : playing ? (
                  <Pause size={19} />
                ) : (
                  <Play size={19} />
                )}{' '}
                {ended ? 'Ещё раз' : playing ? 'Пауза' : 'Смотреть'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="story-icon"
                disabled={slide === day.stops.length - 1}
                onClick={() => seek(slide + 1)}
                aria-label="Следующая остановка"
              >
                <ArrowRight />
              </Button>
            </div>
            <div className="story-bottom-actions">
              <button type="button" onClick={showProgram}>
                <List size={16} />
                Программа
              </button>
              <a
                href={mapSearch(stop.query)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPlaying(false)}
              >
                <MapPin size={16} />
                Место на карте ↗
              </a>
            </div>
            <PhotoCredit photo={photo} contextual={!exact} />
          </div>
        </div>
        <aside className="story-program">
          <p className="eyebrow">
            День {index + 1} · {storyDuration(day)} секунд
          </p>
          <h3>{day.title}</h3>
          <p className="story-subtitle">
            Остановки по порядку. Нажмите, чтобы перейти к нужному моменту.
          </p>
          <ol>
            {day.stops.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={i === slide ? 'active' : ''}
                  aria-current={i === slide ? 'step' : undefined}
                  onClick={() => seek(i)}
                >
                  <span>{s.time}</span>
                  <strong>{s.title}</strong>
                </button>
              </li>
            ))}
          </ol>
          <Button variant="outline" onClick={showProgram}>
            <List size={16} />
            Открыть подробный маршрут
          </Button>
        </aside>
        <div className="story-day-controls">
          <Button
            variant="ghost"
            className="story-icon"
            disabled={index === 0}
            onClick={() => chooseDay(index - 1)}
            aria-label="История предыдущего дня"
          >
            <ArrowLeft size={18} />
            <span>День назад</span>
          </Button>
          <Button
            variant="ghost"
            className="story-icon"
            onClick={() => chooseDay(nextRandomDay(days.length, index))}
          >
            <Shuffle size={17} />
            Случайный день
          </Button>
          <Button
            variant="ghost"
            className="story-icon"
            disabled={index === days.length - 1}
            onClick={() => chooseDay(index + 1)}
            aria-label="История следующего дня"
          >
            <span>Следующий</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

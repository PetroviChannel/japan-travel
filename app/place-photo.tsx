'use client';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { type PlacePhoto, placePhotos } from './trip-photos';

export function PlaceImage({
  photo,
  className = '',
  eager = false,
}: {
  photo?: PlacePhoto;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!photo || failed === photo.src)
    return (
      <div className={`photo-fallback ${className}`}>
        <ImageOff size={24} />
        <span>
          {photo ? `Фото недоступно: ${photo.label}` : 'Программа дня'}
        </span>
      </div>
    );
  return (
    // Static, pre-sized photos are served directly by Sites with lazy loading.
    // oxlint-disable-next-line nextjs/no-img-element
    <img
      className={className}
      src={import.meta.env.BASE_URL + photo.src.replace(/^\//, '')}
      alt={photo.label}
      style={{ objectPosition: photo.position || 'center' }}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(photo.src)}
    />
  );
}
export function PhotoCredit({
  photo,
  contextual = false,
}: {
  photo?: PlacePhoto;
  contextual?: boolean;
}) {
  if (!photo) return null;
  return (
    <a
      className="photo-credit"
      href={photo.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${photo.author} · ${photo.license} · кадрирование для экрана`}
    >
      {contextual ? 'Фото дня: ' : ''}
      {photo.label}{' '}
      <span>
        © {photo.author} · {photo.license} ↗
      </span>
    </a>
  );
}
export function PhotoCredits() {
  return (
    <details className="photo-sources">
      <summary>Фотографии и авторы</summary>
      <p>
        Реальные фотографии мест. Снимки иллюстрируют маршрут; погода, сезон и
        вид в поездке могут отличаться. Изображения кадрируются под экран. Если
        отдельного снимка остановки нет, в истории явно подписано место на
        фотографии дня.
      </p>
      <ul>
        {placePhotos.map((p) => (
          <li key={p.key}>
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
              {p.label} ↗
            </a>
            <span>
              {p.author} ·{' '}
              <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">
                {p.license}
              </a>{' '}
              · кадрирование
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

import { useState } from 'react';
import { VEHICLES } from '../vehicleData';
import { UI_TEXT, assetUrl } from '../constants';
import { useApp } from '../context/AppContext';
import { usePlayer } from '../context/PlayerContext';
import { CARD_BACK_THUMBNAIL_PATH, cardThumbnailPath } from '../assets';

export function GarageView() {
  const { language } = useApp();
  const { storage, markedVehicles } = usePlayer();
  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomAnimating, setZoomAnimating] = useState(false);
  const t = UI_TEXT[language];

  const handleOpenCard = (id: string) => {
    if (!zoomAnimating) setZoomedCard(id);
  };

  const handleCloseCard = () => {
    if (!zoomAnimating) {
      setZoomAnimating(true);
      setTimeout(() => {
        setZoomedCard(null);
        setZoomAnimating(false);
      }, 600);
    }
  };

  return (
    <>
      <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
        <div className="mb-7">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">{t.garage.kicker}</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">{storage.collectedCards.length}</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {markedVehicles.map((vehicle) => {
            const collected = storage.collectedCards.includes(vehicle.id);
            return (
              <article
                key={vehicle.id}
                className={`relative rounded-2xl border-2 p-2 transition-all ${
                  collected ? 'border-[#202A36]/20 bg-white shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.03]' : 'border-[#202A36]/5 bg-[#F8F4F4]'
                }`}
                onClick={() => collected && handleOpenCard(vehicle.id)}
              >
                <img
                  className="aspect-[3/4] w-full rounded-xl object-cover"
                  src={assetUrl(cardThumbnailPath(vehicle))}
                  alt={vehicle.name}
                  loading="lazy"
                  style={collected ? {} : { filter: 'grayscale(1) opacity(0.35)' }}
                />
                <div className="mt-2 text-center">
                  <strong className={`block truncate text-xs ${collected ? 'text-[#202A36]' : 'text-[#202A36]/30'}`}>
                    {vehicle.name}
                  </strong>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {zoomedCard && (() => {
        const vehicle = VEHICLES.find((v) => v.id === zoomedCard);
        if (!vehicle) return null;
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{ perspective: '1200px' }}
            onClick={handleCloseCard}
          >
            <div
              className="relative w-[min(80vw,400px)] cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: zoomAnimating ? 'rotateY(360deg) scale(1)' : 'rotateY(0deg) scale(1)',
                animation: zoomAnimating ? 'none' : 'cardReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              }}
              onClick={(e) => { e.stopPropagation(); handleCloseCard(); }}
            >
              <img className="w-full rounded-2xl shadow-2xl" src={assetUrl(cardThumbnailPath(vehicle))} alt={vehicle.name} style={{ backfaceVisibility: 'hidden' }} />
              <img className="absolute inset-0 w-full rounded-2xl shadow-2xl" src={assetUrl(CARD_BACK_THUMBNAIL_PATH)} alt="" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
            </div>
            <p className="absolute bottom-12 text-center text-lg font-extrabold text-white drop-shadow-lg">{vehicle.name}</p>
          </div>
        );
      })()}
    </>
  );
}

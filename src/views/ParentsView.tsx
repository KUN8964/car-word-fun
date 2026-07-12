import { Lock, Unlock } from 'lucide-react';
import { useCallback, useState } from 'react';
import { VEHICLES, VehicleColor, VehicleCategory } from '../vehicleData';
import { COLOR_LABELS, CATEGORY_LABELS, COLOR_OPTIONS, CATEGORY_OPTIONS, UI_TEXT, assetUrl } from '../constants';
import { useApp } from '../context/AppContext';
import { usePlayer } from '../context/PlayerContext';
import { vehicleThumbnailPath } from '../assets';

export function ParentsView() {
  const { language } = useApp();
  const {
    storage, setStorage, colorCounts, colorForVehicle, categoryForVehicle, resetTags,
  } = usePlayer();
  const [parentFilter, setParentFilter] = useState<'all' | VehicleColor | VehicleCategory>('all');
  const colorLabel = useCallback((color: VehicleColor) => COLOR_LABELS[language][color], [language]);
  const t = UI_TEXT[language];

  const updateVehicleColor = (vehicleId: string, color: VehicleColor) => {
    setStorage((prev) => ({ ...prev, colorOverrides: { ...prev.colorOverrides, [vehicleId]: color } }));
  };

  const updateVehicleCategory = (vehicleId: string, category: VehicleCategory) => {
    setStorage((prev) => ({ ...prev, categoryOverrides: { ...prev.categoryOverrides, [vehicleId]: category } }));
  };

  const toggleLockColor = (vehicleId: string) => {
    setStorage((prev) => ({ ...prev, lockedColors: { ...prev.lockedColors, [vehicleId]: !prev.lockedColors[vehicleId] } }));
  };

  const toggleLockCategory = (vehicleId: string) => {
    setStorage((prev) => ({ ...prev, lockedCategories: { ...prev.lockedCategories, [vehicleId]: !prev.lockedCategories[vehicleId] } }));
  };

  const parentVehicles = (() => {
    if (parentFilter === 'all') return VEHICLES;
    if (COLOR_OPTIONS.includes(parentFilter as VehicleColor)) {
      return VEHICLES.filter((v) => colorForVehicle(v) === parentFilter);
    }
    return VEHICLES.filter((v) => categoryForVehicle(v) === parentFilter);
  })();

  return (
    <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">{t.parents.kicker}</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">{t.parents.title}</h1>
          <p className="mt-3 max-w-[680px] text-sm leading-6 opacity-70">{t.parents.description}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/20 bg-white/55 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em]"
          type="button"
          onClick={resetTags}
        >
          {t.parents.reset}
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        <button
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${parentFilter === 'all' ? 'border-[#202A36] bg-[#202A36] text-white' : 'border-[#202A36]/20 bg-white/45'}`}
          type="button"
          onClick={() => setParentFilter('all')}
        >
          {t.parents.all} {VEHICLES.length}
        </button>
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${parentFilter === color ? 'border-[#202A36] bg-[#202A36] text-white' : 'border-[#202A36]/20 bg-white/45'}`}
            type="button"
            onClick={() => setParentFilter(color)}
          >
            {colorLabel(color)} {colorCounts.get(color) || 0}
          </button>
        ))}
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${parentFilter === cat ? 'border-[#202A36] bg-[#202A36] text-white' : 'border-[#202A36]/20 bg-white/45'}`}
            type="button"
            onClick={() => setParentFilter(cat)}
          >
            {CATEGORY_LABELS[language][cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {parentVehicles.map((vehicle) => {
          const currentColor = colorForVehicle(vehicle);
          const currentCategory = categoryForVehicle(vehicle);
          const colorLocked = storage.lockedColors[vehicle.id] || false;
          const catLocked = storage.lockedCategories[vehicle.id] || false;

          return (
            <article key={vehicle.id} className="grid grid-cols-[112px_1fr] gap-4 rounded-[28px] border border-[#202A36]/10 bg-white/35 p-3">
              <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-white/35">
                <img className="h-full w-full object-contain" src={assetUrl(vehicleThumbnailPath(vehicle))} alt={vehicle.name} loading="lazy" />
              </div>
              <div className="min-w-0">
                <strong className="block truncate text-sm">{vehicle.name}</strong>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] opacity-55">
                  {CATEGORY_LABELS[language][currentCategory]}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-[0.12em] opacity-60">{t.parents.mainColor}</label>
                  <button
                    type="button"
                    className={`ml-1 rounded-full p-0.5 transition-colors ${colorLocked ? 'bg-[#202A36] text-white' : 'bg-[#202A36]/10 text-[#202A36]/50 hover:bg-[#202A36]/20'}`}
                    onClick={() => toggleLockColor(vehicle.id)}
                    title={colorLocked ? t.parents.unlockColor : t.parents.lockColor}
                  >
                    {colorLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                  </button>
                </div>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#202A36]/15 bg-[#F8F4F4] px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#202A36]/20"
                  value={currentColor}
                  disabled={colorLocked}
                  onChange={(e) => updateVehicleColor(vehicle.id, e.target.value as VehicleColor)}
                >
                  <option value="unknown">{colorLabel('unknown')}</option>
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{colorLabel(color)}</option>
                  ))}
                </select>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-[0.12em] opacity-60">
                    {t.parents.category}
                  </label>
                  <button
                    type="button"
                    className={`ml-1 rounded-full p-0.5 transition-colors ${catLocked ? 'bg-[#202A36] text-white' : 'bg-[#202A36]/10 text-[#202A36]/50 hover:bg-[#202A36]/20'}`}
                    onClick={() => toggleLockCategory(vehicle.id)}
                    title={catLocked ? t.parents.unlockCategory : t.parents.lockCategory}
                  >
                    {catLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                  </button>
                </div>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#202A36]/15 bg-[#F8F4F4] px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#202A36]/20"
                  value={currentCategory}
                  disabled={catLocked}
                  onChange={(e) => updateVehicleCategory(vehicle.id, e.target.value as VehicleCategory)}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[language][cat]}</option>
                  ))}
                </select>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

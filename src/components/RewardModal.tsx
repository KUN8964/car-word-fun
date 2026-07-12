import { VEHICLES } from '../vehicleData';
import { UI_TEXT, assetUrl } from '../constants';
import { useApp } from '../context/AppContext';
import { useQuiz } from '../context/QuizContext';
import { vehicleThumbnailPath } from '../assets';

export function RewardModal() {
  const { language } = useApp();
  const { showReward, setShowReward, showAllCollected, setShowAllCollected } = useQuiz();
  const t = UI_TEXT[language].reward;

  if (showReward) {
    const rewardVehicle = VEHICLES.find((v) => v.id === showReward);
    if (!rewardVehicle) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <img src={assetUrl(vehicleThumbnailPath(rewardVehicle))} alt={rewardVehicle.name} className="mx-auto h-40 object-contain" />
          <h2 className="mt-4 text-2xl font-extrabold">{t.newCard}</h2>
          <p className="mt-2 text-lg font-bold">{rewardVehicle.name}</p>
          <button
            className="mt-6 rounded-full bg-[#202A36] px-8 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform active:scale-95"
            type="button"
            onClick={() => setShowReward(null)}
          >
            {t.continue}
          </button>
        </div>
      </div>
    );
  }

  if (showAllCollected) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-extrabold">{t.allCollected}</h2>
          <p className="mt-2 opacity-60">{t.amazing}</p>
          <button
            className="mt-6 rounded-full bg-[#202A36] px-8 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform active:scale-95"
            type="button"
            onClick={() => setShowAllCollected(false)}
          >
            {t.continue}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

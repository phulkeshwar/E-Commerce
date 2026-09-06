export function ProductOffers({ offers = [], offersExpanded, setOffersExpanded }) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-4">
      <p className="text-[0.75rem] font-bold text-gray-800 uppercase tracking-wider mb-2.5">
        🏷️ Available Offers
      </p>
      <div className="space-y-2">
        {(offersExpanded ? offers : offers.slice(0, 2)).map((o) => (
          <div key={o.title} className="flex gap-2.5">
            <span className="text-base flex-shrink-0">{o.icon}</span>
            <p className="text-[0.78rem] text-gray-700 leading-snug">
              <strong className="text-gray-900">{o.title}: </strong>
              {o.desc}
            </p>
          </div>
        ))}
      </div>
      {offers.length > 2 && (
        <button
          onClick={() => setOffersExpanded(!offersExpanded)}
          className="text-[#c4622d] text-[0.78rem] font-semibold hover:underline mt-2 cursor-pointer border-0 bg-transparent p-0"
        >
          {offersExpanded ? "See less" : `+${offers.length - 2} more offers`}
        </button>
      )}
    </div>
  );
}

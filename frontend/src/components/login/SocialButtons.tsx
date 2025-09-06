"use client";

export default function SocialButtons() {
  const cls =
    "inline-flex items-center justify-center h-11 w-11 rounded-full " +
    "border border-slate-300 bg-white text-slate-700 shadow-sm " +
    "hover:bg-slate-50 hover:border-slate-400 active:translate-y-[1px] transition";

  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Continue with Facebook" className={cls}>
        <span className="text-[15px] font-semibold">f</span>
      </button>
      <button type="button" aria-label="Continue with Google" className={cls}>
        <span className="text-[15px] font-semibold">G+</span>
      </button>
      <button type="button" aria-label="Continue with LinkedIn" className={cls}>
        <span className="text-[15px] font-semibold">in</span>
      </button>
    </div>
  );
}

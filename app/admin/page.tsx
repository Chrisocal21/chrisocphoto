export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-white/40 text-xs tracking-widest uppercase">
            chrisocphoto
          </span>
          <span className="text-white/20 text-xs">admin</span>
        </div>

        {/* Drop zone */}
        <div className="border border-dashed border-white/10 rounded-lg px-8 py-16 text-center mb-8 hover:border-white/20 transition-colors cursor-pointer group">
          <div className="text-white/15 text-6xl mb-4 group-hover:text-white/25 transition-colors select-none">
            +
          </div>
          <p className="text-white/40 text-sm mb-2">
            Drop photos here or click to select
          </p>
          <p className="text-white/20 text-xs">
            JPEG · HEIC · GPS extracted automatically
          </p>
        </div>

        {/* Mock queued photo */}
        <div className="border border-white/8 rounded-lg overflow-hidden mb-4">
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Thumbnail placeholder */}
            <div className="w-12 h-12 rounded bg-white/5 flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/admin1/96/96"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-sm truncate">IMG_4821.HEIC</p>
              <p className="text-white/30 text-xs mt-0.5">
                San Diego, CA · Mar 15, 2024
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/20 bg-white/5 rounded px-2 py-0.5">
                GPS found
              </span>
              <button className="text-white/20 hover:text-white/60 text-lg leading-none transition-colors">
                ×
              </button>
            </div>
          </div>

          {/* Editable location name */}
          <div className="border-t border-white/5 px-4 py-2.5 flex items-center gap-3">
            <span className="text-white/25 text-xs">Location name</span>
            <input
              defaultValue="San Diego, CA"
              className="flex-1 bg-transparent text-white/60 text-sm outline-none border-b border-white/10 focus:border-white/30 transition-colors pb-0.5"
            />
          </div>
        </div>

        {/* Upload button */}
        <button className="w-full py-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-lg text-white/60 hover:text-white/80 text-sm transition-colors">
          Upload
        </button>

        <p className="text-white/15 text-xs text-center mt-6">
          Prototype — uploads not active
        </p>
      </div>
    </div>
  );
}

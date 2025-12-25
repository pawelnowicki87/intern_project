export const Loader = ({ size = "md", fullScreen = false }: { size?: "sm" | "md" | "lg"; fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <InstagramSpinner size="lg" />
      </div>
    );
  }
  return <InstagramSpinner size={size} />;
};

const InstagramSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg
          className={`animate-spin ${
            size === "sm" ? "w-6 h-6" : size === "lg" ? "w-16 h-16" : "w-10 h-10"
          }`}
          viewBox="0 0 50 50"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#405DE6" />
              <stop offset="25%" stopColor="#5851DB" />
              <stop offset="50%" stopColor="#833AB4" />
              <stop offset="75%" stopColor="#C13584" />
              <stop offset="100%" stopColor="#E1306C" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
          />
        </svg>
      </div>
    </div>
  );
};

export const DotsLoader = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2";
  return (
    <div className="flex items-center justify-center gap-1">
      <div className={`${dotSize} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce`} style={{ animationDelay: "0ms" }}></div>
      <div className={`${dotSize} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce`} style={{ animationDelay: "150ms" }}></div>
      <div className={`${dotSize} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce`} style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};
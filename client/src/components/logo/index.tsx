import { AudioWaveform } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = (props: { url?: string }) => {
  const { url = "/" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url} className="group">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/20 transition-all group-hover:scale-105 group-hover:shadow-indigo-500/50">
          <AudioWaveform className="size-4 transition-transform group-hover:scale-110" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;

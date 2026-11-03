import { Zap } from "lucide-react";

export default function Logo({ light = true }) {
  return (
    <span className="logo-mark">
      <Zap size={20} strokeWidth={2.4} color={light ? "#f5a623" : "#3b4cca"} />
      EVOLV
    </span>
  );
}

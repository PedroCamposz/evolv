export default function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

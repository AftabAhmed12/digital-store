export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-border border-t-gold rounded-full animate-spin" />
      <p className="text-text-faint text-sm">{label}</p>
    </div>
  );
}

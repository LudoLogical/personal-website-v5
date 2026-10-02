import DiagramAnimation from "@/components/DiagramAnimation";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-48 overflow-hidden py-24">
      <DiagramAnimation
        text='Daniel "Ludo" DeAnda'
        className="text-[clamp(1.5rem,6vw,3rem)] font-bold text-primary"
      />
    </main>
  );
}

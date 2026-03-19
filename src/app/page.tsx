import { RiddleForm } from "@/components/riddle-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <RiddleForm />
      </div>
      <footer className="mt-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Riddle Submit Tool. Build with Next.js & Google Sheets.
      </footer>
    </main>
  );
}

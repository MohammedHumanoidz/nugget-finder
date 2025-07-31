import { Scene } from "@/components/BoxedAnimation";
import IdeaForm from "@/components/IdeaForm";

// Server component with SSR
export default async function Page() {
  return (
    <div className="min-h-screen w-full relative">
      <div className="relative z-10 flex flex-col items-center justify-center gap-12">
        <IdeaForm />
        <div>
          <p className="text-center font-medium text-2xl">
            Today&apos;s finest nuggets
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
          </div>
        </div>
      </div>
      <div className="absolute inset-0 opacity-30">
        <Scene />
      </div>
    </div>
  );
}

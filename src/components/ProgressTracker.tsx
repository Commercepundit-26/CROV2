import { Progress } from "@/components/ui/progress";

export function ProgressTracker({ progress, status }: { progress: number, status: string }) {
  return (
    <div className="max-w-xl mx-auto text-center mt-20">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        {status === 'crawling' ? 'Crawling pages...' : 
         status === 'analyzing' ? 'Running heuristics...' : 
         status === 'generating' ? 'Building presentation...' : 'Initializing...'}
      </h3>
      <Progress value={progress} className="h-4 w-full bg-gray-200" />
      <p className="mt-4 text-gray-500 font-medium">{progress}% Complete</p>
    </div>
  );
}

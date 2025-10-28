import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function BulletPointImprover() {
  const [bulletPoint, setBulletPoint] = useState("");
  const [jobContext, setJobContext] = useState("");
  const [improvements, setImprovements] = useState<any>(null);
  const [isImproving, setIsImproving] = useState(false);

  const improveBullet = useAction(api.openai.improveResumeBullet);

  const handleImprove = async () => {
    if (!bulletPoint.trim()) {
      toast.error("Please enter a bullet point");
      return;
    }

    setIsImproving(true);
    
    const toastId = toast.loading("AI is improving your bullet point...", { duration: Infinity });
    
    try {
      const result = await improveBullet({
        bulletPoint: bulletPoint.trim(),
        jobContext: jobContext.trim() || undefined,
      });

      toast.dismiss(toastId);
      setImprovements(result);
      toast.success("Improvements generated!");
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to improve bullet point");
      console.error(error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-10">
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            B
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Bullet Point Improver</h3>
            <p className="text-sm text-gray-700">
              Transform weak bullet points into powerful achievement statements with metrics and impact
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-8">
        <div>
          <label htmlFor="bullet-input" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Your Bullet Point
          </label>
          <textarea
            id="bullet-input"
            value={bulletPoint}
            onChange={(e) => setBulletPoint(e.target.value)}
            placeholder="e.g., Worked with the team to improve customer satisfaction"
            className="w-full h-24 px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
          />
        </div>

        <div>
          <label htmlFor="context-input" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
            Job Context <span className="text-gray-500 normal-case">(Optional)</span>
          </label>
          <input
            id="context-input"
            type="text"
            value={jobContext}
            onChange={(e) => setJobContext(e.target.value)}
            placeholder="e.g., Software Engineer, Marketing Manager"
            className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          />
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
            Specify the role to tailor the improvements
          </p>
        </div>

        <button
          onClick={handleImprove}
          disabled={isImproving || !bulletPoint.trim()}
          className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isImproving ? "Improving..." : "Improve Bullet Point"}
        </button>
      </div>

      {/* Improvements Display */}
      {improvements && (
        <div className="space-y-8">
          {improvements.feedback && (
            <div className="bg-gray-50 border border-gray-200 p-6">
              <h4 className="font-semibold text-black mb-3 uppercase tracking-wide text-sm">Feedback on Original</h4>
              <p className="text-sm text-gray-700">{improvements.feedback}</p>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold text-black uppercase tracking-wide">Improved Versions</h4>
            {improvements.improvedBullets?.map((bullet: any, idx: number) => (
              <div 
                key={idx} 
                className="border-2 border-gray-200 p-6 hover:border-black transition-all duration-200 bg-white"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider">
                        Score: {bullet.score}/100
                      </span>
                      {idx === 0 && (
                        <span className="px-3 py-1 bg-gray-200 text-black text-xs font-semibold uppercase tracking-wider">
                          Best
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 leading-relaxed mb-3 text-base">{bullet.text}</p>
                    <p className="text-sm text-gray-600">{bullet.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(bullet.text)}
                    className="btn-secondary px-4 py-2 text-xs flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                i
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Tips for Great Bullet Points</h4>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                  <li>Start with strong action verbs (Led, Developed, Increased, Achieved)</li>
                  <li>Include specific metrics and numbers (%, $, time saved)</li>
                  <li>Show the impact/result, not just the task</li>
                  <li>Keep it concise - aim for 1-2 lines</li>
                  <li>Use the CAR method: Challenge → Action → Result</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

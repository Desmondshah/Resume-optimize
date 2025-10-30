import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface JobDescriptionProps {
  onSave?: (jobDescriptionId: string) => void;
}

export function JobDescription({ onSave }: JobDescriptionProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const saveJobDescription = useMutation(api.resumes.saveJobDescription);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in at least the title and description");
      return;
    }

    setIsSaving(true);
    try {
      const jobDescriptionId = await saveJobDescription({
        title,
        description,
        qualifications,
      });

      toast.success("Job description saved!");
      if (onSave) {
        onSave(jobDescriptionId);
      }

      // Clear form
      setTitle("");
      setDescription("");
      setQualifications("");
    } catch (error) {
      toast.error("Failed to save job description");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simple Instructions */}
      <div className="bg-black text-white p-6">
        <h4 className="text-sm font-bold mb-2 uppercase tracking-wide">📝 How to Add Job Details</h4>
        <p className="text-sm opacity-90">Copy the job posting from the company's website and paste it here. This helps tailor your resume to match what they're looking for.</p>
      </div>

      <div>
        <label htmlFor="job-title" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Job Title *
        </label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="w-full px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="job-description" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Job Description *
        </label>
        <textarea
          id="job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the full job description here...&#10;&#10;💡 Tip: Include responsibilities, requirements, and any other details from the posting"
          className="w-full h-48 px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="qualifications" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Required Qualifications (Optional)
        </label>
        <textarea
          id="qualifications"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="Paste specific qualifications if listed separately...&#10;&#10;(If already included above, you can skip this)"
          className="w-full h-32 px-4 py-4 border-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
          disabled={isSaving}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !title.trim() || !description.trim()}
        className="w-full py-4 bg-black text-white font-semibold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSaving ? "SAVING..." : "SAVE JOB DESCRIPTION"}
      </button>
    </div>
  );
}

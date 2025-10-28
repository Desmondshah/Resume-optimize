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
      <div>
        <label htmlFor="job-title" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Job Title
        </label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="job-description" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Job Description
        </label>
        <textarea
          id="job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-48 px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
          disabled={isSaving}
        />
      </div>

      <div>
        <label htmlFor="qualifications" className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
          Required Qualifications
        </label>
        <textarea
          id="qualifications"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="Paste the required qualifications here..."
          className="w-full h-32 px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
          disabled={isSaving}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !title.trim() || !description.trim()}
        className="btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Job Description"}
      </button>
    </div>
  );
}

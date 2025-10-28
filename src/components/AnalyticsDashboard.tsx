import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function AnalyticsDashboard() {
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<Id<"resumes"> | "">("");

  const applications = useQuery(api.resumes.getUserApplications);
  const stats = useQuery(api.resumes.getApplicationStats);
  const resumes = useQuery(api.resumes.getUserResumes);
  const trackApplication = useMutation(api.resumes.trackApplication);
  const updateStatus = useMutation(api.resumes.updateApplicationStatus);

  const handleAddApplication = async () => {
    if (!companyName.trim() || !jobTitle.trim() || !selectedResumeId) {
      toast.error("Please fill in company, job title, and select a resume");
      return;
    }

    try {
      await trackApplication({
        resumeId: selectedResumeId,
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        status,
        notes: notes.trim() || undefined,
      });

      toast.success("Application tracked!");
      setCompanyName("");
      setJobTitle("");
      setNotes("");
      setStatus("applied");
      setShowAddApplication(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to track application");
    }
  };

  const handleStatusChange = async (appId: Id<"applications">, newStatus: string) => {
    try {
      await updateStatus({
        applicationId: appId,
        status: newStatus,
      });
      toast.success("Status updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-100 text-blue-800";
      case "interviewing": return "bg-purple-100 text-purple-800";
      case "offer": return "bg-green-100 text-green-800";
      case "accepted": return "bg-emerald-100 text-emerald-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "withdrawn": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-10">
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
            A
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black uppercase tracking-wide text-sm mb-1">Application Analytics</h3>
            <p className="text-sm text-gray-700">
              Track your job applications and measure your success rate
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-gray-200 p-6">
            <div className="text-4xl font-bold text-black mb-2">{stats.total}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Total Applications</div>
          </div>
          <div className="bg-white border-2 border-gray-200 p-6">
            <div className="text-4xl font-bold text-black mb-2">{stats.interviewing}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Interviewing</div>
          </div>
          <div className="bg-white border-2 border-gray-200 p-6">
            <div className="text-4xl font-bold text-black mb-2">{stats.interviewRate}%</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Interview Rate</div>
          </div>
          <div className="bg-white border-2 border-gray-200 p-6">
            <div className="text-4xl font-bold text-black mb-2">{stats.successRate}%</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Offer Rate</div>
          </div>
        </div>
      )}

      {/* Add Application Button */}
      <div>
        <button
          onClick={() => setShowAddApplication(!showAddApplication)}
          className="btn-primary w-full"
        >
          {showAddApplication ? "Cancel" : "Track New Application"}
        </button>
      </div>

      {/* Add Application Form */}
      {showAddApplication && (
        <div className="bg-white border-2 border-gray-200 p-8 space-y-6">
          <h4 className="font-semibold text-black uppercase tracking-wide">Add New Application</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Microsoft"
                className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                Job Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                Resume Used <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value as Id<"resumes"> | "")}
                className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
              >
                <option value="">-- Select resume --</option>
                {resumes?.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.fileName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 bg-white"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer Received</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              Notes <span className="text-gray-500 normal-case">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application..."
              className="w-full h-24 px-4 py-4 border-0 border-b-2 border-gray-300 focus:border-black outline-none transition-all duration-200 resize-none bg-white"
            />
          </div>

          <button
            onClick={handleAddApplication}
            className="btn-primary w-full"
          >
            Save Application
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-6">
        <h4 className="font-semibold text-black uppercase tracking-wide">Your Applications ({applications?.length || 0})</h4>
        
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white border-2 border-gray-200 p-6 hover:border-black transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-semibold text-black text-lg">{app.jobTitle}</h5>
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider">
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">{app.companyName}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Applied: {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                    {app.notes && (
                      <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 border-l-2 border-black">
                        {app.notes}
                      </p>
                    )}
                  </div>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="px-3 py-2 text-xs border-2 border-gray-300 focus:border-black outline-none bg-white uppercase tracking-wide"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 border-2 border-gray-200">
            <p className="text-gray-600 mb-2 uppercase tracking-wide text-sm font-semibold">No applications tracked yet</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Click "Track New Application" to get started</p>
          </div>
        )}
      </div>

      {/* Tips */}
      {applications && applications.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
              i
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Pro Tips</h4>
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                <li>Update application status regularly to track your progress</li>
                <li>Follow up 1-2 weeks after applying if no response</li>
                <li>Keep notes on each application for interview prep</li>
                <li>Your interview rate shows how well your resume performs</li>
                <li>Aim for 20-30% interview rate (industry average is 10-15%)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

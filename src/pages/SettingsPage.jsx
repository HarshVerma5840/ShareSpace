import React, { useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { apiRequest } from "../utils/api";
import { getUserRoleLabel, getVerificationLabel, isVerifiedCommuter } from "../utils/helpers";
import useAuthStore from "../stores/authStore";

function SettingsPage() {
  const session = useAuthStore((s) => s.session);
  const onSessionChange = useAuthStore((s) => s.updateSession);
  const onLogout = useAuthStore((s) => s.logout);
  const isDark = useAuthStore((s) => s.isDark);
  const toggleDark = useAuthStore((s) => s.toggleDark);
  const [form, setForm] = useState({
    fullName: session.user.fullName || "",
    email: session.user.email || "",
    phone: session.user.phone || ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    licenseNumber: "",
    frontDocument: null,
    backDocument: null
  });

  const saveSettings = async (e) => {
    e.preventDefault();
    setBusy(true); setError(""); setStatus("");
    try {
      const updatedUser = await apiRequest(`/users/${session.user.id}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
      onSessionChange({ ...session, user: updatedUser });
      setStatus("Profile updated successfully.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const submitVerification = async (e) => {
    e.preventDefault();
    setSubmittingVerification(true); setError(""); setStatus("");
    try {
      const formData = new FormData();
      formData.append("licenseNumber", verificationForm.licenseNumber);
      if (verificationForm.frontDocument) formData.append("frontDocument", verificationForm.frontDocument);
      if (verificationForm.backDocument) formData.append("backDocument", verificationForm.backDocument);
      const updatedUser = await apiRequest(`/users/${session.user.id}/license-verification`, {
        method: "POST",
        headers: {},
        body: formData
      });
      onSessionChange({ ...session, user: updatedUser });
      setVerificationForm({ licenseNumber: "", frontDocument: null, backDocument: null });
      setStatus("Driving license submitted. Verification is now pending review.");
    } catch (err) { setError(err.message); }
    finally { setSubmittingVerification(false); }
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#3a86ff] focus:ring-1 focus:ring-[#3a86ff] transition-all";

  return (
    <div className="w-full max-w-3xl mx-auto p-5 pb-28 sm:p-8 md:pb-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Update your profile details</p>
      </div>
      <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6">
        {status && <p className="text-[#3a86ff] font-bold mb-4">{status}</p>}
        {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="bg-white/5 text-gray-200 border border-white/10 px-3 py-1 rounded-full text-xs font-bold">{getUserRoleLabel(session.user)}</span>
          {getVerificationLabel(session.user) && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isVerifiedCommuter(session.user) ? "bg-[#3a86ff]/10 text-[#3a86ff] border-[#3a86ff]/20" : "bg-[#ff7a00]/10 text-[#ffb347] border-[#ff7a00]/20"}`}>
              {getVerificationLabel(session.user)}
            </span>
          )}
        </div>
        <form className="flex flex-col gap-5" onSubmit={saveSettings}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Full name
            <input className={inputCls} value={form.fullName} onChange={e => setForm(c => ({...c, fullName: e.target.value}))} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
            <input className={inputCls} type="email" value={form.email} onChange={e => setForm(c => ({...c, email: e.target.value}))} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Phone
            <input className={inputCls} value={form.phone} onChange={e => setForm(c => ({...c, phone: e.target.value}))} />
          </label>
          <button type="submit" className="mt-2 bg-gradient-to-r from-[#3a86ff] to-[#4facfe] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50" disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </form>
        {session.user.role === "COMMUTER" && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
            <strong className="text-white block">Driving license verification</strong>
            <p className="text-sm text-gray-400 mt-2 mb-4">
                Submit your Indian driving license to unlock the verified commuter discount after review.
            </p>
            {session.user.verificationStatus === "PENDING" ? (
              <div className="rounded-xl border border-[#ffb347]/20 bg-[#ff7a00]/10 px-4 py-3 text-sm font-medium text-[#ffcf8a]">
                Your documents are under review. The verified commuter discount will activate after approval.
              </div>
            ) : isVerifiedCommuter(session.user) ? (
              <div className="rounded-xl border border-[#3a86ff]/20 bg-[#3a86ff]/10 px-4 py-3 text-sm font-medium text-[#89b9ff]">
                Verification approved. Your bookings now get 5% off while a reduced platform margin still applies.
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={submitVerification}>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Driving license number
                  <input className={inputCls} value={verificationForm.licenseNumber} onChange={e => setVerificationForm(c => ({ ...c, licenseNumber: e.target.value }))} placeholder="e.g. MH1420110012345" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Front document
                  <input className={inputCls} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => setVerificationForm(c => ({ ...c, frontDocument: e.target.files?.[0] || null }))} />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Back document (optional)
                  <input className={inputCls} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => setVerificationForm(c => ({ ...c, backDocument: e.target.files?.[0] || null }))} />
                </label>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#ff7a00] to-[#ffb347] text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={submittingVerification}
                >
                  {submittingVerification ? "Submitting..." : "Submit for verification"}
                </button>
              </form>
            )}
          </div>
        )}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
          <strong className="text-white block">App controls</strong>
          <p className="text-sm text-gray-400 mt-2 mb-4">
            Keep quick account actions here so the mobile navigation can stay focused on core pages.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-200 transition-all hover:bg-white/10"
              onClick={toggleDark}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/15"
              onClick={onLogout}
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;

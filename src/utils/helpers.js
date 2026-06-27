export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount ?? 0));

export const formatCovered = (covered) => (covered ? "Covered" : "Open air");

export const getUserRoleLabel = (user) => {
  if (!user) return "";
  if (user.role === "HOST") return "Host";
  if (user.role === "COMMUTER") return "Commuter";
  return "Tourist";
};

export const getVerificationLabel = (user) => {
  if (!user || user.role !== "COMMUTER") return null;
  if (user.verificationStatus === "VERIFIED") return "Verified Commuter";
  if (user.verificationStatus === "PENDING") return "Verification Pending";
  if (user.verificationStatus === "REJECTED") return "Verification Rejected";
  return "Unverified Commuter";
};

export const isVerifiedCommuter = (user) => user?.role === "COMMUTER" && user?.verificationStatus === "VERIFIED";

export const getPlatformFeePreview = (hourlyRate) => Number(hourlyRate ?? 0) * 0.10;
export const getVerifiedDiscountPreview = (hourlyRate) => Number(hourlyRate ?? 0) * 0.05;

export const buildAddress = (form) =>
  [form.addressLine1, form.addressLine2, form.landmark, form.city, form.state, form.postalCode, "India"]
    .map((p) => p?.trim()).filter(Boolean).join(", ");

export const emptySpot = { title: "", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", postalCode: "", availabilityWindow: "24/7", hourlyRate: "", slotType: "STANDARD", covered: false };
export const emptyLogin = { email: "", password: "" };
export const emptyRegister = { fullName: "", email: "", phone: "", password: "", role: "TOURIST" };

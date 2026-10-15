const FIELDS = [
  ["fullName", "Full name"],
  ["phone", "Phone number"],
  ["addressLine1", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "Pincode"],
];

const validateShipping = (input) => {
  if (!input || typeof input !== "object") {
    return { error: "Shipping address is required" };
  }

  const value = {};
  for (const [key, label] of FIELDS) {
    const raw = input[key];
    const str = typeof raw === "string" || typeof raw === "number" ? String(raw).trim() : "";
    if (!str) return { error: `${label} is required` };
    value[key] = str;
  }

  const phone = value.phone.replace(/[\s-]/g, "");
  if (!/^\+?\d{10,13}$/.test(phone)) {
    return { error: "Phone number is not valid" };
  }
  value.phone = phone;

  if (!/^\d{6}$/.test(value.pincode)) {
    return { error: "Pincode must contain 6 digits" };
  }

  return { value };
};

export default validateShipping;

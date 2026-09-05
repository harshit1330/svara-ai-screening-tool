import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Form = ({ onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contactMethod, setContactMethod] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();

  const data = {
    name,
    age,
    gender,
    contactMethod,
    contact: contactMethod === "email" ? email : phone,
  };

  onSubmit?.(data);

  localStorage.setItem("userData", JSON.stringify(data));

  navigate("/dashboard");
};

  return (

    <div role="dialog" aria-modal="true" aria-labelledby="profile-title" onKeyDown={(event) => { if (event.key === "Escape") onClose?.(); }} className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white p-6 sm:p-7">
      <button type="button" autoFocus onClick={onClose} aria-label="Close profile form" className="absolute right-4 top-3 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">Close</button>
      <h2 id="profile-title" className="text-3xl font-bold text-[#0B1E39] mb-2 mt-8">Create Your Profile</h2>
      <p className="text-slate-500 mb-5">
        Enter your basic information before continuing with the screening.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
        {/* NAME */}
        <div>
          <label className="block font-semibold text-[#0B1E39] mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1D4ED8] transition-colors"
            required
          />
        </div>

        {/* AGE */}
        <div>
          <label className="block font-semibold text-[#0B1E39] mb-2">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1D4ED8] transition-colors"
            required
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="block font-semibold text-[#0B1E39] mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1D4ED8] transition-colors bg-white"
            required
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        {/* CONTINUE USING */}
        <div>
          <label className="block font-semibold text-[#0B1E39] mb-2">Continue using</label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${contactMethod === "email" ? "border-[#1D4ED8]" : "border-slate-300"
                }`}
            >
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={contactMethod === "email"}
                onChange={() => setContactMethod("email")}
                className="accent-[#1D4ED8] w-4 h-4"
              />
              Email
            </label>
            <label
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${contactMethod === "phone" ? "border-[#1D4ED8]" : "border-slate-300"
                }`}
            >
              <input
                type="radio"
                name="contactMethod"
                value="phone"
                checked={contactMethod === "phone"}
                onChange={() => setContactMethod("phone")}
                className="accent-[#1D4ED8] w-4 h-4"
              />
              Phone Number
            </label>
          </div>
        </div>

        {/* CONDITIONAL: EMAIL OR PHONE FIELD */}
        {contactMethod === "email" ? (
          <div>
            <label className="block font-semibold text-[#0B1E39] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1D4ED8] transition-colors"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-[#0B1E39] mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1D4ED8] transition-colors"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-[#1D4ED8] text-white font-bold py-2.5 rounded-xl hover:bg-[#1741B8] transition-colors mt-2"
        >
          Continue
        </button>
      </form>
    </div>

  );
};

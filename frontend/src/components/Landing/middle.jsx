const steps = [
  {
    num: 1,
    title: "Record Voice",
    body: "Record a short voice sample using your microphone.",
  },
  {
    num: 2,
    title: "Process Voice",
    body: "The system extracts vocal features from the sample.",
  },
  {
    num: 3,
    title: "AI Analysis",
    body: "The AI model analyses patterns associated with Parkinson's.",
  },
  {
    num: 4,
    title: "Result",
    body: "You receive a simple preliminary screening insight.",
  },
];

export const Middle = () => {
  return (
    <section id="how-it-works" className="bg-[#EEF4FB] py-16 px-6 mt-32 relative top-40  z-10">
      <div className="max-w-[1600px] mx-auto relative left-2">
        <h2 className="text-4xl font-bold text-[#0B1E39]">How Svara Works</h2>
        <p className="text-slate-500 text-lg mt-2 mb-10">
          A simple voice sample moves through four steps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="w-11 h-11 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center mb-5">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-[#0B1E39] mb-2">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
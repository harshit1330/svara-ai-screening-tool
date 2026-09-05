import { Link } from "react-router-dom";

export const Start = ({openForm}) => {














  return (
    <>
    <section id="start-diagnosis" className="bg-white py-20 px-6 relative top-35">
      <div className="max-w-[900px] mx-auto text-center">
        <span className="inline-block bg-[#DCEBFF] text-[#1D4ED8] text-sm font-semibold px-5 py-2 rounded-full mb-6">
          Voice Screening
        </span>

        <h2 className="text-5xl font-extrabold text-[#0B1E39] mb-4">
          Start Your Screening
        </h2>

        <p className="text-lg text-slate-500 mb-12">
          Take a short voice screening test. Before starting, we will ask for a few basic
          details.
        </p>

        {/* outer soft panel */}
        <div className="bg-[#F5F9FE] rounded-3xl p-10">
          {/* inner card */}
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-[560px] mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#DCEBFF] flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path
                  d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                  stroke="#1D4ED8"
                  strokeWidth="1.8"
                />
                <path
                  d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3"
                  stroke="#1D4ED8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-[#0B1E39] mb-3">Ready to begin?</h3>

            <p className="text-slate-500 mb-8">
              The test takes only a few moments. Click below to continue.
            </p>

            <button   onClick={openForm}  className="bg-[#1D4ED8] text-white font-semibold px-10 py-3.5 rounded-xl hover:bg-[#1741B8] transition-colors">
              Start screening
            </button>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold text-blue-700">
              <Link to="/dashboard" className="underline underline-offset-4">Open dashboard</Link>
              <Link to="/dashboard?view=history" className="underline underline-offset-4">View saved results</Link>
            </div>

          </div>
        </div>
      </div>
    </section>


    </>
  );
};

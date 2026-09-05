import parkinson from '../../assets/parkinson.png';
import Pk from '../../assets/Pk.jpg'

export const Hero = () => {
    return (
        <>
            <div className="flex flex-col gap-6 relative top-20 left-17 w-250 h-100 ">
                <p className="border border-blue-600 font-semibold text-[#0866d8] bg-[#dce9fb] w-55 rounded-3xl p-3  ">AI-Powered Voice Analysis</p>
                <div className="flex flex-col gap-4">
                    <h1 className="text-7xl text-blue-950 font-bold">Your voice</h1>
                    <h1 className="text-7xl text-blue-600 font-bold">Early insights</h1>
                   <p className="text-2xl w-150"><span className="font-bold text-blue-600">Svara</span> listens for subtle vocal changes that may offer early insights into Parkinson’s.</p>
                    <button onClick={() => {
    document.getElementById("start-diagnosis").scrollIntoView({ behavior: "smooth" });
  }} className="bg-blue-600 border-white w-50 p-5 cursor-pointer  rounded-2xl text-white">Start Diagnosis</button>
                </div>

 <div className="relative left-160 bottom-120 w-[520px] h-[520px] flex items-center justify-center shrink-0">
        {/* the big background circle */}
        <div className="absolute w-[480px] h-[480px] rounded-full bg-gradient-to-br from-[#BFDBFE] to-[#60A5FA]" />

        {/* soft glow behind it */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-blue-300/30 blur-3xl -z-10" />



        <img
        src={parkinson}
        alt="Parkinson illustration"
        className="absolute w-[400px] h-[400px] object-contain z-10"
    />
 </div>







            </div >
            <div id="aboutParkinson" className="bg-[#EEF4FB] relative top-50  flex flex-col gap-10 h-100 ">
                <h1 className="relative left-12 font-bold top-4 text-4xl w-75">About Parkinson
                </h1>
                <div className=" mx-10 rounded-3xl bg-blue-500 p-13 w-300 flex flx-row gap-5">
                    <img src={Pk} alt="" className="w-40 p-3 rounded-3xl bg-[#EEF4FB] border-[#EEF4FB] bg-white" />
                    <p className="text-2xl text-white">Parkinson's disease is a progressive neurological condition that mainly affects movement, but it can also influence speech and voice. Changes may include reduced volume, monotone speech, hoarseness, irregular rhythm and altered vocal stability. Voice analysis can help identify patterns that may warrant further professional medical evaluation.</p>
                </div>
            </div>


        </>

    )
}

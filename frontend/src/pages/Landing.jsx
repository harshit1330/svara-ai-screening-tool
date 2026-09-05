import { Navbar} from "../components/Landing/nav";
import { Hero } from "../components/Landing/hero";
import { Middle } from "../components/Landing/middle";
import { Start } from "../components/Landing/start";
import { Disclaimer } from "../components/Landing/disclaimer";
import { Form } from "../components/Landing/form";
import { useState } from "react";
export const Landing = () =>{
   const [form, setForm] = useState(false);

    // function of add  form
    const openForm = () => {
        setForm(true)


    }

    //function to form
    const formSubmit = (data) => {


         localStorage.setItem("userData", JSON.stringify(data));

    setForm(false);

    }




    return(
       <>
       <Navbar />
       <Hero/>
       <Middle/>
       <Start openForm={openForm}  />
       {form && ( // Conditional Rendering,first- false && second- true
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <Form onSubmit={formSubmit} onClose={() => setForm(false)}/>
                </div>)}
       <Disclaimer/>
       </>
    )
}

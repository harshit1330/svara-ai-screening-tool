import { Content } from "../components/Dashboard/content"
export const Dashboard = () =>{
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("userData"));
    } catch {
      return null;
    }
  })();

    return(
        <div>

  <Content userData={userData} />
        </div>
    )
}

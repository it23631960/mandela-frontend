import { Link } from "react-router-dom";
const Title = () => {
    return (
      <div className="fixed flex items-center bg-white justify-between text-black pl-10 p-4 text-4xl font-bold w-full">
        <img class="h-12 w-30" src="/images/logo.webp" alt="image description"></img>  
          {/*  <img src={logo} alt="Logo" className="h-12 mr-4" /> */}
          <Link to="/pos">
        <button className=" bg-white text-black font-mono px-4 py-2 rounded-2xl hover:bg-gray-300 ml-4 border border-black">
          POS
        </button>
      </Link>
 
      </div>
    );
  };
  
  export default Title;
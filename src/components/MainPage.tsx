import MainGame from "./MainGame";
import { useState } from "react";
import "./MainPage.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainNav from "./MainNav";
import Modal from "react-overlays/Modal";

interface MainPageProps {
  onQuery: (query: string) => void;
}

function MainPage({ onQuery }: MainPageProps): JSX.Element {
  //using states
  // const [user, setUser] = useState();

  // useEffect(() => {
  //   let dataa = fetch("https://localhost:7166/User/GetUser")
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     // .then((dataa) => console.log(dataa))
  //     .then((dataa) => setPlayers(dataa));
  // }, []);

  const navigate = useNavigate();

  const navigateToMainGame = () => {
    // navigate to /main the token logic will be written here in future
    // if user exists go to main game page otherwise go to displayname page

    navigate("/displayName");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    onQuery(e.target.value);
  };

  return (
    <>
      <MainNav />
      <div className="container">
        <div className="mainpage">
          <div className="mainpage__text">
            <p>Choose a name and a voting system for your game.</p>
          </div>
          <div className="mainpage__input__div">
            <input
              onChange={handleInput}
              id="mainpage__input_id"
              type="text"
              maxLength={60}
              className="mainpage__input mainpage__bordercolor"
              placeholder="Game's Name"
            ></input>
          </div>
          <div className="mainpage__select__div">
            <div className="mainpage__select mainpage__bordercolor ">
              Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ? )
            </div>
          </div>
          <div className="mainpage__button__div">
            <button className="mainpage__button " onClick={navigateToMainGame}>
              Create game
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;

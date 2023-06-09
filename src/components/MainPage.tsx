import { HubConnection } from "@microsoft/signalr";
import { useState } from "react";
import "./MainPage.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainNav from "./MainNav";
import Modal from "react-overlays/Modal";
import DisplayName from "./DisplayName";
import { v4 as uuidv4 } from "uuid";
import MainGame from "./MainGame";

interface MainPageProps {
  tokenFromMainPage: (data: string) => void;
  hubConnection: HubConnection;
}

const MainPage: React.FC<MainPageProps> = ({
  tokenFromMainPage,
  hubConnection,
}) => {
  const [gameCreatorName, setGameCreatorName] = useState<string | null>(null);

  const GameToken = uuidv4();
  console.log("the token from mainpage");
  console.log(GameToken);
  const navigate = useNavigate();

  const navigateToMainGame = () => {
    navigate(`/displayName/${GameToken}`);
  };

  const addGameCreator = () => {
    fetch("https://localhost:7166/User/AddCreator", {
      method: "POST",
      body: JSON.stringify({
        Name: gameCreatorName,
        GameToken: GameToken,
        IsGameCreator: true,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res + "called after adding user from maingame");
        console.log(res);
        const UID = res.userid;
        const resName = res.name;
        sessionStorage.setItem("useridFromAddUser", UID);
        sessionStorage.setItem("GameCreatorName", gameCreatorName || "");
        sessionStorage.setItem("name", resName);
        sessionStorage.setItem("gameCreatorId", UID);
        localStorage.setItem("creatorName", gameCreatorName || "");
        sessionStorage.setItem("GameToken", res.gameToken || "");
        // localStorage.setItem("GameTokenLocal", res.gameToken || "");
        tokenFromMainPage(res.gameToken || "");
      })

      .catch((err) => {
        console.log(err.message);
      });

    // getUser();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setGameCreatorName(e.target.value);
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
            <button
              className="mainpage__button "
              onClick={function () {
                addGameCreator();
                navigateToMainGame();
              }}
            >
              Create game
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;

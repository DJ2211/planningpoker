import MainNavGame from "./MainNavGame";

import "./MainGame.css";
import React, { useEffect, useState } from "react";
import { render } from "@testing-library/react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import DisplayName from "./DisplayName";

interface Player {
  userid: string;
  selectedCard: string;
  name: string;
  isCardSelected: boolean;
}

interface MainGameProps {
  token: string;
  query: string;
  displayName: string;
  userid: string;
}

const MainGame: React.FC<MainGameProps> = (props) => {
  const [newPlayer, setNewPlayer] = useState();
  const [token, setToken] = useState(props.token);

  const [selectedCard, setSelectedCard] = useState("");

  const [isCardSelected, setIsCardSelected] = useState(false);

  const [revealCard, setRevealCard] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const userid = sessionStorage.getItem("useridFromAddUser");
    console.log("getting user id from session storage " + userid);
  }, []);

  useEffect(() => {
    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7166/chatHub") // Adjust the hub URL as per your setup
      .build();

    hubConnection.on("ReceiveData", (data) => {
      console.log("Received data:", data);
      setNewPlayer(data);
    });

    hubConnection.start();

    return () => {
      hubConnection.stop();
    };
  }, []);

  useEffect(() => {
    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7166/chatHub")
      .build();

    hubConnection.on("UpdatePlayers", (updatedPlayers) => {
      console.log("called updated player api from maingame.tsx");
      setPlayers(updatedPlayers);
    });
    hubConnection.start();

    return () => {
      hubConnection.stop();
    };
  }, []);

  useEffect(() => {
    let dataa = fetch("https://localhost:7166/User/GetPlayers")
      .then(function (response) {
        return response.json();
      })
      // .then((dataa) => console.log(dataa))
      .then((dataa) => setPlayers(dataa));
  }, [newPlayer]);

  let playersForRender = players;

  const clickHandlerRandom = () => {
    const fibonacciArr = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const value = Math.floor(Math.random() * fibonacciArr.length);
    const randomvalue = fibonacciArr[value].toString();
    console.log(randomvalue);
    setSelectedCard(randomvalue);
    setIsCardSelected(true);
    updateUser(randomvalue);
  };
  const card = [];

  let n1 = 0,
    n2 = 1,
    nextTerm;
  const final = [];

  const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.innerText;
    let result = value.replace(/[^0-9]/g, "");
    const mainvalue = result;
    console.log(mainvalue);

    setSelectedCard(mainvalue);
    setIsCardSelected(true);
    updateUser(mainvalue);
    // updatePlayerCard(props.displayName, mainvalue);
  };

  const updateUser = (mainvalue: string) => {
    // Create the user object with the necessary data

    const userId = sessionStorage.getItem("useridFromAddUser");

    const displayName = sessionStorage.getItem("name");
    const token = props.token;

    const updatedPlayers = players.map((player) => {
      if (player.userid === userId) {
        return {
          ...player,
          selectedCard: mainvalue,
          isCardSelected: true,
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);

    console.log(
      "below code is added from gpt to send all the clients the updated list line 134 in maingame.tsx"
    );
    // Send the updated player list to all clients using SignalR
    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7166/chatHub")
      .build();

    hubConnection.start().then(() => {
      hubConnection
        .invoke("UpdatePlayers", updatedPlayers)
        .then(() => {
          console.log("Player list updated and broadcasted to all clients");
        })
        .catch((error) => {
          console.error("Error broadcasting player list:", error);
        })
        .finally(() => {
          hubConnection.stop();
        });
    });

    const user = {
      userid: userId,

      displayName: displayName,
      game_token: token,
      isCardSelected: 1,
      selectedCard: mainvalue,
    };

    console.log(user);

    // Send the POST request to add the user
    fetch("https://localhost:7166/User/UpdateUser", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: sessionStorage.getItem("useridFromAddUser"),
        Name: displayName,
        GameToken: token,
        isCardSelected: 1,
        selectedCard: mainvalue,
      }),
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error updating user:", error);
      });
  };

  for (let i = 1; i < 11; i++) {
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
    final.push(
      <li className="li__card__render__main" key={n2}>
        <button className="button__card__render__main" onClick={clickHandler}>
          <span>{n2}</span>
        </button>
      </li>
    );
  }

  // conditional rendering for cards component
  const revealCardEvent = () => {
    setRevealCard(true);

    console.log("revealCardEvent called");
  };

  // logic to do in this line
  console.log(players);
  const renderPlayers = players.map((player) => (
    <div
      className="maingame__card__div  maingame__card__padding"
      key={player.userid}
    >
      <div
        className={`maingame__card ${
          // player.userid == sessionStorage.getItem("useridFromAddUser") &&
          isCardSelected === true ? "maingame__card__backgroundsvg" : ""
        }`}
      >
        {player.selectedCard}
      </div>
      <div className="maingame__lastname">{player.name}</div>
    </div>
  ));

  if (revealCard === false) {
    if (isCardSelected === false) {
      card.push(
        <div className="maingame__card ">
          <p className="d-none">{selectedCard}</p>
        </div>
      );
    } else if (isCardSelected === true) {
      card.push(
        <div className="maingame__card maingame__card__backgroundsvg">
          <p className="d-none">{selectedCard}</p>
        </div>
      );
    }
  } else if (revealCard === true) {
    if (isCardSelected === false) {
      card.push(
        <div className="maingame__card ">
          <p>{selectedCard}</p>
        </div>
      );
    } else if (isCardSelected == true) {
      card.push(
        <div className="maingame__card maingame__selected">
          <p className="maingame__card__value">{selectedCard}</p>
        </div>
      );
    }
  }

  //this below to vote for another game
  // if (revealCard === true) {
  //   setRevealCard(false);
  //   setIsCardSelected(false);
  //   setSelectedCard(false);
  // }

  // conditional rendering for main pick your card component
  const picker = [];
  if (isCardSelected == false) {
    picker.push(<div className="maingame__table__text">pick your cards!</div>);
  } else if (isCardSelected == true) {
    picker.push(
      <button className="maingame__table__button" onClick={revealCardEvent}>
        Reveal Your card
      </button>
    );
  }

  return (
    <>
      <MainNavGame data={props} />
      <div className="container">
        <div className="maingame">
          <div>
            <p>feeling sus? </p>
          </div>
          <div className="maingame__invite">
            <p>Invite Players</p>
          </div>
          <div className="maingame__table">
            <div className="maingame__table__div">{picker}</div>
          </div>
        </div>
        {/* below code is for rendering users in given token , token logic is pending but main card rendering is started */}

        <div className="maingame__card__multipleUsers justify-content-center ">
          {renderPlayers}
          {/* {playersForRender &&
            playersForRender.map((player: Player, index: number) => {
              return (
                <>
                  <div className="maingame__card__div maingame__card__padding">
                    <div className="maingame__card">{player.selectedCard}</div>
                    <div className="maingame__lastname">{player.name}</div>
                  </div>
                </>
              );
            })} */}
        </div>
      </div>

      {/* below this is for card rendering for fibonacci */}
      <div className="container main__card__render">
        <div>
          <p>Choose your card 👇</p>
        </div>
        <div>
          <div className="card__render__main">
            <ul className="ul__card__render__main">
              <li className="li__card__render__main" key={0}>
                <button
                  className="button__card__render__main"
                  onClick={clickHandler}
                >
                  <span>0</span>
                </button>
              </li>
              {final}
              <li className="li__card__render__main" key={"random"}>
                <button
                  className="button__card__render__main"
                  onClick={clickHandlerRandom}
                >
                  <span>?</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainGame;

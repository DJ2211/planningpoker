import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import MainNavGame from "./MainNavGame";

import "./MainGame.css";
import React, { useEffect, useState } from "react";
import { render } from "@testing-library/react";

import DisplayName from "./DisplayName";
import userEvent from "@testing-library/user-event";
import "react-toastify/dist/ReactToastify.css";
import "animate.css/animate.min.css";
import { toast, ToastContainer, Slide } from "react-toastify";

interface Player {
  userid: string;
  selectedCard: string;
  name: string;
  isCardSelected: boolean;
  isGameCreator: boolean;
}

interface RevealedCard {
  Card: number;
  Count: number;
}

interface MainGameProps {
  hubConnection: HubConnection;
  tokenProp: string;
  query: string;
  displayName: string;
  userid: string;
}

// interface MainGameProps {
//   query: string;
//   displayName: string;
// }

const MainGame: React.FC<MainGameProps> = ({
  hubConnection,
  tokenProp,
  query,
  displayName,
  userid,
}) => {
  const [gameEnded, setGameEnded] = useState(false);
  // modified
  const [revealedCards, setRevealedCards] = useState<
    { card: number; count: number }[]
  >([]);

  const [average, setAverage] = useState<number>(0);

  // const [averageCard, setAverageCard] = useState(0);
  const [newPlayer, setNewPlayer] = useState();
  const [token, setToken] = useState(tokenProp);

  const [selectedCard, setSelectedCard] = useState("");

  const [isCardSelected, setIsCardSelected] = useState(false);

  const [isGameCreator, setIsGameCreator] = useState(false);

  const [revealCard, setRevealCard] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

  const [toaster, setToaster] = useState(false);

  // connection.start();

  //its creating new instance of hubconnection on maingame.tsx

  const handleCopyLink = () => {
    setToaster(true);
    const link = `http://localhost:3000/displayName/${token}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          transition: Slide,
          className: "animate__animated animate__fadeInRight",
          autoClose: 3000,
        });
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
      });

    setToaster(false);
  };

  // useEffect(() => {
  //   hubConnection.on("ReceiveMessage", (message, users) => {
  //     console.log("Received message:", message);
  //     console.log("Updated users:", users);
  //     setPlayers(users);
  //   });
  // }, []);

  // receivemessage
  // Define a callback function to handle the "UpdatePlayers" event

  useEffect(() => {
    const link = "https://localhost:7166/User/GetGameCreator";
    const playerId = sessionStorage.getItem("gameCreatorId");

    if (playerId === null) {
    } else {
      const url = `${link}/${playerId}`;
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch player data");
          }
        })
        .then((data) => {
          setIsGameCreator(data.isGameCreator);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  // useEffect(() => {
  //   // const connection: HubConnection = new HubConnectionBuilder()
  //   //   .withUrl("https://localhost:7166/chatHub")
  //   //   .build();

  //   // connection.start().then(() => {
  //   hubConnection.on("ReceiveRevealCardEvent", (payload) => {
  //     console.log("Reveal card event received");
  //     setRevealCard(payload.revealCard);
  //   });
  //   // });
  // }, []);

  useEffect(() => {
    // Create a new hub connection

    // connection.start().then(() => {

    hubConnection.on("GameStateReset", (usrs) => {
      console.log("called gamestate reset funciton", usrs);
      console.log(
        "88888888888888888888888888888888888888888888888888888888888888888888   NEW GAME STARTED 8888888888888888888888888888888888888888888888888888888888888888888888888888888"
      );
      setGameEnded(false);
      setRevealCard(false);
      setAverage(0);
      setSelectedCard("");
      setIsCardSelected(false);
      setNewPlayer(undefined);
      setRevealedCards([]);

      // Update the user data with the reset state
      setPlayers(usrs);
    });
    // });
  }, []);

  useEffect(() => {
    const userid = sessionStorage.getItem("useridFromAddUser");
    console.log("getting user id from session storage " + userid);
  }, []);

  useEffect(() => {
    const handleUpdatePlayers = (users: React.SetStateAction<Player[]>) => {
      console.log(
        "******************************************  receive player ***************************************************** "
      );
      console.log(users);
      // Update the players state with the received user list
      setPlayers(users);
    };

    // Register the callback function for the "UpdatePlayers" event

    if (!hubConnection) {
      hubConnection = new HubConnectionBuilder()
        .withUrl("https://localhost:7166/chatHub")
        .build();

      hubConnection.start().then(() => {
        hubConnection.on("ReceiveMessage", handleUpdatePlayers);
      });
    } else {
      hubConnection.on("ReceiveMessage", handleUpdatePlayers);
    }
  }, []);

  useEffect(() => {
    const handleReceivedCardsList = (cardsArray: RevealedCard[]) => {
      console.log(
        "******************************************  RECEIVE CARD LIST ***************************************************** "
      );

      console.log(cardsArray);
      setRevealedCards(cardsArray);

      // Calculate the average of card values
      const totalValue = cardsArray.reduce(
        (sum: number, card: RevealedCard) => sum + card.Count,
        0
      );
      const average = parseFloat((totalValue / cardsArray.length).toFixed(2));

      setAverage(average);
    };

    if (!hubConnection) {
      hubConnection = new HubConnectionBuilder()
        .withUrl("https://localhost:7166/chatHub")
        .build();

      hubConnection.start().then(() => {
        hubConnection.on("ReceiveRevealedCards", handleReceivedCardsList);
      });
    } else {
      hubConnection.on("ReceiveRevealedCards", handleReceivedCardsList);
    }
  }, []);

  useEffect(() => {
    const handleUserPlayers = (
      playersFromServer: React.SetStateAction<Player[]>
    ) => {
      console.log(
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww received Updated players wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
      );
      console.log(playersFromServer);
      setPlayers(playersFromServer);
    };

    hubConnection.on("sendPlayers", handleUserPlayers);
  }, []);

  useEffect(() => {
    const tkn = token;
    console.log(
      "..........................................................................................................................."
    );

    // Create a new hub connection
    // const connection = new HubConnectionBuilder()
    //   .withUrl("https://localhost:7166/chatHub")
    //   .build();

    // connection.start().then(() => {

    fetch(`https://localhost:7166/User/GetPlayers?gameToken=${tkn}`)
      .then((response) => response.json())
      .then((data) => {
        setPlayers(data);
      })
      .catch((error) => {
        console.error("Error fetching players data:", error);
      });

    // connection
    //   .invoke("JoinGame", tkn)
    //   .then(() => {})
    //   .catch((error) => {
    //     console.error("Error joining the game:", error);
    //   });
    // });
  }, []);

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
  const Card = [];

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
  };

  const updateUser = (mainvalue: string) => {
    // Create the user object with the necessary data

    const userId = sessionStorage.getItem("useridFromAddUser");

    const displayName = sessionStorage.getItem("name");
    // const token = props.token;
    let gameToken = sessionStorage.getItem("GameToken");

    // const updatedPlayers = players.map((player) => {
    //   if (player.userid === userId) {
    //     return {
    //       ...player,
    //       selectedCard: mainvalue,
    //       isCardSelected: true,
    //     };
    //   }
    //   return player;
    // });

    console.log("this console is used when any user is updated ");
    // Send the updated player list to all clients using SignalR

    if (gameToken == null) {
      gameToken = token;
    }

    const user = {
      userid: userId,

      displayName: displayName,
      game_token: token,
      isCardSelected: 1,
      selectedCard: mainvalue,
    };

    console.log(
      "this user will be updated to server in db call using fetch api"
    );
    console.log(user);

    // Send the PATCH request to add the user
    fetch("https://localhost:7166/User/UpdateUser", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: sessionStorage.getItem("useridFromAddUser"),
        Name: displayName,
        GameToken: token,
        isCardSelected: true,
        selectedCard: mainvalue,
      }),
    })
      .then(() => {
        console.log("user is successfully updated to fetch api in db call");

        // below code is used to get players
        let gameToken = sessionStorage.getItem("GameToken");

        if (gameToken == null) {
          gameToken = token;
        }
        updatePlayerInServer(gameToken);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error updating user:", error);
      });
  };

  const updatePlayerInServer = (gameToken: string) => {
    hubConnection
      .invoke("UpdatePlayers", gameToken)
      .then(() => {
        console.log(
          "Player list updated and broadcasted to all the grouped clients"
        );
      })
      .catch((error) => {
        console.error("Error broadcasting player list:", error);
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
    let gameToken = sessionStorage.getItem("GameToken");

    setRevealCard(true);

    // Calculate the vote count for each revealed card
    const cardsMap = new Map<string, number>();
    players.forEach((player) => {
      const { selectedCard } = player;
      if (selectedCard && selectedCard !== "") {
        const count = cardsMap.get(selectedCard) || 0;
        cardsMap.set(selectedCard, count + 1);
      }
    });

    // Convert the cards map to an array of RevealedCard objects
    const cardsArray: RevealedCard[] = Array.from(cardsMap.entries()).map(
      ([card, count]) => ({
        card: parseInt(card),
        count,
      })
    );

    // Calculate the average
    const totalVotes = cardsArray.reduce((sum, Card) => sum + Card.Count, 0);
    const average = totalVotes / cardsArray.length;
    setAverage(average);

    // Update the revealed cards state
    setRevealedCards(cardsArray);

    console.log(cardsArray);

    hubConnection
      .invoke("BroadcastRevealedCards", gameToken, cardsArray)
      .then(() => {
        console.log("Revealed cards and vote count broadcasted to all clients");
      })
      .catch((error) => {
        console.error("Error broadcasting revealed cards:", error);
      });

    setGameEnded(true);
  };

  const startNewGame = () => {
    hubConnection
      .invoke("ResetGameState", token)
      .then(() => {
        console.log("Game state reset and broadcast to all the clients");
      })
      .catch((error) => {
        console.error("Error restarting game state: ", error);
      });
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
          player.isCardSelected == true ? "maingame__card__backgroundsvg" : ""
        }`}
      >
        {player.isCardSelected ? player.selectedCard : ""}
      </div>
      <div className="maingame__lastname">{player.name}</div>
    </div>
  ));

  let mainContent;

  if (isGameCreator === true) {
    if (isCardSelected === false) {
      mainContent = (
        <div className="maingame__table__text">pick your cards!</div>
      );
    } else if (isCardSelected === true) {
      if (revealCard) {
        mainContent = (
          <div>
            <button className="maingame__table__button" onClick={startNewGame}>
              {" "}
              New Game
            </button>
          </div>
        );
      } else {
        mainContent = (
          <button className="maingame__table__button" onClick={revealCardEvent}>
            Reveal Your card
          </button>
        );
      }
    }
  } else {
    if (isCardSelected === false) {
      mainContent = (
        <div className="maingame__table__text">pick your cards!</div>
      );
    } else if (isCardSelected === true) {
      if (revealCard) {
        mainContent = (
          <div>
            <button className="maingame__table__button" onClick={startNewGame}>
              {" "}
              {localStorage.getItem("creatorName")} will start new game
            </button>
          </div>
        );
      } else {
        mainContent = (
          <button className="maingame__table__button" onClick={revealCardEvent}>
            {localStorage.getItem("creatorName")} will reveal cards
          </button>
        );
      }
    }
  }

  const totalVotes = revealedCards.reduce(
    (total, Card) => total + Card.count,
    0
  );
  const progress = revealedCards.map((Card, index) => {
    return (Card.count / totalVotes) * 100;
  });

  return (
    <>
      <MainNavGame query={query} displayName={displayName} />
      <ToastContainer transition={Slide} />
      <div className="container">
        <div className="maingame">
          <div>
            <p>feeling lonely like me? </p>
          </div>
          <div className="maingame__invite">
            <button
              className="maingame__invite__button"
              onClick={handleCopyLink}
            >
              Invite Players
            </button>
          </div>
          <div className="maingame__table">
            <div className="maingame__table__div">{mainContent}</div>
          </div>
        </div>
        {/* below code is for rendering users in given token , token logic is pending but main card rendering is started */}

        <div className="maingame__card__multipleUsers justify-content-center ">
          {revealCard ? (
            <div>
              <div className="d-flex ">
                {revealedCards.map((Card, index) => {
                  const progress = (Card.count / totalVotes) * 100;

                  return (
                    <div key={index}>
                      <div className="progress-bar  m-auto">
                        <div
                          className="progress"
                          style={{
                            height: `${progress}%`,
                            backgroundColor: "#ff7e7e",
                          }}
                        ></div>
                      </div>
                      <div className="m-2">
                        <div
                          key={index}
                          className="maingame__card maingame__card__renderForOutput"
                        >
                          <p className="maingame__card__cardText">
                            {Card.card}
                          </p>
                        </div>
                        <p>Votes: {Card.count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="maingame__card__cardText__avg">
                Average: {average}
              </p>
            </div>
          ) : (
            renderPlayers
          )}
        </div>
      </div>

      {/* below this is for card rendering for fibonacci */}
      {!revealCard && (
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
      )}
    </>
  );
};

export default MainGame;

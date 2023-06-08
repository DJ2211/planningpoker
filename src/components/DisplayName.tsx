import { useEffect, useState } from "react";
import { HubConnection } from "@microsoft/signalr";
import "./DisplayName.css";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

interface DisplayNameProps {
  hubConnection: HubConnection;
  changeDisplayName: (name: string) => void;
  displayName: string;
  getToken: string;
  onUserIdChange: (userid: any) => void;
}

const DisplayName: React.FC<DisplayNameProps> = ({
  hubConnection,
  changeDisplayName,
  displayName,
  getToken,
  onUserIdChange,
}) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchTokenData = async () => {
      // Extract the token from the URL
      const url = window.location.pathname;
      const token = url.substring(url.lastIndexOf("/") + 1);

      // Send a request to check if the token exists in the database
      try {
        const response = await fetch(
          `https://localhost:7166/User/CheckToken?token=${token}`
        );
        if (response.ok) {
          // Token exists in the database
          console.log("Token exists:", token);
          setToken(token);
          sessionStorage.setItem("TokenFromLink", token);
          // Perform any desired actions with the token
        } else {
          // Token does not exist in the database
          console.log("Token does not exist:", token);
          // Perform any desired actions for a non-existent token
        }
      } catch (error) {
        console.error("Error checking token:", error);
        // Perform error handling
      }
    };

    fetchTokenData();
  }, []);

  const navigate = useNavigate();

  const navigateToMainGame = () => {
    joinGameGroup(token); // Join the game group
    navigate(`/main/${token}`);
    console.log("token called from displayname " + token);
  };

  // code for creating group and joining in them is written here down
  const joinGameGroup = async (gameToken: string) => {
    try {
      if (hubConnection) {
        await hubConnection.invoke("JoinGame", gameToken); // Join the game group
        console.log("Connected to SignalR hub and joined the game group.");

        // Other SignalR event handlers or methods can be added here

        // hubConnection.on("ReceiveMessage", (message, users) => {
        //   console.log(message);
        //   console.log(users);
        // });
      }
    } catch (error) {
      console.error("Error establishing SignalR connection:", error);
    }
  };

  const addUsers = () => {
    const flagForCreator = sessionStorage.getItem("useridFromAddUser");
    const gameCreatorName = sessionStorage.getItem("GameCreatorName");
    // const tokenFromSession = sessionStorage.getItem("GameToken");

    if (flagForCreator != null && gameCreatorName != null) {
      // Send the PATCH request to add the user
      fetch("https://localhost:7166/User/UpdateUser", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: flagForCreator,
          Name: displayName,
          GameToken: token,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res + "called after updating user from main page");
          const resName = res.name;
          sessionStorage.setItem("name", displayName);
        })

        .catch((err) => {
          console.log(err.message);
        });
    } else {
      fetch("https://localhost:7166/User/AddUser", {
        method: "POST",
        body: JSON.stringify({
          Name: displayName,
          GameToken: token,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res + "called after adding user from displayname");
          const UID = res.userid;
          const resName = res.name;
          sessionStorage.setItem("useridFromAddUser", UID);
          sessionStorage.setItem("name", resName);
        })

        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    changeDisplayName(e.target.value);
  };

  return (
    <div className="container">
      <div className="mainpage">
        <div className="mainpage__input__div">
          <input
            onChange={handleInput}
            id="mainpage__input_id"
            type="text"
            maxLength={60}
            className="mainpage__input mainpage__bordercolor"
            placeholder="Display Name"
          ></input>
        </div>

        <div className="mainpage__button__div">
          <button
            className="mainpage__button"
            onClick={function () {
              addUsers();
              navigateToMainGame();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisplayName;

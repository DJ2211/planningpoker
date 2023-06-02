import "./App.css";

//importing custom components
import MainNav from "./components/MainNav";
import MainPage from "./components/MainPage";
import MainGame from "./components/MainGame";
import DisplayName from "./components/DisplayName";
import { Routes, Route, useNavigate } from "react-router-dom";
import React, { createContext, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";

export const HubConnectionContext = createContext<signalR.HubConnection | null>(
  null
);

const App: React.FC = () => {
  const [query, setQuery] = useState("Planning Poker");

  const [userid, setUserId] = useState("");

  const [displayName, setDisplayName] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token"));

  // useEffect(() => {
  //   let dataa = fetch("https://localhost:7166/User/GetToken")
  //     .then(function (response) {
  //       return response.text();
  //     })
  //     .then((dataa) => setToken(dataa));
  // }, []);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7166/chatHub")
      .build();

    connection.on("ReceiveMessage", (user, message) => {
      // Handle received message from the server
    });

    connection
      .start()
      .then(() => {
        // Example of invoking a server method
        connection.invoke("SendMessage", "jay", `Hello, `);
      })
      .catch((err) => {
        // Failed to start the connection
        console.error(err.toString());
      });
  }, []);

  const handleTokenChange = (token: React.SetStateAction<string | null>) => {
    setToken(token);
  };

  // const handleAddedUser = (userid) => {
  //   setUserId(userid);
  // };

  // doing signalr connection
  // console.log(token + "called from app.js");
  console.log(userid + "called userid from app.tsx line 74");

  return (
    <>
      <Routes>
        <Route
          path={`/displayName`}
          element={
            <DisplayName
              changeDisplayName={setDisplayName}
              displayName={displayName}
              getToken={handleTokenChange}
              onUserIdChange={setUserId}
            />
          }
        />

        <Route path="/" element={<MainPage onQuery={setQuery} />} />
        <Route
          // path={`/main/${token}`}
          path={`/main`}
          element={
            <MainGame
              query={query}
              displayName={displayName}
              token={token || ""}
              userid={userid}
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;

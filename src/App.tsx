import "./App.css";
import { hubConnection } from "../src/connections/signalr";
//importing custom components
import MainNav from "./components/MainNav";
import MainPage from "./components/MainPage";
import MainGame from "./components/MainGame";
import DisplayName from "./components/DisplayName";
import { Routes, Route, useNavigate } from "react-router-dom";
import React, { createContext, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

const App: React.FC = () => {
  const [query, setQuery] = useState("Planning Poker");

  const [userid, setUserId] = useState("");

  const [displayName, setDisplayName] = useState("");

  const [token, setToken] = useState("");

  //for connecting signalR

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

  const handleDataFromChild = (data: string) => {
    // Update state or perform operations based on the received data
    setToken(data);
    sessionStorage.setItem("GameTokenFromMainGameStoredFromApp", data);
  };
  // const handleAddedUser = (userid) => {
  //   setUserId(userid);
  // };

  // doing signalr connection
  console.log(token + "called from app.js");
  // console.log(userid + "called userid from app.tsx line 74");

  return (
    <>
      <Routes>
        <Route
          path={`/displayName/:token`}
          element={
            <DisplayName
              changeDisplayName={setDisplayName}
              displayName={displayName}
              getToken={token}
              onUserIdChange={setUserId}
              hubConnection={hubConnection}
            />
          }
        />

        <Route
          path="/"
          element={
            <MainPage
              tokenFromMainPage={handleDataFromChild}
              hubConnection={hubConnection}
            />
          }
        />
        <Route
          path={`/main/${token}`}
          element={
            <MainGame
              hubConnection={hubConnection}
              tokenProp={token || ""}
              query={query}
              displayName={displayName}
              userid={userid}
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;

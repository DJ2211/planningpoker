import { useEffect, useState } from "react";
import "./DisplayName.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HubConnectionContext } from "../App";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

interface DisplayNameProps {
  changeDisplayName: (name: string) => void;
  displayName: string;
  getToken: (token: string | null) => void;
  onUserIdChange: (userid: any) => void;
}

const DisplayName: React.FC<DisplayNameProps> = ({
  changeDisplayName,
  displayName,
  getToken,
  onUserIdChange,
}) => {
  const [latestUser, setLatestUser] = useState("");
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  let hubConnection: HubConnection | null = null;

  const navigateToMainGame = () => {
    // navigate to /main the token logic will be written here in future
    // navigate(`/main/${token}`);
    navigate(`/main`);
    console.log("token called from displayname " + token);
    // navigate("/main");
  };

  useEffect(() => {
    let dataa = fetch("https://localhost:7166/User/GetToken")
      .then(function (response) {
        return response.text();
      })
      .then((dataa) => setToken(dataa));
  }, []);

  const addUsers = () => {
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

    // getUser();
  };

  // const getUser = () => {
  //   let dataa = fetch("https://localhost:7166/User/GetUser")
  //     .then(function (response) {
  //       return response.json();
  //     })
  //     .then((dataa) => {
  //       console.log(dataa);
  //       setLatestUser(dataa);
  //       onUserIdChange(dataa.userid);
  //       sessionStorage.setItem("userid", dataa.userid);
  //       console.log(
  //         "called userid of current player from displayName line 73" + dataa
  //       );
  //     });
  // };

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
              navigateToMainGame();
              addUsers();
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

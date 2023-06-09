import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

// Create a new hubConnection instance
export const hubConnection: HubConnection = new HubConnectionBuilder()
  .withUrl("https://localhost:7166/chatHub")
  .build();

// Start the hubConnection
hubConnection.start().catch((error) => {
  console.error("Error starting the hub connection:", error);
});

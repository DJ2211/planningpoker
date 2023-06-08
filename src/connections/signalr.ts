import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

// Create a new hubConnection instance
export const hubConnection: HubConnection = new HubConnectionBuilder()
  .withUrl("https://your-signalr-endpoint")
  .build();

// Start the hubConnection
hubConnection.start().catch((error) => {
  console.error("Error starting the hub connection:", error);
});

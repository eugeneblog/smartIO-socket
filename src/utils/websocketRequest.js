import io from "socket.io-client";
const address =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8001"
    : "http://localhost:8001";

export function websocketStart() {

}

export function websocketStop() {
  
}

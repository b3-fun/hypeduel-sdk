import { INSTANCER_SERVER_URL } from "./constants";
import { StartMatchMessage } from "./types";

class MatchClient{
    matchToken: string
    websocket : WebSocket
    constructor(matchToken: string){
        this.matchToken = matchToken;
        this.websocket = new WebSocket(INSTANCER_SERVER_URL);
    }

}
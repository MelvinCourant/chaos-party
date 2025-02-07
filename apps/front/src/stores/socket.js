import { defineStore } from "pinia";
import { io } from "socket.io-client";
const env = import.meta.env;

export const useSocketStore = defineStore("socket", {
    state: () => ({
        socket: null,
    }),
    actions: {
        connect() {
            if (!this.socket) {
                this.socket = io(env.VITE_URL);
            }
        },
        disconnect() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        },
    },
});

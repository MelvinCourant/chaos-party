import { ref } from "vue";
import { defineStore } from "pinia";

export const usePartyStore = defineStore("party", () => {
    const partyId = ref("");
    const hostId = ref("");

    if (localStorage.getItem("partyID")) {
        partyId.value = localStorage.getItem("partyID") || "";
    }

    if (localStorage.getItem("hostID")) {
        hostId.value = localStorage.getItem("hostID") || "";
    }

    function updatePartyId(newParty) {
        partyId.value = newParty;
        localStorage.setItem("partyID", newParty);
    }

    function updateHostId(newHost) {
        hostId.value = newHost;
        localStorage.setItem("hostID", newHost);
    }

    return {
        partyId,
        updatePartyId,
        hostId,
        updateHostId,
    };
});

import { ref } from "vue";
import { defineStore } from "pinia";

export const usePartyStore = defineStore("party", () => {
    const partyId = ref("");

    if (localStorage.getItem("partyID")) {
        partyId.value = localStorage.getItem("partyID") || "";
    }

    function updatePartyId(newParty) {
        partyId.value = newParty;
        localStorage.setItem("partyID", newParty);
    }

    return {
        partyId,
        updatePartyId,
    };
});

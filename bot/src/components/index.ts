import { Collection } from "discord.js";
import { type Button, type Modal } from "types/component.js";

import registerButton from "./buttons/registerButton.js";
import newUserEmbed from "./embeds/newUserEmbed.js";
import registerModal from "./modals/registerModal.js";
import approveButton from "./buttons/approveButton.js";
import rejectButton from "./buttons/rejectButton.js";

export const Buttons = new Collection<string, Button>([
    [registerButton.name, registerButton],
    [approveButton.name, approveButton],
    [rejectButton.name, rejectButton],
]);

export const Modals = new Collection<string, Modal>([
    [registerModal.name, registerModal]
]);

export const Embeds = {
    newUserEmbed
};

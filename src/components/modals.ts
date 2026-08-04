import type { Modal } from "@/types/modal.js";
import { Collection } from "discord.js";

import register_modal from "./register_modal.js";

const Modals = new Collection<string, Modal>([
    [register_modal.name, register_modal],
]);

export default Modals;
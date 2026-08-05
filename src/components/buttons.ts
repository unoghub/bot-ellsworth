import type { Button } from "@/types/button.js";
import { Collection } from "discord.js";

import { registerButton, registryApproveButton, registryRejectButton } from "./register_button.js";

const Buttons = new Collection<string, Button>([
    [registerButton.name, registerButton],
    [registryApproveButton.name, registryApproveButton],
    [registryRejectButton.name, registryRejectButton],
]);

export default Buttons;
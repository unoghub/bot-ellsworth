import type { Button } from "@/types/button.js";
import { Collection } from "discord.js";

import registerButton from "./register_button.js";

const Buttons = new Collection<string, Button>([
    [registerButton.name, registerButton],
]);

export default Buttons;
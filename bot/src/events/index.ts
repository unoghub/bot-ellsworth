import clientReady from "./clientReady.js";
import guildMemberJoin from "./guildMemberJoin.js";
import interactionCreate from "./interactionCreate.js";
import messageCreated from "./messageCreated.js";
import messageDeleted from "./messageDeleted.js";
import messageUpdated from "./messageUpdated.js";

export default [ 
    clientReady,
    interactionCreate,
    messageCreated,
    messageDeleted,
    messageUpdated,
    guildMemberJoin
];
import { createServer } from "https"
import { parse } from "url";
import next from "next";
import fs from "fs";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();


const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/nearsay.troylu.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/nearsay.troylu.com/fullchain.pem'),
};

app.prepare()
.then(() => {
    createServer(options, (req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    })
    .listen(3000);
    
    console.log("nextjs server listening..");
});
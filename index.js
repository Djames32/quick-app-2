const http = require('http');
const fs = require('fs');
const path = require('path');
const {MongoClient} = require('mongodb');

require('dotenv').config();
console.log("URI: ", process.env.MONGO_URI)

async function main() {
    const uri = process.env.MONGO_URI

    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log("MongoDB connection established successfully")

        const server = http.createServer( async (req, res) => {
            if (req.url === '/') {
                fs.readFile(path.join(__dirname, 'index.html'),
                (err, content) => {
                    if(err) throw err;

                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.end(content)
                })
            } else if (req.url === "/api") {
                try {
                    const db = client.db("quicklib");
                    const services = await db.collection("services").find({}).toArray();
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ services }));
                } catch (e) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Database query failed" }));
                }
        } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Nothing is here.");
        }});

        server.listen(5959, ()=>console.log("Server is running"))
    } catch(e) {
        console.log(e);
    }
}



main();


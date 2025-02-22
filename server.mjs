console.log("starting SDE TODO List Web v1.0.0...");
const db_filename = "data.bin";
import fs from "fs";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import sqlite3 from "better-sqlite3-multiple-ciphers";
const db_file_exists = fs.existsSync(db_filename);
const db = sqlite3(db_filename, {
	//verbose: console.log,
});
db.pragma(`cipher='chacha20'`);
db.pragma(`key='${process.env["DB_PASSWORD"]}'`);
db.pragma(`synchronous=NORMAL`); // NORMAL is a balance between speed (OFF) and safety (FULL)
db.pragma(`journal_mode=DELETE`);
if (!db_file_exists) {
	try {
		db.prepare(
			"CREATE TABLE tasks (" +
				"id TEXT NOT NULL PRIMARY KEY, " +
				"create_timestamp TEXT NOT NULL, " +
				"complete_timestamp TEXT, " +
				"description TEXT NOT NULL CHECK(length(description) > 0)" +
			")"
		).run();
	} catch (error) {
		console.error(error);
		console.log("failed to create db");
		process.exit(1);
	}
	console.log(`created db with tasks`);
}
try {
	const count = db.prepare(
		`SELECT COUNT(*) FROM tasks`,
	).get()['COUNT(*)'];
	console.log(`found db with ${count} tasks`);
} catch (error) {
	console.error(error);
	console.error(`failed to open db`);
	process.exit(1);
}
const server = http.createServer(async (request, result) => {
	if (request.method === "GET" && request.url === "/") {
		result.writeHead(200, {"Content-Type": "text/html; charset=UTF-8;"});
		result.end("welcome to my app");
	}
	else if (request.method === "OPTIONS") {
		result.writeHead(204, {}); // no content
		result.end();
	}
	else {
		result.writeHead(404, {"Content-Type": "text/html; charset=UTF-8;"});
		result.end(`api method not found`);
	}	
});
server.listen(8080, "0.0.0.0", 511, async () => {
	console.log("ready!")
});
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
// NORMAL is a balance between speed (OFF) and safety (FULL)
db.pragma(`synchronous=NORMAL`);
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
	const method = request.method;
	const parts = request.url.split("?");
	const url = parts[0];
	const parameters = parts[1].split("&");
	// disable CORS //
	result.setHeader('Access-Control-Allow-Origin', '*');
	result.setHeader('Access-Control-Allow-Methods', '*');
	result.setHeader('Access-Control-Allow-Headers', '*');	
	// resource hosting //
	if (method === "GET" && (url === "/" || url === "/index.html")) {
		result.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});
		result.end(
			"<h1>Welcome To My App</h1>\n" +
			"<p>SDE TODO List Web v1.0.0</p>"
		);
	}
	// tasks api //
	else if (method === "GET" && url === "/api/v1/tasks/add") {
		const description = decodeURIComponent(parameters[0]);
		try {
			const id = crypto.randomUUID();
			db.prepare(
				"INSERT INTO tasks (id, create_timestamp, description) " +
				"VALUES (?, ?, ?)"
			).run(id, (new Date()).toISOString(), description);
			result.writeHead(200, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: true, id}));
		} catch (error) {
			console.warn(error);
			result.writeHead(500, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: false, error: error.message}));
		}
	}
	else if (method === "GET" && url === "/api/v1/tasks/remove") {
		const id = decodeURIComponent(parameters[0]);
		try {
			const effect = db.prepare(
				"DELETE FROM tasks WHERE id = ?"
			).run(id);
			result.writeHead(200, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: effect.changes === 1}));
		} catch (error) {
			console.warn(error);
			result.writeHead(500, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: false, error: error.message}));
		}
	}
	else if (method === "GET" && url === "/api/v1/tasks/complete") {
		const id = decodeURIComponent(parameters[0]);
		try {
			const effect = db.prepare(
				"UPDATE tasks SET complete_timestamp = ? " +
				"WHERE complete_timestamp is NULL AND id = ?"
			).run((new Date()).toISOString(), id);
			result.writeHead(200, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: effect.changes === 1}));
		} catch (error) {
			console.warn(error);
			result.writeHead(500, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: false, error: error.message}));
		}
	}
	else if (method === "GET" && url === "/api/v1/tasks/edit") {
		const id = decodeURIComponent(parameters[0]);
		const description = decodeURIComponent(parameters[1]);
		try {
			const effect = db.prepare(
				"UPDATE tasks SET description = ? " +
				"WHERE id = ? AND description != ? AND complete_timestamp is NULL"
			).run(description, id, description);
			result.writeHead(200, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: effect.changes === 1}));
		} catch (error) {
			console.warn(error);
			result.writeHead(500, {"Content-Type": "application/json"});
			result.end(JSON.stringify({done: false, error: error.message}));
		}
	}
	else if (method === "OPTIONS") {
		result.writeHead(204, {}); // no content
		result.end();
	}
	else {
		result.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
		result.end(`<h2>api method not found</h2>`);
	}	
});
const port = parseInt('8080');
server.listen(port, "0.0.0.0", 511, async () => {
	console.log("ready!")
});
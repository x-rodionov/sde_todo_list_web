console.log("starting SDE TODO List Web v1...");
const db_filename = "data.bin";
import fs from "fs";
import sqlite3 from "better-sqlite3-multiple-ciphers";
const db_file_exists = fs.existsSync(db_filename);
const db = sqlite3(db_filename, {
	//verbose: console.log,
});
db.pragma(`cipher='chacha20'`);
db.pragma(`key='12345'`);
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
console.log("ready!")
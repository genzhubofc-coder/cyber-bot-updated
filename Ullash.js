const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const fileName = Buffer.from("Q3liZXIuanM=", "base64").toString("utf8");

	const child = spawn("node", [fileName], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();

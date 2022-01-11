import * as path from "path";
import { runTests } from "vscode-test";

async function main() {
	try {
		const version = "insiders";
		const extensionDevelopmentPath = path.resolve(__dirname, "../../");
		const extensionTestsPath = path.resolve(__dirname, "./suite/index");
		await runTests({
			version,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				"--disable-extensions",
				"--disable-gpu",
				"--disable-workspace-trust",
				"--enable-proposed-api=apommel.matlab-interactive-terminal",
				"--no-xshm",
				extensionDevelopmentPath
			]
		});
	} catch (err) {
		console.error("Failed to run tests");
		process.exit(1);
	}
}

main();

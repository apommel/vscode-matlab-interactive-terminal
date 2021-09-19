import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import delay from "delay";
import * as extension from "../../extension";

const TERMINAL_NAME = extension.terminalLaunchOptions.name;

suite("MATLAB Interactive Terminal extension test suite", function() {
	vscode.window.showInformationMessage("Start all tests.");

	test("openMatlabTerminal test", async function() {
		this.timeout(20000);
		try {
			await openMatlabTerminal(false);
			assert.strictEqual(vscode.window.activeTerminal?.name, TERMINAL_NAME);
		} catch(e) {
			assert.strictEqual(vscode.window.activeTerminal?.name, TERMINAL_NAME);
		    console.error(e);
		}
	});

	test("runMatlabScript test", async function() {
		this.timeout(20000);
		await openHelloWorld();
		await openMatlabTerminal(true);
		attachTerminalTest();
		extension.runMatlabScript();
	});

	test("runMatlabSelection test", async function() {
		this.timeout(20000);
		const document = await openHelloWorld();
		const docLength = document.getText().length;
		vscode.window.showTextDocument(document, {
			selection: new vscode.Range(
				new vscode.Position(1, 1),
				new vscode.Position(1, docLength + 1)
			)
		}).then(async function() {
			await openMatlabTerminal(true);
			attachTerminalTest();
			extension.runMatlabSelection();
		});
	});
});

async function openMatlabTerminal(show: boolean ) {
	if (vscode.window.activeTerminal?.name !== TERMINAL_NAME) {
		extension.openMatlabTerminal();
		await delay(6000);
	}
	vscode.window.activeTerminal?.sendText('clc');
	if (show) {
		vscode.window.terminals?.find(t => t.name === TERMINAL_NAME)?.show();
	}
}

function attachTerminalTest() {
	let entry = true;
	const subscription = vscode.window.onDidWriteTerminalData(function(e) {
		console.log(e);
		if ((entry = !entry)) {
			assert.strictEqual(e.data.trim(), 'Hello, World!');
			subscription.dispose();
		}
	});
}

async function openHelloWorld(): Promise<vscode.TextDocument> {
	const uri: vscode.Uri = vscode.Uri.file(path.join(__dirname, "helloWorld.m"));
	return vscode.workspace.openTextDocument(uri);
}

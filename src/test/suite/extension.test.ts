import * as assert from "assert";
import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import delay from "delay";
import * as extension from "../../extension";

const TERMINAL_NAME = extension.terminalLaunchOptions.name;

let document: vscode.TextDocument;

suite("MATLAB Interactive Terminal extension test suite", function() {
	vscode.window.showInformationMessage("Start all tests.");

	suiteSetup(async function() {
		const uri = vscode.Uri.file(path.join(__dirname, "helloWorld.m"));
		document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document);
	});

	test("openMatlabTerminal test", async function() {
		this.timeout(15000);
		try {
			await openMatlabTerminal(false);
			assert.strictEqual(vscode.window.activeTerminal?.name, TERMINAL_NAME);
		} catch(e) {
			assert.strictEqual(vscode.window.activeTerminal?.name, TERMINAL_NAME);
		    console.error(e);
		}
	});

	test("runMatlabScript test", async function() {
		this.timeout(25000);
		await openMatlabTerminal(true);
		const done = attachTerminalTest();
		extension.runMatlabScript();
		await done;
		await delay(2000);
	});

	test("runMatlabSelection test", async function() {
		this.timeout(25000);
		const docLength = document.getText().length;
		vscode.window.showTextDocument(document, {
			selection: new vscode.Range(
				new vscode.Position(1, 1),
				new vscode.Position(1, docLength + 1)
			)
		}).then(async function() {
			await openMatlabTerminal(true);
			const done = attachTerminalTest();
			extension.runMatlabSelection();
			await done;
			await delay(2000);
		});
	});
});

async function openMatlabTerminal(show: boolean) {
	if (vscode.window.activeTerminal?.name !== TERMINAL_NAME) {
		extension.openMatlabTerminal();
		await delay(5000);
	}
	if (show) {
		vscode.window.terminals?.find(t => t.name === TERMINAL_NAME)?.show();
	}
	// vscode.window.activeTerminal?.sendText("clc");
	await delay(5000);
}

let terminalData: string;
let prevTerminalData: string;
let clock: number = 0;
function attachTerminalTest(): Promise<void> {
	return new Promise(function(resolve, reject) {
		const subscription = vscode.window.onDidWriteTerminalData(function(e) {
			if (!terminalData) {
				terminalData = e.data.trim();
				return;
			}
			prevTerminalData = terminalData;
			terminalData = e.data.trim();
		});
		const terminalTestHandle = setInterval(function() {
			clock += 1000;
			if (terminalData === ">>>" && !/[^\w\s]|\n/.test(prevTerminalData)) {
				assert.strictEqual(prevTerminalData, "hello world");
				subscription.dispose();
				resolve();
			}
		}, 1000);
		setTimeout(function() {
			clearInterval(terminalTestHandle);
			reject();
		}, 15000)
	});
}

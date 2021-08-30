import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as matlabInteractiveTerminal from "../../extension";

suite("MATLAB Interactive Terminal extension test suite", function() {
	vscode.window.showInformationMessage("Start all tests.");

	test("openMatlabTerminal test", function(done) {
		this.timeout(10000);
		vscode.window.onDidChangeActiveTerminal(function() {
			assert.strictEqual(
				vscode.window.activeTerminal?.name,
				matlabInteractiveTerminal.terminalLaunchOptions.name
			);
			done();
		});
		matlabInteractiveTerminal.openMatlabTerminal();
	});

	test("runMatlabScript test", function(done) {
		this.timeout(10000);
		openHelloWorld(function() {
			const subscription = vscode.window.onDidWriteTerminalData(function(e) {
				assert.strictEqual(e.data, 'Hello, World');
				subscription.dispose();
				done();
			});
			matlabInteractiveTerminal.runMatlabScript();
		});
	});

	test("runMatlabSelection test", function(done) {
		this.timeout(10000);
		openHelloWorld(function(document) {
			const docLength = document.getText().length;
			vscode.window.showTextDocument(document, {
				selection: new vscode.Range(
					new vscode.Position(1, 1),
					new vscode.Position(1, docLength + 1)
				)
			}).then(function() {
				const subscription = vscode.window.onDidWriteTerminalData(function(e) {
					assert.strictEqual(e.data, 'Hello, World');
					subscription.dispose();
					done();
				});
				matlabInteractiveTerminal.runMatlabSelection();
			});
		});
	});
});

function openHelloWorld(cb: (document: vscode.TextDocument) => void) {
	if (vscode.window.activeTerminal?.name !== matlabInteractiveTerminal.terminalLaunchOptions.name) {
		vscode.window.onDidChangeActiveTerminal(openHelloWorld.bind(vscode.window, cb));
		matlabInteractiveTerminal.openMatlabTerminal();
		return;
	}
	vscode.workspace.updateWorkspaceFolders(
		vscode.workspace.workspaceFolders
			? vscode.workspace.workspaceFolders.length
			: 0,
		null,
		{ uri: vscode.Uri.file(__dirname) }
	);
	const uri: vscode.Uri = vscode.Uri.file(path.join(__dirname, "helloWorld.m"));
	vscode.workspace.openTextDocument(uri).then(cb);
}

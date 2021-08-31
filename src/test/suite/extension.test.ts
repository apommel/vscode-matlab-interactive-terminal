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
			matlabInteractiveTerminal.runMatlabScript();
			done();
		});
	});

	test("runMatlabSelection test", function(done) {
		this.timeout(10000);
		openHelloWorld(function(document) {
			const docLength = document.getText().length;
			vscode.window.showTextDocument(document).then(function(textEditor: vscode.TextEditor) {
				textEditor.selection = new vscode.Selection(
					new vscode.Position(0, 0),
					new vscode.Position(0, docLength)
				);
				matlabInteractiveTerminal.runMatlabSelection();
				done();
			});
		});
	});
});

function openHelloWorld(cb: (document: vscode.TextDocument) => void) {
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

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as matlabInteractiveTerminal from "../../extension";

suite("MATLAB Interactive Terminal extension test suite", function () {
	vscode.window.showInformationMessage("Start all tests.");

	test("openMatlabTerminal test", function (done) {
		this.timeout(10000);
		matlabInteractiveTerminal.openMatlabTerminal();
		vscode.window.onDidChangeActiveTerminal(function () {
			assert.strictEqual(
				vscode.window.activeTerminal?.name,
				matlabInteractiveTerminal.terminalLaunchOptions.name
			);
			done();
		})
	});

	test("runMatlabScript test", function () {
		this.timeout(10000);
		openHelloWorld(function () {
			matlabInteractiveTerminal.runMatlabScript();
		});
	});

	test("runMatlabSelection test", function () {
		this.timeout(10000);
		openHelloWorld(document => {
			const docLength = document.getText().length;
			vscode.window.showTextDocument(document, {
				selection: new vscode.Range(
					new vscode.Position(1, 1),
					new vscode.Position(1, docLength + 1)
				)
			}).then(editor => {
				matlabInteractiveTerminal.runMatlabSelection();
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

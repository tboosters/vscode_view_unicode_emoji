import * as vscode from 'vscode';
import EmojiDecorator from './emojiDecorator';

export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;
	let activeEditor = vscode.window.activeTextEditor;
	let emojiDecorator: EmojiDecorator;

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(emojiDecorator.updateDecorations, 200);
	}

	if (activeEditor) {
		emojiDecorator = new EmojiDecorator(activeEditor);
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			if (!emojiDecorator) {
				emojiDecorator = new EmojiDecorator(editor);
			} else {
				emojiDecorator.activeEditor = editor;
			}
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (emojiDecorator && emojiDecorator.activeEditor.document === event.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
}

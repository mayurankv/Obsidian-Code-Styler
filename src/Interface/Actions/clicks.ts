import { MarkdownView } from "obsidian";
import { PREFIX } from "src/Internal/constants/general";
import CodeStylerPlugin from "src/main";

export function rerenderCodeElement(
	eventTarget: EventTarget | null,
	plugin: CodeStylerPlugin,
): void {
	if (eventTarget === null)
		return

	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!view)
		return;

	if (view?.getMode() === "preview") {
		const codeElement = (eventTarget as HTMLElement).parentElement?.parentElement?.parentElement?.querySelector("code");
		if (!codeElement)
			return;

		const rerenderClass = PREFIX+"rerender-element"
		codeElement.addClass(rerenderClass);

		for (
			// @ts-expect-error Undocumented Obsidian API
			const section of view.previewMode.renderer.sections.filter(
				// @ts-expect-error Undocumented Obsidian API
				(section: MarkdownSectionInformation) => (section.el as HTMLElement).querySelector(rerenderClass),
			)
		) {
			section.rendered = false;
			section.html = "";
		}

		view?.previewMode.rerender(true);

	} else {
		// @ts-expect-error Undocumented Obsidian API
		const cmView = view?.sourceMode.cmEditor.cm;
		const pos = cmView.posAtDOM(eventTarget);
		const current: number = cmView.state.selection.main.head;

		cmView.dispatch(
			{
				selection: { anchor: pos, head: pos },
				effects: rerender.of({ pos: current })
			},
		);
		cmView.focus();

		setTimeout(
			() => cmView.dispatch({ selection: { anchor: current, head: current } }),
			10,
		);
	}
}

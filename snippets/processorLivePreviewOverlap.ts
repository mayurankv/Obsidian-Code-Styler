import { Editor, SectionCache } from "obsidian"

function doesCalloutOverlap(
	editor: Editor,
	section: SectionCache,
): boolean {
	const cursor = {from: editor.getCursor("from"), to: editor.getCursor("to")}
	const cursorPreCallout = (section.position.start.line > cursor.to.line || (section.position.start.line === cursor.to.line && section.position.start.col > cursor.to.ch))
	const cursorPostCallout = (section.position.end.line < cursor.from.line || (section.position.start.line === cursor.to.line && section.position.start.col < cursor.to.ch))

	const overlap = !cursorPreCallout && !cursorPostCallout

	return overlap
}

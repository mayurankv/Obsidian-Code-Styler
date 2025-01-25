import { basename } from "path";
import CodeStylerPlugin from "src/main";

async function referenceAdjustParameters(
	fenceCodeParameters: FenceCodeParameters,
	plugin: CodeStylerPlugin,
	codeblockLines: Array<string>,
	sourcePath: string,
): Promise<FenceCodeParameters> {
	if (fenceCodeParameters.language === "reference") {
		const reference = await getReference(codeblockLines, sourcePath, plugin);
		if (!fenceCodeParameters.lineNumbers.alwaysDisabled && !fenceCodeParameters.lineNumbers.alwaysEnabled) {
			fenceCodeParameters.lineNumbers.offset = reference.startLine - 1;
			fenceCodeParameters.lineNumbers.alwaysEnabled = Boolean(reference.startLine !== 1);
		}

		if (fenceCodeParameters.title === "")
			fenceCodeParameters.title = reference.external?.info?.title ?? basename(reference.path);

		if (fenceCodeParameters.reference === "")
			//@ts-expect-error Undocumented Obsidian API
			fenceCodeParameters.reference = reference.external?.info?.displayUrl ?? reference.external?.info?.url ?? plugin.app.vault.adapter.getFilePath(reference.path);

		fenceCodeParameters.language = reference.language;
		if (reference.external)
			fenceCodeParameters.externalReference = reference;
	}

	return fenceCodeParameters;
}

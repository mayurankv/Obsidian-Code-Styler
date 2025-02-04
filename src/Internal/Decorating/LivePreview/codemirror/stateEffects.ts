
import { Range, StateEffect, StateEffectType } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { AnyRange } from "src/Internal/types/decoration";

export const visualStateUpdate: StateEffectType<boolean> = StateEffect.define();

export const applyFold: StateEffectType<{ foldStatus: boolean | null, position: number | null }> = StateEffect.define();

export const fenceScroll: StateEffectType<number> = StateEffect.define();


//!==============

export const fold: StateEffectType<
	{
	from: number,
	to: number,
	value: {
		spec: {
			language: string,
		}
	}
}> = StateEffect.define();

export const unfold: StateEffectType<{
	from: number,
	to: number,
}> = StateEffect.define();

export const hideFold: StateEffectType<Range<Decoration>> = StateEffect.define();

export const unhideFold: StateEffectType<Range<Decoration>> = StateEffect.define();

export const removeFold: StateEffectType<Array<string>> = StateEffect.define();

export const foldAll: StateEffectType<{ toFold: boolean | null }> = StateEffect.define();

export const rerender: StateEffectType<{ pos: number }> = StateEffect.define();

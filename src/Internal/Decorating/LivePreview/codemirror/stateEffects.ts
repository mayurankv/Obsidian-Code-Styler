
import { Range, StateEffect, StateEffectType } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { AnyRange } from "src/Internal/types/decoration";

export const visualStateUpdate: StateEffectType<boolean> = StateEffect.define();

export const applyFold: StateEffectType<{ foldStatus: boolean | "toggle" | null, position: number | null }> = StateEffect.define();

export const applyFoldAll: StateEffectType<{ toFold: boolean | null }> = StateEffect.define();

export const fenceScroll: StateEffectType<{ scrollPosition: number, position: number }> = StateEffect.define();

export const rerender: StateEffectType<{ pos: number }> = StateEffect.define();

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

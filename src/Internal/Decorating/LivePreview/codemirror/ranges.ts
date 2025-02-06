import { EditorState, Extension, MapMode, Range, RangeSet, RangeValue, StateField, Transaction } from "@codemirror/state";

export class RangeNumber extends RangeValue {
    number: number;

	constructor(
		number: number,
		startSide: number = 0,
		endSide: number = 0,
		point: boolean = false,
	) {
        super();
        this.number = number;
        this.startSide = startSide;
        this.endSide = endSide;
        this.point = point;
        this.mapMode = MapMode.TrackDel;
    }

	eq(
		other: RangeValue,
	): boolean {
        return other instanceof RangeNumber && this.number === other.number;
    }

	range(
		from: number,
		to?: number,
	): Range<this> {
		return {
			from: from,
			to: to ?? from,
			value: this,
		};
    }
}

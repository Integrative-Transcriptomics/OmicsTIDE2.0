/**
 * store with UI states
 */
import {extendObservable} from "mobx";

export class UIStore {
    constructor(parentStore) {
        this.parentStore = parentStore
        extendObservable(this, {
            controlsExpanded: true,
            searchExpanded: true,
            selectionExpanded: false,
            setControlsExpanded(isExpanded) {
                this.controlsExpanded = isExpanded;
            },
            setSearchExpanded(isExpanded) {
                this.searchExpanded = isExpanded;
            },
            setSelectionExpanded(isExpanded) {
                this.selectionExpanded = isExpanded;
            },
            expandSelectOnly() {
                this.setControlsExpanded(false);
                this.setSearchExpanded(false);
                this.setSelectionExpanded(true);
            },
            expandOthersButSelect() {
                this.setControlsExpanded(true);
                this.setSearchExpanded(true);
                this.setSelectionExpanded(false);
            }
        })

    }
}
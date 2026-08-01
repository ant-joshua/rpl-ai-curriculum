export interface QuestCompleteEvent {
	title: string;
	description: string;
	xpReward: number;
	questKey: string;
}

let state = $state<QuestCompleteEvent | null>(null);

export function getQuestCompleteEvent(): QuestCompleteEvent | null {
	return state;
}

export function triggerQuestComplete(ev: QuestCompleteEvent) {
	state = ev;
}

export function dismissQuestComplete() {
	state = null;
}

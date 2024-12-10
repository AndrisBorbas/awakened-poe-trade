import { computed, shallowRef, readonly } from "vue";
import { createGlobalState } from "@vueuse/core";
import { AppConfig, poeWebApi } from "@/web/Config";
import { Host } from "./IPC";

// pc-ggg, pc-garena
// const PERMANENT_SC = ['Standard', '標準模式']
// const PERMANENT_HC = ["Hardcore", "專家模式"];

/*
interface ApiLeague {
	id: string;
	event?: boolean;
	rules?: Array<{ id: string }>;
}
*/

interface TradeLeague {
	id: string;
	realm?: string;
	text?: string;
}

interface TradeLeagueResponse {
	result: TradeLeague[];
}

interface League {
	id: string;
	realm: string;
	isPopular: boolean;
}

export const useLeagues = createGlobalState(() => {
	const isLoading = shallowRef(false);
	const error = shallowRef<string | null>(null);
	const tradeLeagues = shallowRef<League[]>([]);

	const selectedId = computed<string | undefined>({
		get() {
			return tradeLeagues.value.length ? AppConfig().leagueId : undefined;
		},
		set(id) {
			AppConfig().leagueId = id;
		},
	});

	const selected = computed(() => {
		const { leagueId } = AppConfig();
		if (!tradeLeagues.value || !leagueId) return undefined;
		const listed = tradeLeagues.value.find((league) => league.id === leagueId);
		return {
			id: leagueId,
			realm: listed?.realm,
			isPopular: !isPrivateLeague(leagueId) && Boolean(listed?.isPopular),
		};
	});

	async function load() {
		isLoading.value = true;
		error.value = null;

		try {
			const response = await Host.proxy(
				`${poeWebApi()}/api/trade2/data/leagues`,
			);
			if (!response.ok)
				throw new Error(JSON.stringify(Object.fromEntries(response.headers)));
			const leagues: TradeLeague[] =
				((await response.json()) as TradeLeagueResponse).result ?? [];
			tradeLeagues.value = leagues.map((league) => {
				return {
					id: league.id,
					isPopular: true,
					realm: league.realm ?? "poe2",
				};
			});

			const leagueIsAlive = tradeLeagues.value.some(
				(league) => league.id === selectedId.value,
			);
			if (!leagueIsAlive && !isPrivateLeague(selectedId.value ?? "")) {
				if (tradeLeagues.value.length > 1) {
					const TMP_CHALLENGE = 1;
					selectedId.value = tradeLeagues.value[TMP_CHALLENGE].id;
				} else {
					const STANDARD = 0;
					selectedId.value = tradeLeagues.value[STANDARD].id;
				}
			}
		} catch (e) {
			console.error(e);
			error.value = (e as Error).message;
		} finally {
			isLoading.value = false;
		}
	}

	return {
		isLoading,
		error,
		selectedId,
		selected,
		list: readonly(tradeLeagues),
		load,
	};
});

function isPrivateLeague(id: string) {
	if (id.includes("Ruthless")) {
		return true;
	}
	return /\(PL\d+\)$/.test(id);
}

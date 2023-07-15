import { invoke } from "@tauri-apps/api";
import { updateResponseStore } from "$lib/stores/responseStore";
import {
	resetStatus,
	resetStatusWithErrorMessage,
	updateResponseSizeStore,
	updateResponseStatusStore,
	updateResponseTimeStore,
} from "$lib/stores/responseStatusStore";
import type { RequestJSON } from "./requestTypes";

export default async function putRequest(url: string, data: string) {
	if (url === undefined || url === "") {
		updateResponseStore("No request was sent. Please input a url.");
		resetStatus();
		return; // Do not send an obviously invalid request.
	}

	if (data === undefined || data === "") {
		updateResponseStore(
			"No request was sent. Please input JSON data to send."
		);
		resetStatus();
		return; // Do not send an obviously invalid request.
	}

	let json: JSON;
	try {
		json = JSON.parse(data);
	} catch (error) {
		console.error(error);
		updateResponseStore(String(error));
		return; // Cancel the request since the json is invalid.
	}

	console.log("Sending a PUT request to " + url + "...");

	try {
		const data = (await invoke("put", {
			url: url,
			json: json,
		})) as RequestJSON;
		// console.log(data);

		// TODO: Say response was successful only if status was 200.
		const message = "PUT request at URL '" + url + "' was sent";

		if (data.body === "") {
			updateResponseStore(
				message + ". There was no additional response."
			);
		} else {
			updateResponseStore(message + " with response: " + data.body);
		}

		updateResponseStatusStore(data.status.code);
		updateResponseTimeStore(data.status.time);
		updateResponseSizeStore(data.status.size);
	} catch (error) {
		console.error(error);
		resetStatusWithErrorMessage(String(error));
	}
}

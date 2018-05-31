const refreshRateForServerInfo = 5000;
const queryKeySizeLimit = 500;
const batchChunkSize = 50;

let keyNum = 0;

let queryInput;
let queryResults;
let queryResultsTemplate;
let serverInfo;
let serverInfoTemplate;
let itemFormInfo;
let itemFormInfoTemplate;

function showHelp() {
	let help = `hel* mathes hello
h?llo matches hello, hallo and hxllo
h*llo matches hllo and heeeello
h[ae]llo matches hello and hallo, but not hillo
h[^e]llo matches hallo, hbllo, ... but not hello
h[a-b]llo matches hallo and hbllo`;
	alert(help);
}

function renderServerInfo() {
	fetch(path + "api/info").then(res => res.json()).then((payload) => {
		payload.db = payload["db" + db];
		keyNum = payload.db.keys;
		payload.total_commands_processed = numberFormatter(payload.total_commands_processed, 2);
		payload.db.keys = numberFormatter(payload.db.keys, 2);
		serverInfo.innerHTML = serverInfoTemplate(payload);
	}).catch((err) => {
		throw err;
	});
}

function renderPopupForm(key, type) {
	fetch(path + "api/get?key=" + key + "&type=" + type).then(res => res.json()).then((payload) => {
		itemFormInfo.style.display = "block";
		if (payload.type == "hash") payload.hash = true;
		itemFormInfo.innerHTML = itemFormInfoTemplate(payload);

		itemFormInfo.querySelector(".close").addEventListener("click", (evt) => {
			itemFormInfo.style.display = "none";
		}, false);

		itemFormInfo.querySelectorAll(".delete").forEach((item, index) => {
			item.addEventListener("click", (evt) => {
				let row = evt.target.parentElement.parentElement;
				evt.target.parentElement.parentElement.parentElement.removeChild(row);
			}, false);
		}, false);

		try {
			itemFormInfo.querySelector(".add-attribute").addEventListener("click", (evt) => {
				let table = evt.target.parentElement.parentElement.querySelector("table tbody");
				let row = table.insertRow(-1);
				let cell1 = row.insertCell(0);
				let cell2 = row.insertCell(1);
				let cell3 = row.insertCell(2);

				let keyInput = document.createElement("input");
				keyInput.type = "text";
				keyInput.name = "key";

				let valueInput = document.createElement("input");
				valueInput.type = "text";
				valueInput.name = "value";

				let deleteButton = document.createElement("button");
				deleteButton.type = "button";
				deleteButton.classList.add("delete");
				deleteButton.innerText = "d";
				deleteButton.addEventListener("click", (evt) => {
					let row = evt.target.parentElement.parentElement;
					evt.target.parentElement.parentElement.parentElement.removeChild(row);
				}, false);

				cell1.appendChild(keyInput);
				cell2.appendChild(valueInput);
				cell3.appendChild(deleteButton);

			}, false);
		} catch(err) {}

		itemFormInfo.querySelector(".save-item").addEventListener("click", (evt) => {
			let root = evt.target.parentElement.parentElement;
			let payload = {};
			payload.key = key;
			payload.type = type;
			payload.value = [];

			if (type == "hash") {
				root.querySelectorAll("table tr").forEach((item, index) => {
					payload.value.push({
						key: item.querySelector("input[name=key]").value,
						value: item.querySelector("input[name=value]").value,
					});
				}, false);
			} else {
				payload.value = root.querySelector("input[name=value]").value
			}

			fetch(path + "api/set", {
				method: "POST",
				body: JSON.stringify(payload),
			}).then(res => res.json()).then((payload) => {
				if (payload.status) {
					itemFormInfo.style.display = "none";
				} else {
					alert("Error saving item");
				}
			}).catch((err) => {
				throw err;
			});

		}, false);

	}).catch((err) => {
		throw err;
	});
}

function renderSearchResults(payload) {
	queryResults.innerHTML = queryResultsTemplate(payload);

	// creates sortable tables based on class
	let sortableTables = queryResults.querySelectorAll(".sortable");
	sortableTables.forEach(function (element) {
		tsorter.create(element);
	});

	// auto select or deselect all rows
	queryResults.querySelector("thead input[type=checkbox]").addEventListener("click", (evt) => {
		if (evt.target.checked) {
			queryResults.querySelectorAll("tbody input[type=checkbox]").forEach((item, index) => {
				item.checked = true;
			}, false);
		} else {
			queryResults.querySelectorAll("tbody input[type=checkbox]").forEach((item, index) => {
				item.checked = false;
			}, false);
		}
	}, false);

	// row items ops
	queryResults.querySelectorAll("tbody tr").forEach((item, index) => {
		item.querySelector("button.delete").addEventListener("click", (evt) => {
			let itemKey = evt.target.parentElement.parentElement.dataset.key;
			let itemType = evt.target.parentElement.parentElement.dataset.type;
			let confirmDelete = confirm("Do you want to delete " + itemType + " item key with this id?\n" + itemKey);
			if (confirmDelete) {
				let sourceItem = evt.target.parentElement.parentElement;
				fetch(path + "api/del", {
					method: "POST",
					body: JSON.stringify({items: [itemKey]}),
				}).then(res => res.json()).then((payload) => {
					if (payload.status) {
						sourceItem.parentElement.removeChild(sourceItem);
					}
				}).catch((err) => {
					throw err;
				});
			}
		}, false);

		// view data in popup
		item.querySelector("button.view").addEventListener("click", (evt) => {
			let itemKey = evt.target.parentElement.parentElement.dataset.key;
			let itemType = evt.target.parentElement.parentElement.dataset.type;
			renderPopupForm(itemKey, itemType);
		}, false);
	});

	// bulk remove
	queryResults.querySelector("button.bulk-delete").addEventListener("click", (evt) => {
		if (queryResults.querySelectorAll("tbody input[type=checkbox]:checked").length > 0) {
			let confirmDelete = confirm("Do you SURE you want to delete selected items?");
			if (confirmDelete) {
				let itemForDeletion = [];
				queryResults.querySelectorAll("tbody input[type=checkbox]").forEach((item, index) => {
					if (item.checked) {
						let sourceItem = item.parentElement.parentElement;
						itemForDeletion.push(sourceItem.dataset.key);
					}
				}, false);

				let i, j, chunkArray;
				for (i=0, j=itemForDeletion.length; i<j; i+=batchChunkSize) {
					chunkArray = itemForDeletion.slice(i, i+batchChunkSize);
					fetch(path + "api/del", {
						method: "POST",
						body: JSON.stringify({items: chunkArray}),
					}).then(res => res.json()).then((payload) => {
						payload.items.forEach((item, index) => {
							let targetItem = queryResults.querySelector("tbody tr[data-key='" + item + "']");
							targetItem.parentElement.removeChild(targetItem);
						}, false);
					}).catch((err) => {
						throw err;
					});
				}
			}
		} else {
			alert("No items selected");
		}
	}, false);
}

window.addEventListener("load", function (evt) {

	queryInput = document.querySelector("#query");
	queryResults = document.querySelector("section#query-results");
	queryResultsTemplate = Handlebars.compile(document.querySelector("#query-results-tmpl").innerHTML);
	serverInfo = document.querySelector("#server-info");
	serverInfoTemplate = Handlebars.compile(document.querySelector("#server-info-tmpl").innerHTML);
	itemFormInfo = document.querySelector("#item-form");
	itemFormInfoTemplate = Handlebars.compile(document.querySelector("#item-form-tmpl").innerHTML);

	// perform query
	queryInput.addEventListener("keypress", function (evt) {
		var key = evt.which || evt.keyCode;
		if (key === 13 && this.value != "") {
			if ((this.value == "*") && (keyNum > queryKeySizeLimit)) {
				alert("Query not recomended. Dataset too large.");
			} else {
				this.disabled = true;
				fetch(path + "api/scan?q=" + this.value).then(res => res.json()).then((payload) => {
					renderSearchResults(payload);
					this.disabled = false;
					this.focus();
				}).catch((err) => {
					throw err;
				});
			}
		}
	});

	// shows help
	document.querySelector("#ops .help").addEventListener("click", (evt) => {
		showHelp();
	}, false);

	// shows help
	document.querySelector("#ops .dump").addEventListener("click", (evt) => {
		alert("Not implemented yet!");
	}, false);

	// on esc hides modal
	document.addEventListener("keydown", (evt) => {
		evt = evt || window.event;
		var isEscape = false;
		if ("key" in evt) {
			isEscape = (evt.key == "Escape" || evt.key == "Esc");
		} else {
			isEscape = (evt.keyCode == 27);
		}
		if (isEscape) {
			itemFormInfo.style.display = "none";
		}
	}, false);

	// refreshed info
	renderServerInfo();
	this.setInterval(function() {
		renderServerInfo();
	}, refreshRateForServerInfo);

}, false);

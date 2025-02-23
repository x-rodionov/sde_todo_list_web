function add_task(list, item) {
	const {id, description, complete_timestamp} = item;
	const p = document.createElement("p");
	p.id = id;
	const input = document.createElement("input");
	input.type = "checkbox";
	if (complete_timestamp) {
		input.checked = true;
		input.style.pointerEvents = "none";
	} else {
		input.checked = false;
	}
	input.onclick = (event) => handle_checkbox_click(event);
	const span = document.createElement("span");
	span.className = "description";
	span.style.margin = "1em";
	span.textContent = description;
	span.onclick = (event) => handle_edit_click(event);
	const button = document.createElement("button");
	button.textContent = "delete";
	button.onclick = (event) => handle_delete_click(event);
	p.append(input);
	p.append(span);
	p.append(button);
	list.append(p);
}
async function handle_body_load() {
	const response = await fetch(`/api/v1/tasks/list`);
	const tasks = await response.json();
	const list = document.getElementById("tasks_list");
	for (let i = 0; i < tasks.length; ++i)
		add_task(list, tasks[i]);
}
async function handle_add_click() {
	const text = prompt("description");
	if (!text)
		return;
	const text_uri = encodeURIComponent(text);
	const response = await fetch(`/api/v1/tasks/add?${text_uri}`);
	const {id} = await response.json();
	if (!id)
		return;
	const list = document.getElementById("tasks_list");
	add_task(list, {id, description: text, complete_timestamp: null});
}
async function handle_delete_click(event) {
	const item = event.target.parentElement;
	const id = encodeURIComponent(item.id);
	await fetch(`/api/v1/tasks/remove?${id}`);
	item.remove();
}
async function handle_edit_click(event) {
	const item = event.target.parentElement;
	const input = item.getElementsByTagName("input")[0];
	if (input.checked)
		return;
	const desc = item.getElementsByClassName(
		"description"
	)[0];
	const new_text = prompt("description", desc.textContent);
	if (!new_text)
		return;
	const new_text_uri = encodeURIComponent(new_text);
	const id = encodeURIComponent(item.id);
	const response = await fetch(
		`/api/v1/tasks/edit?${id}&${new_text_uri}`
	);
	const {done} = await response.json();
	if (done)
		desc.textContent = new_text;
	else
		alert("impossible to change task description");
}
async function handle_checkbox_click(event) {
	const item = event.target.parentElement;
	const id = encodeURIComponent(item.id);
	const response = await fetch(`/api/v1/tasks/complete?${id}`);
	const {done} = await response.json();
	if (done)
		item.getElementsByTagName("input")[0].style.pointerEvents = "none";
	else
		alert("impossible to complete task");
}

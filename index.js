async function handle_body_load() {
	const response = await fetch("/api/v1/tasks/list");
	const tasks = await response.json();
	const list = document.getElementById("tasks_list");
	for (let i = 0; i < tasks.length; ++i) {
		const {id, description, complete_timestamp} = tasks[i];
		const p = document.createElement("p");
		p.id = id;
		const input = document.createElement("input");
		input.type = "checkbox";
		input.checked = complete_timestamp ? true : false;
		input.onclick = () => alert(2);
		const span = document.createElement("span");
		span.style.margin = "1em";
		span.textContent = description;
		span.onclick = () => alert(3);
		const button = document.createElement("button");
		button.textContent = "delete";
		button.onclick = () => alert(4);
		p.append(input);
		p.append(span);
		p.append(button);
		list.append(p);
	}
}
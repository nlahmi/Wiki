

//// The following is from https://github.com/gollum/gollum/issues/1754#issuecomment-1235986338
// CONSTANTS
const COPY_TEXT = "Copy";
const COPIED_TEXT = "Copied!";

// Helper functions
const qs = (query) => document.querySelector(query);
const qsa = (query) => document.querySelectorAll(query);
const randomId = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
const wait = async (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));
const copy = async (text) => navigator.clipboard.writeText(text);

const copyToClipboard = async ({ target }) => {
	const codeBlock = qs(`#${target.dataset.codeblock} code`);
  await copy(codeBlock.textContent);

	target.textContent = COPIED_TEXT;
	await wait(3);
	target.textContent = COPY_TEXT;
};

const addButtonToCodeblocks = () => {
  const codeBlocks = qsa("pre");

  codeBlocks.forEach((item) => {
		const id = randomId();

    const button = document.createElement("button");

    button.textContent = COPY_TEXT;
    button.classList.add("cust-btn-copy");
		button.dataset.codeblock = id;
		item.id = id;

    button.onclick = copyToClipboard;

    item.appendChild(button);
  });
};

const onLoad = () => {
	addButtonToCodeblocks();
};

window.onload = onLoad;
let intervalId;

function startLoader({ text = "Loading ...", frames, interval = 50 }) {
  const loader = frames ?? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let index = 0;
  intervalId = setInterval(function () {
    process.stdout.write(`\r ${loader[index % loader.length]} ${text}`);
    index++;
  }, interval);
}

function stopLoader() {
  clearInterval(intervalId);
  process.stdout.write("\r\x1b[K");
}

module.exports = {
  startLoader,
  stopLoader,
};

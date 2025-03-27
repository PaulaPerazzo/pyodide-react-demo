/* eslint-disable */

self.onmessage = async (event) => {
  const { loadPyodide } = await import("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.mjs");

  const pyodide = await loadPyodide();
  await pyodide.loadPackage(["micropip"]);

  const pythonCode = `
    import json

    def get_cheapest_cars(json_input):
        cars = json.loads(json_input)
        sorted_cars = sorted(cars, key=lambda x: x["price"])[:2]
        return json.dumps(sorted_cars)
  `;

  pyodide.runPython(pythonCode);

  const result = pyodide.runPython(`get_cheapest_cars('${JSON.stringify(event.data)}')`);
  self.postMessage(result);
};

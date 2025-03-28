# Integrating React + Pyodide

This guide shows how to integrate **React** with **Pyodide**, enabling you to run Python code (and use Python libraries like `sad-cin`) directly in the browser.

---

## Step 1: Load Pyodide in React

First, include the Pyodide script in your `public/index.html` file to make it available globally in the browser:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pyodide com React</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

> This makes the `loadPyodide()` function available globally so it can be used inside your React app.

> Here, **CDN** stands for **Content Delivery Network**. It's a network of servers distributed around the world that deliver content more quickly and reliably.

---

## Step 2: Initialize Pyodide and Load Packages

Inside your React component, create a state to hold the Pyodide instance:

```js
const [pyodide, setPyodide] = useState(null);
const [loadingPyodide, setLoadingPyodide] = useState(true);
```

Then, use a `useEffect` hook to initialize Pyodide, install required packages with `micropip`, and define your Python function:

```js
  useEffect(() => {
    async function loadPyodideAndPackages() {
      try {
        const pyodideInstance = await window.loadPyodide();
        await pyodideInstance.loadPackage("micropip");
        await pyodideInstance.runPythonAsync(`
          import micropip
          await micropip.install("sad-cin")
          from sad_cin import decision_support
          import json
          
          def get_results(json_str):
              data = json.loads(json_str)
              result = decision_support(data)
              return json.dumps(result)
          `);
        setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Erro ao carregar o Pyodide:", error);
      } finally {
        setLoadingPyodide(false);
      }
    }
    loadPyodideAndPackages();
  }, []);
```

> Unlike traditional Python, use `micropip.install("package-name")` instead of `pip install`.

---

## Step 3: Call Python Function and Use the Result

You can now call the Python function from JavaScript and work with the result like a regular JSON object:

```js
try {
  const getResults = pyodide.globals.get("get_results");
  const resultString = getResults(jsonStr); // jsonStr should be a JSON string
  setResult(JSON.parse(resultString));
} catch (error) {
  console.error("Error running Python function:", error);
}
```

This allows you to pass data from your React app to Python, run the decision support algorithm, and return the results as a usable JavaScript object.

---

## Summary

- Pyodide enables running Python in the browser.
- `micropip` is used to install Python packages dynamically.
- You can define Python functions inside your React app and call them from JavaScript.
- The `sad-cin` package is the library we are currently coding in this course. At the moment, only VIKOR mcdm method is implemented.
- You can use the file `vikor.json` as an example to run this code with `npm run start`.